
import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, ChartBar, ChartLine, ChartPie, ChartArea, Database } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const analysisConfig = [
  {
    id: 'feasibility',
    name: 'Feasibility Analysis',
    description: 'Evaluate market conditions, competition, and success factors',
    icon: Calculator,
    chartType: 'bar',
    metrics: ['Market Size', 'Competition', 'Cost', 'Potential Revenue', 'Risk'],
    calculation: (inputs: Record<string, number>) => {
      const marketSize = inputs.marketSize || 0;
      const competition = inputs.competition || 0;
      const cost = inputs.cost || 0;
      const revenue = inputs.revenue || 0;
      const risk = inputs.risk || 0;
      
      const feasibilityScore = (marketSize * 0.3) + ((10 - competition) * 0.15) + ((10 - cost) * 0.2) + (revenue * 0.25) + ((10 - risk) * 0.1);
      return {
        score: feasibilityScore.toFixed(2),
        data: [
          { name: 'Market Size', value: marketSize },
          { name: 'Competition', value: 10 - competition },
          { name: 'Cost Efficiency', value: 10 - cost },
          { name: 'Revenue Potential', value: revenue },
          { name: 'Risk Assessment', value: 10 - risk },
        ]
      };
    }
  },
  {
    id: 'forecasting',
    name: 'Business Forecasting',
    description: 'Project sales, market trends, and future developments',
    icon: ChartLine,
    chartType: 'line',
    metrics: ['Initial Sales', 'Growth Rate (%)', 'Months to Forecast', 'Seasonality Factor', 'Market Trend'],
    calculation: (inputs: Record<string, number>) => {
      const initialSales = inputs.initialSales || 0;
      const growthRate = inputs.growthRate || 0;
      const months = inputs.months || 12;
      const seasonality = inputs.seasonality || 0;
      const marketTrend = inputs.marketTrend || 0;
      
      const data = [];
      for (let i = 0; i < months; i++) {
        const growthFactor = 1 + (growthRate / 100);
        const seasonalFactor = 1 + (Math.sin((i / 12) * Math.PI * 2) * (seasonality / 10));
        const trendFactor = 1 + ((marketTrend / 10) * (i / months));
        const sales = initialSales * Math.pow(growthFactor, i/12) * seasonalFactor * trendFactor;
        
        data.push({
          name: `Month ${i+1}`,
          value: parseFloat(sales.toFixed(2))
        });
      }
      
      const avgSales = data.reduce((sum, item) => sum + item.value, 0) / data.length;
      
      return {
        score: avgSales.toFixed(2),
        data
      };
    }
  },
  {
    id: 'optimization',
    name: 'Business Optimization',
    description: 'Improve efficiency, maximize profit, and minimize costs',
    icon: ChartBar,
    chartType: 'bar',
    metrics: ['Current Efficiency', 'Process Improvements', 'Technology Level', 'Staff Training', 'Resource Allocation'],
    calculation: (inputs: Record<string, number>) => {
      const currentEfficiency = inputs.currentEfficiency || 0;
      const processImprovements = inputs.processImprovements || 0;
      const technologyLevel = inputs.technologyLevel || 0;
      const staffTraining = inputs.staffTraining || 0;
      const resourceAllocation = inputs.resourceAllocation || 0;
      
      const optimizationScore = (currentEfficiency * 0.2) + (processImprovements * 0.25) + (technologyLevel * 0.2) + (staffTraining * 0.15) + (resourceAllocation * 0.2);
      
      return {
        score: optimizationScore.toFixed(2),
        data: [
          { name: 'Current Efficiency', value: currentEfficiency },
          { name: 'Process Improvements', value: processImprovements },
          { name: 'Technology Level', value: technologyLevel },
          { name: 'Staff Training', value: staffTraining },
          { name: 'Resource Allocation', value: resourceAllocation },
        ]
      };
    }
  },
  {
    id: 'cultivation',
    name: 'Agricultural Business',
    description: 'Optimize growing conditions, market timing, and cultivation strategies',
    icon: ChartArea,
    chartType: 'area',
    metrics: ['Soil Quality', 'Climate Suitability', 'Water Availability', 'Growing Season Length', 'Pest Risk'],
    calculation: (inputs: Record<string, number>) => {
      const soilQuality = inputs.soilQuality || 0;
      const climateSuitability = inputs.climateSuitability || 0;
      const waterAvailability = inputs.waterAvailability || 0;
      const growingSeason = inputs.growingSeason || 0;
      const pestRisk = inputs.pestRisk || 0;
      
      const cultivationScore = (soilQuality * 0.25) + (climateSuitability * 0.2) + (waterAvailability * 0.2) + (growingSeason * 0.15) + ((10 - pestRisk) * 0.2);
      
      // Generate monthly data for the year
      const data = [];
      for (let i = 0; i < 12; i++) {
        const monthFactor = Math.sin((i / 12) * Math.PI * 2 + Math.PI/2);
        const seasonalYield = cultivationScore * (0.7 + (0.3 * (monthFactor + 1)/2));
        
        data.push({
          name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
          value: parseFloat(seasonalYield.toFixed(2))
        });
      }
      
      return {
        score: cultivationScore.toFixed(2),
        data
      };
    }
  },
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Analyze strengths, weaknesses, opportunities, and threats',
    icon: ChartPie,
    chartType: 'pie',
    metrics: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'],
    calculation: (inputs: Record<string, number>) => {
      const strengths = inputs.strengths || 0;
      const weaknesses = inputs.weaknesses || 0;
      const opportunities = inputs.opportunities || 0;
      const threats = inputs.threats || 0;
      
      const total = strengths + weaknesses + opportunities + threats;
      const swotScore = (strengths * 0.3) + ((10 - weaknesses) * 0.2) + (opportunities * 0.3) + ((10 - threats) * 0.2);
      
      return {
        score: swotScore.toFixed(2),
        data: [
          { name: 'Strengths', value: strengths, fill: '#4CAF50' },
          { name: 'Weaknesses', value: weaknesses, fill: '#F44336' },
          { name: 'Opportunities', value: opportunities, fill: '#2196F3' },
          { name: 'Threats', value: threats, fill: '#FF9800' },
        ]
      };
    }
  }
];

