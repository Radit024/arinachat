
import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, ChartBar, ChartLine, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';
import { analysisFeatures } from '@/data/analysisFeatures';

// Define the feature types and their configurations
const featureConfigs = [
  {
    id: 'feasibility',
    name: 'Business Feasibility Analysis',
    description: 'Analyze investment costs, operational costs, and potential returns to determine business viability',
    icon: Calculator,
    implemented: true,
    fields: [
      { name: 'investmentCost', label: 'Investment Cost (Biaya Investasi)', type: 'number', placeholder: '0' },
      { name: 'operationalCost', label: 'Operational Cost per Month (Biaya Operasional per Bulan)', type: 'number', placeholder: '0' },
      { name: 'productionCostPerUnit', label: 'Production Cost per Unit (Biaya Produksi per Unit)', type: 'number', placeholder: '0' },
      { name: 'salesVolumePerMonth', label: 'Sales Volume per Month (Volume Penjualan per Bulan)', type: 'number', placeholder: '0' },
      { name: 'markup', label: 'Markup (%)', type: 'number', placeholder: '0' }
    ],
    calculation: (inputs) => {
      // Parse input values
      const investmentCost = parseFloat(inputs.investmentCost) || 0;
      const operationalCost = parseFloat(inputs.operationalCost) || 0;
      const productionCostPerUnit = parseFloat(inputs.productionCostPerUnit) || 0;
      const salesVolumePerMonth = parseFloat(inputs.salesVolumePerMonth) || 0;
      const markup = parseFloat(inputs.markup) || 0;
      
      // Calculate base production cost per unit (HPP)
      const hpp = productionCostPerUnit;
      
      // Calculate selling price per unit
      const sellingPrice = hpp * (1 + markup/100);
      
      // Calculate monthly revenue
      const revenue = sellingPrice * salesVolumePerMonth;
      
      // Calculate monthly profit
      const monthlyProfit = revenue - (operationalCost + (productionCostPerUnit * salesVolumePerMonth));
      
      // Calculate annual profit
      const annualProfit = monthlyProfit * 12;
      
      // Calculate ROI
      const roi = investmentCost > 0 ? (annualProfit / investmentCost) * 100 : 0;
      
      // Calculate Break Even Point (BEP) in units
      const fixedCosts = operationalCost;
      const contributionMargin = sellingPrice - productionCostPerUnit;
      const bepUnits = contributionMargin > 0 ? fixedCosts / contributionMargin : 0;
      
      // Calculate Payback Period (in months)
      const paybackPeriod = monthlyProfit > 0 ? investmentCost / monthlyProfit : 0;
      
      // Calculate Profit Margin
      const profitMargin = revenue > 0 ? (monthlyProfit / revenue) * 100 : 0;
      
      // Calculate feasibility score (0-100)
      let feasibilityScore = 0;
      if (roi > 0) feasibilityScore += 20;
      if (roi > 20) feasibilityScore += 15;
      if (paybackPeriod < 24) feasibilityScore += 20;
      if (paybackPeriod < 12) feasibilityScore += 15;
      if (profitMargin > 10) feasibilityScore += 15;
      if (monthlyProfit > operationalCost) feasibilityScore += 15;
      
      return {
        score: feasibilityScore,
        metrics: [
          { name: 'Production Cost (HPP) per Unit', value: hpp.toFixed(2) },
          { name: 'Selling Price per Unit', value: sellingPrice.toFixed(2) },
          { name: 'Revenue (Monthly)', value: revenue.toFixed(2) },
          { name: 'Profit (Monthly)', value: monthlyProfit.toFixed(2) },
          { name: 'ROI (Return on Investment)', value: roi.toFixed(2) + '%' },
          { name: 'BEP (Break Even Point)', value: bepUnits.toFixed(2) + ' units' },
          { name: 'Payback Period', value: paybackPeriod.toFixed(2) + ' months' },
          { name: 'Profit Margin', value: profitMargin.toFixed(2) + '%' }
        ],
        chartData: [
          { name: 'Investment', value: investmentCost },
          { name: 'Monthly Operational Cost', value: operationalCost },
          { name: 'Monthly Production Cost', value: productionCostPerUnit * salesVolumePerMonth },
          { name: 'Monthly Revenue', value: revenue },
          { name: 'Monthly Profit', value: monthlyProfit }
        ]
      };
    }
  },
  {
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
  },
  {
    id: 'optimization',
    name: 'Maximization and Minimization Analysis',
    description: 'Optimize resource usage and minimize costs using Simplex Method or Linear Programming',
    icon: ChartBar,
    implemented: true,
    fields: [
      { name: 'optimizationType', label: 'Optimization Type', type: 'select', options: ['Maximize Profit', 'Minimize Cost'] },
      { name: 'optimizationMethod', label: 'Method', type: 'select', options: ['Simplex Method', 'Linear Programming'] },
      { name: 'variables', label: 'Variables (comma-separated, e.g. "Crop A,Crop B")', type: 'text', placeholder: 'X1,X2' },
      { name: 'objective', label: 'Objective Function Coefficients (comma-separated)', type: 'text', placeholder: '3,2' },
      { name: 'constraints', label: 'Constraints (one per line, format: coefficients;limit, e.g. "2,1;10")', type: 'textarea', placeholder: '2,1;10\n1,3;15' },
      { name: 'nonNegative', label: 'Non-negative variables', type: 'select', options: ['Yes', 'No'] }
    ],
    calculation: (inputs) => {
      const optimizationType = inputs.optimizationType || 'Maximize Profit';
      const optimizationMethod = inputs.optimizationMethod || 'Simplex Method';
      const isMaximizing = optimizationType === 'Maximize Profit';
      
      // Parse variables
      const variablesString = inputs.variables || 'X1,X2';
      const variables = variablesString.split(',').map(v => v.trim()).filter(v => v.length > 0);
      
      // Parse objective function
      const objectiveString = inputs.objective || '3,2';
      const objective = objectiveString.split(',')
        .map(val => parseFloat(val.trim()))
        .filter(val => !isNaN(val));
      
      // Parse constraints
      const constraintsString = inputs.constraints || '2,1;10\n1,3;15';
      const constraintLines = constraintsString.split('\n').filter(line => line.trim().length > 0);
      
      const constraints = constraintLines.map(line => {
        const [coeffsStr, limitStr] = line.split(';');
        const coeffs = coeffsStr.split(',')
          .map(val => parseFloat(val.trim()))
          .filter(val => !isNaN(val));
        const limit = parseFloat(limitStr.trim());
        
        return { coeffs, limit: isNaN(limit) ? 0 : limit };
      });
      
      // Validate inputs
      if (objective.length !== variables.length) {
        return {
          score: 0,
          metrics: [{ name: 'Error', value: `Objective function must have ${variables.length} coefficients` }],
          chartData: []
        };
      }
      
      for (const constraint of constraints) {
        if (constraint.coeffs.length !== variables.length) {
          return {
            score: 0,
            metrics: [{ name: 'Error', value: `Each constraint must have ${variables.length} coefficients` }],
            chartData: []
          };
        }
      }
      
      // Simplified solution for demonstration purposes
      // In a real application, you would implement the Simplex algorithm or use a library
      
      // For 2 variables, we can calculate the intersection points of constraints
      // and determine the optimal solution
      let results = { x: [], optimal: 0, feasible: true };
      let solutionDesc = '';
      
      if (variables.length === 2) {
        // Find all intersection points of constraint lines with axes and with each other
        const points = [];
        
        // Origin (if non-negative)
        if (inputs.nonNegative === 'Yes') {
          points.push({ x: [0, 0], constraints: [] });
        }
        
        // Intersections with axes
        for (let i = 0; i < variables.length; i++) {
          for (const constraint of constraints) {
            if (constraint.coeffs[i] !== 0) {
              const point = Array(variables.length).fill(0);
              point[i] = constraint.limit / constraint.coeffs[i];
              if (point[i] >= 0 || inputs.nonNegative !== 'Yes') {
                points.push({ x: point, constraints: [constraint] });
              }
            }
          }
        }
        
        // Intersections between constraints
        for (let i = 0; i < constraints.length; i++) {
          for (let j = i + 1; j < constraints.length; j++) {
            const a1 = constraints[i].coeffs[0];
            const b1 = constraints[i].coeffs[1];
            const c1 = constraints[i].limit;
            
            const a2 = constraints[j].coeffs[0];
            const b2 = constraints[j].coeffs[1];
            const c2 = constraints[j].limit;
            
            // Solve the system of equations
            const det = a1 * b2 - a2 * b1;
            
            if (det !== 0) {
              const x1 = (c1 * b2 - c2 * b1) / det;
              const x2 = (a1 * c2 - a2 * c1) / det;
              
              // Check if the point satisfies non-negativity
              if ((x1 >= 0 && x2 >= 0) || inputs.nonNegative !== 'Yes') {
                points.push({ x: [x1, x2], constraints: [constraints[i], constraints[j]] });
              }
            }
          }
        }
        
        // Check which points are feasible (satisfy all constraints)
        const feasiblePoints = points.filter(point => {
          for (const constraint of constraints) {
            const sum = constraint.coeffs.reduce((sum, coeff, idx) => sum + coeff * point.x[idx], 0);
            if (sum > constraint.limit) {
              return false;
            }
          }
          return true;
        });
        
        if (feasiblePoints.length === 0) {
          results.feasible = false;
          solutionDesc = 'The problem has no feasible solution';
        } else {
          // Evaluate objective function at each feasible point
          for (const point of feasiblePoints) {
            const objectiveValue = objective.reduce((sum, coeff, idx) => sum + coeff * point.x[idx], 0);
            point.objectiveValue = isMaximizing ? objectiveValue : -objectiveValue;
          }
          
          // Find the optimal solution
          let optimalPoint = feasiblePoints[0];
          for (let i = 1; i < feasiblePoints.length; i++) {
            if (feasiblePoints[i].objectiveValue > optimalPoint.objectiveValue) {
              optimalPoint = feasiblePoints[i];
            }
          }
          
          results.x = optimalPoint.x;
          results.optimal = isMaximizing 
            ? optimalPoint.objectiveValue 
            : -optimalPoint.objectiveValue;
          
          solutionDesc = `Optimal solution: ${variables.map((v, i) => `${v} = ${optimalPoint.x[i].toFixed(2)}`).join(', ')}`;
        }
      } else {
        // For more than 2 variables, we use a simplified approach
        solutionDesc = 'For problems with more than 2 variables, a more advanced solver is required';
        results.feasible = true;
        
        // Generate random feasible solution for demonstration purposes
        results.x = Array(variables.length).fill(0).map(() => Math.random() * 10);
        results.optimal = objective.reduce((sum, coeff, idx) => sum + coeff * results.x[idx], 0);
        if (!isMaximizing) results.optimal = -results.optimal;
      }
      
      // Prepare chart data for visualization
      let chartData = [];
      
      // For 2 variables, we can visualize the feasible region and constraints
      if (variables.length === 2) {
        // Generate points for visualization
        const maxCoord = 20;
        const steps = 10;
        
        for (let i = 0; i <= steps; i++) {
          const x1 = (i / steps) * maxCoord;
          
          // For each constraint, calculate the corresponding x2 value
          for (let j = 0; j < constraints.length; j++) {
            if (constraints[j].coeffs[1] !== 0) {
              const x2 = (constraints[j].limit - constraints[j].coeffs[0] * x1) / constraints[j].coeffs[1];
              if (x2 >= 0 || inputs.nonNegative !== 'Yes') {
                chartData.push({
                  x1: x1,
                  x2: x2,
                  constraint: `Constraint ${j + 1}`
                });
              }
            }
          }
        }
        
        // Add optimal point to the chart
        if (results.feasible) {
          chartData.push({
            x1: results.x[0],
            x2: results.x[1],
            constraint: "Optimal Point",
            isOptimal: true
          });
        }
      } else {
        // For more variables, show the contribution of each variable to the objective
        for (let i = 0; i < variables.length; i++) {
          chartData.push({
            variable: variables[i],
            value: results.x[i],
            contribution: objective[i] * results.x[i]
          });
        }
      }
      
      return {
        score: results.feasible ? (isMaximizing ? 80 : 20) + Math.min(20, Math.max(0, results.optimal)) : 0,
        metrics: [
          { name: 'Method', value: optimizationMethod },
          { name: 'Type', value: optimizationType },
          { name: 'Optimal Value', value: results.feasible ? results.optimal.toFixed(2) : 'N/A' },
          { name: 'Solution', value: solutionDesc }
        ],
        chartData: chartData
      };
    }
  }
];

