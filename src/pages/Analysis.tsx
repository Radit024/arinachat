
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
import { Calculator, ChartBar, ChartLine, ChartPie, FileSpreadsheet, Layers, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Define the feature types and their configurations
const analysisFeatures = [
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
      // Simple feasibility calculation algorithm
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
    name: 'Business Forecasting',
    description: 'Predict future trends based on historical data and market conditions',
    icon: ChartLine,
    implemented: true,
    fields: [
      { name: 'forecastType', label: 'Forecast Type', type: 'select', options: ['Sales Forecast', 'Revenue Forecast', 'Growth Forecast'] },
      { name: 'timePeriod', label: 'Time Period', type: 'select', options: ['Monthly', 'Quarterly', 'Yearly'] },
      { name: 'initialValue', label: 'Initial Value', type: 'number', placeholder: '0' },
      { name: 'growthRate', label: 'Growth Rate (%)', type: 'number', placeholder: '0' },
      { name: 'forecastPeriods', label: 'Number of Periods to Forecast', type: 'number', placeholder: '12' },
      { name: 'seasonality', label: 'Seasonality Factor (0-10)', type: 'number', placeholder: '5' }
    ],
    calculation: (inputs) => {
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
      
      return {
        score: Math.min(100, Math.max(0, totalGrowth)),
        metrics: [
          { name: 'Total Growth', value: `${totalGrowth.toFixed(2)}%` },
          { name: 'Final Value', value: finalValue.toFixed(2) },
          { name: 'Average Value', value: averageValue.toFixed(2) },
          { name: 'CAGR', value: `${(Math.pow(finalValue / initialValue, 1 / periods) - 1) * 100}%` }
        ],
        chartData: forecastData
      };
    }
  },
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Identify Strengths, Weaknesses, Opportunities, and Threats to your business',
    icon: ChartPie,
    implemented: true,
    fields: [
      { name: 'businessName', label: 'Business or Project Name', type: 'text', placeholder: 'Enter the name of your business or project' },
      { name: 'strengths', label: 'Strengths', type: 'textarea', placeholder: 'List your business strengths here' },
      { name: 'weaknesses', label: 'Weaknesses', type: 'textarea', placeholder: 'List your business weaknesses here' },
      { name: 'opportunities', label: 'Opportunities', type: 'textarea', placeholder: 'List your business opportunities here' },
      { name: 'threats', label: 'Threats', type: 'textarea', placeholder: 'List your business threats here' }
    ],
    calculation: (inputs) => {
      // Calculate SWOT score based on text length as a simple metric
      const strengthsLength = (inputs.strengths || '').length;
      const weaknessesLength = (inputs.weaknesses || '').length;
      const opportunitiesLength = (inputs.opportunities || '').length;
      const threatsLength = (inputs.threats || '').length;
      
      // For visualization purposes, normalize lengths to values between 10 and 100
      const normalizeLength = (length) => Math.min(100, Math.max(10, length / 10));
      
      const strengthsValue = normalizeLength(strengthsLength);
      const weaknessesValue = normalizeLength(weaknessesLength);
      const opportunitiesValue = normalizeLength(opportunitiesLength);
      const threatsValue = normalizeLength(threatsLength);
      
      // Calculate SWOT balance score
      const totalLength = strengthsLength + weaknessesLength + opportunitiesLength + threatsLength;
      const swotScore = totalLength > 0 ? 
        ((strengthsLength + opportunitiesLength) / totalLength) * 100 : 50;
      
      return {
        score: Math.round(swotScore),
        metrics: [
          { name: 'Strengths', value: inputs.strengths || 'None provided' },
          { name: 'Weaknesses', value: inputs.weaknesses || 'None provided' },
          { name: 'Opportunities', value: inputs.opportunities || 'None provided' },
          { name: 'Threats', value: inputs.threats || 'None provided' }
        ],
        chartData: [
          { name: 'Strengths', value: strengthsValue, fill: '#4CAF50' },
          { name: 'Weaknesses', value: weaknessesValue, fill: '#F44336' },
          { name: 'Opportunities', value: opportunitiesValue, fill: '#2196F3' },
          { name: 'Threats', value: threatsValue, fill: '#FF9800' }
        ]
      };
    }
  },
  {
    id: 'canvas',
    name: 'Business Model Canvas',
    description: 'Interactive tool to design and refine your business model visually',
    icon: Layers,
    implemented: true,
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'Enter business name' },
      { name: 'keyPartners', label: '1. Key Partners', type: 'textarea', placeholder: 'Who are your key partners and suppliers? Which key resources are you acquiring from them? Which key activities do they perform?' },
      { name: 'keyActivities', label: '2. Key Activities', type: 'textarea', placeholder: 'What key activities does your value proposition require? Your distribution channels? Customer relationships? Revenue streams?' },
      { name: 'valueProposition', label: '3. Value Propositions', type: 'textarea', placeholder: 'What value do you deliver to the customer? Which of your customer\'s problems are you helping to solve? What bundles of products and services are you offering to each segment?' },
      { name: 'customerRelationships', label: '4. Customer Relationships', type: 'textarea', placeholder: 'What type of relationship does each of your customer segments expect you to establish and maintain with them?' },
      { name: 'customerSegments', label: '5. Customer Segments', type: 'textarea', placeholder: 'For whom are you creating value? Who are your most important customers?' },
      { name: 'keyResources', label: '6. Key Resources', type: 'textarea', placeholder: 'What key resources does your value proposition require? Your distribution channels? Customer relationships? Revenue streams?' },
      { name: 'channels', label: '7. Channels', type: 'textarea', placeholder: 'Through which channels do your customer segments want to be reached? How are you reaching them now? How are your channels integrated?' },
      { name: 'costStructure', label: '8. Cost Structure', type: 'textarea', placeholder: 'What are the most important costs inherent in your business model? Which key resources are most expensive? Which key activities are most expensive?' },
      { name: 'revenueStreams', label: '9. Revenue Streams', type: 'textarea', placeholder: 'For what value are your customers really willing to pay? How are they currently paying? How would they prefer to pay? How much does each revenue stream contribute to overall revenues?' }
    ],
    calculation: (inputs) => {
      // Calculate completeness score for Business Model Canvas
      const fields = ['keyPartners', 'keyActivities', 'valueProposition', 'customerRelationships', 
                     'customerSegments', 'keyResources', 'channels', 'costStructure', 'revenueStreams'];
      
      let totalScore = 0;
      let filledSections = 0;
      
      // Count filled sections and calculate average length
      for (const field of fields) {
        if (inputs[field] && inputs[field].length > 0) {
          filledSections++;
          totalScore += Math.min(100, inputs[field].length / 5);
        }
      }
      
      const completionScore = (filledSections / fields.length) * 100;
      const avgScore = filledSections > 0 ? totalScore / filledSections : 0;
      
      // Create chart data for visualization
      const chartData = fields.map(field => {
        const value = inputs[field] ? Math.min(100, inputs[field].length / 5) : 0;
        const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return {
          name: label,
          value: value
        };
      });
      
      return {
        score: Math.round(completionScore),
        metrics: [
          { name: 'Completion', value: `${Math.round(completionScore)}%` },
          { name: 'Sections Filled', value: `${filledSections}/${fields.length}` },
          { name: 'Average Detail', value: `${Math.round(avgScore)}%` }
        ],
        chartData: chartData
      };
    }
  },
  {
    id: 'optimization',
    name: 'Business Optimization',
    description: 'Coming Soon',
    icon: ChartBar,
    implemented: false
  },
  {
    id: 'cultivation',
    name: 'Agricultural Business',
    description: 'Coming Soon',
    icon: FileSpreadsheet,
    implemented: false
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
  const currentFeature = analysisFeatures.find(f => f.id === selectedFeature) || analysisFeatures[0];
  
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
          feature_id: currentFeature.id,
          inputs: formInputs,
          results: results,
          ai_image: aiGeneratedImage
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
    
    const config = {};
    
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
              <Line type="monotone" dataKey="value" stroke="#9b87f5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'swot':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={results.chartData}
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
            <BarChart data={results.chartData} layout="vertical">
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
        {currentFeature.fields.map((field) => (
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
        ))}
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
