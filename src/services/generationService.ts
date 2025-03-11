
import { toast } from "sonner";

export interface GenerationParameters {
  prompt: string;
  negativePrompt?: string;
  model: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  sampler: string;
  seed: number | null;
  batchSize: number;
  enabledLoras?: Array<{
    model: string;
    weight: number;
  }>;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  parameters: GenerationParameters;
  seed: number;
  timestamp: number;
}

// The URL where our Python backend is running
const API_URL = "http://localhost:8000";

// Function to generate images by calling the Python backend
export const generateImages = async (
  parameters: GenerationParameters
): Promise<GeneratedImage[]> => {
  console.log('Generating images with parameters:', parameters);
  
  try {
    // Show a toast notification that generation has started
    const loadingToast = toast.loading('Generating image...');
    
    // Send generation request to local backend
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate images');
    }
    
    const results = await response.json();
    
    // Dismiss the loading toast and show success
    toast.dismiss(loadingToast);
    toast.success(`Generated ${results.length} image${results.length > 1 ? 's' : ''}`);
    
    return results;
  } catch (error) {
    console.error('Error generating images:', error);
    toast.error('Failed to generate images. Please check if the backend server is running.');
    return [];
  }
};

// Function to save an image to the gallery
export const saveImageToGallery = async (image: GeneratedImage): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(image),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save image to gallery');
    }
    
    toast.success('Image saved to gallery');
    return true;
  } catch (error) {
    console.error('Error saving image:', error);
    toast.error('Failed to save image to gallery');
    return false;
  }
};

// Function to get image information
export const getImageInfo = async (imageId: string): Promise<GeneratedImage | null> => {
  try {
    const response = await fetch(`${API_URL}/images/${imageId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get image information');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting image info:', error);
    return null;
  }
};
