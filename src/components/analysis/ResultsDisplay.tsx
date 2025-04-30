
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AnalysisChart from './AnalysisChart';
import { ChartContainer } from '@/components/ui/chart';

interface ResultsDisplayProps {
  results: {
    score: number;
    metrics: Array<{ name: string; value: string }>;
    chartData: Array<any>;
  };
  featureId: string;
}

const ResultsDisplay = ({ results, featureId }: ResultsDisplayProps) => {
  if (!results) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Overall Score: {results.score}/100
            </CardDescription>
          </div>
          <div className="text-3xl font-bold">{results.score}%</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-8">
          <ChartContainer config={{}} className="h-full">
            <AnalysisChart featureId={featureId} chartData={results.chartData} />
          </ChartContainer>
        </div>
        
        <h3 className="text-lg font-medium mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.metrics.map((metric, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <span className="text-lg font-medium">
                  {metric.value}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
