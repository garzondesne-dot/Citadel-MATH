// 🪜 #96 개편 환불 (2026-11-11 선생님 「전부 환불해 주고 개편 기간 없이 · 자동 일괄 환불」 · DECISIONS 「💸 개편 환불」)
//   「개편 뒤」 표시(log buy_… 의 v: 96)가 없는 구매 = 💎 로 산 용사 전부(다시 잠김) + 상점에서 산 스킬 전부 → 낸 💎 · 📜 100% 돌려줌
//   도감 완성으로 이미 💎 를 돌려받은 용사(log refund_hero_…)는 건드리지 않음 · 🔨 강화 · 업적 칸 · 🌟 각성한 로안 그대로
//   끼운 용사가 잠기면 0번(로안) + 기본 스킬 · 돌려준 스킬을 끼워 둔 칸은 비움(그 용사 Ⅰ) · 우편함 한 통(선물 줄)
//   두 번 돌려도 안전: 돌려준 구매는 buy 에서 지워져 다시 잡히지 않음 · 다음 날 한 번 더 = 옛 판 폰에서 그사이 산 것만
//   node tools/auto/refund96.js        → 미리 보기 (아무것도 안 씀 · 이름 안 찍음)
//   node tools/auto/refund96.js --go   → 실제로 씀 (운영 DB · 선생님이 손발 방에서 직접 허락한 뒤)
const path = require('path');
const DB = 'https://citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app';
const go = process.argv.includes('--go');
const X = require(path.join(__dirname, '../../tests/load'))(['assets/manifest.js', 'js/engine/fx.js']); const F = X.FX;
global.window = global; global.DS = { Net: {} }; require('../../js/raid/gem.js'); const Gm = DS.Gem;
const MSG = (g, s, nh, nf) => `⚔ 용사 · 스킬 개편으로 💎 ${g}${s ? ` · 📜 ${s}` : ''} 를 돌려드렸어요 (용사 ${nh}명 + 스킬 ${nf}개) · 이번 한 번만 · 앞으로는 사면 끝`; // 📣 안내 창과 같은 내역
function planOf(d, a) {
  const log = d.log || {}, buy = d.buy || {}, items = []; let g = 0, s = 0;
  for (const k of Object.keys(buy)) {
    const m = /^(hero|fx)_(.+)$/.exec(k); if (!m) continue;
    const L = log[`buy_${k}`] || null; if (L && Number(L.v) === 96) continue; // 개편 뒤 구매
    if (m[1] === 'hero' && log[`refund_${k}`]) continue; // 도감 완성으로 이미 돌려받음
    const id = m[1] === 'hero' ? Number(m[2]) : m[2], pg = L ? -Number(L.g) || 0 : Gm.price(m[1], id) || 0, ps = L ? -Number(L.s) || 0 : 0;
    items.push({ k, kind: m[1], id, g: pg, s: ps }); g += pg; s += ps;
  }
  if (!items.length) return null;
  const heroesGone = new Set(items.filter((x) => x.kind === 'hero').map((x) => x.id)), fxGone = new Set(items.filter((x) => x.kind === 'fx').map((x) => x.id));
  const acc = {}; a = a || {};
  const hero = heroesGone.has(Number(a.hero)) ? 0 : Number(a.hero) || 0; if (hero !== (Number(a.hero) || 0)) acc.hero = hero;
  const fx = !a.fx || fxGone.has(a.fx) || hero !== (Number(a.hero) || 0) || !F.inLadder(hero, a.fx) ? F.ladder(hero)[0] : a.fx; if (fx !== a.fx) acc.fx = fx;
  Object.entries(a.socket || {}).forEach(([h, k]) => { if (heroesGone.has(Number(h)) || fxGone.has(k)) acc[`socket/${h}`] = null; });
  return { items, g, s, acc, lock: acc.hero != null };
}
if (require.main === module) (async () => {
  const { firebaseToken } = require('./google');
  const tok = await firebaseToken(), H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
  const get = async (p) => { const r = await fetch(`${DB}/${p}.json`, { headers: H }); if (!r.ok) throw new Error(`${r.status} ${p}`); return r.json(); };
  const patch = async (p, body) => { const r = await fetch(`${DB}/${p}.json`, { method: 'PATCH', headers: H, body: JSON.stringify(body) }); if (!r.ok) throw new Error(`${r.status} ${p} ${await r.text()}`); };
  const [gem, accs] = await Promise.all([get('gem'), get('accounts')]); const plan = [];
  for (const [c, byN] of Object.entries(gem || {})) for (const [n, d] of Object.entries(byN || {})) { if (!d) continue; const p = planOf(d, ((accs || {})[c] || {})[n]); if (p) plan.push({ c, n, d, ...p }); }
  const sum = (f) => plan.reduce((a, x) => a + f(x), 0), max = plan.reduce((a, x) => (x.g > a ? x.g : a), 0);
  console.log(`대상 ${plan.length}명 · 용사 ${sum((x) => x.items.filter((i) => i.kind === 'hero').length)} · 스킬 ${sum((x) => x.items.filter((i) => i.kind === 'fx').length)} · 💎 ${sum((x) => x.g)} · 📜 ${sum((x) => x.s)} · 1명 최대 💎 ${max} · 끼운 용사가 잠겨 0번으로 ${plan.filter((x) => x.lock).length}명`);
  if (!go) { console.log('미리 보기만 했어요. 실제로 쓰려면 --go (선생님 허락 뒤)'); return; }
  const at = Date.now();
  for (const x of plan) {
    const body = { total: (Number(x.d.total) || 0) + x.g, ...(x.s ? { scroll: (Number(x.d.scroll) || 0) + x.s } : {}), [`log/refund96_${at}`]: { g: x.g, ...(x.s ? { s: x.s } : {}), at: { '.sv': 'timestamp' }, why: MSG(x.g, x.s, x.items.filter((i) => i.kind === 'hero').length, x.items.filter((i) => i.kind === 'fx').length), gift: true, nopop: true, nh: x.items.filter((i) => i.kind === 'hero').length, nf: x.items.filter((i) => i.kind === 'fx').length } }; // 📣 개편 안내 창이 「용사 ○ + 스킬 ○」 로 읽음
    x.items.forEach((i) => { body[`buy/${i.k}`] = null; });
    await patch(`gem/${x.c}/${x.n}`, body);
    if (Object.keys(x.acc).length) await patch(`accounts/${x.c}/${x.n}`, x.acc);
  }
  console.log(`✅ 썼어요: ${plan.length}명`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
module.exports = { planOf };
