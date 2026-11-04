// ⚖ 밸런스 게임 (v0.9.7.7 · 쉼터 놀이 · 사용자 확정 2026-11-04): 둘 중 하나 고르기 → 시간이 끝나면 우르르 → 적은 쪽 탈락 → 2명 이하 남으면 우승
//   방 rooms/{코드}/fun = 진행 상태(교사 · 종합상황실만 씀) · rooms/{코드}/fv/{판}/{uid} = 'a' | 'b' (학생 자기 것만 · 고르는 시간에만)
//   규칙: 비기면 · 모두 같은 쪽이면 탈락 없음 · 안 고르면 탈락 · 모두 탈락하게 되면 그 판은 없던 일 · 탈락자 = 관객석(골라도 결과엔 영향 없음)
//   시간: 1 · 2판 15초 · 3판부터 10초 · 공개 6초 · 4분이 지나면 다음 판이 마지막(살아 있는 사람 모두 우승)
//   진행(시계)은 교사 폰 · 종합상황실 중 한 대가 맡음 (drv: 4초 넘게 소식이 없으면 다른 기기가 이어받음)
//   v0.9.8.0 놀이 종류 (fun.kind): bal ⚖ 밸런스(적은 쪽 탈락 · 무너지는 다리) · rev 🔄 반대로(많은 쪽 탈락 · 침대 숙소 · 스프링으로 띠용) · ox ⭕ 수학 OX(틀리면 탈락 · 얼음 시험장 · 그 반 지금 차시까지)
window.DS = window.DS || {};

