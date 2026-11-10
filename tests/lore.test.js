// 🧙 #73 용사 이름 · 이야기 (2026-11-11): docs/HERO-LORE.md 표 = js/engine/lore.js 그대로 · 34명 · 겹치는 이름 없음 · 한 줄 35자 안팎 — node tests/lore.test.js
const fs = require('fs'), path = require('path');
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/lore.js']);
let ok = 0, fail = 0; const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
const md = fs.readFileSync(path.join(__dirname, '..', 'docs/HERO-LORE.md'), 'utf8');
const rows = {}; md.split('\n').forEach((l) => { const m = /^\| (\d+) \| \*\*(.+?)\*\* \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \|$/.exec(l); if (m) rows[m[1]] = { name: m[2], job: m[3].split(' (')[0], nick: m[4], a: m[5], b: m[6].replace(' (견본 그대로)', '') }; });
const ids = Object.keys(DS.ASSETS.heroesV2.list).map(Number);
check(Object.keys(rows).length === 34 && ids.every((n) => DS.Lore.of(n)), `34명 모두 이야기 (${Object.keys(rows).length})`);
Object.entries(rows).forEach(([n, r]) => { const h = DS.Lore.of(n); check(h && ['name', 'job', 'nick', 'a', 'b'].every((k) => h[k] === r[k]), `${n} 표와 같음`); });
check(new Set(Object.values(DS.Lore.H).map((h) => h.name)).size === 34, '이름 겹침 없음');
ids.filter((n) => n !== 16).forEach((n) => check(DS.Lore.of(n).job === DS.ASSETS.heroesV2.list[n].name, `${n} 직업 = 게임 이름 (${DS.Lore.of(n).job} / ${DS.ASSETS.heroesV2.list[n].name})`));
const sec = md.slice(md.indexOf('## 8.')), says = {}; sec.split('\n').forEach((l) => { const m = /^\| (\d+) \| [^|]+ \| 「(.+)」 \|$/.exec(l); if (m) says[m[1]] = m[2]; });
check(Object.keys(says).length === 34 && Object.entries(says).every(([n, t]) => DS.Lore.of(n).say === t), '💬 한마디 34줄 = 8절 표 (#76)');
check(DS.Lore.label(0) === '로안 · 검사' && DS.Lore.label(24) === '케라운 · 마검사', '표시 = 「이름 · 직업」');
console.log(fail ? `❌ 용사 이야기 실패 ${fail}` : `✅ 용사 이야기: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
