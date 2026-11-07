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
// 📲 체험판 전용 주소 (v0.9.16.2): trial/index.html = index.html 에서 만든 것 그대로 · 앱 정보는 trial/ 범위 · 실제 게임 앱과 id · 시작 주소가 다름
assert.strictEqual(read('trial/index.html'), require('../tools/trial/page.js').build(read('index.html')), 'trial/index.html 이 index.html 과 다름 → node tools/trial/page.js 다시 실행');
const tman = JSON.parse(read('trial/manifest.webmanifest'));
assert.strictEqual(tman.scope, './'); assert.strictEqual(tman.start_url, './'); assert.ok(/체험판/.test(tman.short_name));
for (const i of tman.icons) assert.ok(fs.existsSync(path.join(root, 'trial', i.src)), `체험판 아이콘 없음: ${i.src}`);
console.log(`OK: PWA — 캐시 ${cache} · 미리 받는 파일 ${core.length + stat.length}개 · 스크립트 ${scripts.length}개 모두 캐시 · 아이콘 ${man.icons.length}개`);
