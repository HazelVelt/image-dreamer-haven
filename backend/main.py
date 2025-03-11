
import os
import time
import uuid
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import torch
from diffusers import (
    StableDiffusionPipeline,
    DPMSolverMultistepScheduler,
    EulerAncestralDiscreteScheduler,
    EulerDiscreteScheduler,
    LMSDiscreteScheduler,
    DDIMScheduler,
)
import numpy as np
from PIL import Image

app = FastAPI(title="Local Stable Diffusion API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, limit this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODELS_DIR = os.environ.get("MODELS_DIR", "./models")
OUTPUT_DIR = os.environ.get("OUTPUT_DIR", "./outputs")
THUMB_SIZE = (300, 300)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Create directories if they don't exist
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.join(OUTPUT_DIR, "images"), exist_ok=True)
os.makedirs(os.path.join(OUTPUT_DIR, "thumbnails"), exist_ok=True)

# Serve generated images and thumbnails
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# Model cache
model_cache = {}

# Define schemas
class Lora(BaseModel):
    model: str
    weight: float

class GenerationParameters(BaseModel):
    prompt: str
    negativePrompt: Optional[str] = None
    model: str
    width: int = 512
    height: int = 512
    steps: int = 25
    cfgScale: float = 7.0
    sampler: str = "DPM++ 2M Karras"
    seed: Optional[int] = None
    batchSize: int = 1
    enabledLoras: Optional[List[Lora]] = None

class GeneratedImage(BaseModel):
    id: str
    url: str
    prompt: str
    negativePrompt: Optional[str] = None
    parameters: GenerationParameters
    seed: int
    timestamp: int

class ModelInfo(BaseModel):
    id: str
    name: str
    path: str
    type: str
    thumbnail: Optional[str] = None

class ModelFolder(BaseModel):
    id: str
    name: str
    models: List[ModelInfo]

class ModelVerifyRequest(BaseModel):
    model_path: str

# Helper functions
def get_scheduler(scheduler_name, pipeline):
    scheduler_map = {
        "DPM++ 2M Karras": DPMSolverMultistepScheduler.from_config(
            pipeline.scheduler.config, use_karras_sigmas=True
        ),
        "Euler a": EulerAncestralDiscreteScheduler.from_config(pipeline.scheduler.config),
        "Euler": EulerDiscreteScheduler.from_config(pipeline.scheduler.config),
        "LMS": LMSDiscreteScheduler.from_config(pipeline.scheduler.config),
        "DDIM": DDIMScheduler.from_config(pipeline.scheduler.config),
    }
    return scheduler_map.get(scheduler_name, pipeline.scheduler)

def scan_models_directory():
    result = []
    
    # Scan for checkpoints
    checkpoints_dir = os.path.join(MODELS_DIR, "checkpoints")
    if os.path.exists(checkpoints_dir):
        models = []
        for file in os.listdir(checkpoints_dir):
            if file.endswith((".safetensors", ".ckpt", ".pt")):
                model_id = file.split('.')[0].lower().replace(" ", "-")
                model_name = file.split('.')[0].replace("_", " ").title()
                models.append(
                    ModelInfo(
                        id=model_id,
                        name=model_name,
                        path=os.path.join("checkpoints", file),
                        type="checkpoint"
                    )
                )
        if models:
            result.append(ModelFolder(id="checkpoints", name="Checkpoints", models=models))
    
    # Scan for LoRAs
    loras_dir = os.path.join(MODELS_DIR, "loras")
    if os.path.exists(loras_dir):
        models = []
        for file in os.listdir(loras_dir):
            if file.endswith((".safetensors", ".ckpt", ".pt")):
                model_id = file.split('.')[0].lower().replace(" ", "-")
                model_name = file.split('.')[0].replace("_", " ").title()
                models.append(
                    ModelInfo(
                        id=model_id,
                        name=model_name,
                        path=os.path.join("loras", file),
                        type="lora"
                    )
                )
        if models:
            result.append(ModelFolder(id="loras", name="LoRAs", models=models))
    
    # Scan for VAEs
    vaes_dir = os.path.join(MODELS_DIR, "vaes")
    if os.path.exists(vaes_dir):
        models = []
        for file in os.listdir(vaes_dir):
            if file.endswith((".safetensors", ".ckpt", ".pt")):
                model_id = file.split('.')[0].lower().replace(" ", "-")
                model_name = file.split('.')[0].replace("_", " ").title()
                models.append(
                    ModelInfo(
                        id=model_id,
                        name=model_name,
                        path=os.path.join("vaes", file),
                        type="vae"
                    )
                )
        if models:
            result.append(ModelFolder(id="vaes", name="VAEs", models=models))
    
    return result

def load_model(model_path):
    full_path = os.path.join(MODELS_DIR, model_path)
    
    if model_path in model_cache:
        return model_cache[model_path]
    
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail=f"Model not found: {model_path}")
    
    try:
        pipeline = StableDiffusionPipeline.from_single_file(
            full_path,
            torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
            use_safetensors=full_path.endswith(".safetensors"),
        )
        pipeline = pipeline.to(DEVICE)
        
        # Optimize for faster inference
        if DEVICE == "cuda":
            pipeline.enable_xformers_memory_efficient_attention()
        
        model_cache[model_path] = pipeline
        return pipeline
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

