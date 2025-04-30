
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
        systemMessage += 'Create a visualization for a business feasibility analysis showing market factors, costs, and potential revenue.';
        break;
      case 'forecasting':
        systemMessage += 'Create a visualization for business forecasting showing projected growth over time.';
        break;
      case 'swot':
        systemMessage += 'Create a visualization for SWOT analysis showing strengths, weaknesses, opportunities and threats.';
        break;
      case 'canvas':
        systemMessage += 'Create a visualization for Business Model Canvas showing the nine components of the business model.';
        break;
      default:
        systemMessage += 'Create a business data visualization that is clear and professional.';
    }
    
    // For this implementation, we'll use placeholder images instead of actual AI generation
    // In a production environment, you would integrate with an image generation API
    
    console.log('Generating chart with prompt:', prompt)
    
    // Generate appropriate placeholder images based on the feature type
    let imageUrl;
    
    switch (featureId) {
      case 'feasibility':
        imageUrl = 'https://placehold.co/800x600/9b87f5/FFFFFF?text=Feasibility+Analysis+Chart&font=roboto';
        break;
      case 'forecasting':
        imageUrl = 'https://placehold.co/800x600/7E69AB/FFFFFF?text=Business+Forecast+Chart&font=roboto';
        break;
      case 'swot':
        imageUrl = 'https://placehold.co/800x600/6E59A5/FFFFFF?text=SWOT+Analysis+Chart&font=roboto';
        break;
      case 'canvas':
        imageUrl = 'https://placehold.co/800x600/8B5CF6/FFFFFF?text=Business+Model+Canvas&font=roboto';
        break;
      default:
        imageUrl = 'https://placehold.co/800x600/9b87f5/FFFFFF?text=Business+Analysis+Chart&font=roboto';
    }
    
    // Return the response with the image URL
    return new Response(
      JSON.stringify({ imageUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
    
    // To integrate with a real AI image generation service like DALL-E 3 or Midjourney,
    // you would uncomment and adapt the code below:
    
    /*
    const apiKey = Deno.env.get('AI_API_KEY')
    if (!apiKey) {
      throw new Error('AI_API_KEY is not configured')
    }
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Create a professional business chart visualization for ${featureId} analysis with the following data: ${prompt}. Make it look like a high-quality infographic suitable for a business presentation.`,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      })
    })
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(`API error: ${JSON.stringify(data.error)}`)
    }
    
    const imageUrl = data.data?.[0]?.url
    
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