const Analysis = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string | null>('feasibility');
  const [inputs, setInputs] = useState<Record<string, Record<string, number>>>({});
  const [results, setResults] = useState<Record<string, { score: string, data: any[] }>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingChart, setIsGeneratingChart] = useState<boolean>(false);
  const [aiGeneratedChart, setAiGeneratedChart] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleInputChange = (featureId: string, metric: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({
      ...prev,
      [featureId]: {
        ...(prev[featureId] || {}),
        [metric.toLowerCase().replace(/\s+/g, '')]: Math.min(10, Math.max(0, numValue))
      }
    }));
  };
  
  const calculateAnalysis = (featureId: string) => {
    const feature = analysisConfig.find(f => f.id === featureId);
    if (feature) {
      const result = feature.calculation(inputs[featureId] || {});
      setResults(prev => ({
        ...prev,
        [featureId]: result
      }));
      
      // Save the result to the database if user is logged in
      if (user) {
        saveAnalysisResult(featureId, result);
      }
    }
  };
  
  const saveAnalysisResult = async (type: string, data: any) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('analysis_results')
        .insert({
          user_id: user!.id,
          type,
          data
        });
        
      if (error) throw error;
      toast({
        title: "Results saved",
        description: "Your analysis has been saved to your profile.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving results",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateAIChart = async (featureId: string) => {
    if (!results[featureId]) {
      toast({
        title: "No results available",
        description: "Please calculate results first before generating charts.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGeneratingChart(true);
      
      // Get the selected feature details
      const feature = analysisConfig.find(f => f.id === featureId);
      
      // Create a prompt for the AI
      const prompt = `Generate a professional business chart image for a ${feature?.name} with the following data points: ${JSON.stringify(results[featureId].data)}. The chart should be visually appealing, use corporate colors, and include labels for each data point. Make it suitable for a business presentation.`;
      
      // Call the Supabase edge function to generate image
      const response = await fetch('https://yuqmvayaiiqbkeletlno.supabase.co/functions/v1/generateChart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ prompt, featureId })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAiGeneratedChart(data.imageUrl);
      
      toast({
        title: "Chart generated",
        description: "AI has generated a chart based on your analysis.",
      });
    } catch (error: any) {
      console.error("Error generating chart:", error);
      toast({
        title: "Error generating chart",
        description: error.message || "An error occurred while generating the chart",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingChart(false);
    }
  };
  
  const currentFeature = analysisConfig.find(f => f.id === selectedFeature);
  
  return (
    <div className="flex h-screen bg-[#F8F8F4]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        selectedFeature={selectedFeature}
        setSelectedFeature={setSelectedFeature}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'md:ml-0' : 'md:ml-0 w-full'
      }`}>
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        <main className="flex-1 overflow-auto p-6 bg-[#F8F8F4]">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">{currentFeature?.name || 'Analysis'}</h1>
            <p className="text-muted-foreground mb-6">{currentFeature?.description}</p>
            
            <Tabs defaultValue="input" className="w-full">
              <TabsList>
                <TabsTrigger value="input">Input Data</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="ai">AI Generated Chart</TabsTrigger>
              </TabsList>
              
              <TabsContent value="input" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Input Parameters</CardTitle>
                    <CardDescription>
                      Enter values between 0-10 for each metric to calculate your {currentFeature?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentFeature && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentFeature.metrics.map((metric) => (
                          <div key={metric} className="space-y-2">
                            <label htmlFor={`${metric}`} className="text-sm font-medium">
                              {metric} (0-10)
                            </label>
                            <Input
                              id={`${metric}`}
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              placeholder={`Enter ${metric} (0-10)`}
                              value={inputs[currentFeature.id]?.[metric.toLowerCase().replace(/\s+/g, '')] || ''}
                              onChange={(e) => handleInputChange(currentFeature.id, metric, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => calculateAnalysis(currentFeature?.id || '')}
                      disabled={isLoading}
                      className="w-full md:w-auto"
                    >
                      {isLoading ? 'Calculating...' : 'Calculate Results'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="results" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>
                      {results[currentFeature?.id || ''] 
                        ? `Overall score: ${results[currentFeature?.id || ''].score}/10` 
                        : 'No results calculated yet'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {results[currentFeature?.id || ''] ? (
                      <div className="space-y-6">
                        <div className="h-80">
                          <ChartContainer config={{}} className="h-full">
                            {currentFeature?.chartType === 'bar' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={results[currentFeature.id].data}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis domain={[0, 10]} />
                                  <Tooltip content={<ChartTooltipContent />} />
                                  <Legend />
                                  <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                            
                            {currentFeature?.chartType === 'line' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={results[currentFeature.id].data}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip content={<ChartTooltipContent />} />
                                  <Legend />
                                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                                </LineChart>
                              </ResponsiveContainer>
                            )}
                            
                            {currentFeature?.chartType === 'area' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results[currentFeature.id].data}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis domain={[0, 10]} />
                                  <Tooltip content={<ChartTooltipContent />} />
                                  <Legend />
                                  <Area type="monotone" dataKey="value" fill="#8884d8" stroke="#8884d8" />
                                </AreaChart>
                              </ResponsiveContainer>
                            )}
                            
                            {currentFeature?.chartType === 'pie' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={results[currentFeature.id].data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={(entry) => entry.name}
                                  />
                                  <Tooltip content={<ChartTooltipContent />} />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            )}
                          </ChartContainer>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Metric</TableHead>
                              <TableHead className="text-right">Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results[currentFeature.id].data.map((item) => (
                              <TableRow key={item.name}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.value}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        <Button 
                          onClick={() => generateAIChart(currentFeature?.id || '')}
                          disabled={isGeneratingChart}
                          variant="outline"
                          className="w-full"
                        >
                          {isGeneratingChart ? 'Generating...' : 'Generate AI Chart'}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <p>Calculate results first to see analysis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ai" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Generated Visualization</CardTitle>
                    <CardDescription>
                      Advanced chart generated by AI based on your analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiGeneratedChart ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={aiGeneratedChart} 
                          alt="AI Generated Chart" 
                          className="max-w-full max-h-[500px] rounded-md shadow-md"
                        />
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = aiGeneratedChart;
                            link.download = `${currentFeature?.name}-chart.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          Download Chart
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-20 text-muted-foreground">
                        <p>No AI-generated chart available yet</p>
                        <p className="text-sm mt-2">Click "Generate AI Chart" in the Results tab to create one</p>
                      </div>
                    )}
                  </CardContent>
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
