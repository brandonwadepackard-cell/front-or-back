import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { content, platform } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a social media expert specializing in hashtag strategy. Generate relevant, trending hashtags based on the content and platform.

Platform-specific best practices:
- Twitter: 1-2 highly relevant hashtags (engagement drops with more)
- LinkedIn: 3-5 professional hashtags for maximum reach
- Instagram: 5-10 strategic hashtags (can use up to 30)

Focus on:
- Relevance to the content
- Mix of popular and niche hashtags
- Industry-specific terms
- Trending topics when applicable`;

    const platformGuidance = {
      twitter: 'Generate 1-2 impactful hashtags. Keep them concise and trending.',
      linkedin: 'Generate 3-5 professional hashtags for B2B engagement.',
      instagram: 'Generate 5-10 hashtags mixing popular and niche terms.',
      all: 'Generate versatile hashtags that work across all platforms (3-5 hashtags).'
    };

    const userPrompt = `Content: "${content}"

Platform: ${platform}
${platformGuidance[platform.toLowerCase() as keyof typeof platformGuidance] || platformGuidance.all}

Generate hashtags that will maximize engagement and reach for this specific content and platform.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_hashtags',
            description: 'Return relevant hashtags for the content',
            parameters: {
              type: 'object',
              properties: {
                hashtags: {
                  type: 'array',
                  items: {
                    type: 'string',
                    description: 'Hashtag without the # symbol'
                  },
                  description: 'Array of relevant hashtags'
                },
                reasoning: {
                  type: 'string',
                  description: 'Brief explanation of why these hashtags were chosen'
                }
              },
              required: ['hashtags', 'reasoning'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_hashtags' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating hashtags:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
