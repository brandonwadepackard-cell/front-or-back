-- Add scheduled_at column to content table
ALTER TABLE public.content 
ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;

-- Add index for scheduled content queries
CREATE INDEX idx_content_scheduled_at ON public.content(scheduled_at) 
WHERE scheduled_at IS NOT NULL;

-- Update status to support 'scheduled' and 'published' states
-- (keeping existing draft status)