def save_image(image, prompt, parameters, seed):
    image_id = str(uuid.uuid4())
    timestamp = int(time.time())
    
    # Save the full image
    image_filename = f"{image_id}.png"
    image_path = os.path.join(OUTPUT_DIR, "images", image_filename)
    image.save(image_path)
    
    # Create and save thumbnail
    thumb = image.copy()
    thumb.thumbnail(THUMB_SIZE)
    thumb_path = os.path.join(OUTPUT_DIR, "thumbnails", image_filename)
    thumb.save(thumb_path)
    
    # Create result object
    result = GeneratedImage(
        id=image_id,
        url=f"/outputs/images/{image_filename}",
        prompt=prompt,
        negativePrompt=parameters.negativePrompt,
        parameters=parameters,
        seed=seed,
        timestamp=timestamp
    )
    
    # Save metadata
    metadata_path = os.path.join(OUTPUT_DIR, "images", f"{image_id}.json")
    with open(metadata_path, "w") as f:
        json.dump(result.dict(), f)
    
    return result

# API Endpoints
@app.get("/")
def read_root():
    return {"status": "ok", "device": DEVICE}

@app.get("/models", response_model=List[ModelFolder])
def get_models():
    return scan_models_directory()

@app.post("/models/verify")
def verify_model(request: ModelVerifyRequest):
    model_path = os.path.join(MODELS_DIR, request.model_path)
    if os.path.exists(model_path):
        return {"exists": True}
    return {"exists": False}

@app.get("/models/{model_id}/metadata")
def get_model_metadata(model_id: str):
    # Find the model in the scanned models
    all_folders = scan_models_directory()
    for folder in all_folders:
        for model in folder.models:
            if model.id == model_id:
                # In a real implementation, you would extract metadata from the model
                return {
                    "format": "SafeTensors" if model.path.endswith(".safetensors") else "Checkpoint",
                    "size": os.path.getsize(os.path.join(MODELS_DIR, model.path)) / (1024 * 1024 * 1024),
                    "resolution": "512x512" if "sd15" in model_id else "1024x1024",
                }
    
    raise HTTPException(status_code=404, detail=f"Model {model_id} not found")

@app.post("/generate", response_model=List[GeneratedImage])
async def generate_images(parameters: GenerationParameters, background_tasks: BackgroundTasks):
    try:
        # Find model path from model ID
        model_path = None
        all_folders = scan_models_directory()
        for folder in all_folders:
            for model in folder.models:
                if model.id == parameters.model:
                    model_path = model.path
                    break
            if model_path:
                break
        
        if not model_path:
            raise HTTPException(status_code=404, detail=f"Model {parameters.model} not found")
        
        # Load the model
        pipeline = load_model(model_path)
        
        # Set the scheduler
        pipeline.scheduler = get_scheduler(parameters.sampler, pipeline)
        
        # Generate images
        results = []
        seeds = []
        
        # Use provided seed or generate random ones
        base_seed = parameters.seed if parameters.seed is not None else np.random.randint(0, 2147483647)
        
        for i in range(parameters.batchSize):
            current_seed = base_seed + i if parameters.seed is not None else np.random.randint(0, 2147483647)
            seeds.append(current_seed)
        
        generator = [torch.Generator(device=DEVICE).manual_seed(seed) for seed in seeds]
        
        # Generate images
        outputs = pipeline(
            prompt=parameters.prompt,
            negative_prompt=parameters.negativePrompt,
            width=parameters.width,
            height=parameters.height,
            num_inference_steps=parameters.steps,
            guidance_scale=parameters.cfgScale,
            num_images_per_prompt=parameters.batchSize,
            generator=generator,
        ).images
        
        # Save images and create response
        for i, image in enumerate(outputs):
            result = save_image(image, parameters.prompt, parameters, seeds[i])
            results.append(result)
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

@app.get("/images/{image_id}", response_model=GeneratedImage)
def get_image(image_id: str):
    metadata_path = os.path.join(OUTPUT_DIR, "images", f"{image_id}.json")
    
    if not os.path.exists(metadata_path):
        raise HTTPException(status_code=404, detail=f"Image {image_id} not found")
    
    with open(metadata_path, "r") as f:
        return json.load(f)

@app.post("/gallery", response_model=GeneratedImage)
def save_to_gallery(image: GeneratedImage):
    # In a real implementation, you might want to copy the image to a gallery folder
    # For now, just return the image as it's already saved
    return image

@app.delete("/images/{image_id}")
def delete_image(image_id: str):
    image_path = os.path.join(OUTPUT_DIR, "images", f"{image_id}.png")
    thumb_path = os.path.join(OUTPUT_DIR, "thumbnails", f"{image_id}.png")
    metadata_path = os.path.join(OUTPUT_DIR, "images", f"{image_id}.json")
    
    if not os.path.exists(metadata_path):
        raise HTTPException(status_code=404, detail=f"Image {image_id} not found")
    
    try:
        if os.path.exists(image_path):
            os.remove(image_path)
        if os.path.exists(thumb_path):
            os.remove(thumb_path)
        if os.path.exists(metadata_path):
            os.remove(metadata_path)
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
