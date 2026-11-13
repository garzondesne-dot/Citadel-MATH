// 🏷 버전 꼬리표 (2026-11-13 선생님 「어느 순간 게임 버전 표시 사라짐」): 「창이 떠 있으면 숨김」 규칙이 늘 있는 #quiz(.hidden 로 숨김)를 창으로 치지 않게
const fs = require('fs'), path = require('path');
const css = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8'), html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
let fail = 0; const check = (c, m) => { if (!c) { fail++; console.log('FAIL:', m); } };
const hideByModal = css.split('\n').filter((l) => /\.modal[^{]*#ver-tag[^{]*\{[^}]*display:\s*none/.test(l));
hideByModal.forEach((l) => check(/:not\(\.hidden\)/.test(l), `창 규칙이 .hidden 창을 빼야 함: ${l.slice(0, 90)}`));
check(/getElementById\('ver-tag'\)/.test(fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8')), 'config.js 가 꼬리표를 만듦');
console.log(fail ? `❌ 버전 꼬리표 실패 ${fail}` : `✅ 버전 꼬리표: 창 규칙 ${hideByModal.length}줄 확인`); if (fail) process.exit(1);
