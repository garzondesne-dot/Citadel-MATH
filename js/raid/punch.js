// 🏁 반대항 달리기 경주 (2026-11-05 사용자 「캐릭터들이 게이지를 뒤에 달고 왼쪽에서 오른쪽으로 뛰어오기」 · 예전 🥊 펀치 기계를 바꿈)
//   점수 = 참여 25 · 고침 25 · 콤보 20 · 첫 시도 20 · 돕기 10 (DS.Combo.punch · 0~1000) · 같은 차시를 한 반끼리
//   다른 반이 이 차시를 아직 안 했으면 그 반의 가장 가까운 차시 기록으로 함께 달림 (레인에 「n차시 기록」 표시)
//   연출: 반마다 레인 하나 · 그 반 용사가 왼쪽에서 출발 · 지나간 자리에 게이지가 늘어남 · 모두 같은 속도라 점수 자리에서 멈춤 → 1등 🏆 · 꼴찌 대신 「도전 중」
//   이모지는 교실 TV 에서 안 보일 수 있어 글자 · CSS 로 (그림이 오면 assets/manifest.js thrill.track)
window.DS = window.DS || {};

DS.Punch = (function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const N = () => DS.Net;
  const MAX = 1000;
  const noOf = (id) => { const L = DS.Lessons && DS.Lessons.get(id); return (L && L.no) || 0; };

  // 이 차시 반 기록 (지금 방이면 방에서 바로 계산한 값으로 · 저장 전이어도 보이게)
  async function load(L, R, opt = {}) {
    const all = (await N().get('punch').catch(() => null)) || {};
    const cls = R && R.meta && R.meta.cls;
    if (cls && R.meta.lesson === L.id && !opt.overtime && DS.Combo) {
      const saved = ((all[L.id] || {})[ck(cls)]) || null;
      if (!saved || saved.code === R.meta.code || !saved.code) {
        const live = DS.Combo.punch(L, R);
        all[L.id] = { ...(all[L.id] || {}), [ck(cls)]: { ...live, code: R.meta.code, ...(saved && saved.ot ? { ot: true } : {}) } };
      }
    }
    return { all, b: DS.Combo.board(all, L.id, cls ? ck(cls) : '') };
  }
  // 레인 용사: 우리 반 = 그 방에서 가장 많이 고른 용사 · 다른 반 = 반 이름으로 고정 (이름 · 순위 없이)
  function heroOf(R, cls, mine) {
    if (mine) {
      const cnt = {}; Object.values((R && R.players) || {}).filter((p) => !p.teacher).forEach((p) => { cnt[p.hero || 0] = (cnt[p.hero || 0] || 0) + 1; });
      const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; if (top) return Number(top[0]);
    }
    return DS.Combo.hash(`lane|${cls}`) % 16;
  }

  async function open(L, R, opt = {}) {
    const { b } = await load(L, R, opt);
    const me = b.me, A = (DS.ASSETS && DS.ASSETS.thrill) || {};
    const lanes = b.rows.slice(0, 8);
    const o = document.createElement('div'); o.className = `pm-ov rc-ov${opt.big ? ' big' : ''}`;
    o.innerHTML = `<div class="pm rc">
      <div class="pm-head"><b>🏁 반대항 경주</b><span>${L.no ? `${L.no}차시 ` : ''}${esc(L.title)}${opt.overtime ? ' · ⏳ 연장전 결과' : ''}</span><button class="btn small pm-x">닫기</button></div>
      <div class="rc-track"${A.track ? ` style="background-image:url('${DS.ASSETS.base}${A.track.src}')"` : ''}>
        <i class="rc-start"></i><i class="rc-goal"></i>
        ${lanes.map((r, i) => `<div class="rc-lane${me && r === me ? ' me' : ''}${r.near ? ' near' : ''}" data-i="${i}">
          <div class="rc-name"><b>${esc(r.cls)}반</b>${r.near ? `<small>${noOf(r.near)}차시 기록</small>` : r.ot ? '<small>연장전 중</small>' : ''}</div>
          <div class="rc-run"><div class="rc-bar"></div><div class="rc-hero"><span class="rc-num">0</span>${DS.Art.hero(heroOf(R, r.cls, me && r === me), 'walk')}</div><span class="rc-badge" hidden></span></div></div>`).join('')}
        ${lanes.length < 2 ? '<p class="rc-wait">다른 반 기록을 기다리는 중 — 다른 반이 수업하면 함께 달려요</p>' : ''}
      </div>
      <div class="pm-after" hidden></div></div>`;
    document.body.appendChild(o);
    o.querySelector('.pm-x').onclick = () => { o.remove(); if (opt.onClose) opt.onClose(); };
    const top = Math.max(1, ...lanes.filter((r) => !r.ot).map((r) => r.s || 0)), v = top / 3.6; // 1초에 v 점 · 1등은 3.6초 만에 들어옴
    const els = [...o.querySelectorAll('.rc-lane')].map((e, i) => ({ r: lanes[i], bar: e.querySelector('.rc-bar'), hero: e.querySelector('.rc-hero'), num: e.querySelector('.rc-num'), badge: e.querySelector('.rc-badge'), done: false }));
    els.filter((x) => x.r.ot).forEach((x) => { x.done = true; x.hero.innerHTML = DS.Art.hero(heroOf(R, x.r.cls), 'sit'); x.num.textContent = '⏳'; });
    let t0 = 0, tick = 0;
    const finish = (x) => {
      x.done = true; x.num.textContent = x.r.s;
      const win = x.r.rank === 1 && lanes.filter((r) => !r.ot).length > 1;
      x.hero.innerHTML = `<span class="rc-num">${x.r.s}</span>${DS.Art.hero(heroOf(R, x.r.cls, me && x.r === me), win ? 'win' : 'idle', win ? 'pairhop' : '')}`;
      x.badge.hidden = false; x.badge.className = `rc-badge${win ? ' win' : x.r.last ? ' try' : ''}`; x.badge.textContent = win ? '1등' : x.r.last ? '도전 중' : `${x.r.rank}등`;
      if (DS.Sound) (win ? DS.Sound.correct() : DS.Sound.hit());
    };
    const run = (now) => {
      if (!o.isConnected) return;
      if (!t0) t0 = now;
      const t = (now - t0) / 1000, x0 = v * t;
      els.forEach((x) => {
        if (x.done) return;
        const s = Math.min(x.r.s || 0, x0), w = (s / MAX) * 100;
        x.bar.style.width = `${w}%`; x.hero.style.left = `${w}%`; x.num.textContent = Math.round(s);
        if (s >= (x.r.s || 0)) finish(x);
      });
      if (++tick % 5 === 0 && DS.Sound && DS.Sound.tick) DS.Sound.tick();
      if (els.some((x) => !x.done)) requestAnimationFrame(run);
      else setTimeout(() => after(o, L, b), 700);
    };
    setTimeout(() => requestAnimationFrame(run), 600);
  }
  // 우리 반 지표 막대 · 지난 차시 대비 · 보상 · 시즌
  function after(o, L, b) {
    const me = b.me, el = o.querySelector('.pm-after'), C = DS.Combo, scored = b.rows.filter((r) => !r.ot), gems = C.punchGems(me, b);
    el.innerHTML = `${me && !me.ot ? `<div class="pm-me">${me.rank === 1 && scored.length > 1 ? '<p class="pm-flag">우리 반 1등!</p>' : me.last ? '<p class="pm-flag try">도전 중 — 다음 차시에 뒤집자!</p>' : ''}
        ${me.delta != null ? `<p class="pm-delta ${me.delta >= 0 ? 'up' : 'down'}">지난 차시보다 <b>${me.delta >= 0 ? '+' : ''}${me.delta}%</b></p>` : '<p class="muted small">첫 기록 — 다음 차시부터 지난 차시와 비교해요</p>'}
        <div class="pm-bars">${Object.entries(C.PUNCH_W).map(([k, w]) => `<div class="pm-bar"><span><i class="pm-dot k-${k}"></i>${C.PUNCH_NAMES[k]} <small>${w}</small></span><i class="pm-track"><b style="width:${(me.m || {})[k] || 0}%"></b></i><em>${(me.m || {})[k] || 0}</em></div>`).join('')}</div>
        ${gems.length ? `<p class="pm-gem">${gems.map(([, g, why]) => `${esc(why)} → 모두 💎 +${g}`).join('<br>')}</p>` : ''}</div>` : me && me.ot ? '<p class="pm-flag try">연장전 중 — 이어하기 포털(7일)이 끝나면 다음 수업 때 결과가 나와요</p>' : '<p class="muted">아직 이 반 기록이 없어요.</p>'}
      ${b.rows.some((r) => r.near) ? '<p class="muted small">「n차시 기록」 = 그 반이 아직 이 차시를 안 해서 가장 가까운 차시 기록으로 함께 달렸어요</p>' : ''}
      ${b.season.length > 1 ? `<p class="pm-season">시즌 누적: ${b.season.map((s, i) => `<b>${i + 1}. ${esc(s.cls)}반</b> ${s.total}`).join(' · ')}</p>` : ''}
      <p class="muted small">게임 기록은 수학 성적이 아니에요</p>`;
    el.hidden = false; o.querySelector('.pm').classList.add('done');
  }
  // 학생 보상: 끝난 뒤 저장된 기록(같은 수업 코드)을 기다렸다가 1등 💎 +5 · +10% 💎 +3 (한도 밖 · 한 번)
  async function reward(m, L, R, code) {
    if (!DS.Gem || !m || m.c == null || !R.meta.cls || !L.no || L.eval) return;
    for (let i = 0; i < 5; i++) {
      const all = (await N().get('punch').catch(() => null)) || {}, e = ((all[L.id] || {})[ck(R.meta.cls)]);
      if (e && e.code === code) {
        const bd = DS.Combo.board(all, L.id, ck(R.meta.cls));
        for (const [k, g, why] of DS.Combo.punchGems(bd.me, bd)) await DS.Gem.add(m, g, `punch_${L.id}_${k}`, why, { free: true }).catch(() => {});
        return;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return { open, load, reward };
})();
