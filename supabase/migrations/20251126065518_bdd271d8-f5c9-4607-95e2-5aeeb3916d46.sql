-- Create content table for storing generated social media content
CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram', 'all')),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all content (public content generator)
CREATE POLICY "Anyone can view content"
  ON public.content
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert content (public content generator)
CREATE POLICY "Anyone can insert content"
  ON public.content
  FOR INSERT
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_content_created_at ON public.content(created_at DESC);
CREATE INDEX idx_content_platform ON public.content(platform);