CREATE TABLE IF NOT EXISTS rfps (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  document_url TEXT,
  status TEXT DEFAULT 'QUEUED',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rfp_analysis (
  id SERIAL PRIMARY KEY,
  rfp_id INT REFERENCES rfps(id) ON DELETE CASCADE,
  parsed JSONB,
  validation JSONB,
  score NUMERIC,
  decision TEXT,
  rationale TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rfp_events (
  id SERIAL PRIMARY KEY,
  rfp_id INT REFERENCES rfps(id) ON DELETE CASCADE,
  event_type TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rfp_clauses (
  id BIGSERIAL PRIMARY KEY,
  rfp_id INT REFERENCES rfps(id) ON DELETE CASCADE,
  section TEXT,
  text TEXT NOT NULL,
  embedding vector(384),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Recommended index (requires populated data; ivfflat builds on table state)
-- You can rebuild after data load:
-- CREATE INDEX IF NOT EXISTS rfp_clauses_embedding_idx ON rfp_clauses USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
