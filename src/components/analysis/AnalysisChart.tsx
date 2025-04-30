
import React from 'react';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define types for the chart renderer props
interface AnalysisChartProps {
  featureId: string;
  chartData: Array<any>;
}

const AnalysisChart = ({ featureId, chartData }: AnalysisChartProps) => {
  // Render the appropriate chart based on feature type
  switch (featureId) {
    case 'feasibility':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="value" fill="#9b87f5" />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'forecasting':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#9b87f5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'swot':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={(entry) => entry.name}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    case 'canvas':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="value" fill="#9b87f5" />
          </BarChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
};

export default AnalysisChart;
