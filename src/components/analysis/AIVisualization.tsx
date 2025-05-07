
import React from 'react';
import { Button } from '@/components/ui/button';

interface AIVisualizationProps {
  aiGeneratedImage: string | null;
  setCurrentTab: (tab: string) => void;
  saveAnalysisResults: () => void;
  user: any;
}

const AIVisualization: React.FC<AIVisualizationProps> = ({
  aiGeneratedImage,
  setCurrentTab,
  saveAnalysisResults,
  user
}) => {
  if (!aiGeneratedImage) return null;

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="overflow-hidden rounded-lg border bg-card w-full max-w-3xl">
          <img 
            src={aiGeneratedImage} 
            alt="AI Generated Chart" 
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            This AI-generated chart visualization was created based on your analysis results.
          </p>
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentTab('results')}
        >
          Back to Results
        </Button>
        {user && (
          <Button
            variant="default"
            onClick={saveAnalysisResults}
          >
            Save Results with Chart
          </Button>
        )}
      </div>
    </>
  );
};

export default AIVisualization;
