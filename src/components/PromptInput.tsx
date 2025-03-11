
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Sparkles, ChevronDown } from "lucide-react";
import { ModelInfo } from '@/services/modelService';
import { GenerationParameters } from '@/services/generationService';

interface PromptInputProps {
  selectedModel?: ModelInfo;
  onGenerate: (params: GenerationParameters) => void;
}

const SAMPLERS = [
  "Euler a",
  "Euler",
  "DPM++ 2M Karras",
  "LMS",
  "DDIM",
];

export function PromptInput({ selectedModel, onGenerate }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("blurry, bad quality, low resolution, distorted, deformed");
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(25);
  const [cfgScale, setCfgScale] = useState(7);
  const [sampler, setSampler] = useState(SAMPLERS[0]);
  const [seed, setSeed] = useState<string>("");
  const [batchSize, setBatchSize] = useState(1);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedModel) {
      return;
    }

    if (!prompt.trim()) {
      return;
    }

    setGenerating(true);

    const parsedSeed = seed ? parseInt(seed) : null;

    try {
      const params: GenerationParameters = {
        prompt,
        negativePrompt,
        model: selectedModel.id,
        width,
        height,
        steps,
        cfgScale,
        sampler,
        seed: parsedSeed,
        batchSize,
      };

      await onGenerate(params);
    } finally {
      setGenerating(false);
    }
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 2147483647).toString());
  };

  return (
    <Card className="glass-panel animate-fade-in">
      <CardContent className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Prompt</label>
          <Textarea
            placeholder="Describe the image you want to generate..."
            className="resize-none min-h-24"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Negative Prompt</label>
          <Textarea
            placeholder="What to avoid in the generated image..."
            className="resize-none min-h-16"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
          />
        </div>

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <div className="flex items-center justify-between mb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2 text-muted-foreground">
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-4 animate-slide-down">
            <Separator className="my-2" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Width</label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[width]}
                    min={128}
                    max={1024}
                    step={64}
                    onValueChange={(vals) => setWidth(vals[0])}
                    className="flex-grow"
                  />
                  <span className="text-sm min-w-12 text-right">{width}px</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Height</label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[height]}
                    min={128}
                    max={1024}
                    step={64}
                    onValueChange={(vals) => setHeight(vals[0])}
                    className="flex-grow"
                  />
                  <span className="text-sm min-w-12 text-right">{height}px</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Steps</label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[steps]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={(vals) => setSteps(vals[0])}
                    className="flex-grow"
                  />
                  <span className="text-sm min-w-10 text-right">{steps}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CFG Scale</label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[cfgScale]}
                    min={1}
                    max={15}
                    step={0.5}
                    onValueChange={(vals) => setCfgScale(vals[0])}
                    className="flex-grow"
                  />
                  <span className="text-sm min-w-10 text-right">{cfgScale}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sampler</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  value={sampler}
                  onChange={(e) => setSampler(e.target.value)}
                >
                  {SAMPLERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Seed</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Random"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={randomizeSeed}
                    className="flex-shrink-0"
                    title="Random seed"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Batch Size</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[batchSize]}
                  min={1}
                  max={4}
                  step={1}
                  onValueChange={(vals) => setBatchSize(vals[0])}
                  className="flex-grow"
                />
                <span className="text-sm min-w-10 text-right">{batchSize}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="my-4" />

        <Button
          className="w-full"
          size="lg"
          disabled={!selectedModel || !prompt.trim() || generating}
          onClick={handleGenerate}
        >
          {generating ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
              Generating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
