// GET /api/health — 배포 버전과 데이터베이스 연결을 한 번에 확인한다.
import { VERSION } from '../../public/version.js';
import { ensureSchema, roundtrip } from '../_lib/db.js';

export async function onRequestGet({ env }) {
  const body = { ok: true, version: VERSION, time: new Date().toISOString(), db: { bound: !!env.DB } };
  if (env.DB) {
    try {
      await ensureSchema(env.DB);
      body.db.roundtrip = await roundtrip(env.DB);
      body.db.ok = body.db.roundtrip.ok;
    } catch (e) {
      body.db.ok = false;
      body.db.error = String(e && e.message || e);
    }
  } else {
    body.db.ok = false;
    body.db.error = 'D1 바인딩(DB)이 없습니다. docs/deploy-cloudflare.md 4단계를 확인하세요.';
  }
  body.ok = body.db.ok;
  return Response.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
