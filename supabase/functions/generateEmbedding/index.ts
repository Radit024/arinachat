
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');

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
    const { text, messageId } = await req.json()
    
    if (!text) {
      throw new Error('Missing text parameter')
    }
    
    if (!OPENAI_KEY) {
      throw new Error('OPENAI_API_KEY is not configured in environment variables')
    }
    
    // Call OpenAI for embedding
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002'
      })
    })
    
    const embeddingData = await embeddingResponse.json()
    
    if (embeddingData.error) {
      throw new Error(embeddingData.error.message)
    }
    
    const embedding = embeddingData.data[0].embedding
    
    // If messageId is provided, update the message with the embedding
    if (messageId) {
      const { supabaseClient } = await import('./supabase.ts')
      
      const { error } = await supabaseClient
        .from('memory_messages')
        .update({ embedding })
        .eq('id', messageId)
        
      if (error) {
        throw new Error(`Error updating message: ${error.message}`)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        embedding,
        messageId 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})
