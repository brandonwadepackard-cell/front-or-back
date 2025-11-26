-- Enable the pgvector extension for storing embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to library_items table
-- Using 768 dimensions for text embeddings (common size for modern models)
ALTER TABLE public.library_items 
ADD COLUMN embedding vector(768);

-- Create an index for faster similarity searches
CREATE INDEX library_items_embedding_idx ON public.library_items 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add a comment to explain the column
COMMENT ON COLUMN public.library_items.embedding IS 'AI-generated embedding vector for similarity search based on title, description, and content';
