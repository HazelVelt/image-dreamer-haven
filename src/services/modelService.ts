
// Service for interacting with local models
import { toast } from "sonner";

export interface ModelInfo {
  id: string;
  name: string;
  path: string;
  type: 'checkpoint' | 'lora' | 'vae';
  thumbnail?: string;
}

export interface ModelFolder {
  id: string;
  name: string;
  models: ModelInfo[];
}

// The URL where our Python backend is running
const API_URL = "http://localhost:8000";

// Function to scan for local models
export const scanLocalModels = async (): Promise<ModelFolder[]> => {
  try {
    const response = await fetch(`${API_URL}/models`);
    
    if (!response.ok) {
      throw new Error('Failed to scan models');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error scanning models:', error);
    toast.error('Failed to scan models. Please check if the backend server is running.');
    return [];
  }
};

// Function to verify a model exists locally
export const verifyModel = async (model: ModelInfo): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/models/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model_path: model.path }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error verifying model:', error);
    return false;
  }
};

// Function to get additional model info
export const getModelMetadata = async (model: ModelInfo): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/models/${model.id}/metadata`);
    
    if (!response.ok) {
      throw new Error('Failed to get model metadata');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting model metadata:', error);
    return {};
  }
};