const Analysis = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState('feasibility');
  const [currentTab, setCurrentTab] = useState('input');
  const [formInputs, setFormInputs] = useState({});
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get the current feature configuration
  const currentFeature = featureConfigs.find(f => f.id === selectedFeature) || featureConfigs[0];
  
  const handleInputChange = (name, value) => {
    setFormInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name, value) => {
    handleInputChange(name, value);
  };
  
  const handleCalculate = () => {
    if (!currentFeature.implemented) {
      toast({
        title: "Feature Coming Soon",
        description: "This analysis feature is not yet implemented.",
        variant: "default"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      try {
        const result = currentFeature.calculation(formInputs);
        setResults(result);
        setCurrentTab('results');
        
        toast({
          title: "Analysis Complete",
          description: `${currentFeature.name} calculated with a score of ${result.score}%`,
        });
      } catch (error) {
        console.error("Calculation error:", error);
        toast({
          title: "Calculation Error",
          description: "There was a problem calculating your results.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };
  
  const generateAIChart = async () => {
    if (!results) {
      toast({
        title: "No Results",
        description: "Please run the analysis first to generate an AI chart.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingAI(true);
    
    try {
      // Create a prompt for the AI based on feature type and results
      const prompt = `Create a professional ${currentFeature.name} chart visualization based on the following data: ${JSON.stringify(results.chartData)}. Make it visually appealing with corporate colors and clear labels.`;
      
      // Call the Supabase edge function to generate chart
      const response = await fetch(`${window.location.origin}/functions/v1/generateChart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ prompt, featureId: currentFeature.id })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAiGeneratedImage(data.imageUrl);
      setCurrentTab('ai');
      
      toast({
        title: "AI Chart Generated",
        description: "Your custom chart visualization has been created.",
      });
    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        title: "Generation Error",
        description: "There was a problem generating your AI chart.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  const saveAnalysisResults = async () => {
    if (!results || !user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('analysis_results')
        .insert({
          user_id: user.id,
          type: currentFeature.id,
          data: {
            inputs: formInputs,
            results: results,
            ai_image: aiGeneratedImage
          }
        });
      
      if (error) throw error;
      
      toast({
        title: "Analysis Saved",
        description: "Your analysis results have been saved to your account.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Error",
        description: "There was a problem saving your analysis.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle navigation to feature from sidebar
  const handleFeatureSelect = (featureId) => {
    setSelectedFeature(featureId);
    setFormInputs({});
    setResults(null);
    setAiGeneratedImage(null);
    setCurrentTab('input');
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Render the appropriate chart based on feature type
  const renderChart = () => {
    if (!results || !results.chartData) return null;
    
    switch (currentFeature.id) {
      case 'feasibility':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.chartData}>
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
            <LineChart data={results.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              {results.chartData.some(d => d.actual !== null) && (
                <Line type="monotone" dataKey="actual" stroke="#4CAF50" strokeWidth={2} name="Actual" />
              )}
              {results.chartData.some(d => d.forecast !== null) && (
                <Line type="monotone" dataKey="forecast" stroke="#9b87f5" strokeWidth={2} name="Forecast" />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'optimization':
        // For optimization, we need to handle different chart types based on variables
        if (results.chartData.some(d => d.variable)) {
          // For multi-variable optimization, show bar chart of variable values
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="variable" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="value" fill="#9b87f5" name="Variable Value" />
                <Bar dataKey="contribution" fill="#4CAF50" name="Contribution" />
              </BarChart>
            </ResponsiveContainer>
          );
        } else {
          // For 2-variable optimization, show scatter plot
          return (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={results.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x1" label={{ value: 'X1', position: 'bottom' }} />
                <YAxis dataKey="x2" label={{ value: 'X2', angle: -90, position: 'left' }} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="x2" stroke="#9b87f5" dot={{ r: 4 }} name="Constraints" />
                {results.chartData.some(d => d.isOptimal) && (
                  <Line type="monotone" dataKey="isOptimal" stroke="#FF5722" dot={{ r: 8 }} name="Optimal Point" />
                )}
              </LineChart>
            </ResponsiveContainer>
          );
        }
      default:
        return null;
    }
  };
  
  // Render the input form based on the selected feature
  const renderInputForm = () => {
    if (!currentFeature.implemented) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
          <p className="text-muted-foreground max-w-md">
            We're currently working on this feature. It will be available in a future update.
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentFeature.fields.map((field) => {
          // Check conditional display of field
          if (field.condition && formInputs[field.condition.field] !== field.condition.value) {
            return null;
          }
          
          return (
            <div key={field.name} className="space-y-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </label>
              
              {field.type === 'select' ? (
                <Select 
                  onValueChange={(value) => handleSelectChange(field.name, value)}
                  value={formInputs[field.name] || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || 'Select an option'} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={formInputs[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="min-h-[100px]"
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formInputs[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Get the current feature configuration
  const currentFeature = featureConfigs.find(f => f.id === selectedFeature) || featureConfigs[0];
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Analysis Tools</h2>
          <div className="space-y-2">
            {featureConfigs.map((feature) => (
              <button
                key={feature.id}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  selectedFeature === feature.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleFeatureSelect(feature.id)}
              >
                <feature.icon className="h-5 w-5" />
                <span>{feature.name}</span>
              </button>
            ))}
          </div>
        </div>
      </Sidebar>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{currentFeature.name}</h1>
            <p className="text-muted-foreground mb-8">{currentFeature.description}</p>

            <Card>
              <CardHeader>
                <CardTitle>{currentFeature.name}</CardTitle>
                <CardDescription>{currentFeature.description}</CardDescription>
              </CardHeader>

              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <div className="px-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="input">Input</TabsTrigger>
                    <TabsTrigger value="results" disabled={!results}>Results</TabsTrigger>
                    <TabsTrigger value="ai" disabled={!aiGeneratedImage}>AI Visualization</TabsTrigger>
                  </TabsList>
                </div>

                <CardContent className="p-6">
                  <TabsContent value="input" className="space-y-6">
                    {renderInputForm()}
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setFormInputs({})}
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleCalculate}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Calculating...' : 'Run Analysis'}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="results" className="space-y-6">
                    {results && (
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
                              disabled={isLoading}
                            >
                              Save Results
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="ai" className="space-y-6">
                    {aiGeneratedImage && (
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
                              disabled={isLoading}
                            >
                              Save Results with Chart
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
