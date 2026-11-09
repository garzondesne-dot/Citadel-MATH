// 에셋 배치표(DS.ASSETS)로 그림 칸을 HTML 로 그린다. 코드는 파일 이름을 직접 쓰지 않는다.
window.DS = window.DS || {};
DS.Art = (function () {
  const A = () => DS.ASSETS;
  const pos = (col, cols, row, rows) => `${cols > 1 ? (100 * col) / (cols - 1) : 0}% ${rows > 1 ? (100 * row) / (rows - 1) : 0}%`;
  function cell(sheet, col, row, cls = '') {
    const s = A()[sheet];
    return `<i class="art ${sheet} ${cls}" style="background-image:url('${A().base}${s.src}');background-size:${s.cols * 100}% ${s.rows * 100}%;background-position:${pos(col, s.cols, row, s.rows)}"></i>`;
  }
  // 용사 번호: 0~7 기본 시트(7 = 선생님 현자) · 8~15 추가 용사(heroesExtra, 잠금 해제 특전) · 17 = 선생님 수학자 — 배치표 heroesV2.list 에 있으면 v2 도트로 그린다
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
  // 선생님 모습 (2026-11-03): 수업 방의 선생님 용사 → 없으면 이 기기에서 고른 모습(교사 메뉴) → 기본 7 현자
  const TKEY = 'citadel-thero';
  function teacherHero(R) {
    const tl = R && R.state && R.state.tlook; if (tl && tl.hero != null && Number.isFinite(Number(tl.hero))) return Number(tl.hero); // 2026-11-06: 수업 중 바꾼 모습 (교사 폰 · 종합상황실 ⚙ → state/tlook · 종합상황실도 쓸 수 있는 칸)
    const t = R && R.meta && R.players && R.players[R.meta.teacher];
    if (t && t.hero != null) return Number(t.hero);
    try { const raw = localStorage.getItem(TKEY), v = Number(raw); if (raw !== null && raw !== '' && A().heroesV2 && A().heroesV2.list[v]) return v; } catch (e) { /* 무시 */ } // 2026-11-04: 교사는 모든 용사
    return A().heroes.teacher;
  }
  const teacherFx = (R) => ((R && R.state && R.state.tlook && R.state.tlook.fx) || (R && R.meta && R.players && (R.players[R.meta.teacher] || {}).fx) || 'twinkle');
  const setTeacherHero = (n) => { try { localStorage.setItem(TKEY, String(n)); } catch (e) { /* 무시 */ } };
  // 선생님 이펙트 · 호칭 (2026-11-04 · 교사 캠프 ⚙ 설정 · 모두 열림 · 이 기기에 저장)
  const TLOOK = 'citadel-tlook';
  const teacherLook = () => { let v = {}; try { v = JSON.parse(localStorage.getItem(TLOOK) || '{}') || {}; } catch (e) { /* 무시 */ } return { hero: teacherHero(), fx: v.fx || 'twinkle', title: v.title || 'none', socket: v.socket || {} }; };
  const setTeacherLook = (o) => { try { const v = JSON.parse(localStorage.getItem(TLOOK) || '{}') || {}; localStorage.setItem(TLOOK, JSON.stringify({ ...v, fx: o.fx || v.fx, title: o.title || v.title, socket: o.socket || v.socket || {} })); } catch (e) { /* 무시 */ } if (o.hero != null) setTeacherHero(o.hero); };
  // n = 숫자(기본 시트) 또는 'extra:3' · 'new:5' · 'crown:7' (추가 시트)
  const SHEETS = { extra: 'monstersExtra', new: 'monstersNew', crown: 'monstersCrown', rift: 'monstersRift', riftboss: 'monstersRiftBoss', mirror: 'monstersMirror', mirrorboss: 'monstersMirrorBoss', mirrorboss8: 'monstersMirrorBoss8', castle1: 'monstersCastle1', castle2: 'monstersCastle2', castleboss: 'monstersCastleBoss', castle3: 'monstersCastle3', castleboss2: 'monstersCastleBoss2' };
  // 몬스터 번호: 2 · 'extra:3' · 'crown:9' … 끝에 '@h150' 을 붙이면 색 변형 (hue-rotate 150°, v0.9.6 — 보강 · 돌려쓰기 보스용, 그림 0)
  function monster(n, pose = 'idle', cls = '') {
    let hue = 0;
    if (typeof n === 'string' && n.includes('@h')) { hue = Number(n.split('@h')[1]) || 0; n = n.split('@h')[0]; }
    const [k, i] = typeof n === 'string' && n.includes(':') ? n.split(':') : [null, n];
    const sheet = SHEETS[k] || 'monsters', s = A()[sheet];
    const row = Number(i) % s.rows;
    // 오른쪽을 보고 그려진 몬스터는 좌우를 뒤집어 왼쪽(용사 쪽)을 보게 한다 (배치표 flip)
    const html = cell(sheet, s.poses[pose] || 0, row, `monster${(s.flip || []).includes(row) ? ' flip' : ''}${hue ? ' hue' : ''} ${cls}`).replace('<i class=', `<i data-sh="${sheet}" data-row="${row}" class=`); // 🎯 data-sh · row = 보이는 몸통(배치표 bodies) 찾기
    return hue ? html.replace('style="', `style="--hue:${hue}deg;`) : html;
  }
  // 🌫 정찰 진형 (2026-11-09 #18 후속 · 방향 방 시안): 대장 = 뒤 가운데(붉은 기운 · 빨간 눈) + 졸개 3 이 앞(용사 쪽)에 뭉쳐 섬 · 모두 검은 실루엣
  //   box = 대장 그림(.art.monster)이 든 칸 · 눈 자리 = 배치표 bodies(보이는 몸통) 위쪽 28% · 등장하면 scoutDeco(box, false) 로 지움
  function scoutDeco(box, on = true, opt = {}) { // opt.n = 졸개 수(기본 3) · opt.down = 쓰러진 졸개 번호들 · opt.fight = 전투 중(색 · 눈 없음)
    if (!box) return; box.querySelectorAll('.sc-deco').forEach((e) => e.remove()); box.classList.toggle('sc-lead', !!on);
    const art = box.querySelector('.art.monster'); if (!on || !art) return;
    const w = art.offsetWidth, h = art.offsetHeight, x0 = art.offsetLeft, y0 = art.offsetTop; if (!w || !h) return;
    const b = ((A().bodies || {})[art.dataset.sh] || [])[Number(art.dataset.row)] || [0.15, 0.2, 0.85, 0.95], flip = art.classList.contains('flip');
    const bx = flip ? 1 - (b[0] + b[2]) / 2 : (b[0] + b[2]) / 2, ex = x0 + w * (bx - (b[2] - b[0]) * 0.12), ey = y0 + h * (b[1] + (b[3] - b[1]) * 0.28);
    if (!opt.fight) { const eyes = document.createElement('i'); eyes.className = 'sc-deco sc-eyes'; eyes.style.cssText = `left:${ex.toFixed(0)}px;top:${ey.toFixed(0)}px;--ew:${Math.max(4, Math.round(w * 0.035))}px`; box.appendChild(eyes); }
    const pack = document.createElement('div'); pack.className = 'sc-deco sc-pack'; pack.style.cssText = `left:${(x0 - w * 0.2).toFixed(0)}px;top:${(y0 + h * 0.6).toFixed(0)}px;width:${(w * 0.72).toFixed(0)}px;height:${(h * 0.4).toFixed(0)}px`;
    const row = art.dataset.row, sh = art.dataset.sh, key = Object.keys(SHEETS).find((k) => SHEETS[k] === sh), n = key ? `${key}:${row}` : Number(row);
    const cnt = Math.max(0, Math.min(5, opt.n == null ? 3 : opt.n)), down = opt.down || []; pack.dataset.n = cnt; if (opt.fight) pack.classList.add('sc-fight');
    pack.innerHTML = Array.from({ length: cnt }, (_, i) => `<span class="sc-min m${i}${down.includes(i) ? ' down' : ''}" data-k="${i}">${monster(n, 'idle', '')}</span>`).join(''); box.appendChild(pack);
  }
  const card = (art, cls = '') => cell('cards', art % A().cards.cols, Math.floor(art / A().cards.cols) % A().cards.rows, `card-art ${cls}`);
  function css() { // 글꼴·프레임·배경을 배치표에서
    const a = A();
    return `@font-face{font-family:'Galmuri11';src:url('${a.fonts.pixel}') format('woff2');font-display:swap}
@font-face{font-family:'Galmuri11';font-weight:700;src:url('${a.fonts.pixelBold}') format('woff2');font-display:swap}
${a.fonts.gothic ? `@font-face{font-family:'DS Gothic';src:url('${a.fonts.gothic}') format('woff2');font-display:swap}
@font-face{font-family:'DS Gothic';font-weight:700;src:url('${a.fonts.gothicBold}') format('woff2');font-display:swap}` : ''}
${a.ui && a.ui.panel ? '' : `.framed{border:14px solid transparent;border-image:url('${a.base}${a.frame.src}') ${a.frame.slice} / 14px stretch}`}
.bg-dungeon{background:#12100d}.bg-dungeon::before{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(#1a161200 55%,#1a161266),url('${a.base}${a.background.src}') center top/cover no-repeat}
.bg-scene{background-image:linear-gradient(#1a161266,#1a161211 40%,#1a1612dd),url('${a.base}${(a.scene || a.background).src}');background-size:cover;background-position:center 65%}
${a.brand ? `.brand-head{background:url('${a.base}${a.brand.header}') center/contain no-repeat;aspect-ratio:960/461}
${a.brand.splash ? '' : `.splash{background-image:url('${a.base}${a.brand.title}')}`}
.menu-ic{background-image:url('${a.base}${a.brand.menu.src}');background-size:${a.brand.menu.cols * 100}% 100%}
${Object.entries(a.brand.menu.kinds).map(([k, i]) => `.menu-ic[data-ic="${k}"]{background-position:${(i / (a.brand.menu.cols - 1)) * 100}% 0}`).join('')}` : ''}
${a.ui && a.ui.kit ? skin(a) : ''}
${a.ui && a.ui.paper ? `:root{--paper-tex:url('${new URL(a.base + a.ui.paper, document.baseURI).href}')}` : ''}
${(a.dungeons ? a.dungeons.ids : []).map((id) => `.bg-scene.th-${id}{background-image:linear-gradient(#1a161255,#1a161200 40%,#1a1612cc),url('${a.base}${a.dungeons.bg(id)}')}`).join('\n')}`;
  }
  // UI 키트 입히기 (2026-11-04): 창 · 버튼 · 탭 · 입력칸 · ✕ · 뒤로 · 아이콘 버튼. 다른 규칙의 border 묶음 지정이 border-image 를 지우므로 그림 · 두께는 !important
  function skin(a) {
    const k = a.ui.kit, p = a.ui.panel, u = (f) => `url('${a.base}${f}')`, n = k.slice;
    const img = (f, w) => `border-style:solid!important;border-color:transparent!important;border-width:${w}!important;border-image:${u(f)} ${n} fill / ${w} stretch!important;background:none!important;border-radius:0!important;image-rendering:pixelated`;
    return `.framed{border:${p.w}px solid transparent!important;border-image:${u(p.src)} ${p.slice} fill / ${p.w}px stretch!important;background:none!important;image-rendering:pixelated}
.btn{${img(k.btn, '9px')};color:#eef2ff;text-shadow:1px 1px 0 #000;padding:1px 6px;box-shadow:0 3px 8px #0007}
.btn.big{padding:5px}.btn.small{border-width:6px!important;border-image-width:6px!important;padding:0 4px}
.btn:active:not(:disabled){border-image-source:${u(k.press)}!important;transform:translateY(1px)}
.btn.primary,.btn.on,.btn.help.on{border-image-source:${u(k.gold)}!important;color:#3a2204!important;text-shadow:0 1px 0 #ffefb0!important;font-weight:700}
.btn.primary:active:not(:disabled),.btn.on:active{border-image-source:${u(k.goldPress)}!important}
.btn:disabled{border-image-source:${u(k.off)}!important;color:#9aa0ad!important;opacity:.75}
.btn.boss{color:#e3d2ff}
.role{${img(k.btn, '11px')};color:#eef2ff;padding:1px 0;min-height:92px;justify-content:center;box-shadow:0 3px 8px #0008}
.role.on{border-image-source:${u(k.gold)}!important;color:#3a2204!important}
.role b{white-space:nowrap;font-size:clamp(12px,3.7vw,16px);text-shadow:1px 1px 0 #000}.role.on b{text-shadow:0 1px 0 #ffefb0}
input:not([type=checkbox]):not([type=radio]):not([type=range]),select,textarea{${img(k.input, '7px')};padding:3px 4px;color:#eef2ff}
.tab{${img(k.tab, '8px 8px 0')};border-image-slice:${n} ${n} 0 fill!important;color:#b9c4e6!important;padding:2px 4px 6px}
.tabs .tab{padding:2px 8px 6px}.tab.on{border-image-source:${u(k.tabOn)}!important;color:#ffd35a!important}
.ic-bar .icb{${img(k.icbtn, '7px')};box-shadow:0 2px 6px #0007}.ic-bar .icb.on{border-image-source:${u(k.gold)}!important;box-shadow:0 0 10px #ffd35a88}
.ui-ic{display:inline-block;width:1.2em;height:1.2em;vertical-align:-.25em;margin:0 .08em;background:${u(a.ui.icons.src)} 0 0/${a.ui.icons.cols * 100}% ${a.ui.icons.rows * 100}% no-repeat;image-rendering:pixelated;flex:none}
.ui-x{border:7px solid transparent!important;border-image:${u(k.icbtn)} ${n} fill / 7px stretch!important;background:none!important;color:#ffd35a!important;text-shadow:1px 1px 0 #000;image-rendering:pixelated;border-radius:0!important;font-size:18px!important}
.nav-back,#bn-back,.ui-back{${img(k.btn, '7px')};color:#e9eefc!important;padding:0 8px!important}
${a.ui.home ? `.home-props{display:contents}.home-props img{position:fixed;z-index:1;pointer-events:none;image-rendering:pixelated;filter:drop-shadow(0 4px 4px #000a)}.home-props .wide{display:none}
@media (min-width:701px){.home-props .phone{display:none}.home-props .wide{display:block}}
#screen-home .wrap{position:relative;z-index:2}.home-emblem{display:block;width:110px;margin:22px auto 0;image-rendering:pixelated}` : ''}`;
  }
  // 이모지 → 도트 아이콘 (2026-11-04): 화면에 글이 그려질 때마다(MutationObserver) 표 ui.emoji 에 있는 이모지를 <i class="ui-ic"> 로 바꿈
  //   입력칸 · 고르기(option) · 그림판 · 공유 카드(canvas) 는 건드리지 않음 · 글자(textContent)는 이모지만 빠짐
  const SKIP = /^(INPUT|TEXTAREA|SELECT|OPTION|SCRIPT|STYLE|CANVAS|SVG|TITLE|CODE|PRE)$/;
  let EMO = null;
  function emoRe() {
    if (EMO !== null) return EMO;
    const m = ((A().ui || {}).emoji) || {}, keys = Object.keys(m).sort((x, y) => y.length - x.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return (EMO = keys.length ? new RegExp(`(?<!\u200D)(${keys.join('|')})\uFE0F?(?!\u200D)`, 'gu') : false);
  }
  const icHtml = (name) => { const ic = A().ui.icons, i = ic.names.indexOf(name); return i < 0 ? '' : `<i class="ui-ic" data-ic="${name}" aria-hidden="true" style="background-position:${((i % ic.cols) / (ic.cols - 1)) * 100}% ${(Math.floor(i / ic.cols) / (ic.rows - 1)) * 100}%"></i>`; };
  function emojify(root) {
    const re = emoRe(); if (!re || !root) return;
    const map = A().ui.emoji, list = [];
    const w = document.createTreeWalker(root.nodeType === 3 ? root.parentNode : root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => { for (let p = n.parentNode; p && p !== document.body; p = p.parentNode) { if (SKIP.test(p.nodeName.toUpperCase()) || (p.classList && p.classList.contains('no-ic')) || p.isContentEditable) return NodeFilter.FILTER_REJECT; } re.lastIndex = 0; return re.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; } });
    for (let n = w.nextNode(); n; n = w.nextNode()) list.push(n);
    list.forEach((n) => { const span = document.createElement('span'); span.className = 'ui-ics'; re.lastIndex = 0; const esc = n.nodeValue.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]); span.innerHTML = esc.replace(re, (m, k) => icHtml(map[k]) || m); n.replaceWith(...span.childNodes); });
  }
  function watchEmoji() {
    if (!emoRe() || typeof MutationObserver === 'undefined') return;
    emojify(document.body);
    let q = new Set(), t = 0;
    const flush = () => { t = 0; const s = q; q = new Set(); s.forEach((n) => n && n.isConnected && emojify(n)); };
    new MutationObserver((ms) => { ms.forEach((m) => { if (m.type === 'characterData') { if (m.target.parentNode) q.add(m.target.parentNode); } else m.addedNodes.forEach((n) => { const t = n.nodeType === 3 ? n.parentNode : n; if (t && !(n.classList && n.classList.contains('ui-ic'))) q.add(t); }); }); if (!t) t = requestAnimationFrame(flush); }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  // 첫 화면 소품 · 엠블럼 (배치표 ui.home) — 첫 화면이 보일 때만 보임 (#screen-home 안에 넣음)
  function homeProps() {
    const a = A(), h = a.ui && a.ui.home, sc = document.getElementById('screen-home');
    if (!h || !sc || sc.querySelector('.home-props')) return;
    const box = document.createElement('div'); box.className = 'home-props'; box.setAttribute('aria-hidden', 'true');
    // 폰 = 390px 기준으로 줄어듦 (min(원래 px, vw 비율)) · PC = 그대로
    const fit = (v, wide) => (wide ? `${v}px` : `min(${v}px, ${(v / 3.9).toFixed(2)}vw)`);
    const put = (list, cls) => list.forEach(([f, at, w]) => { const im = document.createElement('img'); im.className = cls; im.alt = ''; im.src = a.base + f; im.style.cssText = at.replace(/(bottom|top):(\d+)px/g, (m, k, v) => `${k}:${fit(+v, cls === 'wide')}`) + `;width:${fit(w, cls === 'wide')}`; box.appendChild(im); });
    put(h.phone, 'phone'); put(h.wide, 'wide');
    sc.appendChild(box);
    const wrap = sc.querySelector('.wrap'), em = document.createElement('img');
    em.className = 'home-emblem'; em.alt = ''; em.src = a.base + h.emblem; wrap.appendChild(em);
  }
  function install() { const s = document.createElement('style'); s.textContent = css(); document.head.appendChild(s); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { homeProps(); watchEmoji(); }); else { homeProps(); watchEmoji(); } }
  // ── 차시별 다운로드 (v0.9.6): 처음엔 공통 그림만 받고(sw.js STATIC), 던전 그림은 그 차시에 들어갈 때 받는다 ──
  // lessonFiles(L) = 그 차시 던전 배경 · 포털 · 몬스터 시트 파일 이름 · prefetch = 미리 받기(서비스 워커가 저장)
  // trim(Ls) = 폰 저장소(ds-assets)에서 Ls 차시들(지금 + 바로 전)에 쓰지 않는 던전 그림을 지운다 (공통 그림은 그대로)
  const sheetFile = (n) => { n = typeof n === 'string' ? n.split('@h')[0] : n; const [k] = typeof n === 'string' && n.includes(':') ? n.split(':') : [null]; return (A()[SHEETS[k] || 'monsters'] || {}).src; };
  function lessonFiles(L) {
    if (!L) return [];
    const a = A(), out = new Set();
    if (L.theme && a.dungeons) { out.add(a.dungeons.bg(L.theme)); } // 2026-11-08 요청 #8: 테마 포털은 화면에 안 나와 미리 받지 않음
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
  return { emojify, cell, hero, isV2, monster, scoutDeco, card, install, pos, lessonFiles, prefetch, trim, lessonEnter, teacherHero, teacherFx, setTeacherHero, teacherLook, setTeacherLook };
})();
