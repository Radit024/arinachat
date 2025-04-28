
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Agricultural topics that the AI is allowed to discuss
const ALLOWED_TOPICS = [
  'agriculture', 'farming', 'crops', 'livestock', 'irrigation', 
  'fertilizer', 'pesticides', 'soil', 'harvest', 'planting',
  'yield', 'farm equipment', 'weather', 'climate', 'sustainability',
  'organic farming', 'agribusiness', 'food production', 'crop rotation',
  'agricultural economics', 'agricultural technology', 'agricultural policy'
];

// Check if a message is related to agricultural topics
function isAgricultureRelated(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  // Simple check for any agricultural term in the message
  return ALLOWED_TOPICS.some(topic => lowerMessage.includes(topic)) ||
    // Check for analysis features from our app
    ['business feasibility', 'forecasting', 'maximization', 'minimization', 
     'cultivation', 'seasonal commodity', 'annual commodity', 'business model',
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
      return 'You are an agricultural business assistant. Provide concise, general agricultural business advice based on the query. Do not perform detailed analysis like SWOT or Feasibility. If asked for specific analysis, state: "For detailed analysis like [Specific Analysis], please select the corresponding feature." Avoid discussing non-agricultural topics.';
  }
}

// Base agricultural context that all responses must adhere to
const BASE_AGRICULTURAL_CONTEXT = 'You are Arina, an AI assistant specialized in agricultural topics. ' +
  'You provide helpful information about farming, crops, livestock, irrigation, agricultural business, ' +
  'and other farming-related topics. You MUST ONLY answer questions related to agriculture and farming. ' +
  'If a user asks about an unrelated topic, politely redirect them to agricultural topics.';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, selectedFeature } = await req.json();
    const lastMessage = messages[messages.length - 1];
    
    // Check if the last message is related to agriculture
    if (!isAgricultureRelated(lastMessage.content)) {
      return new Response(
        JSON.stringify({ 
          response: "I'm specialized in agricultural topics. Could you please ask me something related to farming, crops, agricultural business, or other farming topics?" 
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
    
    // Add the system message with agricultural context + feature-specific task
    const taskDescription = getTaskDescription(selectedFeature);
    const systemPrompt = `${BASE_AGRICULTURAL_CONTEXT}\n\n${taskDescription}`;
    
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
