// 🏫 다른 학교판 주소 s/<학교코드>/ 만들기 (2026-11-13 · 선생님 「추천대로」 = A 학교 주소) — node tools/school/page.js
//   schools/schools.json = { "<학교코드>": { name, fb: { 그 학교 Firebase 웹 설정값(공개값) }, example? } }
//   학교마다 index.html 을 그대로 복사하되 <base href="../../"> (그림 · 스크립트는 저장소 맨 위 것 = 우리 배포 때 같이 바뀜)
//   + config.js 앞에 window.DS_SCHOOL (그 학교 Firebase · 이름) + 앱 정보 s/<코드>/manifest.webmanifest (시작 주소 · 범위 = 그 학교 주소 · 앱 따로 설치)
//   example: true 인 학교는 파일을 만들지 않음 (시험용 · 배포 안 함) · index.html 을 고치면 다시 실행 (tests/school.test.js 가 같은지 확인)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const CODE = /^[a-z0-9]{4,6}$/; // 짧은 무작위 영소문자 · 숫자 (학교 이름이 드러나지 않게)
const FB_KEYS = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function check(code, sch) {
  if (!CODE.test(code)) throw new Error(`학교코드는 영소문자 · 숫자 4~6자: ${code}`);
  if (!sch || !sch.fb || !sch.fb.apiKey || !sch.fb.databaseURL) throw new Error(`${code}: Firebase 웹 설정값(apiKey · databaseURL …) 없음`);
  Object.keys(sch.fb).forEach((k) => { if (!FB_KEYS.includes(k)) throw new Error(`${code}: 모르는 설정 칸 ${k}`); if (typeof sch.fb[k] !== 'string' || /[<>"'\\]/.test(sch.fb[k])) throw new Error(`${code}: 설정값 ${k} 이 이상함`); });
}
function build(src, code, sch) {
  check(code, sch);
  let s = src;
  const rep = (a, b) => { if (!s.includes(a)) throw new Error(`index.html 에 없음: ${a}`); s = s.replace(a, b); };
  const name = String(sch.name || '').slice(0, 20);
  const data = JSON.stringify({ code, name, fb: Object.fromEntries(FB_KEYS.filter((k) => sch.fb[k]).map((k) => [k, sch.fb[k]])) }).replace(/</g, '\\u003c');
  rep('<meta charset="utf-8">', `<meta charset="utf-8">\n<base href="../../"><!-- 🏫 다른 학교판 · tools/school/page.js 가 index.html 에서 만듦 (직접 고치지 말 것) -->`);
  rep('<title>모두의 던전 : 공통수학2</title>', `<title>모두의 던전 : 공통수학2${name ? ` · ${esc(name)}` : ''}</title>`);
  rep('<link rel="manifest" href="manifest.webmanifest">', `<link rel="manifest" href="s/${code}/manifest.webmanifest">`);
  rep('<script src="js/config.js"></script>', `<script>window.DS_SCHOOL = ${data};</script>\n<script src="js/config.js"></script>`);
  return s;
}
function manifest(base, code, sch) {
  check(code, sch);
  const m = JSON.parse(base), name = String(sch.name || '').slice(0, 20);
  m.name = `모두의 던전${name ? ` · ${name}` : ''}`; m.short_name = '모두의 던전'; m.id = './'; m.start_url = './'; m.scope = './';
  m.icons = (m.icons || []).map((i) => ({ ...i, src: `../../${String(i.src).replace(/^\.\//, '')}` }));
  return JSON.stringify(m, null, 2) + '\n';
}
const list = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'schools', 'schools.json'), 'utf8'));
if (require.main === module) {
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), man = fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8');
  for (const [code, sch] of Object.entries(list())) {
    if (sch.example) { build(src, code, sch); console.log(`· ${code} (예시 · 파일 안 만듦)`); continue; }
    const dir = path.join(ROOT, 's', code); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), build(src, code, sch));
    fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), manifest(man, code, sch));
    console.log(`✔ s/${code}/ (${sch.name || ''})`);
  }
}
module.exports = { build, manifest, list, CODE };
