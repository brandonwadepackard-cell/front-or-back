-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update categories"
  ON public.categories FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete categories"
  ON public.categories FOR DELETE
  USING (true);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tags"
  ON public.tags FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete tags"
  ON public.tags FOR DELETE
  USING (true);

-- Create library items table
CREATE TABLE public.library_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('video', 'photo', 'text_idea', 'link', 'voice_memo')),
  title TEXT NOT NULL,
  description TEXT,
  storage_path TEXT, -- for videos, photos, voice memos
  content TEXT, -- for text ideas and links
  thumbnail_path TEXT, -- for videos and photos
  metadata JSONB, -- for additional flexible data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view library items"
  ON public.library_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert library items"
  ON public.library_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update library items"
  ON public.library_items FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete library items"
  ON public.library_items FOR DELETE
  USING (true);

-- Create library_item_categories junction table
CREATE TABLE public.library_item_categories (
  library_item_id UUID NOT NULL REFERENCES public.library_items(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (library_item_id, category_id)
);

ALTER TABLE public.library_item_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage library item categories"
  ON public.library_item_categories FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create library_item_tags junction table
CREATE TABLE public.library_item_tags (
  library_item_id UUID NOT NULL REFERENCES public.library_items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (library_item_id, tag_id)
);

ALTER TABLE public.library_item_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage library item tags"
  ON public.library_item_tags FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('library-videos', 'library-videos', true),
  ('library-photos', 'library-photos', true),
  ('library-voice-memos', 'library-voice-memos', true);

-- Storage policies for library-videos
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'library-videos');

CREATE POLICY "Anyone can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'library-videos');

CREATE POLICY "Anyone can update videos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'library-videos');

CREATE POLICY "Anyone can delete videos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'library-videos');

-- Storage policies for library-photos
CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'library-photos');

CREATE POLICY "Anyone can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'library-photos');

CREATE POLICY "Anyone can update photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'library-photos');

CREATE POLICY "Anyone can delete photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'library-photos');

-- Storage policies for library-voice-memos
CREATE POLICY "Anyone can view voice memos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'library-voice-memos');

CREATE POLICY "Anyone can upload voice memos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'library-voice-memos');

CREATE POLICY "Anyone can update voice memos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'library-voice-memos');

CREATE POLICY "Anyone can delete voice memos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'library-voice-memos');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_library_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_library_items_updated_at
  BEFORE UPDATE ON public.library_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_library_item_updated_at();