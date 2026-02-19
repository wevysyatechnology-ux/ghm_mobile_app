# Create Knowledge Base Table

## Quick Setup via Supabase Dashboard

The `knowledge_base` table needs to be created before loading documents.

### Steps:

1. **Go to Supabase SQL Editor**
   - Navigate to: https://supabase.com/dashboard/project/vlwppdpodavowfnyhtkh/sql/new
   - (Your project ID: `vlwppdpodavowfnyhtkh`)

2. **Copy the SQL migration**
   - Open file: `supabase/migrations/20260218_create_knowledge_base.sql`
   - Copy entire contents (Ctrl+A, Ctrl+C)

3. **Paste and Run**
   - Paste into SQL Editor
   - Click "Run" button (or press F5)
   - Wait for execution (~5 seconds)

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - Check Tables list - `knowledge_base` should appear

5. **Load Knowledge**
   ```bash
   node scripts/load-knowledge-base.js
   ```

---

## What Gets Created

### Table: `knowledge_base`
- `id`: UUID primary key
- `content`: Full text of the document
- `embedding`: Vector(1536) for semantic search (OpenAI ada-002)
- `metadata`: JSONB with title, category, source
- `created_at`, `updated_at`: Timestamps

### Function: `search_knowledge()`
- Performs semantic search using vector similarity
- Returns top N matching documents with similarity scores
- Uses cosine similarity between embeddings

### Indexes:
- GIN index on metadata for fast JSON queries
- IVFFlat index on embeddings for fast vector search

### Security:
- RLS enabled
- Read access for all authenticated users
- Write access for service role only

---

## Troubleshooting

### "extension vector does not exist"
**Solution**: Enable pgvector extension first
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### "permission denied"
**Solution**: Use SQL Editor in Supabase Dashboard (has admin privileges)

### "already exists" errors
**Solution**: Safe to ignore - tables/functions already created

---

## After Creating Table

Run the knowledge loading script:
```bash
node scripts/load-knowledge-base.js
```

Expected output:
```
📚 Starting knowledge base loading...
✅ [1/11] What is WeVysya?
✅ [2/11] Membership Types
...
📚 Knowledge Base Loading Complete!
✅ Inserted: 11 documents
```

