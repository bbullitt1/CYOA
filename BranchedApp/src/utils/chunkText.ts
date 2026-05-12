const CHUNK_SIZE = 220;

export function makeChunks(text: string): string[] {
  if (!text || text.length <= CHUNK_SIZE) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [text];
  const chunks: string[] = [];
  let cur = '';

  for (const s of sentences) {
    if (cur.length + s.length > CHUNK_SIZE && cur.length > 0) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur += s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.length > 0 ? chunks : [text];
}
