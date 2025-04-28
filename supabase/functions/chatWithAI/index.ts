
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Business topics that the AI is allowed to discuss
const ALLOWED_TOPICS = [
  'business', 'market', 'finance', 'investment', 'profit', 
  'revenue', 'cost', 'strategy', 'planning', 'management',
  'marketing', 'sales', 'customer', 'product', 'service',
  'analysis', 'projections', 'forecast', 'feasibility', 'swot',
  'optimization', 'efficiency', 'sustainability', 'growth', 
  'competition', 'economics', 'industry', 'trends', 'development'
];

// Check if a message is related to business topics
function isBusinessRelated(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  // Simple check for any business term in the message
  return ALLOWED_TOPICS.some(topic => lowerMessage.includes(topic)) ||
    // Check for analysis features from our app
    ['business feasibility', 'forecasting', 'maximization', 'minimization', 
     'optimization', 'seasonal commodity', 'annual commodity', 'business model',
     'swot analysis'].some(term => lowerMessage.includes(term));
}

// Get feature-specific task description
function getTaskDescription(selectedFeature: string | null): string {
  switch (selectedFeature) {
    case 'business-feasibility':
      return 'Your ONLY task is feasibility analysis. STRICTLY focus on market conditions, competition, and success factors relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to feasibility. If the query is off-topic, explicitly state: "I can only discuss business feasibility analysis."';
    case 'forecasting':
      return 'Your ONLY task is business forecasting. STRICTLY focus on sales projections, market trends, and future developments relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to forecasting. If the query is off-topic, explicitly state: "I can only discuss business forecasting."';
    case 'max-min-analysis':
      return 'Your ONLY task is business optimization. STRICTLY focus on efficiency, profit maximization, and cost minimization strategies relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to optimization. If the query is off-topic, explicitly state: "I can only discuss business optimization strategies."';
    case 'cultivation':
      return 'Your ONLY task is agricultural business insights. STRICTLY focus on optimal growing conditions, market timing, and cultivation strategies relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to agricultural cultivation. If the query is off-topic, explicitly state: "I can only discuss agricultural business insights."';
    case 'seasonal-commodity':
      return 'Your ONLY task is seasonal commodity analysis. STRICTLY focus on price fluctuations, market patterns, and seasonal trends relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to seasonal commodities. If the query is off-topic, explicitly state: "I can only discuss seasonal commodity analysis."';
    case 'annual-commodity':
      return 'Your ONLY task is annual commodity analysis. STRICTLY focus on long-term price projections, market cycles, and annual trends relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to annual commodities. If the query is off-topic, explicitly state: "I can only discuss annual commodity analysis."';
    case 'business-model-canvas':
      return 'Your ONLY task is Business Model Canvas assistance. STRICTLY focus on the nine building blocks (partners, activities, resources, value propositions, customer relationships, channels, segments, cost, revenue) relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to the Business Model Canvas. If the query is off-topic, explicitly state: "I can only assist with the Business Model Canvas."';
    case 'swot-analysis':
      return 'Your ONLY task is SWOT analysis. STRICTLY focus on strengths, weaknesses, opportunities, and threats relevant to the user\'s business query. ABSOLUTELY IGNORE anything unrelated to SWOT. If the query is off-topic, explicitly state: "I can only perform SWOT analysis."';
    default:
      return 'You are a general business assistant. Provide concise, general business advice based on the query. Do not perform detailed analysis like SWOT or Feasibility. If asked for specific analysis, state: "For detailed analysis like [Specific Analysis], please select the corresponding feature." Avoid discussing unrelated topics.';
  }
}

// Base business context that all responses must adhere to
const BASE_BUSINESS_CONTEXT = 'You are Arina, a highly specialized AI business assistant. ';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, selectedFeature } = await req.json();
    const lastMessage = messages[messages.length - 1];
    
    // Check if the last message is related to business
    if (!isBusinessRelated(lastMessage.content)) {
      // Create an appropriate off-topic message based on the selected feature
      let offTopicMessage = "I'm specialized in business topics. Could you please ask me something related to business strategy, finance, marketing, or other business topics?";
      
      if (selectedFeature) {
        switch(selectedFeature) {
          case 'business-feasibility':
            offTopicMessage = "I can only discuss business feasibility analysis.";
            break;
          case 'forecasting':
            offTopicMessage = "I can only discuss business forecasting.";
            break;
          case 'max-min-analysis':
            offTopicMessage = "I can only discuss business optimization strategies.";
            break;
          case 'cultivation':
            offTopicMessage = "I can only discuss agricultural business insights.";
            break;
          case 'seasonal-commodity':
            offTopicMessage = "I can only discuss seasonal commodity analysis.";
            break;
          case 'annual-commodity':
            offTopicMessage = "I can only discuss annual commodity analysis.";
            break;
          case 'business-model-canvas':
            offTopicMessage = "I can only assist with the Business Model Canvas.";
            break;
          case 'swot-analysis':
            offTopicMessage = "I can only perform SWOT analysis.";
            break;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          response: offTopicMessage 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        },
      )
    }

    // Get the API key from environment variables
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Build the conversation history for Gemini
    const geminiMessages = [];
    
    // Add the system message with business context + feature-specific task
    const taskDescription = getTaskDescription(selectedFeature);
    const systemPrompt = `${BASE_BUSINESS_CONTEXT}${taskDescription}`;
    
    // Add system prompt
    geminiMessages.push({
      role: "system",
      content: systemPrompt
    });
    
    // Add conversation history (limited to last 5 messages for context)
    const historyMessages = messages.slice(-5);
    historyMessages.forEach(msg => {
      geminiMessages.push({
        role: msg.role === "user" ? "user" : "model",
        content: msg.content
      });
    });

    // Call the Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data));

    // Extract the generated text from the response
    let aiResponse = '';
    if (data.candidates && data.candidates[0]?.content?.parts) {
      aiResponse = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      },
    )
  } catch (error) {
    console.error('Error in chatWithAI edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      },
    )
  }
})
