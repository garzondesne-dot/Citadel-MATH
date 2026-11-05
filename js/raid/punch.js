// 🥊 반대항 펀치 기계 (v0.9.11 · 2026-11-05 사용자 확정 A안): 같은 차시를 한 반끼리 · 학기 누적 시즌
//   점수 = 🙋 참여 25 · 🔁 고침 25 · 🔥 콤보 20 · 🎯 첫 시도 20 · 💚 돕기 10 (DS.Combo.punch · 0~1000)
//   연출: 용사가 샌드백 펀치 → 7세그 숫자 돌기 → 다른 반 기록선 근처에서 느려짐 → 쾅 → 순위 · 지표 막대 · 지난 차시 대비
//   꼴찌 대신 「도전 중」 · 1등 반 🏆 깃발 + 💎 +5 · 지난 차시보다 +10% 이상 💎 +3 · ⏳ 이어하기 중 = 「연장전 중」
window.DS = window.DS || {};

DS.Punch = (function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const N = () => DS.Net;
  const MAX = 1000;
  // 7세그 숫자 (a b c d e f g)
  const SEG = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abcdfg'];
  const seg = (d) => `<span class="pm-dig">${'abcdefg'.split('').map((x) => `<i class="s-${x}${d != null && SEG[d].includes(x) ? ' on' : ''}"></i>`).join('')}</span>`;
  const segs = (v, n = 4) => String(Math.max(0, Math.round(v))).padStart(n, ' ').split('').map((c) => seg(c === ' ' ? null : Number(c))).join('');

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
  // 공격 용사 고르기 (이름 · 순위 없이 그 반 용사 하나)
  function heroOf(R) {
    const ps = Object.values((R && R.players) || {}).filter((p) => !p.teacher);
    if (!ps.length) return DS.Art.teacherHero ? DS.Art.teacherHero(R) : 7;
    return ps[DS.Combo.hash(String((R.meta || {}).code || '')) % ps.length].hero || 0;
  }

  async function open(L, R, opt = {}) {
    const { b } = await load(L, R, opt);
    const me = b.me, cls = R.meta.cls;
    const target = me && !me.ot ? me.s : 0;
    const lines = b.rows.filter((r) => r !== me && !r.ot).map((r) => ({ cls: r.cls, s: r.s }));
    const A = (DS.ASSETS && DS.ASSETS.thrill) || {};
    const o = document.createElement('div'); o.className = `pm-ov${opt.big ? ' big' : ''}`;
    o.innerHTML = `<div class="pm">
      <div class="pm-head"><b>🥊 반대항 펀치 기계</b><span>${L.no ? `${L.no}차시 ` : ''}${esc(L.title)}${opt.overtime ? ' · ⏳ 연장전 결과' : ''}</span><button class="btn small pm-x">닫기</button></div>
      <div class="pm-stage"${A.arena ? ` style="background-image:url('${DS.ASSETS.base}${A.arena.src}')"` : ''}>
        <div class="pm-gauge"><div class="pm-fill"></div>${lines.map((l) => `<i class="pm-line" style="bottom:${(l.s / MAX) * 100}%"><span>${esc(l.cls)}반 ${l.s}</span></i>`).join('')}</div>
        <div class="pm-seg">${segs(0)}</div>
        <div class="pm-mach">${DS.Thrill.sprite('punch', 0, 'idle')}</div>
        <div class="pm-hero">${DS.Art.hero(heroOf(R), 'idle')}</div>
        <p class="pm-cls">${cls ? `${esc(cls)}반` : ''}${me && me.ot ? ' · ⏳ 연장전 중' : ''}</p>
      </div>
      <div class="pm-after" hidden></div></div>`;
    document.body.appendChild(o);
    o.querySelector('.pm-x').onclick = () => { o.remove(); if (opt.onClose) opt.onClose(); };
    if (!me || me.ot) { after(o, L, b, opt); return; }
    // 1) 돌진 → 펀치
    const hero = o.querySelector('.pm-hero'), mach = o.querySelector('.pm-mach'), digits = o.querySelector('.pm-seg'), fill = o.querySelector('.pm-fill');
    setTimeout(() => { hero.classList.add('dash'); hero.innerHTML = DS.Art.hero(heroOf(R), 'attack'); }, 300);
    setTimeout(() => { mach.innerHTML = DS.Thrill.sprite('punch', 1, 'hit'); o.querySelector('.pm-stage').classList.add('shake'); if (DS.Sound) DS.Sound.hit(); }, 850);
    setTimeout(() => { hero.classList.remove('dash'); hero.innerHTML = DS.Art.hero(heroOf(R), 'idle'); mach.innerHTML = DS.Thrill.sprite('punch', 0, 'idle'); o.querySelector('.pm-stage').classList.remove('shake'); }, 1500);
    // 2) 숫자 돌기 (기록선 근처 느려짐)
    const base = Math.max(120, target / 2.4);
    let x = 0, last = 0, tick = 0;
    const speed = (v) => lines.reduce((k, l) => k * (1 - 0.8 * Math.exp(-(((v - l.s) / 45) ** 2))), 1);
    const run = (now) => {
      if (!o.isConnected) return;
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      x = Math.min(target, x + base * Math.max(0.18, speed(x)) * dt * (x > target * 0.92 ? 0.55 : 1));
      digits.innerHTML = segs(x); fill.style.height = `${(x / MAX) * 100}%`;
      if (++tick % 4 === 0 && DS.Sound && DS.Sound.tick) DS.Sound.tick();
      lines.forEach((l) => { const e = [...o.querySelectorAll('.pm-line')].find((i) => i.textContent.startsWith(`${l.cls}반`)); if (e) e.classList.toggle('passed', x >= l.s); });
      if (x < target) requestAnimationFrame(run);
      else { // 3) 쾅
        const st = o.querySelector('.pm-stage'); st.classList.add('bang'); if (DS.Sound) { DS.Sound.hit(); setTimeout(() => DS.Sound.correct(), 150); }
        setTimeout(() => after(o, L, b, opt), 700);
      }
    };
    setTimeout(() => requestAnimationFrame(run), 1100);
  }
  // 순위 · 지표 막대 · 지난 차시 대비 · 보상 · 시즌
  function after(o, L, b, opt) {
    const me = b.me, el = o.querySelector('.pm-after'), C = DS.Combo;
    const scored = b.rows.filter((r) => !r.ot);
    const rowHtml = (r) => `<li class="${r === me ? 'me' : ''}${r.rank === 1 ? ' first' : ''}"><span class="pm-rk">${r.ot ? '⏳' : r.rank === 1 ? '🏆' : r.last ? '🔥' : `${r.rank}등`}</span><b>${esc(r.cls)}반</b><span class="pm-s">${r.ot ? '연장전 중' : r.s}</span>${r.last && !r.ot ? '<small>도전 중</small>' : ''}${r.delta != null && !r.ot ? `<small class="${r.delta >= 0 ? 'up' : 'down'}">${r.delta >= 0 ? '+' : ''}${r.delta}%</small>` : ''}</li>`;
    const gems = C.punchGems(me, b);
    el.innerHTML = `${me && !me.ot ? `<div class="pm-me">${me.rank === 1 && scored.length > 1 ? '<p class="pm-flag">🏆 우리 반 1등!</p>' : me.last ? '<p class="pm-flag try">🔥 도전 중 — 다음 차시에 뒤집자!</p>' : ''}
        ${me.delta != null ? `<p class="pm-delta ${me.delta >= 0 ? 'up' : 'down'}">지난 차시보다 <b>${me.delta >= 0 ? '+' : ''}${me.delta}%</b></p>` : '<p class="muted small">첫 기록 — 다음 차시부터 지난 차시와 비교해요</p>'}
        <div class="pm-bars">${Object.entries(C.PUNCH_W).map(([k, w]) => `<div class="pm-bar"><span>${C.PUNCH_NAMES[k]} <small>${w}</small></span><i><b style="width:${(me.m || {})[k] || 0}%"></b></i><em>${(me.m || {})[k] || 0}</em></div>`).join('')}</div>
        ${gems.length ? `<p class="pm-gem">${gems.map(([, g, why]) => `${esc(why)} → 모두 💎 +${g}`).join('<br>')}</p>` : ''}</div>` : me && me.ot ? '<p class="pm-flag try">⏳ 연장전 중 — 이어하기 포털(7일)이 끝나면 다음 수업 때 결과를 펀치해요</p>' : '<p class="muted">아직 이 반 기록이 없어요.</p>'}
      ${scored.length > 1 || b.rows.some((r) => r.ot) ? `<ol class="pm-rank">${b.rows.map(rowHtml).join('')}</ol>` : '<p class="muted small">다른 반이 같은 차시를 하면 순위가 생겨요.</p>'}
      ${b.season.length > 1 ? `<p class="pm-season">🏅 시즌 누적: ${b.season.map((s, i) => `<b>${i + 1}. ${esc(s.cls)}반</b> ${s.total}`).join(' · ')}</p>` : ''}
      <p class="muted small">같은 차시끼리 겨뤄요 · 게임 기록은 수학 성적이 아니에요</p>`;
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
  return { open, load, reward, segs };
})();
