import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecurringContent {
  id: string;
  topic: string;
  platform: string;
  content: string;
  scheduled_at: string | null;
  status: string;
  is_recurring: boolean;
  recurrence_type: 'daily' | 'weekly' | 'monthly';
  recurrence_interval: number;
  recurrence_end_date: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all recurring content that is active
    const { data: recurringContent, error: fetchError } = await supabase
      .from('content')
      .select('*')
      .eq('is_recurring', true)
      .eq('status', 'scheduled')
      .not('scheduled_at', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    const now = new Date();
    const createdInstances: string[] = [];

    for (const content of recurringContent as RecurringContent[]) {
      // Check if recurrence has ended
      if (content.recurrence_end_date && new Date(content.recurrence_end_date) < now) {
        continue;
      }

      const lastScheduled = new Date(content.scheduled_at!);
      
      // Calculate next scheduled date based on recurrence type
      let nextDate = new Date(lastScheduled);
      
      switch (content.recurrence_type) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + content.recurrence_interval);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + (7 * content.recurrence_interval));
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + content.recurrence_interval);
          break;
      }

      // Check if we need to create a new instance
      // Create instances up to 30 days in advance
      const thirtyDaysFromNow = new Date(now);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      while (nextDate <= thirtyDaysFromNow) {
        // Check if recurrence end date is set and we've passed it
        if (content.recurrence_end_date && nextDate > new Date(content.recurrence_end_date)) {
          break;
        }

        // Check if an instance already exists for this date
        const { data: existingContent } = await supabase
          .from('content')
          .select('id')
          .eq('parent_content_id', content.id)
          .gte('scheduled_at', nextDate.toISOString())
          .lt('scheduled_at', new Date(nextDate.getTime() + 60000).toISOString()) // Within 1 minute
          .single();

        if (!existingContent) {
          // Create new instance
          const { data: newInstance, error: insertError } = await supabase
            .from('content')
            .insert({
              topic: content.topic,
              platform: content.platform,
              content: content.content,
              scheduled_at: nextDate.toISOString(),
              status: 'scheduled',
              is_recurring: false,
              parent_content_id: content.id,
            })
            .select()
            .single();

          if (!insertError && newInstance) {
            createdInstances.push(newInstance.id);
          }
        }

        // Calculate next occurrence
        switch (content.recurrence_type) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + content.recurrence_interval);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + (7 * content.recurrence_interval));
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + content.recurrence_interval);
            break;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: createdInstances.length,
        instances: createdInstances,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating recurring content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
