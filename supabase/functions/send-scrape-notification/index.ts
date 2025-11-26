import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id: string;
  job_name: string;
  status: 'completed' | 'failed';
  error_message?: string;
  results_count?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, job_name, status, error_message, results_count }: NotificationRequest = await req.json();

    console.log(`Sending notification for job: ${job_name}, status: ${status}`);

    // Get user email from auth.users using service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !userData.user?.email) {
      console.error('Error fetching user email:', userError);
      throw new Error('Could not retrieve user email');
    }

    const userEmail = userData.user.email;

    // Prepare email content based on status
    const isSuccess = status === 'completed';
    const subject = isSuccess 
      ? `✓ Scrape Job Completed: ${job_name}`
      : `✗ Scrape Job Failed: ${job_name}`;

    const htmlContent = isSuccess
      ? `
        <h2>Recurring Scrape Job Completed Successfully</h2>
        <p><strong>Job Name:</strong> ${job_name}</p>
        <p><strong>Status:</strong> Completed</p>
        ${results_count ? `<p><strong>Results Found:</strong> ${results_count}</p>` : ''}
        <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://app.')}/scraper">View Results</a></p>
      `
      : `
        <h2>Recurring Scrape Job Failed</h2>
        <p><strong>Job Name:</strong> ${job_name}</p>
        <p><strong>Status:</strong> Failed</p>
        ${error_message ? `<p><strong>Error:</strong> ${error_message}</p>` : ''}
        <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://app.')}/scraper">Check Job Details</a></p>
      `;

    const emailResponse = await resend.emails.send({
      from: "Scraper Notifications <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, email_id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-scrape-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
