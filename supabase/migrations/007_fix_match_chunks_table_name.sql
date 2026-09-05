-- Fix match_chunks() to query the actual populated table (knowledge_chunks)
-- instead of the never-created kb_chunks table from migration 003.
--
-- Root cause: migration 003_knowledge_base.sql defined kb_chunks + match_chunks(),
-- but that migration was never applied to production. Instead, a separate table
-- `knowledge_chunks` (different schema: document_name instead of document_path,
-- no title column) was created and populated with 145 rows back in June 2026.
-- The match_chunks() RPC function was left pointing at the non-existent kb_chunks,
-- so every RAG retrieval silently failed for the life of the app.

drop function if exists public.match_chunks(vector, text, int);

create function public.match_chunks(
  query_embedding vector,
  match_domain text,
  match_count int default 3
)
returns table (
  id uuid,
  document_name text,
  domain text,
  content text,
  similarity float
) as $$
begin
  return query
  select
    knowledge_chunks.id,
    knowledge_chunks.document_name,
    knowledge_chunks.domain,
    knowledge_chunks.content,
    1 - (knowledge_chunks.embedding <=> query_embedding)::float as similarity
  from public.knowledge_chunks
  where knowledge_chunks.domain = match_domain
     or knowledge_chunks.domain is null  -- crisis/general content applies to all domains
  order by knowledge_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$ language plpgsql;
