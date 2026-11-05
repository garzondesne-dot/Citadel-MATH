// 모든 브라우저 스크립트가 문법 오류 없이 읽히는지 (2026-11-05: 한 줄 주석이 뒤 코드를 삼켜 hall.js 가 통째로 안 읽히던 일)
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const scripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
let bad = 0;
for (const f of scripts) { try { new vm.Script(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f }); } catch (e) { bad++; console.error('FAIL:', f, e.message); } }
if (bad) process.exit(1);
console.log(`OK: 스크립트 ${scripts.length}개 문법 확인`);
