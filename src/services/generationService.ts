
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
  enabledControlNets?: Array<{
    model: string;
    weight: number;
    image?: string;
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

// Mock function to simulate image generation
export const generateImages = async (
  parameters: GenerationParameters
): Promise<GeneratedImage[]> => {
  console.log('Generating images with parameters:', parameters);
  
  // In a real implementation, this would call the local Python backend
  // For demonstration, we'll simulate the process with a delay
  
  try {
    // Show a toast notification that generation has started
    const loadingToast = toast.loading('Generating image...');
    
    // Simulate processing time (would be longer in reality)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock the generated images
    const results: GeneratedImage[] = [];
    const timestamp = Date.now();
    
    for (let i = 0; i < parameters.batchSize; i++) {
      // Use a deterministic seed if provided, otherwise generate a random one
      const seed = parameters.seed !== null ? 
        parameters.seed + i : 
        Math.floor(Math.random() * 2147483647);
      
      // In a real implementation, this URL would point to a locally generated image
      // For the mock, we'll use placeholder images
      const imageUrls = [
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/5e12c2da-d2a7-4c0f-b331-3b0c8ec79ccd/width=1024/00054.jpeg',
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a49912af-88c7-4a1e-afcb-5c57f1ecff90/width=1024/00186-3850407391.jpeg',
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/4137777c-b33d-40f3-acba-5ffcd08c89bb/width=1024/00054-1499682456.jpeg',
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/ccc6a52f-48e7-483f-a579-c54dc7e3b1ba/width=1024/00029-1507642904.jpeg'
      ];
      
      results.push({
        id: `img-${timestamp}-${i}`,
        url: imageUrls[i % imageUrls.length],
        prompt: parameters.prompt,
        negativePrompt: parameters.negativePrompt,
        parameters: { ...parameters },
        seed,
        timestamp
      });
    }
    
    // Dismiss the loading toast and show success
    toast.dismiss(loadingToast);
    toast.success(`Generated ${results.length} image${results.length > 1 ? 's' : ''}`);
    
    return results;
  } catch (error) {
    console.error('Error generating images:', error);
    toast.error('Failed to generate images. Please try again.');
    return [];
  }
};

// Function to save an image to the gallery
export const saveImageToGallery = async (image: GeneratedImage): Promise<boolean> => {
  // In a real implementation, this would save to local storage or a database
  console.log('Saving image to gallery:', image);
  
  // Simulate successful save
  toast.success('Image saved to gallery');
  
  return true;
};

// Function to get image information
export const getImageInfo = async (imageId: string): Promise<GeneratedImage | null> => {
  // In a real implementation, this would fetch from local storage or a database
  // For now, just return a mock object
  
  return {
    id: imageId,
    url: 'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/5e12c2da-d2a7-4c0f-b331-3b0c8ec79ccd/width=1024/00054.jpeg',
    prompt: 'A detailed portrait of a cyberpunk character with neon lights',
    negativePrompt: 'blurry, low quality',
    parameters: {
      prompt: 'A detailed portrait of a cyberpunk character with neon lights',
      negativePrompt: 'blurry, low quality',
      model: 'sd15',
      width: 512,
      height: 512,
      steps: 30,
      cfgScale: 7,
      sampler: 'DPM++ 2M Karras',
      seed: 123456789,
      batchSize: 1
    },
    seed: 123456789,
    timestamp: Date.now() - 86400000 // Yesterday
  };
};

// These are placeholder/mock functions. In a real application, you would implement
// proper communication with a local Python backend running stable diffusion.
