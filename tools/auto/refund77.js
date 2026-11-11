// 📜 #77 ③ (2026-11-11 머리 방 요청 · 선생님 「#79 취소 · 리셋 대신 이것만 되살림」): 모든 Ⅳ 전설 📜 3 → 2 가 들어가는 배포 날 한 번
//   이미 📜 3 을 내고 Ⅳ 를 연 학생에게 그 Ⅳ 하나마다 📜 1 돌려줌 + 우편함 한 줄(선물 줄 · gem log 「refund77」 = 두 번 실행해도 한 번만)
//   node tools/auto/refund77.js        → 미리 보기 (아무것도 안 씀)
//   node tools/auto/refund77.js --go   → 실제로 씀 (운영 DB · 선생님 「배포」 뒤 허락 받고)
const { firebaseToken } = require('./google');
const DB = 'https://citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app';
const go = process.argv.includes('--go');
const MSG = '전설 스킬에 필요한 📜 가 2개로 줄어 1개를 돌려드려요';
(async () => {
  const tok = await firebaseToken(), H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
  const get = async (p) => { const r = await fetch(`${DB}/${p}.json`, { headers: H }); if (!r.ok) throw new Error(`${r.status} ${p}`); return r.json(); };
  const patch = async (p, body) => { const r = await fetch(`${DB}/${p}.json`, { method: 'PATCH', headers: H, body: JSON.stringify(body) }); if (!r.ok) throw new Error(`${r.status} ${p} ${await r.text()}`); };
  const gem = (await get('gem')) || {}; const plan = []; let done = 0;
  for (const [c, byN] of Object.entries(gem)) for (const [n, d] of Object.entries(byN || {})) {
    if (!d) continue; const log = d.log || {};
    if (log.refund77) { done++; continue; }
    const paid3 = Object.keys(d.buy || {}).filter((k) => /^fx_/.test(k) && -Number((log[`buy_${k}`] || {}).s) >= 3);
    if (paid3.length) plan.push({ c, n, skills: paid3, s: paid3.length, scroll: Number(d.scroll) || 0 });
  }
  console.log(`대상 ${plan.length}명 · 📜 ${plan.reduce((a, x) => a + x.s, 0)} 돌려줌 · 이미 받음 ${done}명`); plan.forEach((x) => console.log(`  ${x.c} ${x.n}번 · ${x.skills.join(', ')} → 📜 +${x.s}`));
  if (!go) { console.log('미리 보기만 했어요. 실제로 쓰려면 --go'); return; }
  for (const x of plan) await patch(`gem/${x.c}/${x.n}`, { scroll: x.scroll + x.s, 'log/refund77': { s: x.s, at: { '.sv': 'timestamp' }, why: MSG, gift: true } });
  console.log(`✅ 썼어요: ${plan.length}명`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
