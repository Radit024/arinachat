
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
import { analysisFeatures } from '@/data/analysisFeatures';

// Import refactored components
import InputForm from '@/components/analysis/InputForm';
import ResultsView from '@/components/analysis/ResultsView';
import AIVisualization from '@/components/analysis/AIVisualization';
import { featureConfigs, getFeatureById } from '@/components/analysis/AnalysisFeatures';

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
  const currentFeature = getFeatureById(selectedFeature);
  
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
    <div className="flex h-screen bg-background">
      {/* Sidebar - updated to pass correct props */}
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        selectedFeature={selectedFeature}
        setSelectedFeature={handleFeatureSelect}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - updated to pass correct props */}
        <Header 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
        />

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
                    <InputForm
                      currentFeature={currentFeature}
                      formInputs={formInputs}
                      handleInputChange={handleInputChange}
                      handleSelectChange={handleSelectChange}
                    />
                    
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
                      <ResultsView
                        currentFeature={currentFeature}
                        results={results}
                        isGeneratingAI={isGeneratingAI}
                        generateAIChart={generateAIChart}
                        setCurrentTab={setCurrentTab}
                        saveAnalysisResults={saveAnalysisResults}
                        user={user}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="ai" className="space-y-6">
                    <AIVisualization
                      aiGeneratedImage={aiGeneratedImage}
                      setCurrentTab={setCurrentTab}
                      saveAnalysisResults={saveAnalysisResults}
                      user={user}
                    />
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
