import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LibraryItem {
  id: string;
  type: string;
  title: string;
  description: string;
  content?: string;
  tags: string[];
  categories: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, platform } = await req.json();
    console.log('Finding relevant library content for:', { topic, platform });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch all library items with tags and categories
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: items, error: itemsError } = await supabase
      .from('library_items')
      .select(`
        id,
        type,
        title,
        description,
        content,
        storage_path,
        library_item_tags(tags(name)),
        library_item_categories(categories(name))
      `)
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error('Error fetching library items:', itemsError);
      throw itemsError;
    }

    // Format library items for AI
    const formattedItems = (items || []).map((item: any) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description || '',
      content: item.content || '',
      tags: item.library_item_tags?.map((t: any) => t.tags?.name).filter(Boolean) || [],
      categories: item.library_item_categories?.map((c: any) => c.categories?.name).filter(Boolean) || []
    }));

    const systemPrompt = `You are an expert content strategist. Analyze the user's personal content library and suggest the most relevant items to include in a ${platform} post about "${topic}".

Consider:
- Content relevance to the topic
- Platform appropriateness (${platform})
- Content type (videos, photos, text ideas, links, voice memos)
- Tags and categories
- Potential engagement value

Return your suggestions using the suggest_content_items function.`;

    const userPrompt = `Topic: ${topic}
Platform: ${platform}

Available library items:
${JSON.stringify(formattedItems, null, 2)}

Which items from my library would work best for this post? Suggest 2-4 items with explanations.`;

    // Call Lovable AI with function calling
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_content_items',
              description: 'Return suggested library items with reasoning',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        item_id: { type: 'string', description: 'ID of the library item' },
                        reason: { type: 'string', description: 'Why this item is relevant' },
                        usage_tip: { type: 'string', description: 'How to use this item effectively' }
                      },
                      required: ['item_id', 'reason', 'usage_tip']
                    }
                  }
                },
                required: ['suggestions']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_content_items' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    // Enrich suggestions with full item data
    const enrichedSuggestions = suggestions.suggestions.map((sugg: any) => {
      const item = formattedItems.find((i: LibraryItem) => i.id === sugg.item_id);
      return {
        ...sugg,
        item
      };
    }).filter((s: any) => s.item); // Only include items that were found

    console.log('Content suggestions generated:', enrichedSuggestions.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions: enrichedSuggestions
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in suggest-library-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});