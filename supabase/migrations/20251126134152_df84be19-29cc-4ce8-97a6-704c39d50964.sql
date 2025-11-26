-- Create a function to find similar library items using vector similarity
CREATE OR REPLACE FUNCTION public.find_similar_library_items(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5,
  exclude_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  type text,
  content text,
  storage_path text,
  thumbnail_path text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    library_items.id,
    library_items.title,
    library_items.description,
    library_items.type,
    library_items.content,
    library_items.storage_path,
    library_items.thumbnail_path,
    library_items.created_at,
    1 - (library_items.embedding <=> query_embedding) AS similarity
  FROM library_items
  WHERE 
    library_items.embedding IS NOT NULL
    AND (exclude_id IS NULL OR library_items.id != exclude_id)
    AND 1 - (library_items.embedding <=> query_embedding) > match_threshold
  ORDER BY library_items.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
