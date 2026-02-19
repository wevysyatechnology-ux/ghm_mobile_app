-- Create knowledge_base table for Voice OS RAG (Retrieval Augmented Generation)
-- This table stores documents with embeddings for semantic search

-- Enable pgvector extension for embedding storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embeddings are 1536 dimensions
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS knowledge_base_metadata_idx ON public.knowledge_base USING gin (metadata);
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx ON public.knowledge_base USING ivfflat (embedding vector_cosine_ops);

-- Create function for semantic search using vector similarity
CREATE OR REPLACE FUNCTION public.search_knowledge(
  query_embedding vector(1536),
  match_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_base kb
  WHERE kb.embedding IS NOT NULL
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;

-- Enable RLS (Row Level Security)
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read
CREATE POLICY "Allow read access to all authenticated users"
  ON public.knowledge_base
  FOR SELECT
  USING (true);

-- Create policy to allow service role to insert/update
CREATE POLICY "Allow service role to insert"
  ON public.knowledge_base
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update"
  ON public.knowledge_base
  FOR UPDATE
  USING (true);

-- Grant permissions
GRANT SELECT ON public.knowledge_base TO anon, authenticated;
GRANT ALL ON public.knowledge_base TO service_role;

-- Add helpful comment
COMMENT ON TABLE public.knowledge_base IS 'Stores knowledge documents with embeddings for Voice OS semantic search';
COMMENT ON COLUMN public.knowledge_base.embedding IS 'OpenAI text-embedding-ada-002 vector (1536 dimensions)';
COMMENT ON FUNCTION public.search_knowledge IS 'Semantic search using cosine similarity between embeddings';
