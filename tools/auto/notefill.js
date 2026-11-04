// 📕 오답노트 칸 채우기 (v0.9.7.9): 옛 기록(records)에 문제마다 칸(mons · bossM)과 ⭐ 도전 문항 분리(boss · bossX)를 방 기록(rooms/코드)으로 다시 계산해 넣는다
//   기록의 다른 칸(EXP · 시각 · 개념)은 그대로 · 이미 칸이 있는 기록은 건너뜀(--all 이면 다시) · 서비스 계정 열쇠(FIREBASE_SA_JSON) 필요
//   node tools/auto/notefill.js [반] [--dry] [--all]
const fs = require('fs'), path = require('path'), vm = require('vm');
const { firebaseToken } = require('./google');
const DB = 'https://citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app';
const args = process.argv.slice(2), DRY = args.includes('--dry'), ALL = args.includes('--all'), [CLS] = args.filter((a) => !a.startsWith('--'));

async function rest(method, p, body) {
  const tok = await firebaseToken();
  const r = await fetch(`${DB}/${p}.json`, { method, headers: { Authorization: `Bearer ${tok}`, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`Firebase ${method} ${p} → ${r.status} ${await r.text()}`);
  return r.json();
}
const Net = {
  TS: { '.sv': 'timestamp' },
  now: () => Date.now(),
  uid: () => 'recover-tool',
  pack: (v) => JSON.stringify(v),
  unpack: (s) => { try { return JSON.parse(s); } catch (e) { return null; } },
  get: (p) => rest('GET', p),
  set: (p, v) => { if (DRY) { console.log('  [dry] PUT', p, JSON.stringify(v).slice(0, 160)); return Promise.resolve(); } return rest('PUT', p, v); },
};
const store = {};
const ctx = vm.createContext({ console, setTimeout, clearTimeout, localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } } });
ctx.window = ctx;
const root = path.join(__dirname, '..', '..');
const files = ['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js',
  ...fs.readdirSync(path.join(root, 'lessons')).filter((f) => /^set-\d+\.js$|^eval-\d+\.js$/.test(f)).sort().map((f) => `lessons/${f}`), 'lessons/curriculum.js',
  'js/engine/fx.js', 'js/raid/model.js', 'js/raid/actions.js', 'js/raid/grow.js', 'js/raid/result.js'];
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
ctx.DS.Net = Net;

(async () => {
  const D = ctx.DS, X = D.Raid, recs = (await Net.get('records')) || {}, rooms = {}, ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  let n = 0, skip = 0, miss = 0;
  for (const [c, byN] of Object.entries(recs)) {
    if (CLS && c !== ck(CLS)) continue;
    for (const [num, byL] of Object.entries(byN || {})) for (const [lid, r] of Object.entries(byL || {})) {
      const L = D.Lessons.get(lid);
      if (!L || L.eval || !r || !r.code) { skip++; continue; }
      if (r.mons && r.bossM && !ALL) { skip++; continue; }
      if (!(r.code in rooms)) { const v = await Net.get(`rooms/${r.code}`).catch(() => null); rooms[r.code] = v && v.meta ? D.Act.unpackRoom(v) : null; }
      const R = rooms[r.code]; if (!R) { miss++; continue; }
      const uid = Object.keys(R.players || {}).find((u) => !R.players[u].teacher && ck(R.players[u].cls || '') === c && String(R.players[u].num) === String(num));
      if (!uid) { miss++; continue; }
      const x = D.Result.compute(L, R, uid), hp = x.boss.hp;
      const patch = { mons: Object.fromEntries(x.mons.map((m) => [m.id, m.st])), bossM: x.boss.bossM, boss: x.boss.mast.slice(0, hp).filter(Boolean).length, bossX: x.boss.mast.slice(hp).filter(Boolean).length };
      await rest(DRY ? 'GET' : 'PATCH', `records/${c}/${num}/${lid}`, DRY ? undefined : patch);
      if (DRY && n < 6) console.log('  [dry]', c, num, lid, JSON.stringify(patch));
      n++;
    }
  }
  console.log(`${DRY ? '[dry] ' : ''}✅ 오답노트 칸 ${n}개 기록 · 건너뜀 ${skip} · 방 · 학생 못 찾음 ${miss}`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
