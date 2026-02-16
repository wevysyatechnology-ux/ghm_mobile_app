-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- Create knowledge_base table
create table if not exists public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  embedding vector(1536), -- Ada model produces 1536 dimensions
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Indexing for vector similarity search
  constraint knowledge_base_embedding_check check (
    embedding is null or array_length(embedding::float[], 1) = 1536
  )
);

-- Create index for semantic search
create index if not exists knowledge_base_embedding_index on public.knowledge_base 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create text search index
create index if not exists knowledge_base_content_index on public.knowledge_base
using gin(to_tsvector('english', content));

-- Create function for semantic search
create or replace function public.search_knowledge(
  query_embedding vector,
  match_limit int default 5,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql stable as $$
begin
  return query
  select
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.metadata,
    (1 - (knowledge_base.embedding <=> query_embedding))::float as similarity
  from knowledge_base
  where embedding is not null
  and (1 - (knowledge_base.embedding <=> query_embedding)) > match_threshold
  order by knowledge_base.embedding <=> query_embedding
  limit match_limit;
end;
$$;

-- Create function to initialize knowledge base table
create or replace function public.create_knowledge_base_table()
returns void language plpgsql as $$
begin
  -- Table creation handled above, function exists for compatibility
  null;
end;
$$;

-- Add RLS policies (optional - adjust based on your security requirements)
alter table public.knowledge_base enable row level security;

-- Allow all authenticated users to read knowledge
create policy "Knowledge base is readable by authenticated users"
on public.knowledge_base for select
to authenticated
using (true);

-- Allow service role to manage knowledge (for admin operations)
create policy "Service role can manage knowledge"
on public.knowledge_base
to service_role
using (true)
with check (true);
