// 📥 수업 기록 복구 (v0.9.7.6): 수업 끝 전에 나간 학생 기록 · EXP 를 방 기록(rooms/코드)으로 다시 만든다
//   게임의 DS.Result.gather 를 그대로 돌림 (교사 「수업 일지 → 📥 결과」 버튼과 같은 계산) · 서비스 계정 열쇠(FIREBASE_SA_JSON) 필요
//   node tools/auto/recover.js <방코드> [반] [--dry]     예) node tools/auto/recover.js 149929 1-4 --dry
const fs = require('fs'), path = require('path'), vm = require('vm');
const { firebaseToken } = require('./google');
const DB = 'https://citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app';
const args = process.argv.slice(2), DRY = args.includes('--dry'), [CODE, CLS] = args.filter((a) => !a.startsWith('--'));
if (!CODE) { console.error('쓰는 법: node tools/auto/recover.js <방코드> [반] [--dry]'); process.exit(1); }

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
  const o = await ctx.DS.Result.gather(String(CODE), CLS || null);
  console.log(`${DRY ? '[dry] ' : ''}✅ ${CODE} · ${o.L.no}차시 · 저장 ${o.saved.length}명 (${o.saved.sort((a, b) => a - b).join(', ')})${o.kept.length ? ` · 이미 있음 ${o.kept.join(', ')}` : ''}`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
