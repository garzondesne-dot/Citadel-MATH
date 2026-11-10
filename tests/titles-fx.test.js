// 🏅 #63 칭호 작은 기능 (2026-11-10 · DECISIONS 72ce314): 기호 · 단원 문양 범위 · 사건 → 그 칭호만 · 처음 본 상태는 안 쏨 — node tests/titles-fx.test.js
//   종합실 동시 5 상한 · 끄기 스위치 · 줄 서기는 브라우저 시험 tools/e2e/e2e95.js
const fs = require('fs'), path = require('path');
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-04.js', 'lessons/unit-set.js', 'js/raid/grow.js', 'js/raid/titles.js']);
const T = DS.Titles;
let ok = 0, fail = 0; const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };

// ① 평소 기호 (C안 표)
const ic = (title, extra = {}) => { const m = /<i class="tfx-ic[^"]*"[^>]*>([^<]*)<\/i>/.exec(T.icon({ title, ...extra }, 'u1')); return m ? m[1] : ''; };
const WANT = { dawn: '✦', first: '✦', slayer: '⚔', grit: '💪', smith: '⚒', collector: '⚒', magic: '⚒', rare: '⚒', sage: '⚒', gambler: '🎲', nunchi: '🙊', oxsurv: '⭕', quester: '✏', writer: '✍', hunter: '🎯', wall: '🛡', awake: '⚡' };
Object.entries(WANT).forEach(([id, sym]) => check(ic(id) === sym, `${id} 기호 「${ic(id)}」 = 「${sym}」`));
check(ic('steady', { stk: 7 }) === '🔁7' && ic('steady') === '🔁', `꾸준한 용사 = 🔁n (${ic('steady', { stk: 7 })})`);
check(ic('none') === '' && ic('lv3') === '' && ic('dg-set-04') === '', '레벨 · 던전 칭호 · 없음 = 기호 없음');
check(T.BASE.every((t) => T.ICON[t.id] || T.UNIT[t.id]), '모든 칭호(BASE)에 기호 또는 단원 문양');
check(/data-tu="u1"/.test(T.icon({ title: 'slayer' }, 'u1')), '기호에 uid (반짝일 이름표 찾기)');
// 단원 문양 = 그 단원 차시 레이드에서만
T.setNo(null); check(ic('king') === '' && ic('detective') === '' && ic('sovereign') === '', '캠프 · 성채(차시 아님) = 단원 문양 없음');
T.setNo(4); check(ic('king') === '∩' && ic('detective') === '' && ic('sovereign') === '∴', '4차시: 집합 ∩ · 군주 ∴ · 논리 없음');
T.setNo(8); check(ic('king') === '' && ic('detective') === '→' && ic('sovereign') === '∴', '8차시: 논리 → · 군주 ∴');
T.setNo(14); check(ic('sovereign') === '', '14차시(함수) = 군주 문양 없음');
// 이름표에 기호 (보통 · 위아래 칸 모두)
T.setNo(null);
check(/⚔<\/i>/.test(T.nameHtml({ title: 'slayer', nick: '민준', num: 1 }, { uid: 'u1' })) && /⚔<\/i><\/span><span class="tname/.test(T.nameHtml({ title: 'slayer', nick: '민준', num: 1 }, { stack: true, uid: 'u1' })), '이름표 · 종합실 위아래 칸에 기호');
check(!/tfx-ic/.test(T.nameHtml({ title: 'none', nick: '민준' })), '칭호 안 단 학생 = 기호 없음 (효과는 고른 칭호 하나만)');

// ② 사건 → 그 칭호를 단 사람만 (처음 본 상태는 안 쏨)
const L = DS.Lessons.get('set-04');
let st = { kind: 'monster', id: 'm1' }, won = false, stone = null;
DS.Raid = { stepOf: () => st, bossHp: () => ({ won }), stone: () => stone };
const hits = []; T.pulse = (u) => { hits.push(u); return 1; };
const R = { players: { a: { title: 'slayer' }, b: { title: 'king' }, c: { title: 'wall' }, d: { title: 'awake' }, e: { title: 'nunchi' }, f: { title: 'oxsurv' }, g: { title: 'gambler' }, t: { title: 'slayer', teacher: true } } };
T.setNo(4);
T.watch(R, L, 'h', 'X1'); check(hits.length === 0, '처음 본 상태 = 안 쏨');
won = true; st = { kind: 'boss', id: 'boss' }; T.watch(R, L, 'h', 'X1');
check(hits.join() === 'a,b', `보스전 시작 + 보스 격파 → 보스 토벌자(a) · 집합의 지배자(b) (교사 빼고) (${hits})`);
hits.length = 0; T.watch(R, L, 'h', 'X1'); check(hits.length === 0, '같은 상태 = 다시 안 쏨');
R.fun = { kind: 'td', g: 1, phase: 'pick' }; T.watch(R, L, 'h', 'X1'); check(hits.join() === 'c', `디펜스 시작 → 성벽의 수호자 (${hits})`);
hits.length = 0; R.fun = { kind: 'nun', g: 2, phase: 'go' }; T.watch(R, L, 'h', 'X1'); check(hits.sort().join() === 'e,g', `눈치 게임 → 눈치 백단 · 쉼터의 승부사 (${hits})`);
hits.length = 0; R.fun = { kind: 'ox', g: 3, phase: 'go' }; T.watch(R, L, 'h', 'X1'); check(hits.sort().join() === 'f,g', `OX → OX 서바이버 · 승부사 (${hits})`);
hits.length = 0; stone = { holy: true, until: 99, by: 'd' }; T.watch(R, L, 'h', 'X1'); check(hits.join() === 'd', `홀리 방패 → 각성한 자 (${hits})`);
T.setNo(8); hits.length = 0; const R2 = { players: { b: { title: 'king' }, x: { title: 'detective' } } }; st = { kind: 'monster', id: 'm1' }; won = false;
T.watch(R2, L, 'h', 'X2'); st = { kind: 'boss', id: 'boss' }; T.watch(R2, L, 'h', 'X2'); check(hits.join() === 'x', `8차시 보스전 = 논리의 탐정만 (집합의 지배자 ✕) (${hits})`);
// 폰: 내 칭호만 · 이름표가 없으면 작은 칩 (여기선 document 없음 = false 아님)
const mine = []; T.me = (title, kind) => { mine.push(`${title}:${kind}`); return true; };
st = { kind: 'monster', id: 'm1' }; won = false; const R3 = { players: { me1: { title: 'slayer' } } };
T.watch(R3, L, 'me1', 'X3'); won = true; T.watch(R3, L, 'me1', 'X3'); check(mine.join() === 'slayer:boss', `폰 = 내 칭호로 (${mine})`);
check(T.EVENT.grit.join() === 'grit' && T.EVENT.photo.join() === 'writer' && T.EVENT.fix.join() === 'hunter' && T.EVENT.quest.join() === 'quester' && T.EVENT.forge.length === 5, '사건 표: 끈기 · 서술 · 사냥꾼 · 출제 · 연성 5');

// ③ 종합실 가벼움 (코드 규칙)
const css = fs.readFileSync(path.join(__dirname, '..', 'css/style.css'), 'utf8'), seg = css.slice(css.indexOf('/* 🏅 #63'));
check(T.HALL_MAX === 5, '종합실 동시에 움직이는 이름표 최대 5');
{ const kf = [...seg.matchAll(/@keyframes (tfx-[\w-]+) \{((?:[^{}]*\{[^}]*\})*)[^}]*\}/g)]; const props = kf.flatMap((m) => [...m[2].matchAll(/([a-z-]+)\s*:/g)].map((x) => x[1]));
  check(kf.length >= 3 && props.every((p) => p === 'transform' || p === 'opacity'), `움직임 = transform/opacity 만 (${[...new Set(props)]})`); }
check(/#screen-hall \.tname\.t-o \{[^}]*box-shadow/.test(seg) && !/#screen-hall[^{]*::after/.test(seg), '종합실 주황 = 멈춘 금테 (반짝임은 폰만)');
check(/prefers-reduced-motion/.test(seg) && /\.tfx-off #screen-hall \.tfx-ic/.test(seg), 'reduced-motion · 끄기 스위치');
check(/id="h-tfx"/.test(fs.readFileSync(path.join(__dirname, '..', 'js/raid/hall.js'), 'utf8')), '종합실 ⚙ 「칭호 효과 끄기」');
check(!/canvas|requestAnimationFrame/.test(fs.readFileSync(path.join(__dirname, '..', 'js/raid/titles.js'), 'utf8')), '캔버스 · 입자 없음');
console.log(fail ? `❌ 칭호 효과 실패 ${fail}` : `✅ 칭호 효과: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
