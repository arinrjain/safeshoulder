-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- Knowledge base chunks table
create table public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  document_path text not null,
  domain text not null,  -- school_bullying, heartbreak, domestic, financial, workplace
  title text not null,
  content text not null,
  embedding vector(1536),  -- OpenAI text-embedding-3-small produces 1536-dim vectors
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for fast lookup
create index idx_kb_chunks_domain on public.kb_chunks(domain);
create index idx_kb_chunks_document on public.kb_chunks(document_path);
create index idx_kb_chunks_embedding on public.kb_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RPC function to retrieve relevant chunks by vector similarity
drop function if exists public.match_chunks(vector, text, int);

create function public.match_chunks(
  query_embedding vector,
  match_domain text,
  match_count int default 3
)
returns table (
  id uuid,
  document_path text,
  domain text,
  title text,
  content text,
  similarity float
) as $$
begin
  return query
  select
    kb_chunks.id,
    kb_chunks.document_path,
    kb_chunks.domain,
    kb_chunks.title,
    kb_chunks.content,
    1 - (kb_chunks.embedding <=> query_embedding)::float as similarity
  from public.kb_chunks
  where kb_chunks.domain = match_domain
  order by kb_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$ language plpgsql;
