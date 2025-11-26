import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, title, description, content, imageUrl } = await req.json();
    
    if (!type || !title) {
      throw new Error('Missing required parameters: type or title');
    }

    console.log('Suggesting tags for:', { type, title });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context for AI based on content type
    let contextText = `Content type: ${type}\nTitle: ${title}`;
    if (description) contextText += `\nDescription: ${description}`;
    if (content) contextText += `\nContent: ${content}`;

    const systemPrompt = `You are a content tagging expert. Analyze the provided content and suggest 3-7 relevant, specific tags that would help organize and search for this content later. 
    
Rules:
- Tags should be concise (1-3 words)
- Focus on topics, themes, categories, emotions, or key concepts
- Avoid generic tags like "video" or "content"
- Make tags searchable and practical
- Return ONLY a JSON array of tag strings, nothing else

Example output: ["marketing", "social media", "tutorial", "beginner-friendly"]`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contextText }
    ];

    // If image URL provided, include it for visual analysis
    if (imageUrl && type === 'photo') {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image and suggest relevant tags:' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      });
    }

    console.log('Calling Lovable AI for tag suggestions...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`Lovable AI error: ${errorText}`);
    }

    const result = await response.json();
    const aiResponse = result.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI response:', aiResponse);

    // Parse the JSON array from the response
    // Remove markdown code blocks if present
    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const suggestedTags = JSON.parse(cleanedResponse);

    if (!Array.isArray(suggestedTags)) {
      throw new Error('Invalid response format from AI');
    }

    console.log('Suggested tags:', suggestedTags);

    return new Response(
      JSON.stringify({ tags: suggestedTags }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Tag suggestion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, tags: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
