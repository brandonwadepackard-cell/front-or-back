-- Create templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  platform TEXT NOT NULL,
  description TEXT
);

-- Enable Row Level Security
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Create policies for templates
CREATE POLICY "Anyone can view templates"
ON public.templates
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert templates"
ON public.templates
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update templates"
ON public.templates
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete templates"
ON public.templates
FOR DELETE
USING (true);