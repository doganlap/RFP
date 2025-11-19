// Deterministic lightweight "embedding" for offline dev.
// Replace with a real model in production.
export function embed(text: string, dim = parseInt(process.env.EMBED_DIM || '384', 10)): number[] {
  const v = new Array(dim).fill(0);
  let seed = 2166136261;
  for (const ch of text) {
    seed ^= ch.charCodeAt(0);
    seed = Math.imul(seed, 16777619) >>> 0;
    const idx = seed % dim;
    v[idx] += 1;
  }
  // L2 normalize
  const norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0)) || 1;
  return v.map(x => x / norm);
}
