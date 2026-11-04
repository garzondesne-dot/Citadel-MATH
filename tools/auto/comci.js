// 🔄 컴시간알리미 → 교사 시간표 (2026-11-04 · v0.9.7.1 · GitHub Actions 에서 매일 새벽 6시 · .github/workflows/comci.yml)
//   컴시간에는 공식 API 가 없어 학생용 화면이 쓰는 자료(http://comci.net:4082)를 읽는다 — 화면 구조가 바뀌면 끊길 수 있음 → 실패하면 sched/comci.err 에 남기고 수동 시간표로 운영
//   비밀 값 (GitHub Secrets · 저장소에 넣지 않음): FIREBASE_SA_JSON · COMCI_SCHOOL(학교코드) · COMCI_TEACHER(교사 이름 · 컴시간엔 「김*우」처럼 가려져 나옴) · COMCI_TEACHER_NO(선택 · 같은 모양 이름이 여럿일 때) · FIREBASE_DB(선택)
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

// 첫 화면 = EUC-KR · 시간표 자료(JSON) = UTF-8 (2026-11 확인: 자료를 EUC-KR 로 읽으면 「분리」 · 교사 이름이 깨짐)
const dec = (buf, cs = 'euc-kr') => new TextDecoder(cs).decode(buf);
async function get(url, cs) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (school timetable sync)' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  const ct = (r.headers.get('content-type') || '').toLowerCase(), b = Buffer.from(await r.arrayBuffer());
  return dec(b, cs || (/utf-?8/.test(ct) ? 'utf-8' : 'euc-kr'));
}
// 2026-11 컴시간 화면 코드가 뒤섞여 있음 (hour-obfuscated-v2): (function(a,k){… 16진 4자리 ^ ((k + n*13) & 255) …})([[0|1, "…"], …], k) → 같은 방법으로 풀어서(실행하지 않음) 글로 붙임
function unmix(html) {
  let out = '';
  const re = /\}\)\((\[\[[\s\S]*?\]\])\s*,\s*(\d+)\s*\)/g; let m;
  while ((m = re.exec(html))) {
    let a; try { a = JSON.parse(m[1]); } catch (e) { continue; }
    const k = Number(m[2]);
    a.forEach(([plain, b]) => { if (plain) { out += b; return; } for (let j = 0; j < b.length; j += 4) out += String.fromCharCode(parseInt(b.substr(j, 4), 16) ^ ((k + (j / 4) * 13) & 255)); });
    out += '\n';
  }
  return out;
}
// 학생용 첫 화면에서 자료 주소(경로 번호 · 앞 글자)를 찾는다 (뒤섞인 코드는 풀어서 함께 찾음)
async function route() {
  const page = await get(`${HOST}/st`), html = page + '\n' + unmix(page);
  const ra = html.match(/school_ra\(sc\)[\s\S]{0,120}?url\s*:\s*'\.?\/?(\d+)\?/);
  const sd = html.match(/sc_data\(\s*'([^']*)'\s*,\s*sc\s*,\s*(\d+)\s*,\s*'?(\d+)'?\s*\)/) || html.match(/sc_data\(\s*'([^']*)'\s*,\s*sc\s*,\s*'?(\d+)'?/);
  if (!ra || !sd) { const u = unmix(page), at = Math.max(0, u.search(/school_ra|sc_data|url\s*:/)); throw Object.assign(new Error('컴시간 첫 화면에서 자료 주소를 못 찾음 (화면 구조가 바뀐 듯)'), { snip: (u ? `[풀린 코드 ${u.length}자]\n` + u.slice(Math.max(0, at - 3000), at + 12000) : page.slice(0, 20000)) }); }
  return { path: ra[1], prefix: sd[1], a: sd[2] || '0', b: sd[3] || '1' };
}
async function raw(r) {
  const q = Buffer.from(`${r.prefix}${SCHOOL}_0_${r.a}`).toString('base64'); // sc_data('앞글자', sc, 1, '0') → 앞글자 + 학교코드 + _0_ + 1
  const body = await get(`${HOST}/${r.path}?${q}`, 'utf-8');
  const j = body.slice(0, body.lastIndexOf('}') + 1);
  return JSON.parse(j);
}
// 원본에서 교사 이름 목록 · 과목 이름 목록 · 학급 시간표(학년 → 반 → 요일 → 교시 = 코드)를 찾는다 (키 이름이 「자료123」처럼 바뀌므로 모양으로 찾음)
function shape(d) {
  const arrs = Object.entries(d).filter(([, v]) => Array.isArray(v));
  const strs = (v) => v.filter((x) => typeof x === 'string').length;
  const masked = (x) => typeof x === 'string' && /\*/.test(x);
  const teachers = arrs.filter(([, v]) => strs(v) > 5 && v.filter(masked).length > 5).sort((a, b) => b[1].length - a[1].length)[0]; // 가려진 이름(*)이 많은 목록 = 교사
  const subjects = arrs.filter(([k, v]) => (!teachers || k !== teachers[0]) && strs(v) > 5 && v.some((x) => typeof x === 'string' && MATH.test(x))).sort((a, b) => b[1].length - a[1].length)[0];
  // 학급 시간표: 학년(1~3) → 반 → 요일(1~5) → 교시 · 숫자 4단 배열
  const num = (x) => (typeof x === 'number' ? x : typeof x === 'string' && /^\D?\d+$/.test(x) ? Number(x.replace(/\D/g, '')) : NaN);
  const deep = (v, n) => (n === 0 ? Number.isFinite(num(v)) : Array.isArray(v) && v.some((x) => deep(x, n - 1)));
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
  // 컴시간 교사 이름은 가려져 나옴 (예: 「김*우」) → * = 아무 한 글자 · 길이가 같아야 함
  const hit = (x) => { if (typeof x !== 'string' || !x || !TEACHER) return false; if (x === TEACHER) return true; const re = new RegExp('^' + x.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.') + '$'); return re.test(TEACHER); };
  const me = T.map((x, i) => [x, i]).filter(([x]) => hit(x));
  if (!me.length) throw Object.assign(new Error(`교사 목록에 「${TEACHER}」가 없음`), { names: T.filter((x) => typeof x === 'string').length });
  let ids = me.map(([, i]) => i);
  // 같은 모양 이름이 여럿이면 수학 칸이 있는 선생님만 (COMCI_TEACHER_NO = 컴시간 교사 번호로 콕 집을 수도)
  if (process.env.COMCI_TEACHER_NO) ids = [Number(process.env.COMCI_TEACHER_NO)];
  else if (ids.length > 1) {
    const mathOf = (id) => { let n = 0; tables.forEach(([, tab]) => tab.forEach((g) => Array.isArray(g) && g.forEach((cl) => Array.isArray(cl) && cl.forEach((day, dw) => Array.isArray(day) && dw >= 1 && day.forEach((c, p) => { const v = typeof c === 'number' ? c : Number(String(c).replace(/\D/g, '')); if (p >= 1 && v && ['tf', 'sf'].some((m) => { const r = split(v, sep, m); return r.t === id && MATH.test(String(Sb[r.s] || '')); })) n++; }))))); return n; };
    const withMath = ids.filter((id) => mathOf(id) > 0);
    if (withMath.length !== 1) throw Object.assign(new Error(`「${TEACHER}」와 모양이 같은 수학 선생님이 ${withMath.length}명 (${me.map(([x, i]) => `${i}:${x}`).join(' ')}) — GitHub 비밀 값 COMCI_TEACHER_NO 에 번호를 넣어 주세요`), {});
    ids = withMath;
  }
  let best = null;
  // 읽는 방향: 교사 번호 · 과목 번호가 둘 다 목록 안에 드는 칸이 더 많은 쪽 (2026-11-04 실제 자료: 과목*1000+교사 = 480/480칸 유효)
  const validOf = (tab, mode) => { let v = 0; tab.forEach((g) => Array.isArray(g) && g.forEach((cl) => Array.isArray(cl) && cl.forEach((day, dw) => Array.isArray(day) && dw >= 1 && day.forEach((c, p) => { const x = typeof c === 'number' ? c : Number(String(c).replace(/\D/g, '')); if (p < 1 || !x) return; const r = split(x, sep, mode); if (r.t > 0 && T[r.t] !== undefined && Sb[r.s] !== undefined) v++; })))); return v; };
  for (const [key, tab] of tables) for (const mode of [validOf(tab, 'sf') >= validOf(tab, 'tf') ? 'sf' : 'tf']) {
    const out = {}; let n = 0;
    tab.forEach((g, grade) => Array.isArray(g) && g.forEach((cl, c) => Array.isArray(cl) && cl.forEach((day, dw) => Array.isArray(day) && day.forEach((code, p) => {
      code = typeof code === 'number' ? code : typeof code === 'string' ? Number(code.replace(/\D/g, '')) : NaN; // ">74032" = 이번 주 바뀐 칸
      if (!Number.isFinite(code) || !code || dw < 1 || dw > 5 || p < 1 || p > 10) return;
      const { t, s } = split(code, sep, mode);
      if (!ids.includes(t)) return;
      const sub = String(Sb[s] || ''); if (!MATH.test(sub)) return;
      out[`${dw}-${p}`] = `${grade}-${c}`; n++;
    }))));
    if (!best || n > best.n) best = { n, out, key, mode };
  }
  return { week: best ? best.out : {}, n: best ? best.n : 0, how: best ? `${best.key} · ${best.mode} · 분리 ${sep}` : '', teacher: ids.map((i) => `${i}:${T[i]}`).join(',') };
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
