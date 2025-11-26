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
    const { itemId, title, description } = await req.json();
    
    if (!itemId || !title) {
      throw new Error('Missing required parameters: itemId or title');
    }

    console.log('Generating thumbnail for video:', { itemId, title });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create a detailed prompt for thumbnail generation
    const prompt = `Create a professional, eye-catching video thumbnail for: "${title}". ${description ? `Context: ${description}.` : ''} The thumbnail should be vibrant, cinematic, and visually appealing with bold text overlay showing the title. High quality, 16:9 aspect ratio, YouTube-style thumbnail.`;

    console.log('Generating image with prompt:', prompt);

    // Call Lovable AI image generation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`Lovable AI error: ${errorText}`);
    }

    const result = await response.json();
    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated from AI');
    }

    console.log('Image generated, uploading to storage...');

    // Extract base64 data from data URL
    const base64Data = imageUrl.split(',')[1];
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upload thumbnail to storage
    const thumbnailFileName = `thumbnail-${itemId}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('library-videos')
      .upload(thumbnailFileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload thumbnail: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('library-videos')
      .getPublicUrl(thumbnailFileName);

    console.log('Thumbnail uploaded:', publicUrl);

    // Update library item with thumbnail
    const { error: updateError } = await supabase
      .from('library_items')
      .update({ thumbnail_path: publicUrl })
      .eq('id', itemId);

    if (updateError) {
      throw new Error(`Failed to update library item: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, thumbnailUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Thumbnail generation error:', error);
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
