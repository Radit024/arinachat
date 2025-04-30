
// Feature configuration for Business Forecasting
export const forecastingConfig = {
  id: 'forecasting',
  name: 'Business Forecasting',
  description: 'Predict future trends based on historical data and market conditions',
  implemented: true,
  fields: [
    { name: 'forecastType', label: 'Forecast Type', type: 'select', options: ['Sales Forecast', 'Revenue Forecast', 'Growth Forecast'] },
    { name: 'timePeriod', label: 'Time Period', type: 'select', options: ['Monthly', 'Quarterly', 'Yearly'] },
    { name: 'initialValue', label: 'Initial Value', type: 'number', placeholder: '0' },
    { name: 'growthRate', label: 'Growth Rate (%)', type: 'number', placeholder: '0' },
    { name: 'forecastPeriods', label: 'Number of Periods to Forecast', type: 'number', placeholder: '12' },
    { name: 'seasonality', label: 'Seasonality Factor (0-10)', type: 'number', placeholder: '5' }
  ],
  calculation: (inputs: Record<string, any>) => {
    const initialValue = parseFloat(inputs.initialValue) || 1000;
    const growthRate = parseFloat(inputs.growthRate) || 5;
    const periods = parseInt(inputs.forecastPeriods) || 12;
    const seasonality = parseFloat(inputs.seasonality) || 5;
    const timePeriod = inputs.timePeriod || 'Monthly';
    
    // Generate forecast data with seasonality
    const forecastData = [];
    for (let i = 0; i < periods; i++) {
      const growthFactor = 1 + (growthRate / 100);
      // Add seasonal variations (higher in middle of year, lower at start/end)
      const seasonalFactor = 1 + ((Math.sin((i / periods) * Math.PI * 2) * (seasonality / 10)));
      const value = initialValue * Math.pow(growthFactor, i) * seasonalFactor;
      
      let label;
      if (timePeriod === 'Monthly') {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = monthNames[i % 12];
      } else if (timePeriod === 'Quarterly') {
        label = `Q${(i % 4) + 1}`;
      } else {
        label = `Year ${i+1}`;
      }
      
      forecastData.push({
        name: label,
        value: Math.round(value)
      });
    }
    
    // Calculate metrics
    const finalValue = forecastData[forecastData.length - 1].value;
    const totalGrowth = ((finalValue - initialValue) / initialValue) * 100;
    const averageValue = forecastData.reduce((sum, item) => sum + item.value, 0) / forecastData.length;
    const cagr = (Math.pow(finalValue / initialValue, 1 / periods) - 1) * 100;
    
    return {
      score: Math.min(100, Math.max(0, totalGrowth)),
      metrics: [
        { name: 'Total Growth', value: `${totalGrowth.toFixed(2)}%` },
        { name: 'Final Value', value: finalValue.toFixed(2) },
        { name: 'Average Value', value: averageValue.toFixed(2) },
        { name: 'CAGR', value: `${cagr.toFixed(2)}%` }
      ],
      chartData: forecastData
    };
  }
};
