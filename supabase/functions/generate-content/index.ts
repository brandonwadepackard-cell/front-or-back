import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, platform } = await req.json();
    console.log('Generating content for:', { topic, platform });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Platform-specific prompts and character limits
    const platformSpecs: Record<string, { limit: number; style: string }> = {
      twitter: { 
        limit: 280, 
        style: 'concise, engaging, use relevant hashtags, conversational tone' 
      },
      linkedin: { 
        limit: 1300, 
        style: 'professional, insightful, value-driven, thought leadership tone' 
      },
      instagram: { 
        limit: 2200, 
        style: 'visual storytelling, engaging, use emojis, hashtag strategy' 
      },
      all: { 
        limit: 500, 
        style: 'versatile, adaptable to multiple platforms' 
      }
    };

    const spec = platformSpecs[platform] || platformSpecs.all;
    
    const systemPrompt = `You are an expert social media content creator. Generate high-quality ${platform} content that is ${spec.style}. Keep it under ${spec.limit} characters.`;
    
    const userPrompt = platform === 'all' 
      ? `Create engaging social media content about: ${topic}. Make it suitable for multiple platforms.`
      : `Create a ${platform} post about: ${topic}. Follow ${platform}'s best practices and style.`;

    // Call Lovable AI
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
    const generatedContent = aiData.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: savedContent, error: dbError } = await supabase
      .from('content')
      .insert({
        topic,
        platform,
        content: generatedContent,
        status: 'draft'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Content generated and saved:', savedContent.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: savedContent 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);
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