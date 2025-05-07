
import React from 'react';
import { ChartLine } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

// Feature definition
export const demandForecastingConfig = {
  id: 'forecasting',
  name: 'Demand Forecasting',
  description: 'Predict future demand based on historical data using SMA or Exponential Smoothing',
  icon: ChartLine,
  implemented: true,
  fields: [
    { name: 'forecastMethod', label: 'Forecasting Method', type: 'select', options: ['Simple Moving Average (SMA)', 'Exponential Smoothing'] },
    { name: 'historicalData', label: 'Historical Data (comma-separated values)', type: 'text', placeholder: '10, 12, 15, 14, 16, 18, 17, 19, 20, 22' },
    { name: 'forecastPeriods', label: 'Number of Periods to Forecast', type: 'number', placeholder: '5' },
    { name: 'maParameters', label: 'Moving Average Periods', type: 'number', placeholder: '3', condition: { field: 'forecastMethod', value: 'Simple Moving Average (SMA)' } },
    { name: 'smoothingFactor', label: 'Smoothing Factor (0-1)', type: 'number', placeholder: '0.3', condition: { field: 'forecastMethod', value: 'Exponential Smoothing' } }
  ],
  calculation: (inputs) => {
    // Parse historical data
    const historicalDataString = inputs.historicalData || '';
    const historicalData = historicalDataString.split(',')
      .map(val => parseFloat(val.trim()))
      .filter(val => !isNaN(val));
    
    if (historicalData.length < 2) {
      return {
        score: 0,
        metrics: [{ name: 'Error', value: 'Not enough historical data' }],
        chartData: []
      };
    }
    
    const forecastMethod = inputs.forecastMethod || 'Simple Moving Average (SMA)';
    const forecastPeriods = parseInt(inputs.forecastPeriods) || 5;
    
    let forecast = [];
    let forecastData = [];
    
    // Prepare chart data with historical values
    const chartData = historicalData.map((value, index) => ({
      name: `Past ${historicalData.length - index}`,
      actual: value,
      forecast: null
    }));
    
    // Calculate forecasts based on selected method
    if (forecastMethod === 'Simple Moving Average (SMA)') {
      const periods = parseInt(inputs.maParameters) || 3;
      
      if (periods > historicalData.length) {
        return {
          score: 0,
          metrics: [{ name: 'Error', value: 'Not enough data for the selected MA period' }],
          chartData: []
        };
      }
      
      // Calculate Simple Moving Average
      for (let i = 0; i < forecastPeriods; i++) {
        const startIndex = historicalData.length - periods + i;
        const endIndex = historicalData.length + i;
        const dataToAverage = [...historicalData, ...forecast].slice(startIndex, endIndex);
        
        const average = dataToAverage.reduce((sum, val) => sum + val, 0) / periods;
        forecast.push(parseFloat(average.toFixed(2)));
        
        chartData.push({
          name: `Future ${i + 1}`,
          actual: null,
          forecast: average
        });
      }
    } else if (forecastMethod === 'Exponential Smoothing') {
      const alpha = parseFloat(inputs.smoothingFactor) || 0.3;
      
      // Initialize with the first value
      let lastForecast = historicalData[0];
      
      // Calculate exponential smoothing for historical data (for visualization)
      for (let i = 1; i < historicalData.length; i++) {
        const smoothed = alpha * historicalData[i] + (1 - alpha) * lastForecast;
        chartData[i].forecast = parseFloat(smoothed.toFixed(2));
        lastForecast = smoothed;
      }
      
      // Generate future forecasts
      for (let i = 0; i < forecastPeriods; i++) {
        // For exponential smoothing forecasting future periods,
        // the forecast is the same as the last smoothed value
        chartData.push({
          name: `Future ${i + 1}`,
          actual: null,
          forecast: parseFloat(lastForecast.toFixed(2))
        });
        
        forecast.push(parseFloat(lastForecast.toFixed(2)));
      }
    }
    
    // Calculate metrics
    const lastActual = historicalData[historicalData.length - 1];
    const firstForecast = forecast[0];
    const percentChange = lastActual !== 0 ? ((firstForecast - lastActual) / lastActual) * 100 : 0;
    
    // Calculate accuracy based on how well the method fits the historical data
    let accuracy = 0;
    if (forecastMethod === 'Simple Moving Average (SMA)') {
      const periods = parseInt(inputs.maParameters) || 3;
      // Calculate MAE for historical data
      if (historicalData.length >= periods) {
        let totalError = 0;
        let count = 0;
        
        for (let i = periods; i < historicalData.length; i++) {
          const actual = historicalData[i];
          const predictedSum = historicalData.slice(i - periods, i).reduce((sum, val) => sum + val, 0);
          const predicted = predictedSum / periods;
          totalError += Math.abs(actual - predicted);
          count++;
        }
        
        const mae = count > 0 ? totalError / count : 0;
        const maxValue = Math.max(...historicalData);
        accuracy = 100 - (mae / maxValue * 100);
      }
    } else if (forecastMethod === 'Exponential Smoothing') {
      const alpha = parseFloat(inputs.smoothingFactor) || 0.3;
      
      // Calculate accuracy based on historical fits
      let lastPrediction = historicalData[0];
      let totalError = 0;
      
      for (let i = 1; i < historicalData.length; i++) {
        const actual = historicalData[i];
        const predicted = alpha * historicalData[i - 1] + (1 - alpha) * lastPrediction;
        lastPrediction = predicted;
        totalError += Math.abs(actual - predicted);
      }
      
      const mae = historicalData.length > 1 ? totalError / (historicalData.length - 1) : 0;
      const maxValue = Math.max(...historicalData);
      accuracy = 100 - (mae / maxValue * 100);
    }
    
    return {
      score: Math.min(100, Math.max(0, Math.round(accuracy))),
      metrics: [
        { name: 'Forecasting Method', value: forecastMethod },
        { name: 'Next Period Forecast', value: forecast[0]?.toFixed(2) || 'N/A' },
        { name: 'Change from Last Actual', value: percentChange.toFixed(2) + '%' },
        { name: 'Forecast Accuracy', value: Math.round(accuracy) + '%' }
      ],
      chartData: chartData
    };
  }
};

// Results visualization component
export const DemandForecastingChart = ({ chartData }) => {
  if (!chartData) return null;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        {chartData.some(d => d.actual !== null) && (
          <Line type="monotone" dataKey="actual" stroke="#4CAF50" strokeWidth={2} name="Actual" />
        )}
        {chartData.some(d => d.forecast !== null) && (
          <Line type="monotone" dataKey="forecast" stroke="#9b87f5" strokeWidth={2} name="Forecast" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};