DS.Fun = (function () {
  const N = () => DS.Net, Q = () => DS.FunQ.list, OXL = () => (DS.FunOX || { list: [] }).list;
  const KIND = {
    bal: { name: '⚖ 밸런스 게임', short: '⚖ 밸런스', rule: '적은 쪽이 탈락!', out: '적은 쪽이라', list: Q, pre: '' },
    rev: { name: '🔄 반대로 밸런스', short: '🔄 반대로', rule: '이번엔 많은 쪽이 탈락!', out: '많은 쪽이라', list: Q, pre: '' },
    ox: { name: '⭕ 수학 OX', short: '⭕ 수학 OX', rule: '틀리면 탈락!', out: '틀려서', list: OXL, pre: 'x' },
  };
  const K = (f) => KIND[(f && f.kind) || 'bal'] || KIND.bal;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const T = () => (typeof window !== 'undefined' && window.DS_FUN) || {}; // 시험용 시간 줄이기 (e2e48)
  const PICK = (n) => T().pick || (n <= 2 ? 15000 : 10000), SHOW = 6500, LIMIT = 240000, MIN = 3, QUEUE = 24;
  const SHOWMS = () => T().show || SHOW;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const P = (code, s) => `rooms/${code}/${s}`;

  // DB 는 배열을 객체로 돌려주거나 빈 배열을 지운다 → 읽을 때 배열로 맞춤
  const arr = (x) => (Array.isArray(x) ? x : x && typeof x === 'object' ? Object.keys(x).sort((p, q) => p - q).map((k) => x[k]) : []);
  function norm(f) {
    if (!f) return f;
    const r = f.res ? { ...f.res, a: arr(f.res.a), b: arr(f.res.b), none: arr(f.res.none), out: arr(f.res.out) } : f.res;
    return { ...f, queue: arr(f.queue), q: arr(f.q), win: arr(f.win), res: r };
  }
  // ── 판정 (순수 함수 · tests/fun.test.js) ─────────────────
  //   kind: bal = 적은 쪽 · rev = 많은 쪽 · ox = 정답(ans)이 아닌 쪽 (사람이 없어도 그쪽)
  function judge(alive, votes, kind = 'bal', ans = '') {
    votes = votes || {};
    const a = alive.filter((u) => votes[u] === 'a'), b = alive.filter((u) => votes[u] === 'b'), none = alive.filter((u) => votes[u] !== 'a' && votes[u] !== 'b');
    const lose = kind === 'ox' ? (ans === 'a' ? 'b' : 'a')
      : a.length && b.length && a.length !== b.length ? ((kind === 'rev' ? a.length > b.length : a.length < b.length) ? 'a' : 'b') : '';
    let out = [...none, ...(lose === 'a' ? a : lose === 'b' ? b : [])];
    let left = alive.filter((u) => !out.includes(u)), voided = false;
    if (!left.length) { out = []; left = alive.slice(); voided = true; } // 모두 탈락 → 이 판은 없던 일
    return { a, b, none, lose, out, left, voided };
  }
  // 질문 줄: 이 반이 안 쓴 것부터 섞어서 (다 쓰면 처음부터)
  // 쏠린 질문 (실제로 2번 이상 해서 적은 쪽이 평균 25% 아래) → 줄에서 뺌 · 심리전이 되는 반반 질문만 남김
  const tilted = (st) => !!(st && st.n >= 2 && st.m / st.n < 0.25);
  //   pool = 고를 수 있는 번호(수학 OX: 그 반 지금 차시까지) · pre = 쓴 질문 기록 앞글자(OX 는 'x')
  function queue(used, n = QUEUE, rnd = Math.random, stats = null, pool = null, pre = '') {
    const base = pool || Q().map((_, i) => i);
    n = Math.min(n, base.length);
    const ok = base.filter((i) => !tilted((stats || {})[i]));
    const all = ok.length >= n ? ok : base, fresh = all.filter((i) => !(used || {})[pre + i]);
    const mix = (arr) => { const x = arr.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
    const q = mix(fresh).slice(0, n);
    return { q: q.length < n ? [...q, ...mix(all.filter((i) => !q.includes(i))).slice(0, n - q.length)] : q, reset: fresh.length < n };
  }
  const round = (f, n, now) => {
    const qi = f.queue[(n - 1) % f.queue.length], x = K(f).list()[qi], ox = f.kind === 'ox';
    return { n, rk: `r${n}`, qi, q: ox ? ['⭕ 맞다', '❌ 아니다'] : [x[0], x[1]], s: ox ? x.t : null, ans: ox ? (x.a ? 'a' : 'b') : null, why: ox ? x.why : null, phase: 'pick', from: now, to: now + PICK(n), final: now - f.at0 >= LIMIT, res: null, until: null };
  };
  // 다음 상태 (바뀔 게 없으면 null) — 시계를 맡은 기기가 부름
  function step(f, votes, now) {
    f = norm(f);
    if (!f || f.phase === 'end') return null;
    if (f.phase === 'pick' && now >= f.to) {
      const alive = Object.keys(f.alive || {}), r = judge(alive, votes, f.kind || 'bal', f.ans);
      const spect = Object.keys(votes || {}).filter((u) => !(f.alive || {})[u]);
      const sa = spect.filter((u) => votes[u] === 'a').length;
      return { ...f, phase: 'show', until: now + SHOWMS(), res: { a: r.a, b: r.b, none: r.none, lose: r.lose, out: r.out, voided: r.voided, sa, sb: spect.length - sa }, alive: Object.fromEntries(r.left.map((u) => [u, true])), outAt: { ...(f.outAt || {}), ...Object.fromEntries(r.out.map((u) => [u, f.n])) } };
    }
    if (f.phase === 'show' && now >= f.until) {
      const left = Object.keys(f.alive || {});
      if (left.length <= 2 || f.final) return { ...f, phase: 'end', win: left, endAt: now };
      return { ...f, ...round(f, f.n + 1, now) };
    }
    return null;
  }

  // ── 교사 · 종합상황실 ───────────────────────────────────
  const studentsIn = (R) => Object.keys(R.players || {}).filter((u) => !R.players[u].teacher && (R.active || {})[u]);
  async function start(code, R, kind = 'bal') {
    kind = KIND[kind] ? kind : 'bal';
    const k = KIND[kind], alive = studentsIn(R);
    if (alive.length < MIN) throw Object.assign(new Error(`${k.name}은 ${MIN}명 이상일 때 할 수 있어요 (지금 ${alive.length}명)`), { user: true });
    const cls = (R.meta || {}).cls, now = N().now();
    const L = DS.Lessons && DS.Lessons.get((R.meta || {}).lesson), no = (L && L.no) || 99;
    const pool = kind === 'ox' ? OXL().map((x, i) => (x.no <= no ? i : -1)).filter((i) => i >= 0) : null;
    if (pool && !pool.length) throw Object.assign(new Error('이 차시까지는 수학 OX 문제가 없어요'), { user: true });
    const used = cls ? await N().get(`funUsed/${ck(cls)}`).catch(() => null) : null, stats = kind === 'ox' ? null : await N().get('funStats').catch(() => null);
    const { q, reset } = queue(used, QUEUE, Math.random, stats, pool, k.pre);
    if (cls && reset) await N().update(`funUsed/${ck(cls)}`, Object.fromEntries((pool || Q().map((_, i) => i)).map((i) => [k.pre + i, null]))).catch(() => {}); // 그 종류 질문만 처음부터
    const f0 = { g: now, kind, total: alive.length, at0: now, queue: q, alive: Object.fromEntries(alive.map((u) => [u, true])), outAt: {}, drv: { u: N().uid(), at: now } };
    await N().set(P(code, 'fv'), null);
    await N().set(P(code, 'fun'), { ...f0, ...round(f0, 1, now) });
    mark(cls, k.pre + q[0]);
    drive(code);
  }
  // 쏠림 재기: 이 판에 고른 사람(관객 포함)이 4명 이상이면 funStats/{질문} 에 적은 쪽 비율을 더함
  async function tally(f) {
    const r = f.res || {}, a = arr(r.a).length + (r.sa || 0), b = arr(r.b).length + (r.sb || 0);
    if (a + b < 4 || f.qi == null) return;
    const st = (await N().get(`funStats/${f.qi}`).catch(() => null)) || { n: 0, m: 0 };
    await N().set(`funStats/${f.qi}`, { n: (st.n || 0) + 1, m: Math.round(((st.m || 0) + Math.min(a, b) / (a + b)) * 1000) / 1000 }).catch(() => {});
  }
  const mark = (cls, qi) => { if (cls != null && qi != null) N().set(`funUsed/${ck(cls)}/${qi}`, true).catch(() => {}); };
  async function stop(code) { await N().set(P(code, 'fun'), null); await N().set(P(code, 'fv'), null).catch(() => {}); }
  // 시계: 0.7초마다 · 맡은 기기만 씀
  const drivers = {};
  function drive(code) {
    if (drivers[code]) return;
    let busy = false;
    drivers[code] = setInterval(async () => {
      if (busy) return; busy = true;
      try {
        const f = await N().get(P(code, 'fun')).catch(() => null), me = N().uid(), now = N().now();
        if (!f) { clearInterval(drivers[code]); delete drivers[code]; return; }
        if (f.drv && f.drv.u !== me && now - (f.drv.at || 0) < 4000) return; // 다른 기기가 맡고 있음
        if (f.phase === 'end') { if (now - (f.endAt || now) > 60000) await stop(code); else if (!f.drv || f.drv.u !== me || now - f.drv.at > 1500) await N().set(P(code, 'fun/drv'), { u: me, at: now }); return; }
        const votes = f.phase === 'pick' && now >= f.to ? (await N().get(P(code, `fv/${f.rk}`)).catch(() => null)) || {} : null;
        const nx = step(f, votes, now);
        if (nx) {
          nx.drv = { u: me, at: now };
          await N().set(P(code, 'fun'), nx);
          if (nx.phase === 'show' && nx.kind !== 'ox') tally(nx);
          if (nx.phase === 'pick' && nx.n !== f.n) { const R = await N().get(P(code, 'meta')).catch(() => null); mark(R && R.cls, K(nx).pre + nx.qi); }
        } else if (!f.drv || f.drv.u !== me || now - f.drv.at > 1500) await N().set(P(code, 'fun/drv'), { u: me, at: now });
      } finally { busy = false; }
    }, 700);
  }
  // 교사 폰 쉼터 칸 · 종합상황실 아이콘 줄
  const status = (R) => {
    const f = R.fun; if (!f) return '';
    const n = Object.keys(f.alive || {}).length;
    return `${K(f).short} · ${f.phase === 'end' ? `🏆 우승 ${arr(f.win).length}명` : `${f.n}판 · 생존 ${n}명`}`;
  };
  const ctlHtml = (R) => (R.fun
    ? `<div class="fun-ctl"><span>${esc(status(R))}</span><button class="btn small" data-fun="stop">⏹ 게임 끝</button><button class="btn small" data-fun="again">↻ 새 게임</button></div>`
    : `<div class="fun-ctl pick"><span class="muted small">쉬는 시간 놀이</span>${Object.entries(KIND).map(([k, v]) => `<button class="btn small fun-btn k-${k}" data-fun="start:${k}" title="${esc(v.rule)}">${esc(v.short)}</button>`).join('')}</div>`);
  function bind(el, code, R) {
    if (R.fun) drive(code);
    el.querySelectorAll('[data-fun]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const k = b.dataset.fun;
      if (k === 'stop') return stop(code);
      if (k === 'again' && !window.confirm('새 게임을 시작할까요? (지금 판은 끝나요)')) return;
      await start(code, R, k === 'again' ? (R.fun || {}).kind : k.split(':')[1]);
    })));
  }

  // ── 그리기 (학생 폰 · 종합상황실 공용 조각) ──────────────
  const A = () => DS.ASSETS.fun || {};
  const nameOf = (R, u) => (R.players[u] || {}).nick || '';
  const heroOf = (R, u) => DS.Art.hero((R.players[u] || {}).hero || 0, 'idle', 'small');
  // 무대 그림: 종류마다 (rev = 침대 숙소 그림이 오기 전엔 CSS · ox = 다리 그림을 얼음빛으로)
  const bgOf = (kind) => (kind === 'rev' ? A().bgRev : kind === 'ox' ? A().bgOx || A().bg : A().bg) || null;
  const platStyle = () => (A().plat ? ` style="background-image:url('${DS.ASSETS.base}${A().plat}')"` : '');
  const left = (f) => Math.max(0, Math.round((f.to - N().now()) / 1000));
  if (typeof document !== 'undefined') setInterval(() => document.querySelectorAll('[data-fun-end]').forEach((e) => { e.textContent = Math.max(0, Math.round((Number(e.dataset.funEnd) - N().now()) / 1000)); }), 250);
  // 자리: 무리 안에서 i 번째 (가로 cols 칸)
  const spot = (i, n, x0, x1, y0, cols) => { const c = Math.max(1, Math.min(cols, n)), r = Math.floor(i / c), k = i % c, w = (x1 - x0) / c; return { x: x0 + w * (k + 0.5) + (r % 2 ? w * 0.25 : 0), y: y0 + r * 9 }; };
  // 종합상황실 · 학생 폰 같은 무대 (big: 종합상황실)
  function stage(R, f, big, me) {
    const alive = Object.keys(f.alive || {}), res = f.res || {}, show = f.phase === 'show';
    const inPlay = show ? [...res.a, ...res.b, ...res.none] : f.phase === 'end' ? (f.win || []) : alive;
    const spect = Object.keys(R.players || {}).filter((u) => !R.players[u].teacher && !inPlay.includes(u) && (R.active || {})[u]);
    const cols = big ? 6 : 4;
    const bib = (u) => String((R.players[u] || {}).num || 0).padStart(2, '0'); // 🔄 반대로: 이름 대신 번호표
    const fig = (u, x, y, cls = '') => `<div class="fa-h${cls}${u === me ? ' me' : ''}" data-u="${u}" style="left:${x}%;top:${y}%" ${show ? `data-go="${res.a.includes(u) ? 'a' : res.b.includes(u) ? 'b' : 'n'}"` : ''}>${heroOf(R, u)}${(f.kind || 'bal') === 'rev' ? `<b class="bib">${bib(u)}</b>` : big || u === me ? `<b>${esc(u === me ? '나' : nameOf(R, u))}</b>` : ''}</div>`;
    const py = (f.kind || 'bal') === 'rev' ? 68 : 50; // 🔄 숙소 그림: 바닥이 아래쪽
    const plaza = inPlay.map((u, i) => { const s = spot(i, inPlay.length, 34, 66, py, big ? 5 : 4); return fig(u, s.x, s.y); }).join('');
    const gal = spect.slice(0, big ? 24 : 10).map((u, i) => `<div class="fa-g${u === me ? ' me' : ''}" style="left:${4 + (i * (92 / Math.max(1, Math.min(spect.length, big ? 24 : 10))))}%">${heroOf(R, u)}</div>`).join('');
    const lose = show ? res.lose : '';
    const kind = f.kind || 'bal', bg = bgOf(kind), spring = kind === 'rev' ? '<i class="fa-spring"></i>' : '';
    return `<div class="fa-arena k-${kind}${big ? ' big' : ''}${bg || kind === 'rev' ? ' img' : ''}${A().plat ? ' pimg' : ''}">${bg ? `<i class="fa-bg" style="background-image:url('${DS.ASSETS.base}${bg}')"></i>` : kind === 'rev' ? '<i class="fa-bg dorm"></i>' : ''}
      <div class="fa-gal">${gal}${spect.length ? `<span class="fa-gn">👀 관객 ${spect.length}</span>` : ''}</div>
      <div class="fa-pit l"></div><div class="fa-pit r"></div>
      <div class="fa-plat a${lose === 'a' ? ' doom' : ''}"${platStyle()}><i class="fa-flag">${kind === 'ox' ? '⭕' : esc(f.q[0])}</i>${show ? `<em class="fa-cnt">${res.a.length}</em>` : ''}${spring}</div>
      <div class="fa-plat b${lose === 'b' ? ' doom' : ''}"${platStyle()}><i class="fa-flag">${kind === 'ox' ? '❌' : esc(f.q[1])}</i>${show ? `<em class="fa-cnt">${res.b.length}</em>` : ''}${spring}</div>
      <div class="fa-plaza"></div>${plaza}${kind === 'rev' ? board(f) : ''}</div>`;
  }
  // 🔄 생존자 전광판 (그림의 아치 위 검은 판) · 안내 방송 자막 (판 시작 때 한 글자씩)
  function board(f) {
    const res = f.res || {}, now = Object.keys(f.alive || {}).length, before = f.phase === 'show' ? arr(res.a).length + arr(res.b).length + arr(res.none).length : now;
    const pad = (n) => String(n).padStart(2, '0');
    return `<div class="fa-board"><b data-after="${pad(now)}">${pad(before)}</b><span>/${pad(f.total || before)}</span></div><i class="fa-board-l">생존자</i>${f.phase === 'pick' ? `<div class="fa-ann"><i>📢</i><span>${f.n === 1 ? '참가자 여러분, ' : ''}이번 판은… 많은 쪽이 탈락합니다</span></div>` : ''}`;
  }
  // 공개 연출: 광장 → 자기 쪽 발판으로 우르르 → 적은 쪽 무너짐
  function animate(root, f, big) {
    const res = f.res || {}, cols = big ? 3 : 3, rev = f.kind === 'rev';
    const go = { a: res.a, b: res.b };
    setTimeout(() => {
      root.querySelectorAll('.fa-h[data-go]').forEach((h) => {
        const u = h.dataset.u, side = h.dataset.go;
        if (side === 'n') { h.classList.add('fa-lost'); return; }
        const i = go[side].indexOf(u), s = spot(i, go[side].length, side === 'a' ? 2 : 81, side === 'a' ? 19 : 98, rev ? 50 : 46, cols); // 발판 위 (그림 v1: 양옆 허공 위 떠 있는 발판)
        h.style.left = `${s.x}%`; h.style.top = `${s.y}%`; h.classList.add(side === 'a' ? 'run-l' : 'run-r');
      });
      if (DS.Sound && DS.Sound.card) DS.Sound.card();
    }, 300);
    if (res.lose && rev) setTimeout(() => { // 🔄 버저 → 전광판 빨갛게 · 숫자 줄어듦 → 띠용
      if (DS.Sound && DS.Sound.buzz) DS.Sound.buzz();
      const b = root.querySelector('.fa-board'); if (b) { b.classList.add('hot'); const n = b.querySelector('b'); if (n) setTimeout(() => { n.textContent = n.dataset.after; }, 500); }
    }, 1900);
    if (res.lose) setTimeout(() => {
      root.querySelectorAll(`.fa-plat.${res.lose}, .fa-h[data-go="${res.lose}"]`).forEach((e) => e.classList.add('fall'));
      if (DS.Sound) (rev && DS.Sound.boing ? DS.Sound.boing() : DS.Sound.hit && DS.Sound.hit());
    }, 2600);
  }
  const head = (f) => (f.phase === 'end' ? `<b>🏆 ${esc(K(f).name)} 끝!</b>`
    : `<b>${esc(K(f).short)} ${f.n}판${f.final ? ' · 마지막 판' : ''}</b>${f.kind === 'ox' ? `<span class="fa-st">${esc(f.s)}</span>` : `<span class="fa-vs"><i class="a">${esc(f.q[0])}</i> vs <i class="b">${esc(f.q[1])}</i></span>`}<em class="fa-rule">${esc(K(f).rule)}</em>${f.phase === 'pick' ? `<span class="fa-t">⏱ <b data-fun-end="${f.to}">${left(f)}</b></span>` : ''}`);
  const verdict = (f) => {
    const r = f.res || {};
    if (r.voided) return `모두 탈락하게 돼서 이번 판은 없던 일!${f.kind === 'ox' ? ` (정답 ${f.ans === 'a' ? '⭕' : '❌'} · ${esc(f.why)})` : ' 다시 한 번'}`;
    if (f.kind === 'ox') { const n = (r.lose === 'a' ? r.a : r.b).length + r.none.length; return `정답 ${f.ans === 'a' ? '⭕' : '❌'} — ${esc(f.why)}${n ? ` · ${n}명 탈락` : ' · 모두 정답!'}`; }
    if (!r.lose) return r.a.length && r.b.length ? `${r.a.length} : ${r.b.length} 비김 — 아무도 탈락 안 해요` : '모두 같은 쪽! 아무도 탈락 안 해요';
    return `${esc(f.q[r.lose === 'a' ? 0 : 1])} 쪽${f.kind === 'rev' ? '이 더 많아서' : ''} ${(r.lose === 'a' ? r.a : r.b).length}명 탈락!${f.kind === 'rev' ? ' 띠용~' : ''}`;
  };

  // 종합상황실
  let hallSig = '';
  function hall(el, R) {
    const f = norm(R.fun), sig = `${f.g}|${f.rk}|${f.phase}|${Object.keys(f.alive || {}).length}`;
    const voted = Object.keys(((R.fv || {})[f.rk]) || {}).filter((u) => (f.alive || {})[u]).length;
    if (hallSig === sig && el.querySelector('.fa-wrap')) { const v = el.querySelector('.fa-voted'); if (v) v.textContent = `고른 사람 ${voted} / ${Object.keys(f.alive || {}).length}`; return; }
    hallSig = sig;
    const win = f.phase === 'end' ? `<div class="fa-win"><h1>🏆 우승!</h1><p>${(f.win || []).map((u) => `<b>${esc((R.players[u] || {}).num)}번 ${esc(nameOf(R, u))}</b>`).join(' · ')}</p></div>` : '';
    el.innerHTML = `<div class="fa-wrap big"><div class="fa-head">${head(f)}</div>${stage(R, f, true)}${win}
      <p class="fa-foot">${f.phase === 'pick' ? `<span class="fa-voted">고른 사람 ${voted} / ${Object.keys(f.alive || {}).length}</span> · 누가 어디를 골랐는지는 시간이 끝나면 공개!` : f.phase === 'show' ? `${verdict(f)}${(f.res.sa + f.res.sb) ? ` <span class="muted">(관객 ${esc(f.q[0])} ${f.res.sa} · ${esc(f.q[1])} ${f.res.sb})</span>` : ''}` : '쉼터가 끝나면 하던 수업으로 돌아가요'}</p></div>`;
    if (f.phase === 'show') animate(el.querySelector('.fa-arena'), f, true);
  }
  // 학생 폰
  let phoneSig = '';
  function phone(body, R, me, code) {
    const f = norm(R.fun), alive = !!(f.alive || {})[me], mine = ((R.fv || {})[f.rk] || {})[me] || pend[`${f.g}|${f.rk}`] || '';
    const sig = `${f.g}|${f.rk}|${f.phase}|${alive}|${mine}`;
    if (phoneSig === sig && body.querySelector('.fa-wrap')) return;
    phoneSig = sig;
    const r = f.res || {}, wasIn = f.phase !== 'pick' && (r.a || []).concat(r.b || [], r.none || []).includes(me);
    const me2 = f.phase === 'show' ? (wasIn ? (alive ? '<p class="fa-me ok">🎉 살아남았다!</p>' : `<p class="fa-me ng">💥 ${(r.none || []).includes(me) ? '안 골라서' : K(f).out} 탈락… 관객석으로</p>`) : '<p class="fa-me">👀 관객석</p>')
      : f.phase === 'end' ? ((f.win || []).includes(me) ? '<p class="fa-me ok">🏆 우승! 끝까지 살아남았어요</p>' : `<p class="fa-me">우승: ${(f.win || []).map((u) => esc(nameOf(R, u))).join(' · ')}</p>`)
      : alive ? `<p class="fa-me">${f.kind === 'ox' ? '맞을까 틀릴까?' : '둘 중 하나!'} <b>${esc(K(f).rule)}</b> · 시간 안에는 바꿀 수 있어요</p>` : '<p class="fa-me">👀 관객석 — 골라도 결과엔 영향 없어요</p>';
    body.innerHTML = `<div class="panel framed fa-wrap"><div class="fa-head">${head(f)}</div>${stage(R, f, false, me)}${me2}
      ${f.phase === 'pick' ? `<div class="fa-pick"><button class="btn big fa-a${mine === 'a' ? ' on' : ''}" data-pick="a">${esc(f.q[0])}</button><button class="btn big fa-b${mine === 'b' ? ' on' : ''}" data-pick="b">${esc(f.q[1])}</button></div>` : ''}
      ${f.phase === 'show' ? `<p class="fa-res">${verdict(f)}</p>` : ''}</div>`;
    body.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = () => {
      if (N().now() > f.to) return;
      pend[`${f.g}|${f.rk}`] = b.dataset.pick; phoneSig = '';
      if (DS.Sound && DS.Sound.card) DS.Sound.card();
      phone(body, R, me, code);
      N().set(P(code, `fv/${f.rk}/${me}`), b.dataset.pick).catch(() => DS.UI.toast('시간이 끝났어요'));
    }));
    if (f.phase === 'show') animate(body.querySelector('.fa-arena'), f, false);
  }
  const pend = {};
  const on = (R) => !!(R && R.fun && DS.Raid.restOn(R));
  return { KIND, judge, queue, tilted, step, round, start, stop, drive, ctlHtml, bind, hall, phone, on, PICK, SHOW, LIMIT, MIN };
})();
