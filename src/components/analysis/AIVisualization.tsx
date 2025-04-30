
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AIVisualizationProps {
  aiGeneratedImage: string | null;
  featureName: string;
  onBackClick: () => void;
}

const AIVisualization = ({ aiGeneratedImage, featureName, onBackClick }: AIVisualizationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Visualization</CardTitle>
        <CardDescription>
          Custom visualization created based on your analysis data
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {aiGeneratedImage ? (
          <img 
            src={aiGeneratedImage} 
            alt="AI Generated Chart" 
            className="max-w-full max-h-[500px] border rounded-md shadow-md"
          />
        ) : (
          <div className="text-center p-12 text-muted-foreground">
            <p>No AI visualization generated yet</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBackClick}
        >
          Back to Results
        </Button>
        {aiGeneratedImage && (
          <Button
            onClick={() => {
              // Create a download link
              const link = document.createElement('a');
              link.href = aiGeneratedImage;
              link.download = `${featureName}_visualization.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download Image
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIVisualization;
