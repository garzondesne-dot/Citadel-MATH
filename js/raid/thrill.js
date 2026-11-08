// v0.9.11 화면 연출 공용 (학생 폰 · 종합상황실): ✨ 퍼펙트 배너 · 🔥 콤보 배지 · 👑 보스 단계 · 🦇 황금 박쥐 · 🎁 보물 상자
//   규칙 계산은 DS.Combo (순수 함수) · 그림은 assets/manifest.js 의 thrill (없으면 CSS · 이모지)
window.DS = window.DS || {};

DS.Thrill = (function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const A = () => (DS.ASSETS && DS.ASSETS.thrill) || {};
  const url = (f) => `${DS.ASSETS.base}${f}`;
  const el = (cls, html, parent) => { const e = document.createElement('div'); e.className = cls; e.innerHTML = html; (parent || document.body).appendChild(e); return e; };
  // 그림 칸: 시트(가로 프레임) 가 있으면 그 칸 · 없으면 이모지 (cls 로 CSS 움직임)
  function sprite(kind, frame, cls = '') {
    const a = A()[kind];
    if (!a) return `<i class="th-emo th-k-${kind} ${cls}">${{ bat: '🦇', chest: '🎁', feather: '🪶', punch: '🥊' }[kind] || '✨'}</i>`;
    const n = a.frames || 1, f = Math.max(0, Math.min(n - 1, frame || 0));
    return `<i class="th-spr th-k-${kind} ${cls}" style="background-image:url('${url(a.src)}');background-size:${n * 100}% 100%;background-position:${n > 1 ? (f / (n - 1)) * 100 : 0}% 0"></i>`;
  }
  // ✨ PERFECT ×3 · ⛓ 4초 (폰 · 종합상황실 공통 배너)
  // ⛓ 묶기 이펙트 (2026-11-06 사용자 「묶기 이모티콘이 안 예쁨 → 이펙트로」): 몬스터를 사슬이 감음 · big = 필살기 대묶기 (2겹 · 붉은 금빛)
  function bindFx(mon, big) {
    if (!mon || !DS.FX) return;
    const box = mon.closest('.scene, #raid') || mon.parentElement; if (!box) return;
    const art = (mon.matches && mon.matches('.art')) ? mon : (mon.querySelector && mon.querySelector('.art.monster, .art.hero')) || mon; // 2026-11-06 사용자 「보스 묶기가 정중앙이 아니라 살짝 위」: 체력 막대까지 든 칸 말고 몬스터 그림 기준
    // 2026-11-08 사용자 「묶기가 몸 밖으로 벗어남」: 칸(투명 여백 포함) 말고 보이는 몸통에 — 사슬의 보이는 가운데 = 몸통 가운데 · 폭 = 몸통 폭 (대묶기 1.15배)
    const B = DS.Attack && DS.Attack.body ? DS.Attack.body(art, box) : null;
    if (B) DS.FX.place(box, big ? 'bind2' : 'bind', { body: B, mode: 'body', mult: big ? 1.15 : 1, flat: true });
    else { const a = art.getBoundingClientRect(), b = box.getBoundingClientRect(); DS.FX.play(box, big ? 'bind2' : 'bind', { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height * 0.6, s: Math.max(1, Math.min(4, a.width / 110)) * (big ? 1.3 : 1) }); }
    if (DS.Sound && DS.Sound.block) DS.Sound.block();
  }
  function perfect(streak, bind, opt = {}) {
    const n = el(`th-perfect${opt.big ? ' big' : ''}`, `<b>✨ PERFECT${streak > 1 ? ` ×${streak}` : ''}</b><span>${bind}초 묶기</span>`, opt.parent);
    setTimeout(() => n.remove(), 1900);
    if (!opt.parent) bindFx(document.querySelector('#st-body .enc-mon .art.monster') || document.querySelector('#st-body .enc-mon'));
  }
  // 🔥 콤보 배지 html (n < 2 이면 빈칸)
  function badge(c, opt = {}) {
    if (!c || c.n < 2) return '';
    const t = c.tier;
    const F = ((DS.ASSETS || {}).thrill || {}).combo, k = { fire: 0, bolt: 1, rainbow: 2, crown: 3 }[t && t.id] || 0; // 콤보 창 그림 (2026-11-05 · 4단계 · 5 아래는 1단계 창을 흐리게)
    const fr = F ? ` fr" style="background-image:url('${DS.ASSETS.base}${F.src}');background-position:${(k / (F.frames - 1)) * 100}% 100%` : '';
    return `<div class="th-combo${t ? ` tier-${t.id}` : ' tier-none'}${opt.big ? ' big' : ''}${c.paused ? ' paused' : ''}${fr}"><b>${F ? c.n : `${t ? t.icon : '🔥'} ${c.n}`}</b><span>COMBO</span><i style="width:${Math.round(c.left * 100)}%"></i></div>`;
  }
  // ⚡ 10 COMBO! · 👑 보스 2단계! 같은 큰 알림
  function note(html, cls = '', ms = 2600, parent) { const n = el(`th-note ${cls}`, html, parent); setTimeout(() => n.remove(), ms); }
  const tierNote = (t, parent) => note(`<p>${t === 30 ? '👑' : t === 20 ? '🌈' : '⚡'} ${t} COMBO!</p><b>몬스터 묶기 +${DS.Combo.TIER_BIND[t]}초</b>`, `tier tier-${t}`, 2600, parent);
  const phaseNote = (ph, parent) => note(`<p>👑 보스 ${ph.phase}단계!</p><b>${ph.phase === 2 ? '보스가 화났다 — 공격 멈춤 3초' : '보스가 비틀거린다 — 공격 멈춤 2초'}</b>`, `phase ph-${ph.phase}`, 3000, parent);

  // 🎁 보물 상자 열기 (폰): 닫힘 → 흔들림 → 열림 → 보상 · 확률 공개
  function chestOpen(r, onClose) {
    if (!r) return;
    const C = DS.Combo.CHEST, prize = `💎 조각 +${r.gem}`;
    const o = el('th-chest-ov', `<div class="th-chest tier-${r.tier}"><p class="th-chest-t">🎁 보물 상자!${r.pity ? ' <small>(오래 기다린 상자 — 확정)</small>' : ''}</p>
      <div class="th-chest-box">${sprite('chest', 0, 'shut')}</div><p class="th-chest-r" hidden><b class="tier-${r.tier}">${esc(r.name)}</b> ${prize}${r.rare ? `<br><small>🏆 영웅 · 전설 상자 ${Math.min(r.rares || 0, C.feathers)} / ${C.feathers} — 5번이면 🌟 황금 날개 이펙트</small>` : ''}</p>
      <details class="th-odds"><summary>상자 확률 보기</summary><p>몬스터를 쓰러뜨릴 때 데미지를 준 용사 <b>${C.p * 100}%</b> (✨ 퍼펙트 3연속 이상이면 +${C.streakBonus * 100}%) · 하루 ${C.day}개 · ${C.pity}수업 연속 못 받으면 다음 첫 처치 때 확정 · 🦇 황금 박쥐를 맞히면 확정</p>
      <ul>${C.table.map((t) => `<li><b class="tier-${t.id}">${t.name}</b> ${Math.round(t.p * 100)}% — 💎 ${t.gem[0] === t.gem[1] ? t.gem[0] : `${t.gem[0]}~${t.gem[1]}`}</li>`).join('')}</ul></details>
      <button class="btn primary" hidden>좋아요!</button></div>`);
    const box = o.querySelector('.th-chest-box'), res = o.querySelector('.th-chest-r'), btn = o.querySelector('button');
    setTimeout(() => { box.innerHTML = sprite('chest', 1, 'shake'); if (DS.Sound) DS.Sound.clank(); }, 450);
    setTimeout(() => { box.innerHTML = sprite('chest', 2, 'open') + '<i class="th-burst"></i>'; res.hidden = false; btn.hidden = false; if (DS.Sound) DS.Sound.correct(); }, 1500);
    btn.onclick = () => { o.remove(); if (onClose) onClose(); };
  }

  // 🦇 황금 박쥐 (폰): 20초 OX — 내가 고르면 「기다려요」 · 끝나면 결과
  function batPhone(b, mine, onPick) {
    let o = document.getElementById('th-bat');
    if (!b) { if (o) o.remove(); return; }
    const sig = `${b.at}|${b.live}|${mine || ''}|${b.live ? '' : b.rightN}`;
    if (!o) { o = el('th-bat-ov', '', document.body); o.id = 'th-bat'; }
    if (o.dataset.sig !== sig) {
      o.dataset.sig = sig;
      const q = b.q || { t: '', a: true };
      const res = b.live ? '' : b.ok ? `<p class="th-bat-ok">🦇 포획 성공! <small>${b.rightN}명 / 필요 ${b.need}명</small></p><p>반 전체 💎 +${DS.Combo.BAT.gem} · 🔥 콤보 +${DS.Combo.BAT.combo} · ⛓ ${DS.Combo.BAT.bind}초 묶기${mine && (mine === 'o') === !!q.a ? '<br><b class="gold">맞힌 용사에게 🎁 상자!</b>' : ''}</p>` : `<p class="th-bat-no">🦇 놓쳤다… <small>${b.rightN}명 / 필요 ${b.need}명</small></p>`;
      o.innerHTML = `<div class="th-bat">${sprite('bat', b.live ? 0 : b.ok ? 3 : 0, b.live ? 'flap' : b.ok ? 'caught' : 'flee')}<p class="th-bat-t">🦇 황금 박쥐 출현! <span data-bat-left>${Math.ceil(b.left / 1000)}</span>초</p>
        <p class="th-bat-q">${DS.UI ? DS.UI.rich(q.t) : esc(q.t)}</p>
        ${b.live ? (mine ? `<p class="muted">✔ ${mine === 'o' ? '⭕' : '❌'} 골랐어요 — 친구들을 기다려요 (응답 ${b.answered}명)</p>` : '<div class="th-bat-btns"><button class="choice sym" data-bat="o">⭕</button><button class="choice sym" data-bat="x">❌</button></div><p class="muted small">반 친구 30%가 맞히면 박쥐를 잡아요!</p>') : `${res}<p class="muted small">정답: ${q.a ? '⭕' : '❌'} — ${esc(q.why || '')}</p><button class="btn" data-bat-x>✕ 닫기</button>`}</div>`;
      o.querySelectorAll('[data-bat]').forEach((x) => (x.onclick = () => onPick(x.dataset.bat)));
      const cx = o.querySelector('[data-bat-x]'); if (cx) cx.onclick = () => { o.remove(); batClosed[b.at] = true; };
      if (!b.live) setTimeout(() => { batClosed[b.at] = true; const e = document.getElementById('th-bat'); if (e && e.dataset.sig === sig) e.remove(); }, 6000); // 결과는 6초 뒤 저절로 닫힘 (문제 화면을 가리지 않게)
    }
    const t = o.querySelector('[data-bat-left]'); if (t) t.textContent = Math.ceil(b.left / 1000);
  }
  const batClosed = {};
  const batShut = (b) => !!(b && batClosed[b.at]);
  // 🦇 종합상황실: 박쥐가 장면 위를 날아다님 · 남은 초 · 응답 수 → 결과
  function batHall(arena, b) {
    let o = arena && arena.querySelector('.th-bat-hall');
    if (!b || !arena || hallDone[b.at]) { if (o) o.remove(); return; }
    if (!o) { o = el('th-bat-hall', '', arena); }
    const sig = `${b.at}|${b.live}`;
    if (o.dataset.sig !== sig) {
      o.dataset.sig = sig;
      o.innerHTML = b.live ? `<div class="th-bat-fly">${sprite('bat', 0, 'flap')}</div><div class="th-bat-card"><p>🦇 황금 박쥐 출현! 📱 폰을 보세요</p><b class="th-bat-q">${DS.UI ? DS.UI.rich((b.q || {}).t || '') : ''}</b><p><span data-bl></span>초 · 응답 <span data-ba></span>명 · 30% 가 맞히면 포획!</p></div>`
        : `<div class="th-bat-card ${b.ok ? 'ok' : 'no'}">${sprite('bat', b.ok ? 3 : 0, b.ok ? 'caught' : 'flee')}<p>${b.ok ? '🦇 포획 성공!' : '🦇 놓쳤다…'}</p><b>${b.rightN}명 맞힘 / 필요 ${b.need}명 · 정답 ${(b.q || {}).a ? '⭕' : '❌'}</b>${b.ok ? `<p>반 전체 💎 +${DS.Combo.BAT.gem} · 🔥 +${DS.Combo.BAT.combo} · ⛓ ${DS.Combo.BAT.bind}초</p>` : ''}</div>`;
      if (!b.live) setTimeout(() => { hallDone[b.at] = true; if (o.dataset.sig === sig) o.remove(); }, 7000);
    }
    const l = o.querySelector('[data-bl]'), a = o.querySelector('[data-ba]');
    if (l) l.textContent = Math.ceil(b.left / 1000); if (a) a.textContent = b.answered;
  }
  const hallDone = {};
  // ⛓ 종합상황실: 몬스터에 쇠사슬 + 숫자
  function chain(mon, sec, why) {
    if (!mon || !sec) return;
    const c = el(`th-chain${why === 'pf' ? ' pf' : ''}${why === 'ult' ? ' ult' : ''}`, `<b>+${sec}초 ${why === 'ult' ? '대묶기!' : '묶기'}</b>`, mon); setTimeout(() => c.remove(), 1800);
    bindFx(mon, why === 'ult');
  }
  // 🗿 석화 (🌟 진필살기 · 2026-11-06): 몬스터가 회색 돌로 굳으며 금이 감 (연출 · 굳은 상태는 화면에서 .petrified 로 유지)
  function petrify(mon) {
    if (!mon || !mon.isConnected) return;
    const box = mon.closest('.enc-mon') || mon.parentElement || mon; box.classList.add('petrified');
    const c = el('th-petri', '<i></i><i></i><i></i><b>🗿 석화!</b>', box); setTimeout(() => c.remove(), 2200);
    if (DS.Sound && DS.Sound.hit) { DS.Sound.hit(); setTimeout(() => DS.Sound.hit(), 180); }
  }
  return { bindFx, sprite, perfect, badge, note, tierNote, phaseNote, chestOpen, batPhone, batShut, batHall, chain, petrify };
})();
