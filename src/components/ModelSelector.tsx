
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ModelInfo, ModelFolder, scanLocalModels } from '@/services/modelService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ModelSelectorProps {
  onSelectModel: (model: ModelInfo) => void;
  selectedModel?: ModelInfo;
}

export function ModelSelector({ onSelectModel, selectedModel }: ModelSelectorProps) {
  const [modelFolders, setModelFolders] = useState<ModelFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('checkpoints');

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const folders = await scanLocalModels();
        setModelFolders(folders);
        
        // Set default selection if none is provided
        if (!selectedModel && folders.length > 0 && folders[0].models.length > 0) {
          onSelectModel(folders[0].models[0]);
        }
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [onSelectModel, selectedModel]);

  return (
    <Card className="glass-panel animate-fade-in">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Select Model</h3>
        
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex space-x-1">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid mb-4" style={{ gridTemplateColumns: `repeat(${modelFolders.length}, 1fr)` }}>
              {modelFolders.map(folder => (
                <TabsTrigger key={folder.id} value={folder.id} className="px-3 py-2">
                  {folder.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {modelFolders.map(folder => (
              <TabsContent key={folder.id} value={folder.id} className="mt-0">
                <ScrollArea className="h-[300px] pr-4 -mr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {folder.models.map(model => (
                      <div 
                        key={model.id}
                        className={`
                          cursor-pointer rounded-lg p-2 transition-all duration-200
                          border border-border hover:border-primary/50
                          ${selectedModel?.id === model.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                        `}
                        onClick={() => onSelectModel(model)}
                      >
                        <div className="flex items-center gap-3">
                          {model.thumbnail ? (
                            <div className="w-16 h-16 rounded overflow-hidden bg-secondary flex-shrink-0">
                              <img 
                                src={model.thumbnail} 
                                alt={model.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl text-muted-foreground">SD</span>
                            </div>
                          )}
                          <div className="flex-grow">
                            <h4 className="font-medium text-sm text-foreground line-clamp-1">{model.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">{model.path.split('/').pop()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
