
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
    const { prompt, featureId } = await req.json()
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt parameter" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }
    
    // Create a system message based on the feature type
    let systemMessage = 'You are a specialized AI assistant that creates data visualizations for business analysis. ';
    
    switch (featureId) {
      case 'feasibility':
        systemMessage += 'Create a visualization for a feasibility analysis showing marketplace factors.';
        break;
      case 'forecasting':
        systemMessage += 'Create a visualization for business forecasting showing projected growth over time.';
        break;
      case 'optimization':
        systemMessage += 'Create a visualization for business optimization showing efficiency improvements.';
        break;
      case 'cultivation':
        systemMessage += 'Create a visualization for agricultural business showing seasonal yields and growing conditions.';
        break;
      case 'swot':
        systemMessage += 'Create a visualization for SWOT analysis showing strengths, weaknesses, opportunities and threats.';
        break;
      default:
        systemMessage += 'Create a business data visualization that is clear and professional.';
    }
    
    // Call the image generation API using Gemini API
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured')
    }
    
    console.log('Generating chart with prompt:', prompt)
    
    // For testing, we'll use a placeholder image to avoid API costs
    // In production, use the actual Gemini API call
    const imageUrl = `https://placehold.co/800x600?text=Business+Chart+for+${featureId}`
    
    // Return the response with the image URL
    return new Response(
      JSON.stringify({ imageUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
    
    // Uncomment this code to integrate with a real image generation API
    /*
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      })
    })
    
    const data = await response.json()
    
    if (data.error) {
      console.error('API error:', data)
      throw new Error(`API error: ${data.error.message}`)
    }
    
    // Process the response to extract the image URL
    const imageUrl = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    return new Response(
      JSON.stringify({ imageUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
    */
  } catch (error) {
    console.error('Error in generateChart edge function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})
