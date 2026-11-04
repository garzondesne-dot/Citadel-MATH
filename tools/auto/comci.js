// 🔄 컴시간알리미 → 교사 시간표 (2026-11-04 · v0.9.7.1 · GitHub Actions 에서 매일 새벽 6시 · .github/workflows/comci.yml)
//   컴시간에는 공식 API 가 없어 학생용 화면이 쓰는 자료(http://comci.net:4082)를 읽는다 — 화면 구조가 바뀌면 끊길 수 있음 → 실패하면 sched/comci.err 에 남기고 수동 시간표로 운영
//   비밀 값 (GitHub Secrets · 저장소에 넣지 않음): FIREBASE_SA_JSON · COMCI_SCHOOL(학교코드) · COMCI_TEACHER(교사 이름) · FIREBASE_DB(선택)
//   쓰는 곳 (교사만 읽기 · 서비스 계정은 규칙을 거치지 않음):
//     sched/comci = { at, ok, err, week: { '요일-교시': '학년-반' }, raw?: 원본(검증 전 · 확인 뒤 지움) }
//   게임 반영: sched/comciOn === true 일 때만 (읽는 방식을 실제 자료로 확인한 뒤 켬) · 수동 시간표 칸이 우선 · 수학 칸만 · 월 5 · 목 7 제외는 게임 쪽에서
//   사용: node tools/auto/comci.js            (비밀 값은 환경 변수로)
//         node tools/auto/comci.js --dry      (Firebase 에 안 씀 · 결과만 출력)
//         node tools/auto/comci.js --raw      (원본도 sched/comci/raw 에 저장 — 첫 확인용)
const { firebaseToken } = require('./google');
const HOST = 'http://comci.net:4082';
const DB = process.env.FIREBASE_DB || 'https://citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app';
const SCHOOL = process.env.COMCI_SCHOOL, TEACHER = process.env.COMCI_TEACHER;
const DRY = process.argv.includes('--dry'), RAW = process.argv.includes('--raw');
const MATH = /수학/; // 수학 칸만 (공통수학1 · 2 · 수학 등)

