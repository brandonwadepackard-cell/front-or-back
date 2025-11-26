import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Suggestion {
  topic: string;
  platform: string;
  reason: string;
  optimal_time: string;
  time_reason: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { platform, userPreferences } = await req.json();

    const systemPrompt = `You are an expert social media strategist who provides trending content suggestions and optimal posting times. 
Generate 5 content suggestions based on current trends and best practices for social media engagement.

Consider:
- Platform-specific best practices (Twitter: concise, LinkedIn: professional, Instagram: visual)
- Current trending topics and themes
- Optimal posting times for maximum engagement
- Diverse content types and angles

Return suggestions in a structured format.`;

    const userPrompt = `Generate 5 trending content suggestions for ${platform || 'all platforms'}.
${userPreferences ? `User preferences: ${userPreferences}` : ''}

For each suggestion, provide:
1. A compelling topic/theme
2. The best platform for this content (twitter, linkedin, or instagram)
3. Why this topic is trending or relevant now
4. Optimal posting time (specific time of day)
5. Why that time is optimal for engagement`;

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
            name: 'provide_content_suggestions',
            description: 'Return 5 trending content suggestions with optimal posting times',
            parameters: {
              type: 'object',
              properties: {
                suggestions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      topic: { 
                        type: 'string',
                        description: 'A compelling, specific content topic or theme'
                      },
                      platform: { 
                        type: 'string',
                        enum: ['twitter', 'linkedin', 'instagram'],
                        description: 'The best platform for this content'
                      },
                      reason: { 
                        type: 'string',
                        description: 'Why this topic is trending or relevant (1-2 sentences)'
                      },
                      optimal_time: { 
                        type: 'string',
                        description: 'Best time to post in format HH:MM (24-hour format)'
                      },
                      time_reason: { 
                        type: 'string',
                        description: 'Why this time is optimal for engagement (1 sentence)'
                      }
                    },
                    required: ['topic', 'platform', 'reason', 'optimal_time', 'time_reason'],
                    additionalProperties: false
                  },
                  minItems: 5,
                  maxItems: 5
                }
              },
              required: ['suggestions'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'provide_content_suggestions' } }
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

    // Extract tool call results
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(suggestions),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
