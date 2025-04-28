
import React from 'react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onExampleClick: (message: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onExampleClick }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-semibold mb-8 text-center">
        How can Arina help you today?
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-start text-left"
          onClick={() => onExampleClick("Analyze market feasibility for a new product")}
        >
          <span className="font-medium mb-2">Market feasibility analysis</span>
          <span className="text-sm text-gray-500">Evaluate your new business idea's potential</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-start text-left"
          onClick={() => onExampleClick("Create a business forecast for next quarter")}
        >
          <span className="font-medium mb-2">Create a business forecast</span>
          <span className="text-sm text-gray-500">Project your business growth trends</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-start text-left"
          onClick={() => onExampleClick("Analyze ROI for new equipment investment")}
        >
          <span className="font-medium mb-2">Calculate ROI for investments</span>
          <span className="text-sm text-gray-500">Understand the return on your investments</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-start text-left"
          onClick={() => onExampleClick("Create SWOT analysis for my business")}
        >
          <span className="font-medium mb-2">Create a SWOT analysis</span>
          <span className="text-sm text-gray-500">Identify strengths, weaknesses, opportunities, threats</span>
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
