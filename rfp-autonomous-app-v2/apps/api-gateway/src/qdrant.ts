import axios from 'axios';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION = 'rfp_clauses';

export async function ensureCollection(dim: number) {
  try {
    await axios.put(`${QDRANT_URL}/collections/${COLLECTION}`, {
      vectors: { size: dim, distance: 'Cosine' }
    });
  } catch (e) {
    // ignore if exists
  }
}

export async function upsertQdrant(points: Array<{id: string|number, vector: number[], payload: any}>) {
  await axios.put(`${QDRANT_URL}/collections/${COLLECTION}/points`, { points });
}

export async function searchQdrant(vector: number[], topK: number, filter?: any) {
  const res = await axios.post(`${QDRANT_URL}/collections/${COLLECTION}/points/search`, {
    vector, limit: topK, filter
  });
  return res.data?.result ?? [];
}
