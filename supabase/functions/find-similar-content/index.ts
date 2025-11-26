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
    const { itemId, limit = 5 } = await req.json();
    
    if (!itemId) {
      throw new Error('Missing required parameter: itemId');
    }

    console.log('Finding similar content for item:', itemId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current item's embedding
    const { data: currentItem, error: fetchError } = await supabase
      .from('library_items')
      .select('embedding, title')
      .eq('id', itemId)
      .single();

    if (fetchError || !currentItem) {
      throw new Error('Failed to fetch item or item not found');
    }

    if (!currentItem.embedding) {
      throw new Error('Item does not have an embedding yet');
    }

    console.log('Current item:', currentItem.title);

    // Find similar items using vector similarity search
    // Using RPC to call a custom function that does the similarity search
    const { data: similarItems, error: searchError } = await supabase.rpc(
      'find_similar_library_items',
      {
        query_embedding: currentItem.embedding,
        match_threshold: 0.5,
        match_count: limit + 1, // +1 because we'll filter out the current item
        exclude_id: itemId
      }
    );

    if (searchError) {
      console.error('Similarity search error:', searchError);
      throw new Error(`Similarity search failed: ${searchError.message}`);
    }

    console.log('Found similar items:', similarItems?.length || 0);

    return new Response(
      JSON.stringify({ 
        similarItems: similarItems || [],
        count: similarItems?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Find similar content error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, similarItems: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
