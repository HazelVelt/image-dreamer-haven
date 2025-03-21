
# Local Stable Diffusion API

This Python backend provides a FastAPI server that can run local Stable Diffusion models on your machine.

## Setup

1. Make sure you have Python 3.8+ installed (Python 3.10 recommended)
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
   
   If you encounter any errors with PyTorch, you might need to install it separately:
   - Visit https://pytorch.org/get-started/locally/
   - Follow instructions to install the correct version for your system

3. Create model directories (or run the provided script):
   ```
   mkdir -p models/checkpoints models/loras models/vaes
   ```
4. Place your Stable Diffusion models in the appropriate directories:
   - Checkpoint models (.safetensors, .ckpt files) in `models/checkpoints/`
   - LoRA models in `models/loras/`
   - VAE models in `models/vaes/`

## Running the server

Run the server with:
```
./run.sh
```

Or manually with:
```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the API documentation at:
http://localhost:8000/docs

## Troubleshooting

If you encounter issues:

1. Ensure you have the correct Python version (3.8+ recommended)
2. Try installing PyTorch separately from the official website
3. Check that your CUDA drivers are up to date if using GPU
4. Make sure you have enough disk space for models and generated images

## Frontend Integration

This server is designed to work with the React frontend. Make sure the frontend is configured to connect to this backend at `http://localhost:8000`.

## Requirements

- A CUDA-capable GPU is recommended for reasonable generation speed
- At least 8GB of VRAM for 512x512 images
- At least 12GB of VRAM for 1024x1024 images
