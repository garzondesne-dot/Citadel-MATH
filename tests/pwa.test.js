// 앱 설치(PWA) 검사: 캐시 이름 = 'ds-' + DS.VERSION, 서비스 워커가 미리 받는 파일이 모두 있고, index.html 의 스크립트가 모두 캐시 목록에 있는지
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const DS = require('./load')(['js/config.js']);
const sw = read('sw.js');
const cache = sw.match(/const CACHE = '([^']+)'/)[1];
assert.strictEqual(cache, 'ds-' + DS.VERSION, `sw.js 캐시 이름 ${cache} ≠ ds-${DS.VERSION}`);
const list = (name) => [...sw.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`))[1].matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean);
const core = list('CORE'), stat = list('STATIC');
for (const f of [...core, ...stat]) assert.ok(fs.existsSync(path.join(root, f)), `서비스 워커 목록의 파일이 없음: ${f}`);
const scripts = [...read('index.html').matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
for (const s of scripts) assert.ok(core.includes(s), `index.html 스크립트가 sw.js CORE 에 없음: ${s}`);
const man = JSON.parse(read('manifest.webmanifest'));
assert.strictEqual(man.display, 'standalone');
for (const i of man.icons) assert.ok(fs.existsSync(path.join(root, i.src)), `아이콘 없음: ${i.src}`);
assert.ok(man.icons.some((i) => i.purpose === 'maskable') && man.icons.some((i) => i.sizes === '512x512'));
console.log(`OK: PWA — 캐시 ${cache} · 미리 받는 파일 ${core.length + stat.length}개 · 스크립트 ${scripts.length}개 모두 캐시 · 아이콘 ${man.icons.length}개`);