const dec = (buf) => new TextDecoder('euc-kr').decode(buf);
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (school timetable sync)' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return dec(Buffer.from(await r.arrayBuffer()));
}
// 학생용 첫 화면에서 자료 주소(경로 번호 · 앞 글자)를 찾는다
async function route() {
  const html = await get(`${HOST}/st`);
  const ra = html.match(/school_ra\(sc\)[\s\S]{0,120}?url\s*:\s*'\.?\/?(\d+)\?/);
  const sd = html.match(/sc_data\(\s*'([^']*)'\s*,\s*sc\s*,\s*(\d+)\s*,\s*'?(\d+)'?\s*\)/) || html.match(/sc_data\(\s*'([^']*)'\s*,\s*sc\s*,\s*'?(\d+)'?/);
  if (!ra || !sd) throw Object.assign(new Error('컴시간 첫 화면에서 자료 주소를 못 찾음 (화면 구조가 바뀐 듯)'), { snip: html.slice(0, 4000) });
  return { path: ra[1], prefix: sd[1], a: sd[2] || '0', b: sd[3] || '1' };
}
async function raw(r) {
  const q = Buffer.from(`${r.prefix}${SCHOOL}_0_${r.a}`).toString('base64'); // sc_data('앞글자', sc, 1, '0') → 앞글자 + 학교코드 + _0_ + 1
  const body = await get(`${HOST}/${r.path}?${q}`);
  const j = body.slice(0, body.lastIndexOf('}') + 1);
  return JSON.parse(j);
}
// 원본에서 교사 이름 목록 · 과목 이름 목록 · 학급 시간표(학년 → 반 → 요일 → 교시 = 코드)를 찾는다 (키 이름이 「자료123」처럼 바뀌므로 모양으로 찾음)
function shape(d) {
  const arrs = Object.entries(d).filter(([, v]) => Array.isArray(v));
  const strs = (v) => v.filter((x) => typeof x === 'string').length;
  const teachers = arrs.filter(([, v]) => strs(v) > 5 && v.some((x) => typeof x === 'string' && x.includes(String(TEACHER || '').slice(0, 2)))).sort((a, b) => b[1].length - a[1].length)[0];
  const subjects = arrs.filter(([k, v]) => (!teachers || k !== teachers[0]) && strs(v) > 5 && v.some((x) => typeof x === 'string' && MATH.test(x))).sort((a, b) => b[1].length - a[1].length)[0];
  // 학급 시간표: 학년(1~3) → 반 → 요일(1~5) → 교시 · 숫자 4단 배열
  const deep = (v, n) => (n === 0 ? typeof v === 'number' : Array.isArray(v) && v.some((x) => deep(x, n - 1)));
  const tables = arrs.filter(([, v]) => deep(v, 4));
  const sep = typeof d['분리'] === 'number' ? d['분리'] : 100;
  return { teachers, subjects, tables, sep };
}
// 코드 → 교사 · 과목 (컴시간: 분리 100 = 교사*100+과목 · 그 밖 = 과목*분리+교사 — 두 해석 중 이름이 맞는 쪽)
const split = (code, sep, mode) => (mode === 'tf' ? { t: Math.floor(code / sep), s: code % sep } : { t: code % sep, s: Math.floor(code / sep) });
function week(d) {
  const { teachers, subjects, tables, sep } = shape(d);
  if (!teachers || !subjects || !tables.length) throw Object.assign(new Error('원본에서 교사 · 과목 · 시간표 자리를 못 찾음'), { keys: Object.keys(d).slice(0, 80) });
  const T = teachers[1], Sb = subjects[1];
  const me = T.map((x, i) => [x, i]).filter(([x]) => typeof x === 'string' && TEACHER && (x === TEACHER || TEACHER.startsWith(x.replace(/\*/g, '')) || x.startsWith(TEACHER.slice(0, 2))));
  if (!me.length) throw Object.assign(new Error(`교사 목록에 「${TEACHER}」가 없음`), { names: T.filter((x) => typeof x === 'string').length });
  const ids = me.map(([, i]) => i);
  let best = null;
  for (const [key, tab] of tables) for (const mode of ['tf', 'sf']) {
    const out = {}; let n = 0;
    tab.forEach((g, grade) => Array.isArray(g) && g.forEach((cl, c) => Array.isArray(cl) && cl.forEach((day, dw) => Array.isArray(day) && day.forEach((code, p) => {
      if (typeof code !== 'number' || !code || dw < 1 || dw > 5 || p < 1 || p > 10) return;
      const { t, s } = split(code, sep, mode);
      if (!ids.includes(t)) return;
      const sub = String(Sb[s] || ''); if (!MATH.test(sub)) return;
      out[`${dw}-${p}`] = `${grade}-${c}`; n++;
    }))));
    if (!best || n > best.n) best = { n, out, key, mode };
  }
  return { week: best ? best.out : {}, n: best ? best.n : 0, how: best ? `${best.key} · ${best.mode} · 분리 ${sep}` : '' , teacher: me.map(([x]) => x).join(',') };
}
async function put(path, val) {
  if (DRY) { console.log('[dry] PUT', path, JSON.stringify(val).slice(0, 300)); return; }
  const tok = await firebaseToken();
  const r = await fetch(`${DB}/${path}.json`, { method: 'PUT', headers: { Authorization: `Bearer ${tok}`, 'content-type': 'application/json' }, body: JSON.stringify(val), signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`Firebase ${path} → ${r.status} ${await r.text()}`);
}
(async () => {
  if (!SCHOOL || !TEACHER) throw new Error('COMCI_SCHOOL · COMCI_TEACHER 비밀 값이 없어요');
  const at = Date.now();
  let d = null;
  try {
    const r = await route(); d = await raw(r);
    const w = week(d);
    console.log(`✅ 컴시간: 수학 ${w.n}칸 (${w.how}) · 교사 표기 ${w.teacher}`);
    Object.entries(w.week).sort().forEach(([k, v]) => console.log(`  ${['', '월', '화', '수', '목', '금'][k.split('-')[0]]} ${k.split('-')[1]}교시 → ${v}반`));
    await put('sched/comci', { at, ok: true, n: w.n, how: w.how, week: w.week, ...(RAW ? { raw: JSON.stringify(d).slice(0, 900000) } : {}) });
  } catch (e) {
    console.error('❌', e.message);
    await put('sched/comci', { at, ok: false, err: String(e.message).slice(0, 300), ...(e.keys ? { keys: e.keys } : {}), ...(e.snip ? { snip: e.snip } : {}), ...(d && (RAW || e.keys) ? { raw: JSON.stringify(d).slice(0, 900000) } : {}) }).catch((x) => console.error('Firebase 기록 실패', x.message));
    process.exit(1);
  }
})();
