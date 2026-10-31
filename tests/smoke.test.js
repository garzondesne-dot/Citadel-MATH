// 실제로 떠 있는 서버(로컬 wrangler 또는 배포 주소)를 확인한다. 모의 객체 없음.
//   node tests/smoke.test.js                          → http://localhost:8788
//   node tests/smoke.test.js https://xxx.pages.dev    → 배포 주소
import assert from 'node:assert/strict';
import { VERSION } from '../public/version.js';

const BASE = (process.argv[2] || 'http://localhost:8788').replace(/\/$/, '');

const h = await (await fetch(`${BASE}/api/health`)).json();
assert.equal(h.version, VERSION, `서버 버전 ${h.version} ≠ 저장소 버전 ${VERSION} (배포가 아직 반영 안 됨?)`);
assert.equal(h.db.bound, true, 'D1 바인딩(DB) 없음');
assert.equal(h.db.ok, true, `DB 오류: ${h.db.error || JSON.stringify(h.db.roundtrip)}`);
assert.equal(h.db.roundtrip.got, '007', '문자열 "007" 이 그대로 돌아와야 함');

// 두 번째 호출: 스키마 초기화를 다시 실행해도 안전한지
const h2 = await (await fetch(`${BASE}/api/health`)).json();
assert.equal(h2.ok, true, '두 번째 초기화 실패');

for (const page of ['/', '/teacher.html', '/screen.html', '/version.js']) {
  const res = await fetch(BASE + page);
  assert.equal(res.status, 200, `${page} → ${res.status}`);
}
const js = await (await fetch(`${BASE}/version.js`)).text();
assert.ok(js.includes(`'${VERSION}'`), '화면 version.js 가 저장소와 다름');

console.log(`OK: ${BASE} · v${VERSION} · DB 왕복('007') · 재초기화 · 화면 4개 통과`);
