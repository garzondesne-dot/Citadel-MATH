// 🔁 #79 스킬 전체 리셋 (2026-11-11 머리 방 · 선생님 확정 · 🌳 스킬 지도 배포 날에 한 번)
//   ① 💎 로 산 스킬(gem buy fx_*) → 산 기록 지움(다시 잠김) · 용사 · 강화 · 호칭 · 카드 · 업적(인장으로 연 Ⅲ)은 그대로
//   ② 돌려줌 = 실제로 낸 💎 100% (log buy_fx_* 의 g) + 낸 📜 전부 · 하루 한도 밖
//   ③ 예전에 되판 스킬(sell_fx_* · 70%)의 나머지 30% (그 판 값 − 받은 값 · 다시 사서 가진 것은 ②로 · 겹치지 않게)
//   ④ 끼워 둔 스킬이 잠기면 그 칸 비움(socket) · 지금 이펙트(fx)도 용사 기본 Ⅰ 로
//   ⑤ 우편함 한 줄(선생님 선물 줄 · gem log 「reset79」 = 두 번 실행해도 한 번만) · ⑥ 시험 계정도 같은 규칙
//   node tools/auto/reset79.js        → 미리 보기 (아무것도 안 씀)
//   node tools/auto/reset79.js --go   → 실제로 씀
const { firebaseToken } = require('./google');
const load = require('../../tests/load');
const DB = 'https://citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app';
const go = process.argv.includes('--go');
const fs = require('fs'), path = require('path');
const lessonFiles = fs.readdirSync(path.join(__dirname, '../../lessons')).filter((f) => /^(set|eval)-\d+\.js$/.test(f)).sort().map((f) => `lessons/${f}`);
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', ...lessonFiles, 'js/engine/fx.js', 'js/raid/bonus.js']);
const REF = 0.7;
const msg = (g, s) => `스킬 지도가 새로 열렸어요. 스킬에 쓴 💎 ${g}${s ? ` · 📜 ${s}` : ''}을 모두 돌려드려요. 새 지도에서 다시 골라 보세요.`;
(async () => {
  const tok = await firebaseToken(), H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
  const get = async (p) => { const r = await fetch(`${DB}/${p}.json`, { headers: H }); if (!r.ok) throw new Error(`${r.status} ${p}`); return r.json(); };
  const patch = async (p, body) => { const r = await fetch(`${DB}/${p}.json`, { method: 'PATCH', headers: H, body: JSON.stringify(body) }); if (!r.ok) throw new Error(`${r.status} ${p} ${await r.text()}`); };
  const [gem, accounts, bonus, tester] = await Promise.all([get('gem'), get('accounts'), get('bonus'), get('tester')]);
  const plan = []; let skills = 0, sumG = 0, sumS = 0, max = 0, socketN = 0, soldN = 0, soldStud = 0, done = 0;
  for (const [c, byN] of Object.entries(gem || {})) for (const [n, d] of Object.entries(byN || {})) {
    if (!d) continue; const log = d.log || {};
    if (log.reset79) { done++; continue; }
    const owned = Object.keys(d.buy || {}).filter((k) => /^fx_/.test(k));
    let g = 0, s = 0, sold = 0;
    owned.forEach((k) => { const b = log[`buy_${k}`] || {}; g += Math.max(0, -Number(b.g) || 0); s += Math.max(0, -Number(b.s) || 0); });
    Object.entries(log).filter(([k]) => /^sell_fx_/.test(k)).forEach(([k, v]) => {
      const key = k.replace(/^sell_/, '').replace(/_\d+$/, ''), back = Number(v.g) || 0, b = log[`buy_${key}`] || {};
      const paid = !owned.includes(key) && b.g ? -Number(b.g) : Math.round(back / REF); // 다시 사서 가진 것은 buy 기록이 새 값 → 판 값은 받은 값에서 거꾸로
      const rest = Math.max(0, paid - back); if (rest) { g += rest; sold++; }
    });
    if (!owned.length && !sold) continue;
    // ④ 잠기게 되는 스킬 = 산 것 중 인장(업적)으로도 열리지 않는 것
    const seals = DS.Bonus.seals(((bonus || {})[c] || {})[n] || {}).length, fo = (id) => { const i = DS.FX.FANCY.indexOf(id); return i >= 0 && seals >= DS.Bonus.UNLOCK[i]; };
    const lock = owned.map((k) => k.slice(3)).filter((id) => !fo(id));
    const a = ((accounts || {})[c] || {})[n] || {}, sock = { ...(a.socket || {}) }; let sockChange = false;
    Object.entries(sock).forEach(([h, id]) => { if (lock.includes(id)) { delete sock[h]; sockChange = true; } });
    const fxNow = a.fx && lock.includes(a.fx) ? DS.FX.affOf(Number(a.hero) || 0).ids[0] : null;
    if (sockChange || fxNow) socketN++;
    skills += owned.length; sumG += g; sumS += s; max = Math.max(max, g); if (sold) soldStud++; soldN += sold;
    plan.push({ c, n, owned, g, s, sock: sockChange ? sock : undefined, fxNow, total: Number(d.total) || 0, scroll: Number(d.scroll) || 0, earned: Number(d.earned) || 0, test: !!((tester || {})[c] || {})[n] });
  }
  const byCls = plan.reduce((o, x) => ((o[x.c] = (o[x.c] || 0) + 1), o), {});
  console.log(`대상 ${plan.length}명 (${Object.entries(byCls).sort().map(([c, k]) => `${c} ${k}`).join(' · ')}) · 시험 계정 ${plan.filter((x) => x.test).length}명 포함 · 이미 받음 ${done}명`);
  console.log(`스킬 ${skills}개 다시 잠김 · 돌려줌 💎 ${sumG} · 📜 ${sumS} · 한 명 최대 💎 ${max} · 끼운 칸 비움 ${socketN}명 · 되판 나머지 30% ${soldStud}명(${soldN}번)`);
  if (!go) { console.log('미리 보기만 했어요. 실제로 쓰려면 --go'); return; }
  for (const x of plan) {
    const up = { total: x.total + x.g, earned: x.earned + x.g, ...(x.s ? { scroll: x.scroll + x.s } : {}), 'log/reset79': { g: x.g, ...(x.s ? { s: x.s } : {}), at: { '.sv': 'timestamp' }, why: msg(x.g, x.s), gift: true } };
    x.owned.forEach((k) => { up[`buy/${k}`] = null; });
    await patch(`gem/${x.c}/${x.n}`, up);
    if (x.sock !== undefined || x.fxNow) await patch(`accounts/${x.c}/${x.n}`, { ...(x.sock !== undefined ? { socket: Object.keys(x.sock).length ? x.sock : null } : {}), ...(x.fxNow ? { fx: x.fxNow } : {}) });
  }
  console.log(`✅ 썼어요: ${plan.length}명 · 💎 ${sumG} · 📜 ${sumS}`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
