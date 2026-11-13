// 🔇 소리 버튼 (2026-11-06 사용자 「효과음 · 배경음 음소거 · 언제 어느 순간이든」): 모든 화면 왼쪽 가장자리의 작은 탭
//   누르면 효과음 · 배경음 켜기/끄기 두 칸 · 이 기기에 기억 · 종합실은 교사 리모컨으로도 (state/sound)
window.DS = window.DS || {};

DS.SoundUI = (function () {
  let tab = null, pop = null;
  const S = () => DS.Sound;
  const icon = () => (!S() ? '🔊' : !S().sfxOn && !S().bgmOn ? '🔇' : '🔊'); // 🎵 2026-11-13 선생님 「배경 음악 끄는 기능」: 둘 다 꺼짐 = 🔇 · 하나라도 켜짐 = 🔊
  function draw() {
    if (!tab) return;
    tab.textContent = icon(); tab.classList.toggle('off', !!S() && !S().sfxOn && !S().bgmOn);
    if (pop) pop.innerHTML = `<b>소리</b><button data-k="sfx" class="${S().sfxOn ? 'on' : ''}">🔊 효과음 <i>${S().sfxOn ? '켜짐' : '꺼짐'}</i></button><button data-k="bgm" class="${S().bgmOn ? 'on' : ''}">🎵 배경음 <i>${S().bgmOn ? '켜짐' : '꺼짐'}</i></button><div class="snd-lv">${[['low', '작게'], ['mid', '보통']].map(([k, t]) => `<button data-v="${k}" class="${S().vol === k ? 'on' : ''}">${t}</button>`).join('')}</div>`;
    if (pop) pop.querySelectorAll('[data-v]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); S().setVol(b.dataset.v); S().clank(); }));
    if (pop) pop.querySelectorAll('[data-k]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); if (b.dataset.k === 'sfx') { S().setSfx(!S().sfxOn); if (S().sfxOn) S().clank(); } else S().setBgm(!S().bgmOn); }));
  }
  function close() { if (pop) { pop.remove(); pop = null; } }
  function install() {
    if (tab || typeof document === 'undefined' || !S() || /demo\.html$/.test(location.pathname)) return;
    tab = document.createElement('button'); tab.id = 'snd-tab'; tab.type = 'button'; tab.setAttribute('aria-label', '소리 켜기 · 끄기');
    tab.onclick = (e) => { e.stopPropagation(); if (pop) { close(); return; } pop = document.createElement('div'); pop.id = 'snd-pop'; document.body.appendChild(pop); draw(); };
    document.body.appendChild(tab);
    document.addEventListener('click', (e) => { if (pop && !pop.contains(e.target)) close(); });
    S().onChange(draw); draw();
  }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install(); }
  return { install, close };
})();
