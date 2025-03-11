
#!/bin/bash
echo "Starting Stable Diffusion Local API..."
echo "Make sure you have installed all requirements with: pip install -r requirements.txt"

# Create necessary directories
mkdir -p models/checkpoints models/loras models/vaes outputs/images outputs/thumbnails

# Run the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
