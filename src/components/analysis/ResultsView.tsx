
import React from 'react';
import { Button } from '@/components/ui/button';
import { BusinessFeasibilityChart } from './BusinessFeasibility';
import { DemandForecastingChart } from './DemandForecasting';
import { OptimizationChart } from './OptimizationAnalysis';

interface ResultsViewProps {
  currentFeature: {
    id: string;
    name: string;
  };
  results: {
    score: number;
    metrics: Array<{
      name: string;
      value: string | number;
    }>;
    chartData: any[];
  };
  isGeneratingAI: boolean;
  generateAIChart: () => void;
  setCurrentTab: (tab: string) => void;
  saveAnalysisResults: () => void;
  user: any;
}

const ResultsView: React.FC<ResultsViewProps> = ({
  currentFeature,
  results,
  isGeneratingAI,
  generateAIChart,
  setCurrentTab,
  saveAnalysisResults,
  user
}) => {
  const renderChart = () => {
    if (!results || !results.chartData) return null;
    
    switch (currentFeature.id) {
      case 'feasibility':
        return <BusinessFeasibilityChart chartData={results.chartData} />;
      case 'forecasting':
        return <DemandForecastingChart chartData={results.chartData} />;
      case 'optimization':
        return <OptimizationChart chartData={results.chartData} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Analysis Results</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Score: {results.score}%
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {results.metrics.map((metric, i) => (
            <div key={i} className="bg-muted/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">{metric.name}</h4>
              <p className="text-xl font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 h-[300px]">
        {renderChart()}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentTab('input')}
        >
          Back to Input
        </Button>
        <Button
          onClick={generateAIChart}
          disabled={isGeneratingAI}
        >
          {isGeneratingAI ? 'Generating...' : 'Generate AI Chart'}
        </Button>
        {user && (
          <Button
            variant="default"
            onClick={saveAnalysisResults}
          >
            Save Results
          </Button>
        )}
      </div>
    </>
  );
};

export default ResultsView;
