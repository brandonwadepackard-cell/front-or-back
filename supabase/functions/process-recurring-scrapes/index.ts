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
    console.log('Processing recurring scrapes...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();

    // Find jobs that need to run (enabled, not paused, and due)
    const { data: jobsToRun, error: fetchError } = await supabase
      .from('scrape_jobs')
      .select('*')
      .eq('recurrence_enabled', true)
      .eq('recurrence_paused', false)
      .lte('next_run_at', now.toISOString())
      .or('status.eq.completed,status.eq.failed,status.eq.cancelled');

    if (fetchError) {
      console.error('Error fetching jobs:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${jobsToRun?.length || 0} jobs to run`);

    if (!jobsToRun || jobsToRun.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No jobs to run', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const processedJobs = [];

    for (const job of jobsToRun) {
      console.log(`Creating new run for job: ${job.id}`);

      // Create a new scrape job based on the recurring job
      const { data: newJob, error: insertError } = await supabase
        .from('scrape_jobs')
        .insert({
          user_id: job.user_id,
          name: `${job.name || job.query} (${now.toLocaleDateString()})`,
          query: job.query,
          sources: job.sources,
          extract_prices: job.extract_prices,
          extract_contacts: job.extract_contacts,
          status: 'pending',
          recurrence_enabled: false // New job is not recurring
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Error creating new job for ${job.id}:`, insertError);
        
        // Send failure notification
        try {
          await supabase.functions.invoke('send-scrape-notification', {
            body: {
              user_id: job.user_id,
              job_name: job.name || job.query,
              status: 'failed',
              error_message: insertError.message
            }
          });
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
        }
        
        continue;
      }

      console.log(`Created new job: ${newJob.id}`);

      // Send success notification
      try {
        await supabase.functions.invoke('send-scrape-notification', {
          body: {
            user_id: job.user_id,
            job_name: job.name || job.query,
            status: 'completed',
            results_count: 0 // Will be updated when scrape completes
          }
        });
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Don't fail the whole process if notification fails
      }

      // Calculate next run time
      const nextRun = calculateNextRun(job.recurrence_interval, job.recurrence_time);

      // Update the recurring job
      const { error: updateError } = await supabase
        .from('scrape_jobs')
        .update({
          last_run_at: now.toISOString(),
          next_run_at: nextRun.toISOString()
        })
        .eq('id', job.id);

      if (updateError) {
        console.error(`Error updating job ${job.id}:`, updateError);
      }

      processedJobs.push({
        original_job_id: job.id,
        new_job_id: newJob.id,
        next_run_at: nextRun.toISOString()
      });
    }

    console.log(`Processed ${processedJobs.length} jobs`);

    return new Response(
      JSON.stringify({
        message: 'Recurring scrapes processed successfully',
        processed: processedJobs.length,
        jobs: processedJobs
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing recurring scrapes:', error);
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

function calculateNextRun(interval: string, time: string): Date {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  
  const nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);

  // If the time has passed today, move to the next interval
  if (nextRun <= now) {
    if (interval === 'daily') {
      nextRun.setDate(nextRun.getDate() + 1);
    } else if (interval === 'weekly') {
      nextRun.setDate(nextRun.getDate() + 7);
    } else if (interval === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }
  }

  return nextRun;
}
