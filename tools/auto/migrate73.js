// 🌟 #73 금발 검사 칸 없애기 (2026-11-11 머리 방 · 선생님 확정 · 배포 날에 한 번)
//   ① 🏆 업적 3개 이상 학생 = 💎 30 (하루 한도 밖 · 한 번만 · gem log 「blond73」) + 📮 우편함 통보 (선생님 선물 줄에 문구) · 호칭 「만 번째 베기」 는 업적 3개면 저절로
//   ② 지금 금발 검사(16)를 고른 계정 = 로안(0)으로 · 그 계정 스킬 칸(socket[16])도 0 으로 옮김
//   node tools/auto/migrate73.js            → 미리 보기 (아무것도 안 씀)
//   node tools/auto/migrate73.js --go       → 실제로 씀 (이미 받은 학생은 건너뜀)
const { firebaseToken } = require('./google');
const load = require('../../tests/load');
const DB = 'https://citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app';
const go = process.argv.includes('--go');
const fs = require('fs'), path = require('path');
const lessonFiles = fs.readdirSync(path.join(__dirname, '../../lessons')).filter((f) => /^(set|eval)-\d+\.js$/.test(f)).sort().map((f) => `lessons/${f}`);
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', ...lessonFiles, 'js/raid/bonus.js']);
const MSG = '금발 검사 칸이 없어졌어요. 대신 💎 30 과 호칭 「만 번째 베기」를 드려요. 이 호칭에는 비밀이 있어요.';
(async () => {
  const tok = await firebaseToken(), H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
  const get = async (p) => { const r = await fetch(`${DB}/${p}.json`, { headers: H }); if (!r.ok) throw new Error(`${r.status} ${p}`); return r.json(); };
  const patch = async (p, body) => { const r = await fetch(`${DB}/${p}.json`, { method: 'PATCH', headers: H, body: JSON.stringify(body) }); if (!r.ok) throw new Error(`${r.status} ${p} ${await r.text()}`); };
  const [bonus, gem, accounts] = await Promise.all([get('bonus'), get('gem'), get('accounts')]);
  const give = [], skip = [], blond = [];
  Object.entries(bonus || {}).forEach(([c, byN]) => Object.entries(byN || {}).forEach(([n, b]) => {
    const seals = DS.Bonus.seals(b || {}).length; if (seals < 3) return;
    const g = ((gem || {})[c] || {})[n] || {};
    ((g.log || {}).blond73 ? skip : give).push({ c, n, seals, total: Number(g.total) || 0, earned: Number(g.earned) || 0 });
  }));
  Object.entries(accounts || {}).forEach(([c, byN]) => Object.entries(byN || {}).forEach(([n, a]) => { if (a && Number(a.hero) === 16) blond.push({ c, n, socket: a.socket || {} }); }));
  const byCls = give.reduce((o, x) => ((o[x.c] = (o[x.c] || 0) + 1), o), {});
  console.log(`① 💎 30 + 통보: ${give.length}명 (${Object.entries(byCls).map(([c, k]) => `${c} ${k}`).join(' · ') || '없음'}) · 이미 받음 ${skip.length}명`);
  console.log(`② 금발 검사 → 로안: ${blond.length}개 (${blond.map((x) => `${x.c}/${x.n}`).join(', ') || '없음'})`);
  if (!go) { console.log('미리 보기만 했어요. 실제로 쓰려면 --go'); return; }
  for (const x of give) await patch(`gem/${x.c}/${x.n}`, { total: x.total + 30, earned: x.earned + 30, 'log/blond73': { g: 30, at: { '.sv': 'timestamp' }, why: MSG, gift: true } });
  for (const x of blond) { const s = { ...x.socket }; if (s[16] != null && s[0] == null) s[0] = s[16]; delete s[16]; await patch(`accounts/${x.c}/${x.n}`, { hero: 0, socket: Object.keys(s).length ? s : null }); }
  console.log(`✅ 썼어요: 💎 ${give.length}명 · 로안 ${blond.length}개`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
