// 모닥불 (학생 개인 대기실 · 혼자만의 공간): 로그인하면 여기로 온다. 가로로 넘겨 보는 숲 야영지.
// 왼쪽 ⚒ 모루 → 연성창 (수업 코드 없이 언제나) · 가운데 🔥 모닥불 + 내 용사(씩씩) · 오른쪽 🌀 차원문
// 차원문: 선생님이 우리 반 수업을 열면 그 차시 던전 테마의 포털이 실시간으로 나타난다(live/{반}) → 누르면 코드 없이 입장.
//         수업이 끝나면 마지막 포털이 꺼진(봉쇄) 채로 남는다. ⚙ 설정: 용사 · 공격 이펙트 바꾸기 (잠긴 것은 조건 표시)
window.DS = window.DS || {};

DS.Camp = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const C = () => DS.ASSETS.camp, base = () => DS.ASSETS.base;
  let me = null, fireT = 0, code0 = '', live = null, liveStop = null, liveSeen = '';
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const today = () => new Date().toISOString().slice(0, 10);
  const stampToday = () => { try { return localStorage.getItem('citadel-stamp') === today(); } catch (e) { return false; } };

  async function enter(m, code) {
    me = m; code0 = code || '';
    DS.UI.show('screen-camp');
    if (!m.test) DS.Scene.save({ role: 'camp' });
    render();
    if (liveStop) liveStop();
    liveStop = DS.Net.watch(`live/${ck(m.c)}`, (v) => {
      const was = live; live = v && v.open && !DS.Raid.liveOpen(v, Date.now()) ? Object.assign({}, v, { open: false }) : v;
      if (!document.getElementById('screen-camp').classList.contains('active')) return;
      drawGate();
      if (live && live.open && (!was || !was.open || was.code !== live.code) && liveSeen !== live.code) { liveSeen = live.code; showGate(); forgeInfo(); DS.Sound.correct(); DS.UI.toast(`🌀 ${live.no ? `${live.no}차시 ` : ''}던전이 열렸어요! 차원문을 눌러 들어가요`, 4200); }
    });
    if (code0) setTimeout(codeGate, 300); // QR 로 들어왔으면 코드 창을 바로
  }
  const D = () => DS.ASSETS.dungeons;
  // 한 화면에 전체가 보이므로 차원문이 열리면 반짝 강조만
  function showGate() { const g = document.getElementById('camp-gate'); if (g) { g.classList.remove('flash'); void g.offsetWidth; g.classList.add('flash'); } }
  function drawGate() {
    const el = document.getElementById('camp-gate'); if (!el) return;
    if (!live || !live.theme) { el.className = 'camp-gate empty'; el.innerHTML = '<span class="camp-label dim">🌀 차원문 자리 — 선생님이 수업을 열면 나타나요</span>'; return; }
    const i = D().ids.indexOf(live.theme), name = i >= 0 ? D().names[i] : '던전';
    el.className = `camp-gate ${live.open ? 'open appear' : 'closed'}`;
    el.innerHTML = `<i class="camp-portal" style="background-image:url('${base()}${D().portal(live.theme)}');background-position:${live.open ? '0%' : '100%'} 0"></i>
      <span class="camp-label">${live.open ? `🌀 ${live.no ? `${live.no}차시 ` : ''}${esc(name)} · 입장!` : `🔒 지난 던전 · ${esc(name)}`}</span>`;
  }
  // 그림 칸 하나 (배치표 시트에서 열·행)
  const sheet = (s, col, row, cls, style = '') => `<i class="${cls}" style="background-image:url('${base()}${s.src}');background-size:${s.cols * 100}% ${(s.rows || 1) * 100}%;background-position:${s.cols > 1 ? (col / (s.cols - 1)) * 100 : 0}% ${(s.rows || 1) > 1 ? (row / (s.rows - 1)) * 100 : 0}%;${style}"></i>`;
  function tree(i, cls, style) {
    const t = C().trees, x0 = t.cuts[i] / t.base, x1 = t.cuts[i + 1] / t.base, w = x1 - x0;
    return `<i class="camp-tree ${cls}" style="background-image:url('${base()}${t.src}');background-size:${100 / w}% 100%;background-position:${(x0 / (1 - w)) * 100}% 0;aspect-ratio:${(w * 1038) / 378};${style}"></i>`;
  }
  function render() {
    const c = C();
    $('#camp').innerHTML = `<div class="camp-top"><b>🔥 ${esc(me.name)}의 모닥불</b><span class="muted small">${DS.Titles && (me.title || 'none') !== 'none' ? `${DS.Titles.nameHtml({ title: me.title || 'none', nick: '' }, { num: false, size: 16 })} · ` : ''}${esc(me.c)} · ${me.n}번${DS.Grow ? ` · <b class="gold" id="camp-lv">Lv.-</b>` : ''}</span><button class="btn small camp-set" id="camp-set">⚙ 설정</button></div>
      ${stampToday() ? '<div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div>' : ''}
      <div class="camp-stage" style="background-image:url('${base()}${c.bg}')">
        <button class="camp-anvil" id="camp-anvil" aria-label="모루">${sheet(c.anvil, c.anvil.states.idle, 0, 'camp-anvil-img')}<span class="camp-label">⚒ 모루</span></button>
        <div class="camp-fire"><i class="camp-glow"></i><i class="camp-glow g2"></i>${sheet(c.fire, 0, 0, 'camp-fire-img', '')}</div>
        <div class="camp-hero">${DS.Art.hero(me.hero, 'sit', 'huff')}<i class="shadow"></i></div>
        <button class="camp-bonus" id="camp-bonus" aria-label="보강던전"><i class="camp-bonus-img" style="background-image:url('${base()}${DS.ASSETS.dportals.bonus}')"></i><span class="camp-label">📘 보강던전</span></button>
        <button class="camp-gate empty" id="camp-gate" aria-label="차원문"></button>
        ${prop('dummy', '🎯', '허수아비', '')}${prop('shelf', '📚', '책장', '')}${prop('mail', '📮', '우편함', '')}

      </div>
      <div class="camp-bar"><span class="muted small">🎯 허수아비 · 📚 책장 · 📮 우편함을 눌러 보세요</span><button class="btn small" id="camp-code">코드로 입장</button></div>
      <div class="camp-forge panel framed" id="camp-forge"><p class="muted small">연성 정보를 불러오는 중…</p></div>`;
    forgeInfo();
    $('#camp-anvil').onclick = () => pick('#camp-anvil', () => DS.Forge.open(me));
    $('#camp-bonus').onclick = () => pick('#camp-bonus', () => DS.Control.run(() => DS.Bonus.enter(me)));
    $('#camp-gate').onclick = () => {
      if (live && live.open) return pick('#camp-gate', () => DS.Control.run(() => enterCode(live.code)), 'portal');
      nope('#camp-gate');
      if (live) DS.UI.toast('지난 던전은 닫혔어요. 선생님이 다음 수업을 열면 새 차원문이 나타나요.', 3200);
      else DS.UI.toast('아직 열린 던전이 없어요. 선생님이 수업을 열면 차원문이 나타나요.', 3200);
    };
    if (DS.Grow) DS.Grow.mine(me).then((g) => { const el = document.getElementById('camp-lv'); if (el && g) el.textContent = `Lv.${g.lv} ${g.title}`; }).catch(() => {});
    newTitles();
    $('#camp-code').onclick = codeGate;
    $('#camp-mail').onclick = () => pick('#camp-mail', () => DS.Control.run(note));
    $('#camp-shelf').onclick = () => pick('#camp-shelf', () => DS.Control.run(shelf));
    $('#camp-dummy').onclick = () => pick('#camp-dummy', () => DS.Control.run(() => DS.Bonus.enter(me, { train: true })));
    $('#camp-set').onclick = settings;
    drawGate();
    animateFire();
    const stg = document.querySelector('#camp .camp-stage'); if (stg) { stg.classList.add('labels'); setTimeout(() => stg.classList.remove('labels'), 3000); } // 이름표: 들어올 때 3초 · 누를 때
  }
  // 선택 연출 (한 번 탭 · 0.7초): 흰 테두리 번쩍 + 눌림 반동 + 소리·진동 → 금빛 외곽선 + ▼ → 내 용사가 그쪽으로 폴짝 → 열림
  let picking = false;
  // pose: 그쪽으로 가는 동안의 용사 동작 (기본 걷기 · 차원문 = 뒷모습으로 들어가기 → 작아지며 사라짐)
  const heroArt = (pose, cls = '') => { const a = document.querySelector('.camp-hero .art'); if (a) a.outerHTML = DS.Art.hero(me.hero, pose, cls); };
  function pick(sel, then, pose = 'walk') {
    const el = document.querySelector(sel); if (!el || picking) return;
    picking = true;
    el.classList.remove('picked'); void el.offsetWidth; el.classList.add('picked');
    DS.Sound.clank(); if (navigator.vibrate) navigator.vibrate(25);
    const hero = document.querySelector('.camp-hero');
    if (hero) {
      const a = el.getBoundingClientRect(), b = hero.getBoundingClientRect();
      const dx = (a.left + a.width / 2) - (b.left + b.width / 2);
      heroArt(pose);
      if (pose === 'portal') {
        // 차원문: 용사 몸 가운데가 포털 그림 정중앙에 닿을 때까지 걸어가며 작아지고 사라짐
        const pe = el.querySelector('.camp-portal') || el, p = pe.getBoundingClientRect(), h = hero.querySelector('.art').getBoundingClientRect();
        hero.style.setProperty('--px', `${p.left + p.width / 2 - (h.left + h.width / 2)}px`);
        hero.style.setProperty('--py', `${p.top + p.height / 2 - (h.top + h.height / 2)}px`);
        hero.classList.remove('face-left'); hero.classList.add('to-portal');
      } else {
        hero.style.setProperty('--dx', `${Math.max(-1, Math.min(1, dx / Math.abs(dx || 1))) * Math.min(Math.abs(dx) * 0.55, 160)}px`);
        hero.classList.remove('dash'); void hero.offsetWidth; hero.classList.add('dash');
        hero.classList.toggle('face-left', dx < 0);
      }
    }
    const wait = pose === 'portal' ? 1150 : 700; // 차원문: 정중앙까지 걸어 들어가 사라지는 걸 다 보고
    setTimeout(() => { picking = false; then(); }, wait);
    setTimeout(() => { el.classList.remove('picked'); if (hero) { hero.classList.remove('dash', 'to-portal'); heroArt('sit', 'huff'); } }, 1300 + wait - 700);
  }
  // 못 들어가는 곳: 회색으로 살짝 흔들림
  function nope(sel) { const el = document.querySelector(sel); if (!el) return; el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); DS.Sound.squish(); }
  // 하단: 연성 정보 (열린 차시 · 도감 진행 · 최근 카드 · 다음 힌트 · 숨겨진 용사까지)
  async function forgeInfo() {
    const el = document.getElementById('camp-forge'); if (!el || !DS.Unit) return;
    const no = Number(await DS.Net.get(`unlock/${ck(me.c)}`).catch(() => 0)) || 0;
    const owned = (await DS.Net.get(`cards/${ck(me.c)}/${me.n}`).catch(() => null)) || {};
    const open = DS.Unit.opens(no), have = open.filter((c) => owned[c.id]);
    const need3 = DS.Unit.CARDS.filter((c) => c.no <= 3), got3 = need3.filter((c) => owned[c.id]).length;
    const next = open.find((c) => !owned[c.id]);
    const pct = open.length ? Math.round((100 * have.length) / open.length) : 0;
    if (!document.getElementById('camp-forge')) return;
    el.innerHTML = !no ? `<p class="cf-h">⚒ 연성 도감</p><p class="muted small">선생님이 우리 반 수업(2차시부터)을 열면 레시피가 열려요.</p>`
      : `<div class="cf-row"><p class="cf-h">⚒ 연성 도감 <span class="muted small">${no}차시까지 열림</span></p><button class="btn small primary" id="cf-open">모루 열기</button></div>
      <div class="cf-bar"><i style="width:${pct}%"></i><span>${have.length} / ${open.length}장</span></div>
      <div class="cf-cards">${have.slice(-4).reverse().map((c) => DS.Card.html(c, { w: 62 })).join('') || '<span class="muted small">아직 만든 카드가 없어요 — 모루에서 첫 카드를 만들어 봐요!</span>'}</div>
      ${next ? `<p class="cf-hint">💡 다음 레시피 힌트: <b>${esc(next.hint)}</b></p>` : '<p class="cf-hint okc">🎉 열린 레시피를 모두 모았어요!</p>'}
      <p class="muted small">✨ 숨겨진 용사: 1~3차시 도감 <b>${got3} / ${need3.length}</b>장 모으면 열려요</p>`;
    const b = document.getElementById('cf-open'); if (b) b.onclick = () => DS.Forge.open(me);
    el.querySelectorAll('.mcard').forEach((c) => (c.onclick = () => DS.Forge.open(me)));
  }
  function animateFire() {
    clearInterval(fireT);
    const f = C().fire; let i = 0;
    fireT = setInterval(() => {
      const el = document.querySelector('.camp-fire-img');
      if (!el || !document.getElementById('screen-camp').classList.contains('active')) { clearInterval(fireT); return; }
      i = (i + 1) % f.frames;
      const col = i % f.cols, row = Math.floor(i / f.cols);
      el.style.backgroundPosition = `${(col / (f.cols - 1)) * 100}% ${(row / (f.rows - 1)) * 100}%`;
    }, f.ms);
  }
  async function enterCode(code) {
    if (me.test && DS.Test.active()) return DS.Test.join(code); // 🧪 테스트 모닥불
    try { localStorage.setItem('citadel-student', JSON.stringify({ code })); } catch (e) { /* 무시 */ }
    await DS.Student.enter(code, { num: me.n, nick: me.name, hero: me.hero, fx: me.fx || 'flame', cls: me.c, title: me.title || 'none' });
  }
  // 캠프 기본 오브젝트 (v0.9.6 · 특전 아님): 그림(DS.ASSETS.camp.props)이 오기 전에는 이모지 팻말
  function prop(id, icon, label, pos) {
    const p = ((C().props || {})[id]) || '', src = typeof p === 'string' ? p : p.src, two = typeof p === 'object' && p.cols === 2; // 2칸 = 평소 | 눌림
    return `<button class="camp-prop" id="camp-${id}" style="${pos}" aria-label="${label}">${src ? `<i class="camp-prop-img${two ? ' two' : ''}" style="background-image:url('${base()}${src}')"></i>` : `<i class="camp-prop-ic">${icon}</i>`}<span class="camp-label">${icon} ${label}</span></button>`;
  }
  // 📚 책장: 열린 차시의 개념별 🎬 설명 영상 · 📄 학습지 개념 (기말 대비 다시 보기)
  async function shelf() {
    const no = me.test ? 99 : Number(await DS.Net.get(`unlock/${ck(me.c)}`).catch(() => 0)) || 0;
    const open = DS.Lessons.list.filter((l) => l.no && l.no <= no).sort((a, b) => b.no - a.no);
    const preps = {};
    for (const l of open) preps[l.id] = (await DS.Act.prepLite(l.id).catch(() => null)) || {};
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    const rows = (l) => l.steps.filter((st) => st.kind === 'concept').map((st) => {
      const p = preps[l.id], vid = DS.Video.pick(l, p.video, st.id), img = DS.Act.hasImg(p, st.id);
      return `<div class="sh-row"><span>${esc(st.title)}</span><span class="row">${vid && DS.Video.ok(vid) ? `<button class="btn small" data-v="${l.id}|${st.id}">🎬 영상</button>` : ''}${img ? `<button class="btn small" data-i="${l.id}|${st.id}">📄 개념</button>` : ''}</span></div>`;
    }).join('');
    el.innerHTML = `<div class="quiz-box framed rs-box"><div class="quiz-head"><b>📚 책장 — 개념 다시 보기</b><button class="btn small" id="sh-x">✕ 닫기</button></div>
      ${open.length ? open.map((l) => `<details class="sh-l"${l === open[0] ? ' open' : ''}><summary><b>${l.no}차시 · ${esc(l.title)}</b></summary>${rows(l)}</details>`).join('') : '<p class="muted">선생님이 우리 반 수업을 열면 그 차시 개념이 꽂혀요.</p>'}</div>`;
    document.body.appendChild(el);
    el.querySelector('#sh-x').onclick = () => el.remove();
    const titleOf = (lid, sid) => (DS.Lessons.get(lid).steps.find((x) => x.id === sid) || {}).title || '';
    el.querySelectorAll('[data-v]').forEach((b) => (b.onclick = () => { const [lid, sid] = b.dataset.v.split('|'); DS.Video.open(DS.Video.pick(DS.Lessons.get(lid), preps[lid].video, sid), titleOf(lid, sid), { lesson: lid, slot: sid }); }));
    el.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const [lid, sid] = b.dataset.i.split('|'), src = await DS.Act.prepImg(lid, sid);
      if (!src) { DS.UI.toast('아직 이 개념의 학습지 이미지가 없어요.'); return; }
      const v = document.createElement('div'); v.className = 'modal sheet-modal'; v.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>📄 ${esc(titleOf(lid, sid))}</b><button class="btn small" data-x>✕ 닫기</button></div><img class="bn-sheet" src="${src}" alt="학습지"></div>`;
      v.querySelector('[data-x]').onclick = () => v.remove(); document.body.appendChild(v);
    })));
  }
  // 📜 복습 노트: 차시별 결과 · 개념별 첫 시도 · 복습 추천 (records/{반}/{번호})
  async function note() {
    const rec = (await DS.Net.get(`records/${ck(me.c)}/${me.n}`).catch(() => null)) || {};
    const g = DS.Grow ? await DS.Grow.mine(me).catch(() => null) : null;
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed rs-box"><h2>📮 우편함 · 복습 노트</h2>${g ? `<div class="rs-lv"><b>Lv.${g.lv} ${esc(g.title)}</b> <span class="muted small">EXP ${g.total}</span><div class="rs-bar"><i style="width:${Math.round((100 * g.into) / g.next)}%"></i><span>${g.into} / ${g.next}</span></div></div>` : ''}
      <p class="muted small">성적이 아니라 다음에 볼 것을 모아 둔 노트예요. 📌 복습 추천 개념은 📘 보강던전에서 연습할 수 있어요.</p>${DS.Result.history(rec)}
      <div class="row"><button class="btn" id="nt-x">닫기</button><button class="btn primary" id="nt-bonus">📘 보강던전으로</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#nt-x').onclick = () => el.remove();
    el.querySelector('#nt-bonus').onclick = () => { el.remove(); pick('#camp-bonus', () => DS.Control.run(() => DS.Bonus.enter(me))); };
  }
  // 코드로 입장 (QR · 만약을 위해)
  function codeGate() {
    let last = ''; try { last = (JSON.parse(localStorage.getItem('citadel-student')) || {}).code || ''; } catch (e) { /* 무시 */ }
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed"><h2>🌀 차원문</h2><p>선생님이 알려 준 <b>수업 코드 6자리</b>를 넣으면 던전 대기실로 넘어가요.</p>
      <input id="g-code" inputmode="numeric" maxlength="6" placeholder="6자리" autocomplete="off" value="${esc(code0 || last)}">
      <div class="row"><button class="btn" id="g-x">닫기</button><button class="btn primary" id="g-go">⚔ 던전으로</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#g-x').onclick = () => el.remove();
    el.querySelector('#g-go').onclick = () => DS.Control.run(async () => {
      const code = el.querySelector('#g-code').value.trim();
      if (!/^\d{6}$/.test(code)) throw Object.assign(new Error('수업 코드 6자리를 넣어 주세요.'), { user: true });
      await enterCode(code);
      el.remove(); code0 = '';
    });
  }
  // v0.9.2: 호칭은 자동으로 달지 않는다 → 새로 얻은 호칭만 알려 주고 ⚙ 설정에서 스스로 고르게 (레벨 칭호는 알리지 않음)
  async function newTitles() {
    if (!DS.Titles || me.test) return;
    const k = `citadel-ttl-seen-${me.c}-${me.n}`;
    let seen = null; try { seen = JSON.parse(localStorage.getItem(k)); } catch (e) { /* 무시 */ }
    const got = DS.Titles.earned(await DS.Titles.data(me).catch(() => ({}))).filter((t) => !/^lv\d/.test(t.id));
    const fresh = got.filter((t) => !(seen || []).includes(t.id));
    try { localStorage.setItem(k, JSON.stringify(got.map((t) => t.id))); } catch (e) { /* 무시 */ }
    if (fresh.length) DS.UI.toast(`🏅 새 호칭 ${fresh.slice(0, 2).map((t) => `[${t.name}]`).join(' ')}${fresh.length > 2 ? ` 외 ${fresh.length - 2}개` : ''} 획득! ⚙ 설정에서 이름 앞에 달 수 있어요`, 4200);
  }
  // ⚙ 설정: 용사 · 공격 이펙트 (잠긴 것은 🔒 + 조건)
  async function settings() {
    const L = await DS.Account.looks(me);
    let hero = me.hero, fx = me.fx || 'flame', title = me.title || 'none';
    const TD = DS.Titles ? await DS.Titles.data(me).catch(() => ({})) : {}, got = DS.Titles ? DS.Titles.earned(TD).map((t) => t.id) : [];
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    const draw = () => {
      el.innerHTML = `<div class="quiz-box framed set-box"><div class="set-head"><h2>⚙ 설정</h2><button class="btn" id="set-x">닫기</button><button class="btn primary" id="set-ok">저장</button></div>
        <p class="shelf-title">내 용사</p><div class="heroes set-grid">${L.heroes.map((h) => `<button class="hpick${h.id === hero ? ' on' : ''}${h.open ? '' : ' lock'}" data-h="${h.id}" title="${esc(h.cond || '')}">${DS.Art.hero(h.id, h.id === hero ? 'attack' : 'idle')}${h.open ? '' : '<b class="lk">🔒</b>'}</button>`).join('')}</div>
        <p class="muted small">✨ 추가 용사: ① 1~3차시 도감 <b>${L.got} / ${L.need}</b>장 · ② 🎁 첫 레이드 클리어 · 나머지는 추후 공개</p>
        <p class="shelf-title">🏅 호칭 <span class="muted small">얻은 ${got.length}개 · 고른 호칭이 이름 앞에 붙어요</span></p>
        <div class="ttl-grid">${[{ id: 'none', name: '달지 않기', tier: 'w', cond: '' }, ...DS.Titles.all()].map((t) => { const has = t.id === 'none' || got.includes(t.id); return `<button class="ttl-pick ${DS.Titles.TIER[t.tier].cls}${t.id === title ? ' on' : ''}${has ? '' : ' lock'}" data-ttl="${t.id}" title="${esc(t.cond || '')}">${has ? DS.Titles.medal(t, 22) : '🔒'}<span>${esc(t.name)}</span>${has ? '' : `<small>${esc(t.cond)}</small>`}</button>`; }).join('')}</div>
        <p class="shelf-title">공격 이펙트 <span class="muted small">화려한 이펙트 = 📘 보강 인장 ${L.seals || 0}개 모음</span></p><div class="fxs">${L.fx.map((f) => `<button class="fxpick${f.id === fx ? ' on' : ''}${f.open ? '' : ' lock'}" data-fx="${f.id}"><canvas width="150" height="90" data-still="${f.id}"></canvas><span>${f.open ? DS.FX.NAMES[f.id] : `🔒 ${esc(f.cond || '추후 공개')}`}</span></button>`).join('')}</div>
      </div>`; // v0.9.3: 닫기 · 저장은 맨 위 (사용자 요청)
      el.querySelectorAll('canvas[data-still]').forEach((c) => DS.FX.still(c, c.dataset.still));
      el.querySelectorAll('[data-h]').forEach((b) => (b.onclick = () => { const h = L.heroes.find((x) => x.id === Number(b.dataset.h)); if (!h.open) { DS.UI.toast(`🔒 ${h.cond}`); return; } hero = h.id; DS.Sound.clank(); draw(); }));
      el.querySelectorAll('[data-fx]').forEach((b) => (b.onclick = () => { const f = L.fx.find((x) => x.id === b.dataset.fx); if (!f.open) { DS.UI.toast(`🔒 ${f.cond || '해금 조건은 추후 공개'} — 보강던전에서 인장을 모아요`, 3200); return; } fx = f.id; draw(); DS.FX.play(el.querySelector(`[data-fx="${fx}"]`), fx, { scale: 0.45 }); DS.Sound.hit(); }));
      el.querySelectorAll('[data-ttl]').forEach((b) => (b.onclick = () => { if (b.classList.contains('lock')) { DS.UI.toast(`🔒 ${b.title}`, 2600); return; } title = b.dataset.ttl; DS.Sound.clank(); draw(); }));
      el.querySelector('#set-x').onclick = () => el.remove();
      el.querySelector('#set-ok').onclick = () => DS.Control.run(async () => { if (me.test) DS.Test.setLook(hero, fx); else { await DS.Account.setLook(hero, fx); if (title !== (me.title || 'none')) await DS.Account.setTitle(title); } me.title = title; me.hero = hero; me.fx = fx; el.remove(); DS.UI.toast('저장했어요! 다음 입장부터 적용돼요.'); render(); });
    };
    draw(); document.body.appendChild(el);
  }
  const back = () => (me ? enter(me) : null);
  return { enter, back, settings, refresh: () => { if (document.getElementById('camp-forge')) forgeInfo(); }, stampToday, markStamp: () => { try { localStorage.setItem('citadel-stamp', today()); } catch (e) { /* 무시 */ } } };
})();
