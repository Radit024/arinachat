
import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Import refactored components
import FeatureInput from '@/components/analysis/FeatureInput';
import ResultsDisplay from '@/components/analysis/ResultsDisplay';
import AIVisualization from '@/components/analysis/AIVisualization';
import { analysisFeatures } from '@/components/analysis/features';

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
                    <FeatureInput
                      fields={currentFeature.fields || []}
                      formInputs={formInputs}
                      handleInputChange={handleInputChange}
                      handleSelectChange={handleSelectChange}
                      implemented={currentFeature.implemented}
                    />
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
                    <ResultsDisplay results={results} featureId={currentFeature.id} />
                    <div className="flex justify-end gap-2 mt-4">
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
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="ai" className="mt-4">
                <AIVisualization 
                  aiGeneratedImage={aiGeneratedImage} 
                  featureName={currentFeature.name}
                  onBackClick={() => setCurrentTab('results')}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analysis;
