-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add recurrence fields to scrape_jobs table
ALTER TABLE public.scrape_jobs
ADD COLUMN recurrence_enabled BOOLEAN DEFAULT false,
ADD COLUMN recurrence_interval TEXT, -- 'daily', 'weekly', 'monthly'
ADD COLUMN recurrence_time TEXT DEFAULT '09:00', -- Time to run (HH:MM format)
ADD COLUMN last_run_at TIMESTAMPTZ,
ADD COLUMN next_run_at TIMESTAMPTZ;

-- Create index for finding jobs that need to run
CREATE INDEX idx_scrape_jobs_next_run ON public.scrape_jobs(next_run_at) 
WHERE recurrence_enabled = true;

COMMENT ON COLUMN public.scrape_jobs.recurrence_enabled IS 'Whether this job should run on a schedule';
COMMENT ON COLUMN public.scrape_jobs.recurrence_interval IS 'How often to run: daily, weekly, or monthly';
COMMENT ON COLUMN public.scrape_jobs.recurrence_time IS 'Time of day to run the job (HH:MM format)';
COMMENT ON COLUMN public.scrape_jobs.next_run_at IS 'When this job should next be executed';
