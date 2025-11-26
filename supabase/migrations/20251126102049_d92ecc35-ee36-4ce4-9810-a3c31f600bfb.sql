-- Add recurring schedule fields to content table
ALTER TABLE public.content 
ADD COLUMN is_recurring BOOLEAN DEFAULT false,
ADD COLUMN recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'monthly')),
ADD COLUMN recurrence_interval INTEGER DEFAULT 1,
ADD COLUMN recurrence_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN parent_content_id UUID REFERENCES public.content(id) ON DELETE SET NULL;

-- Add index for efficient recurring content queries
CREATE INDEX idx_content_recurring ON public.content(is_recurring, recurrence_type) WHERE is_recurring = true;

-- Add index for parent content tracking
CREATE INDEX idx_content_parent ON public.content(parent_content_id) WHERE parent_content_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.content.is_recurring IS 'Whether this content should be automatically scheduled on a recurring basis';
COMMENT ON COLUMN public.content.recurrence_type IS 'Type of recurrence: daily, weekly, or monthly';
COMMENT ON COLUMN public.content.recurrence_interval IS 'Interval between recurrences (e.g., 2 for every 2 days/weeks/months)';
COMMENT ON COLUMN public.content.recurrence_end_date IS 'Date when the recurrence should stop';
COMMENT ON COLUMN public.content.parent_content_id IS 'Reference to the original content if this is a recurring instance';