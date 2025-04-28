
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

// Agricultural context to guide the AI
const AGRICULTURAL_CONTEXT = `You are Arina, an AI assistant specialized in agricultural topics. 
You provide helpful information about farming, crops, livestock, irrigation, agricultural business, 
and other farming-related topics. You MUST ONLY answer questions related to agriculture and farming.
If a user asks about an unrelated topic, politely redirect them to agricultural topics.`;

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
    
    // Add the system message with agricultural context
    let systemPrompt = AGRICULTURAL_CONTEXT;
    
    // Add feature-specific context if a feature is selected
    if (selectedFeature) {
      systemPrompt += `\n\nThe user is currently interested in ${selectedFeature}. Focus your response on this specific agricultural topic.`;
    }
    
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
