
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // In a real implementation, you would connect to your AI API here
    // For demo purposes, we'll simulate an AI response
    console.log('Received chat request with messages:', messages);
    
    const userMessage = messages[messages.length - 1]?.content || "";
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a simple response based on the user message
    let aiResponse = `Thank you for your message: "${userMessage}". As an agricultural business assistant, I can help analyze your data and provide insights.`;
    
    if (userMessage.toLowerCase().includes('analysis')) {
      aiResponse = "I'd be happy to help with your analysis! Please provide more details about the specific agricultural data you'd like to analyze.";
    } else if (userMessage.toLowerCase().includes('forecast')) {
      aiResponse = "For accurate market forecasting, I'll need information about your crop type, region, historical data, and any specific market indicators you're interested in.";
    } else if (userMessage.toLowerCase().includes('help')) {
      aiResponse = "I can help you with agricultural business analytics, market forecasts, ROI calculations, and crop performance analysis. What specific information do you need?";
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});
