
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, selectedFeature } = await req.json()
    
    // Transform messages to Gemini format
    const geminiMessages = messages.map(message => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{
        text: message.content
      }]
    }))
    
    // Get current feature from the request or use default
    const currentFeature = selectedFeature || 'general'
    
    // Create system message based on selected feature
    let systemMessage = 'You are Arina, a highly specialized AI business assistant. '
    let taskDescription = ''
    
    switch (currentFeature) {
        case 'feasibility':
            taskDescription = 'Your ONLY task is feasibility analysis. STRICTLY focus on market conditions, competition, and success factors relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to feasibility. If the query is off-topic, explicitly state: "I can only discuss business feasibility analysis."';
            break;
        case 'forecasting':
            taskDescription = 'Your ONLY task is business forecasting. STRICTLY focus on sales projections, market trends, and future developments relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to forecasting. If the query is off-topic, explicitly state: "I can only discuss business forecasting."';
            break;
        case 'optimization':
            taskDescription = 'Your ONLY task is business optimization. STRICTLY focus on efficiency, profit maximization, and cost minimization strategies relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to optimization. If the query is off-topic, explicitly state: "I can only discuss business optimization strategies."';
            break;
        case 'cultivation':
            taskDescription = 'Your ONLY task is agricultural business insights. STRICTLY focus on optimal growing conditions, market timing, and cultivation strategies relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to agricultural cultivation. If the query is off-topic, explicitly state: "I can only discuss agricultural business insights."';
            break;
        case 'seasonal':
            taskDescription = 'Your ONLY task is seasonal commodity analysis. STRICTLY focus on price fluctuations, market patterns, and seasonal trends relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to seasonal commodities. If the query is off-topic, explicitly state: "I can only discuss seasonal commodity analysis."';
            break;
        case 'annual':
            taskDescription = 'Your ONLY task is annual commodity analysis. STRICTLY focus on long-term price projections, market cycles, and annual trends relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to annual commodities. If the query is off-topic, explicitly state: "I can only discuss annual commodity analysis."';
            break;
        case 'canvas':
            taskDescription = 'Your ONLY task is Business Model Canvas assistance. STRICTLY focus on the nine building blocks (partners, activities, resources, value propositions, customer relationships, channels, segments, cost, revenue) relevant to the user\'s query. ABSOLUTELY IGNORE anything unrelated to the Business Model Canvas. If the query is off-topic, explicitly state: "I can only assist with the Business Model Canvas."';
            break;
        case 'swot':
            taskDescription = 'Your ONLY task is SWOT analysis. STRICTLY focus on strengths, weaknesses, opportunities, and threats relevant to the user\'s business query. ABSOLUTELY IGNORE anything unrelated to SWOT. If the query is off-topic, explicitly state: "I can only perform SWOT analysis."';
            break;
        default: // 'general' case
            taskDescription = 'You are a general business assistant. Provide concise, general business advice based on the query. Do not perform detailed analysis like SWOT or Feasibility. If asked for specific analysis, state: "For detailed analysis like [Specific Analysis], please select the corresponding feature." Avoid discussing unrelated topics.';
    }
    systemMessage += taskDescription;
    
    // Add system message to the beginning of the conversation
    const fullConversation = [
      {
        role: 'model',
        parts: [{
          text: systemMessage
        }]
      },
      ...geminiMessages
    ]

    console.log('Using Gemini API with feature:', currentFeature)
    
    // Call Gemini API with gemini-1.5-flash model
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured')
    }
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: fullConversation,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    // Parse the response
    const data = await response.json()
    
    if (data.error) {
      console.error('Gemini API error:', data)
      throw new Error('Gemini API error: ' + data.error.message)
    }
    
    // Extract the generated text from the response
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      'Sorry, I couldn\'t generate a response.'

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
    console.error('Error in chatWithAI edge function:', error)
    
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
