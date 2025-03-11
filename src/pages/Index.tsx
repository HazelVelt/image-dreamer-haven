
import { useState } from 'react';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptInput } from '@/components/PromptInput';
import { ImageGallery } from '@/components/ImageGallery';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ModelInfo } from '@/services/modelService';
import { GenerationParameters, GeneratedImage, generateImages } from '@/services/generationService';
import { toast } from 'sonner';

const Index = () => {
  const [selectedModel, setSelectedModel] = useState<ModelInfo | undefined>();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleSelectModel = (model: ModelInfo) => {
    setSelectedModel(model);
  };

  const handleGenerate = async (params: GenerationParameters) => {
    try {
      const newImages = await generateImages(params);
      setGeneratedImages(prev => [...newImages, ...prev]);
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images');
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
    toast.success('Image removed');
  };

  const handleClearGallery = () => {
    setGeneratedImages([]);
    toast.success('Gallery cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8 text-center max-w-2xl mx-auto relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <div className="inline-block mb-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            Local Model Diffusion
          </div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">Image Generator</h1>
          <p className="text-muted-foreground">
            Create beautiful images with your local stable diffusion models
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-6">
            <ModelSelector 
              onSelectModel={handleSelectModel} 
              selectedModel={selectedModel} 
            />
            <PromptInput 
              selectedModel={selectedModel} 
              onGenerate={handleGenerate} 
            />
          </div>
          <div>
            <ImageGallery 
              images={generatedImages} 
              onRemoveImage={handleRemoveImage}
              onClearGallery={handleClearGallery}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
