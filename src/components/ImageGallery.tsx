
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { GeneratedImage } from '@/services/generationService';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { Download, Info, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onRemoveImage: (imageId: string) => void;
  onClearGallery: () => void;
}

export function ImageGallery({ images, onRemoveImage, onClearGallery }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const downloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `sd-image-${image.seed}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded');
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderImageInfo = (image: GeneratedImage) => {
    return (
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-medium mb-1">Prompt</h3>
          <div className="relative">
            <p className="bg-muted p-2 rounded text-muted-foreground">{image.prompt}</p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1"
              onClick={() => copyPrompt(image.prompt)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {image.negativePrompt && (
          <div>
            <h3 className="font-medium mb-1">Negative Prompt</h3>
            <p className="bg-muted p-2 rounded text-muted-foreground">{image.negativePrompt}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-1">Model</h3>
            <p className="text-muted-foreground">{image.parameters.model}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Size</h3>
            <p className="text-muted-foreground">{image.parameters.width} x {image.parameters.height}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Steps</h3>
            <p className="text-muted-foreground">{image.parameters.steps}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">CFG Scale</h3>
            <p className="text-muted-foreground">{image.parameters.cfgScale}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Sampler</h3>
            <p className="text-muted-foreground">{image.parameters.sampler}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Seed</h3>
            <p className="text-muted-foreground">{image.seed}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-1">Generated</h3>
          <p className="text-muted-foreground">{formatDate(image.timestamp)}</p>
        </div>
      </div>
    );
  };

  if (images.length === 0) {
    return (
      <Card className="glass-panel h-full animate-fade-in">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No images generated yet</p>
            <p className="text-sm mt-2">Generated images will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel animate-fade-in overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Generated Images</h3>
          {images.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearGallery}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[500px] pr-4 -mr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="image-container aspect-square bg-secondary overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.prompt.substring(0, 30)} 
                    className="w-full h-full object-cover transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-xs flex flex-col justify-center items-center gap-2">
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => setSelectedImage(image)}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            Info
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="aspect-square bg-secondary rounded-md overflow-hidden">
                              <img 
                                src={image.url} 
                                alt={image.prompt.substring(0, 30)} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <ScrollArea className="h-[300px] pr-4 -mr-4">
                              {renderImageInfo(image)}
                            </ScrollArea>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => downloadImage(image)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onRemoveImage(image.id)}
                      className="absolute bottom-2 right-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm line-clamp-1 text-foreground">{image.prompt.substring(0, 50)}{image.prompt.length > 50 ? '...' : ''}</p>
                  <p className="text-xs text-muted-foreground">{image.parameters.width}x{image.parameters.height} • Seed: {image.seed.toString().substring(0, 8)}...</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
