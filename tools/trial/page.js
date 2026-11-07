// 📲 체험판 전용 주소 trial/index.html 만들기 (2026-11-07) — node tools/trial/page.js
//   index.html 을 그대로 복사하되 <base href="../"> (그림 · 스크립트는 저장소 맨 위 것) + 앱 정보 = trial/manifest.webmanifest (시작 주소 · 범위 = trial/)
//   → 폰에서 「앱 설치」 하면 실제 게임 앱과 따로 「던전 체험판」 앱이 생김 (주소가 달라서 브라우저가 헷갈리지 않음)
//   index.html 을 고치면 다시 실행 (tests/pwa.test.js 가 같은지 확인)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
function build(src) {
  let s = src;
  const rep = (a, b) => { if (!s.includes(a)) throw new Error(`index.html 에 없음: ${a}`); s = s.replace(a, b); };
  rep('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../"><!-- 👩‍🏫 체험판 전용 주소 · tools/trial/page.js 가 index.html 에서 만듦 (직접 고치지 말 것) -->');
  rep('<title>모두의 던전 : 공통수학2</title>', '<title>모두의 던전 체험판 (선생님용)</title>');
  rep('<link rel="manifest" href="manifest.webmanifest">', '<link rel="manifest" href="trial/manifest.webmanifest">');
  rep('<meta name="apple-mobile-web-app-title" content="모두의 던전">', '<meta name="apple-mobile-web-app-title" content="던전 체험판">');
  return s;
}
if (require.main === module) {
  fs.writeFileSync(path.join(ROOT, 'trial', 'index.html'), build(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')));
  console.log('✔ trial/index.html');
}
module.exports = { build };
