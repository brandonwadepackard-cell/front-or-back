-- Create enum for job status
CREATE TYPE public.job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- Create scrape_jobs table
CREATE TABLE public.scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT,
  query TEXT NOT NULL,
  sources TEXT[] DEFAULT '{}',
  extract_prices BOOLEAN DEFAULT true,
  extract_contacts BOOLEAN DEFAULT false,
  status public.job_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create scrape_results table
CREATE TABLE public.scrape_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.scrape_jobs(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  text_content TEXT,
  screenshot_path TEXT,
  prices JSONB DEFAULT '[]',
  contacts JSONB DEFAULT '[]',
  ai_summary TEXT,
  ai_sentiment TEXT,
  scraped_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create price_history table
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.scrape_jobs(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  product_name TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scrape_jobs
CREATE POLICY "Users can view their own jobs"
ON public.scrape_jobs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own jobs"
ON public.scrape_jobs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own jobs"
ON public.scrape_jobs FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own jobs"
ON public.scrape_jobs FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for scrape_results (read through job ownership)
CREATE POLICY "Users can view results for their jobs"
ON public.scrape_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.scrape_jobs
    WHERE scrape_jobs.id = scrape_results.job_id
    AND scrape_jobs.user_id = auth.uid()
  )
);

-- RLS Policies for price_history (read through job ownership)
CREATE POLICY "Users can view price history for their jobs"
ON public.price_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.scrape_jobs
    WHERE scrape_jobs.id = price_history.job_id
    AND scrape_jobs.user_id = auth.uid()
  )
);

-- Trigger to update updated_at on scrape_jobs
CREATE OR REPLACE FUNCTION public.update_scrape_job_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_scrape_jobs_updated_at
BEFORE UPDATE ON public.scrape_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_scrape_job_updated_at();

-- Enable realtime for live updates
ALTER TABLE public.scrape_jobs REPLICA IDENTITY FULL;
ALTER TABLE public.scrape_results REPLICA IDENTITY FULL;

-- Add comment
COMMENT ON TABLE public.scrape_jobs IS 'Web scraping jobs created by users';
COMMENT ON TABLE public.scrape_results IS 'Results from completed scrape jobs';
COMMENT ON TABLE public.price_history IS 'Historical price tracking for scraped products';
