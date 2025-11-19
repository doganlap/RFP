# RFP Autonomous Analytics App (Starter)

A production-ready scaffold to ingest RFPs, parse/validate them via a 5-layer pipeline, score opportunities, and produce automated bid/no-bid decisions and dashboard summaries.

## Quick start (Docker)
```bash
cp .env.example .env
docker compose up --build
```

### Test the flow
1) Create an RFP:
```bash
curl -X POST http://localhost:8080/api/rfps/upload   -H "Content-Type: application/json"   -d '{"name":"Sample RFP","deadline":"2025-12-31T23:59:00Z","documentUrl":"http://example.com/rfp.pdf"}'
```
Response:
```json
{"id": 1, "status":"QUEUED"}
```

2) Fetch analysis:
```bash
curl http://localhost:8080/api/rfps/1/analysis
```

3) Dashboard summary:
```bash
curl http://localhost:8080/api/rfps/dashboard/summary
```

## Services
- **api-gateway**: Routes + job queue + orchestrator worker (BullMQ)
- **parser**: Extracts sections from document (stubbed)
- **validator**: 5-layer validation (Layers 1–3 implemented, 4–5 stubbed)
- **scoring**: Weighted (Fit 40 / Complexity 30 / Competitive 30)
- **decision**: Threshold-based decision + rationale
- **postgres / redis**: Storage and queue

## Notes
- Extend parser to actually parse PDF/DOCX and map to JSON.
- Fill Layer-4 (cross-reference) and Layer-5 (AI-assisted) in validator.
- Replace decision thresholds per your playbook.


---

## OpenAPI / Swagger
- API Gateway: http://localhost:8080/docs  (OpenAPI JSON at /openapi.json)
- Parser (FastAPI): http://localhost:8000/docs
- Validator (FastAPI): http://localhost:8001/docs
- Scoring: http://localhost:7002/docs
- Decision: http://localhost:7003/docs

## Semantic Search (pgvector / Qdrant)
- Default uses **pgvector** (ankane/pgvector image). To switch to Qdrant:
  - set `USE_QDRANT=1` in `.env`, keep `QDRANT_URL=http://qdrant:6333`
  - `docker compose up --build`
- Index clauses:
```bash
curl -X POST http://localhost:8080/api/clauses/index  -H "Content-Type: application/json"  -d '{"rfpId":1,"clauses":[{"section":"Scope","text":"Deliver multi-tenant GRC platform."}]}'
```
- Search:
```bash
curl -X POST http://localhost:8080/api/search/clauses  -H "Content-Type: application/json"  -d '{"query":"multi-tenant platform","rfpId":1,"topK":3}'
```

## Control Tower (Next.js, AR/EN)
- http://localhost:3000 — reads from `NEXT_PUBLIC_API_BASE` (defaults to http://localhost:8080)
- Toggle language via the top-right button (switches RTL/LTR).

