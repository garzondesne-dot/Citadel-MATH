// 🏕 캠프 장면 v2 (2026-11-03 사용자 확정 · 학생 모닥불 · 교사 캠프 공통): 달빛 숲 야영지 + 먼 성채
// - 그림에 있는 것을 누르는 자리(zone)로: 🏰 성채 = 중단원던전 · ⛺ 텐트 = 책장 · ⚔ 오른쪽 아치 문 = 차시 던전
// - 차시 문: 수업이 열리면 활성 판의 문 · 계단 · 빛만 잘라 낸 겹(gateOn)을 서서히 켬 (차시마다 문 그림을 따로 만들지 않음)
// - 성벽 등불 5개 = 2~6차시 층 (같은 높이 한 줄 — 순서 없음): 꺼짐 · 켜짐(열린 층) · 금빛(인장) · 새로 켜짐은 반짝
// - 첨탑 깃발 = 집합 관문(꼭대기 층): 열리면 보라 · 「집합의 지배자」면 금빛
// - 글씨 없이 「만질 수 있는 것」 알리기: 숨쉬는 테두리 빛 · 들어올 때 차례로 한 번 반짝 · 상태가 있을 때만 움직임 · 누르면 이름표
//   (차시 문 이름표만 늘 보임) — 좌표는 배치표 DS.ASSETS.camp (zones · gateOn · lamps · flag), 그림 원본 픽셀 기준
window.DS = window.DS || {};

DS.CampScene = (function () {
  const C = () => DS.ASSETS.camp, base = () => DS.ASSETS.base;
  const W = () => C().size[0], H = () => C().size[1];
  const pct = (v, t) => `${((100 * v) / t).toFixed(2)}%`;
  const box = ([x0, y0, x1, y1]) => `left:${pct(x0, W())};top:${pct(y0, H())};width:${pct(x1 - x0, W())};height:${pct(y1 - y0, H())}`;
  // 그림 위 누르는 자리 (id · 접근성 이름 · 눌렀을 때 이름표)
  const zone = (id, key, label, cls = '') => `<button class="cs-zone cs-int ${cls}" id="${id}" style="${box(C().zones[key])}" aria-label="${label}"><i class="cs-glow"></i><span class="camp-label">${label}</span></button>`;
  // 그림에 붙은 것(성채 · 텐트 · 아치 문)의 얇은 윤곽선 (2026-11-05 · 평소에도 보임 · 누를 수 있다는 표시)
  const outline = () => { const o = C().outline; if (!o) return ''; return `<svg class="cs-ol" viewBox="0 0 ${W()} ${H()}" preserveAspectRatio="none" aria-hidden="true">${Object.entries(o).map(([k, d]) => `<path class="cs-ol-${k}" d="${d}"/>`).join('')}</svg>`; };
  // 장면 겹: 차시 문 빛 · 윤곽선 · 깃발 (배경 위 · 오브젝트 아래)
  function layers() {
    const g = C().gateOn, f = C().flag; // 2026-11-05: 성벽 등불 5개는 없앰 (사용자) — lamps() 는 그릴 것이 없으면 아무것도 안 함
    return `<img class="cs-gate-on" alt="" src="${base()}${g.src}" style="left:${pct(g.x, W())};top:${pct(g.y, H())};width:${pct(g.w, W())}">
      ${outline()}
      <i class="cs-flag" style="left:${pct(f[0], W())};top:${pct(f[1], H())}"></i>`;
  }
  // 등불 상태: states[i] = 'off' | 'on' | 'gold' · fresh = 새로 켜진 칸 (반짝)
  function lamps(stage, states, fresh = []) {
    if (!stage) return;
    stage.querySelectorAll('.cs-lamp').forEach((el, i) => { el.className = `cs-lamp ${states[i] || 'off'}${fresh.includes(i) ? ' fresh' : ''}`; });
  }
  const flag = (stage, st) => { const el = stage && stage.querySelector('.cs-flag'); if (el) el.className = `cs-flag ${st || ''}`; }; // '' · 'open' · 'gold'
  const gate = (stage, on) => { if (stage) stage.classList.toggle('gate-open', !!on); };
  // 들어올 때 한 번: 만질 수 있는 것들이 차례로 반짝 (0.25초 간격)
  function intro(stage) {
    if (!stage) return;
    const items = [...stage.querySelectorAll('.cs-int')];
    items.forEach((el, i) => { el.classList.remove('cs-shine'); el.style.setProperty('--cs-d', `${0.4 + i * 0.25}s`); void el.offsetWidth; el.classList.add('cs-shine'); });
    setTimeout(() => items.forEach((el) => el.classList.remove('cs-shine')), 1400 + items.length * 250);
  }
  // 2~6차시 층 → 등불 상태 (D = DS.Bonus.DUNGEONS[0])
  function floorStates(no, sealed, D) {
    const d = D || (DS.Bonus && DS.Bonus.DUNGEONS[0]) || { from: 2, to: 6 };
    const floors = DS.Lessons.list.filter((l) => l.no >= d.from && l.no <= d.to && !l.eval).sort((a, b) => a.no - b.no);
    return C().lamps.xs.map((_, i) => { const l = floors[i]; if (!l || l.no > no) return 'off'; return (sealed || []).includes(l.id) ? 'gold' : 'on'; });
  }
  // 새로 켜진 등불 (지난번에 본 상태와 비교 · 이 기기에 기억)
  function freshLamps(key, states) {
    let seen = null; try { seen = JSON.parse(localStorage.getItem(key)); } catch (e) { /* 무시 */ }
    try { localStorage.setItem(key, JSON.stringify(states)); } catch (e) { /* 무시 */ }
    return seen ? states.map((s, i) => (s !== 'off' && s !== seen[i] ? i : -1)).filter((i) => i >= 0) : [];
  }
  return { zone, layers, lamps, flag, gate, intro, floorStates, freshLamps, box };
})();
