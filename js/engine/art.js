// 에셋 배치표(DS.ASSETS)로 그림 칸을 HTML 로 그린다. 코드는 파일 이름을 직접 쓰지 않는다.
window.DS = window.DS || {};
DS.Art = (function () {
  const A = () => DS.ASSETS;
  const pos = (col, cols, row, rows) => `${cols > 1 ? (100 * col) / (cols - 1) : 0}% ${rows > 1 ? (100 * row) / (rows - 1) : 0}%`;
  function cell(sheet, col, row, cls = '') {
    const s = A()[sheet];
    return `<i class="art ${sheet} ${cls}" style="background-image:url('${A().base}${s.src}');background-size:${s.cols * 100}% ${s.rows * 100}%;background-position:${pos(col, s.cols, row, s.rows)}"></i>`;
  }
  // 용사 번호: 0~7 기본 시트(7 = 선생님) · 8~15 추가 용사(heroesExtra, 잠금 해제 특전)
  // v2 도트 용사 (번호 16~): 줄 = 동작, 프레임을 CSS steps 로 넘긴다. 숨쉬기는 그림에 들어 있어 'huff'(눌림)는 뺀다
  // 시트에 없는 동작은 대신 쓰기: 차원문 → 걷기 · 앉기 · 생각 → 대기 · 힐 받음 → 승리
  const V2_FALL = { pant: 'hit', portal: 'walk', sit: 'idle', think: 'idle', healed: 'win', heal: 'attack', win: 'attack', hit: 'idle', down: 'fall', walk: 'idle', fall: 'idle' };
  const isV2 = (n) => !!(A().heroesV2 && A().heroesV2.list[Number(n)]);
  function heroV2(n, pose, cls) {
    const v = A().heroesV2, h = v.list[n], rows = h.rows || v.rows;
    let a = pose === 'down' ? 'fall' : pose, guard = 0;
    while ((!v.anims[a] || v.anims[a][0] >= rows) && guard++ < 4) a = V2_FALL[a] || 'idle';
    const [row, nf, dur = 1, mode] = v.anims[a];
    const delay = mode === 'once' ? 0 : -((n * 0.37 + Math.random()) % 1) * dur; // 여럿이 있어도 같은 박자로 안 움직이게
    const run = nf > 1 ? (mode === 'once' ? `animation:hv2o${nf} ${dur}s steps(${nf}, jump-none) 1 forwards;` : `animation:hv2n${nf} ${dur}s steps(${nf}) ${delay.toFixed(2)}s infinite;`) : '';
    const W = 124, left = 50 - (h.cx || 0.4) * W; // 그림 칸(80×64)을 상자보다 넓게 두고, 머리 가운데가 상자 가운데에 오게
    return `<i class="art hero hv2 ${String(cls).replace(/\bhuff\b/g, '')}" data-anim="${a}"><b style="left:${left.toFixed(1)}%;width:${W}%;background-image:url('${A().base}${h.src}');background-size:${v.cols * 100}% ${rows * 100}%;background-position:0% ${rows > 1 ? (100 * row) / (rows - 1) : 0}%;${run}"></b></i>`;
  }
  const hero = (n, pose = 'idle', cls = '') => {
    if (isV2(n)) return heroV2(Number(n), pose, cls);
    n = Number(n) || 0;
    if (n >= 8 && n < 16 && A().heroesExtra) return cell('heroesExtra', A().heroesExtra.poses[pose] || 0, n - 8, `hero ${cls}`);
    return cell('heroes', A().heroes.poses[pose] || 0, ((n % A().heroes.count) + A().heroes.count) % A().heroes.count, `hero ${cls}`);
  };
  // n = 숫자(기본 시트) 또는 'extra:3' · 'new:5' · 'crown:7' (추가 시트)
  const SHEETS = { extra: 'monstersExtra', new: 'monstersNew', crown: 'monstersCrown' };
  // 몬스터 번호: 2 · 'extra:3' · 'crown:9' … 끝에 '@h150' 을 붙이면 색 변형 (hue-rotate 150°, v0.9.6 — 보강 · 돌려쓰기 보스용, 그림 0)
  function monster(n, pose = 'idle', cls = '') {
    let hue = 0;
    if (typeof n === 'string' && n.includes('@h')) { hue = Number(n.split('@h')[1]) || 0; n = n.split('@h')[0]; }
    const [k, i] = typeof n === 'string' && n.includes(':') ? n.split(':') : [null, n];
    const sheet = SHEETS[k] || 'monsters', s = A()[sheet];
    const row = Number(i) % s.rows;
    // 오른쪽을 보고 그려진 몬스터는 좌우를 뒤집어 왼쪽(용사 쪽)을 보게 한다 (배치표 flip)
    const html = cell(sheet, s.poses[pose] || 0, row, `monster${(s.flip || []).includes(row) ? ' flip' : ''}${hue ? ' hue' : ''} ${cls}`);
    return hue ? html.replace('style="', `style="--hue:${hue}deg;`) : html;
  }
  const card = (art, cls = '') => cell('cards', art % A().cards.cols, Math.floor(art / A().cards.cols) % A().cards.rows, `card-art ${cls}`);
  function css() { // 글꼴·프레임·배경을 배치표에서
    const a = A();
    return `@font-face{font-family:'Galmuri11';src:url('${a.fonts.pixel}') format('woff2');font-display:swap}
@font-face{font-family:'Galmuri11';font-weight:700;src:url('${a.fonts.pixelBold}') format('woff2');font-display:swap}
.framed{border:14px solid transparent;border-image:url('${a.base}${a.frame.src}') ${a.frame.slice} / 14px stretch}
.bg-dungeon{background-image:linear-gradient(#0a1424aa,#0a1424ee),url('${a.base}${a.background.src}');background-size:cover;background-position:center}
.bg-scene{background-image:linear-gradient(#0a142466,#0a142411 40%,#0a1424dd),url('${a.base}${(a.scene || a.background).src}');background-size:cover;background-position:center 65%}
${a.brand ? `.brand-head{background:url('${a.base}${a.brand.header}') center/contain no-repeat;aspect-ratio:3/1}
.splash{background-image:url('${a.base}${a.brand.title}')}
.menu-ic{background-image:url('${a.base}${a.brand.menu.src}');background-size:${a.brand.menu.cols * 100}% 100%}
${Object.entries(a.brand.menu.kinds).map(([k, i]) => `.menu-ic[data-ic="${k}"]{background-position:${(i / (a.brand.menu.cols - 1)) * 100}% 0}`).join('')}` : ''}
${(a.dungeons ? a.dungeons.ids : []).map((id) => `.bg-scene.th-${id}{background-image:linear-gradient(#0a142455,#0a142400 40%,#0a1424cc),url('${a.base}${a.dungeons.bg(id)}')}`).join('\n')}`;
  }
  function install() { const s = document.createElement('style'); s.textContent = css(); document.head.appendChild(s); }
  // ── 차시별 다운로드 (v0.9.6): 처음엔 공통 그림만 받고(sw.js STATIC), 던전 그림은 그 차시에 들어갈 때 받는다 ──
  // lessonFiles(L) = 그 차시 던전 배경 · 포털 · 몬스터 시트 파일 이름 · prefetch = 미리 받기(서비스 워커가 저장)
  // trim(Ls) = 폰 저장소(ds-assets)에서 Ls 차시들(지금 + 바로 전)에 쓰지 않는 던전 그림을 지운다 (공통 그림은 그대로)
  const sheetFile = (n) => { n = typeof n === 'string' ? n.split('@h')[0] : n; const [k] = typeof n === 'string' && n.includes(':') ? n.split(':') : [null]; return (A()[SHEETS[k] || 'monsters'] || {}).src; };
  function lessonFiles(L) {
    if (!L) return [];
    const a = A(), out = new Set();
    if (L.theme && a.dungeons) { out.add(a.dungeons.bg(L.theme)); out.add(a.dungeons.portal(L.theme)); }
    Object.values(L.monsters || {}).forEach((m) => { const f = sheetFile(m.sprite); if (f) out.add(f); });
    if (L.boss && L.boss.sprite != null) { const f = sheetFile(L.boss.sprite); if (f) out.add(f); }
    return [...out];
  }
  const prefetched = {};
  function prefetch(L) {
    lessonFiles(L).forEach((f) => { if (prefetched[f]) return; prefetched[f] = new Image(); prefetched[f].src = A().base + f; });
  }
  const LESSON_ART = /\/(dg-|portal-|monsters)[^/]*$/;
  async function trim(Ls) {
    if (typeof caches === 'undefined') return 0;
    try {
      const keep = new Set(Ls.filter(Boolean).flatMap(lessonFiles)), c = await caches.open('ds-assets');
      let n = 0;
      for (const req of await c.keys()) { const f = new URL(req.url).pathname.split('/').pop(); if (LESSON_ART.test('/' + f) && !keep.has(f)) { await c.delete(req); n++; } }
      return n;
    } catch (e) { return 0; }
  }
  // 학생 폰 · 종합상황실이 수업에 들어갈 때: 이 차시 그림 미리 받기 + 지금 · 바로 전 차시 말고는 지우기
  function lessonEnter(L) {
    if (!L) return;
    prefetch(L);
    const prev = L.no ? DS.Lessons.list.find((l) => l.no === L.no - 1) : null;
    setTimeout(() => trim([L, prev]), 5000);
  }
  return { cell, hero, isV2, monster, card, install, pos, lessonFiles, prefetch, trim, lessonEnter };
})();
