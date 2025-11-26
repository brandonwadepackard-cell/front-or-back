import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { itemId, text } = await req.json();
    
    if (!itemId || !text) {
      throw new Error('Missing required parameters: itemId or text');
    }

    console.log('Generating embedding for item:', itemId);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate embedding using Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 768
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI embedding error:', errorText);
      throw new Error(`Lovable AI error: ${errorText}`);
    }

    const result = await response.json();
    const embedding = result.data?.[0]?.embedding;

    if (!embedding) {
      throw new Error('No embedding generated');
    }

    console.log('Embedding generated, updating database...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update library item with embedding
    const { error: updateError } = await supabase
      .from('library_items')
      .update({ embedding })
      .eq('id', itemId);

    if (updateError) {
      throw new Error(`Failed to update library item: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Embedding generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
