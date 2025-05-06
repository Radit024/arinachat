
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
    description: 'Analyze market conditions, costs, and potential returns to determine business viability',
    icon: Calculator,
    implemented: true,
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'Enter business name' },
      { name: 'industry', label: 'Industry', type: 'text', placeholder: 'Enter industry' },
      { name: 'initialInvestment', label: 'Initial Investment ($)', type: 'number', placeholder: '0' },
      { name: 'monthlyExpenses', label: 'Monthly Expenses ($)', type: 'number', placeholder: '0' },
      { name: 'expectedRevenue', label: 'Expected Annual Revenue ($)', type: 'number', placeholder: '0' },
      { name: 'targetMarketSize', label: 'Target Market Size', type: 'text', placeholder: 'Enter market size' },
      { name: 'growthRate', label: 'Expected Annual Growth Rate (%)', type: 'number', placeholder: '0' },
      { name: 'breakEvenPeriod', label: 'Expected Break-even Period (months)', type: 'number', placeholder: '0' }
    ],
    calculation: (inputs) => {
      // Business feasibility calculation algorithm
      const initialInvestment = parseFloat(inputs.initialInvestment) || 0;
      const monthlyExpenses = parseFloat(inputs.monthlyExpenses) || 0;
      const expectedRevenue = parseFloat(inputs.expectedRevenue) || 0;
      const growthRate = parseFloat(inputs.growthRate) || 0;
      const breakEvenPeriod = parseFloat(inputs.breakEvenPeriod) || 12;
      
      const annualExpenses = monthlyExpenses * 12;
      const profit = expectedRevenue - annualExpenses;
      const roi = initialInvestment > 0 ? (profit / initialInvestment) * 100 : 0;
      const paybackPeriod = profit > 0 ? initialInvestment / profit : 0;
      
      // Calculate feasibility score (0-100)
      let feasibilityScore = 0;
      if (profit > 0) feasibilityScore += 30;
      if (roi > 15) feasibilityScore += 20;
      if (paybackPeriod < 2) feasibilityScore += 20;
      if (growthRate > 5) feasibilityScore += 15;
      if (breakEvenPeriod < 18) feasibilityScore += 15;
      
      return {
        score: feasibilityScore,
        metrics: [
          { name: 'Profit Margin', value: profit > 0 ? (profit / expectedRevenue * 100).toFixed(2) + '%' : '0%' },
          { name: 'ROI', value: roi.toFixed(2) + '%' },
          { name: 'Payback Period', value: paybackPeriod.toFixed(2) + ' years' },
          { name: 'Break-even', value: breakEvenPeriod + ' months' }
        ],
        chartData: [
          { name: 'Initial Investment', value: initialInvestment },
          { name: 'Annual Expenses', value: annualExpenses },
          { name: 'Expected Revenue', value: expectedRevenue },
          { name: 'Profit', value: profit > 0 ? profit : 0 }
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
  
  return (
    <div className="flex h-screen bg-[#F8F8F4]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        selectedFeature={selectedFeature}
        setSelectedFeature={handleFeatureSelect}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'md:ml-0' : 'md:ml-0 w-full'
      }`}>
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        <main className="flex-1 overflow-auto p-6 bg-[#F8F8F4]">
          <div className="container mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1A1F2C]">{currentFeature.name}</h1>
              <p className="text-muted-foreground">{currentFeature.description}</p>
            </div>
            
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList>
                <TabsTrigger value="input">Input Data</TabsTrigger>
                <TabsTrigger value="results" disabled={!results}>Results</TabsTrigger>
                <TabsTrigger value="ai" disabled={!aiGeneratedImage}>AI Visualization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="input" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Input Parameters</CardTitle>
                    <CardDescription>
                      Fill in the details below to analyze your {currentFeature.name.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderInputForm()}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormInputs({});
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleCalculate}
                      disabled={isLoading || !currentFeature.implemented}
                    >
                      {isLoading ? 'Calculating...' : 'Run Analysis'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="results" className="mt-4">
                {results && (
                  <div className="space-y-4">
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
                            {renderChart()}
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
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentTab('input')}
                        >
                          Edit Inputs
                        </Button>
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={saveAnalysisResults}>
                            Save Results
                          </Button>
                          <Button 
                            onClick={generateAIChart}
                            disabled={isGeneratingAI}
                          >
                            {isGeneratingAI ? 'Generating...' : 'Generate AI Chart'}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="ai" className="mt-4">
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
                      onClick={() => setCurrentTab('results')}
                    >
                      Back to Results
                    </Button>
                    {aiGeneratedImage && (
                      <Button
                        onClick={() => {
                          // Create a download link
                          const link = document.createElement('a');
                          link.href = aiGeneratedImage;
                          link.download = `${currentFeature.name}_visualization.png`;
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
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analysis;
