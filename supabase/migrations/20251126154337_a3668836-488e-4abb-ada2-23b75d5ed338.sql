-- Add pause/resume capability for recurring scrape jobs
ALTER TABLE public.scrape_jobs
ADD COLUMN recurrence_paused boolean DEFAULT false;