// D1 스키마. 모두 IF NOT EXISTS 라서 몇 번을 다시 실행해도 안전하다(초기화 실패 → 재실행).
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS meta (
     key   TEXT PRIMARY KEY,
     value TEXT NOT NULL
   )`,
];

export async function ensureSchema(db) {
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
}

// 실제 저장소가 문자열을 바꾸지 않는지 확인한다. '007' 이 7 로 바뀌면 실패.
export async function roundtrip(db) {
  const probe = '007';
  await db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').bind('health_probe', probe).run();
  const row = await db.prepare('SELECT value FROM meta WHERE key = ?').bind('health_probe').first();
  const value = row ? row.value : null;
  return { ok: value === probe, sent: probe, got: value, type: typeof value };
}
