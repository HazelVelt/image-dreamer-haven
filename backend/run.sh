
#!/bin/bash
echo "Starting Stable Diffusion Local API..."

# Create necessary directories
mkdir -p models/checkpoints models/loras models/vaes outputs/images outputs/thumbnails

# Check if requirements are installed
if ! command -v pip &> /dev/null; then
    echo "Error: pip is not installed or not in PATH"
    echo "Please install Python and pip first"
    exit 1
fi

echo "Installing requirements..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "Error installing requirements. Trying with compatible versions..."
    echo "If this fails, you may need to install PyTorch separately from: https://pytorch.org/get-started/locally/"
    exit 1
fi

# Run the server
echo "Starting server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
