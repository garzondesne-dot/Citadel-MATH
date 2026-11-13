// 🏫 다른 학교판 (2026-11-13 · A 학교 주소 s/<코드>/): 페이지 생성 · 학교 Firebase 로 바꿔 끼움 · 저장소 앞말 · 우리 서버 값이 섞이지 않음
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const root = path.join(__dirname, '..'), read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const P = require('../tools/school/page.js');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const list = P.list(), src = read('index.html'), man = read('manifest.webmanifest');
// ① 학교 목록: 코드 꼴 · 진짜 학교는 파일이 만들어져 있고 index.html 과 같음 · 예시는 파일 없음
for (const [code, sch] of Object.entries(list)) {
  ok(P.CODE.test(code), `학교코드 꼴: ${code}`);
  const html = P.build(src, code, sch), dir = path.join(root, 's', code);
  ok(html.includes('<base href="../../">') && html.indexOf('window.DS_SCHOOL') < html.indexOf('<script src="js/config.js">'), `${code}: base · DS_SCHOOL 이 config.js 앞`);
  if (sch.example) ok(!fs.existsSync(dir), `${code}: 예시 학교 = 파일 안 만듦 (배포 안 함)`);
  else {
    ok(read(`s/${code}/index.html`) === html, `s/${code}/index.html 이 index.html 과 다름 → node tools/school/page.js`);
    ok(read(`s/${code}/manifest.webmanifest`) === P.manifest(man, code, sch), `s/${code}/manifest 다름`);
  }
}
// ② 생성기가 이상한 값 막음
assert.throws(() => P.build(src, 'AB', list[Object.keys(list)[0]]), /학교코드/); n++;
assert.throws(() => P.build(src, 'abcd', { fb: { apiKey: 'x"><script>', databaseURL: 'u' } }), /이상함/); n++;
// ③ config.js: DS_SCHOOL 이 있으면 그 학교 Firebase · 우리 설정은 HOME_FB · 저장소 앞말
const code = Object.keys(list)[0], sch = list[code];
const store = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; }, _m: m }; };
const L0 = store(), S0 = store(); L0.setItem('citadel-teacher', 'OURS');
const win = { DS_SCHOOL: { code, name: sch.name, fb: sch.fb }, localStorage: L0, sessionStorage: S0 };
const ctx = { window: win, location: { pathname: `/Citadel-MATH/s/${code}/`, search: '' }, console }; ctx.window.DS = {}; ctx.DS = ctx.window.DS; vm.createContext(ctx);
vm.runInContext(read('js/config.js'), ctx);
const DS = ctx.DS;
ok(DS.FIREBASE.apiKey === sch.fb.apiKey && DS.HOME_FB && DS.HOME_FB.projectId === 'citadel-math' && DS.SCHOOL.code === code, 'config: 학교 Firebase 로 바꿔 끼움 · 우리 설정은 HOME_FB');
ok(win.localStorage.getItem('citadel-teacher') === null, '학교판은 우리 게임 저장값(citadel-teacher)을 못 봄');
win.localStorage.setItem('citadel-teacher', 'SCHOOL');
ok(L0.getItem('citadel-teacher') === 'OURS' && L0.getItem(`s.${code}.citadel-teacher`) === 'SCHOOL' && win.localStorage.length === 1 && win.localStorage.key(0) === 'citadel-teacher', '저장소 앞말 s.<코드>. 로 나눔');
// ④ 우리 정식 페이지(index.html)는 그대로 = DS_SCHOOL 없음
ok(!src.includes('DS_SCHOOL'), 'index.html 에는 학교 설정 없음');
// ⑤ 서비스 워커: 학교 주소는 우리 index.html 로 대신하지 않음
ok(/\\\/s\\\/\[a-z0-9\]\+\\\/.*Response\.error\(\)/.test(read('sw.js')), 'sw: 학교 주소 오프라인 = 우리 index.html 로 안 바꿈');
console.log(`✅ 다른 학교판: 확인 ${n}개 · 학교 ${Object.keys(list).length}곳 (예시 ${Object.values(list).filter((x) => x.example).length})`);
