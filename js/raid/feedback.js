// 💬 의견 보내기 (2026-11-06 사용자 「피드백 기능 · 버그 리포트 · 선생님에게 하고 싶은 말 · 무엇이든」)
//   학생: 캠프 「💬 의견 보내기」 · 던전 머리말 💬 → 종류(🐞 버그 · 💡 아이디어 · 💌 선생님께 · ❓ 기타) + 글 (400자) → fb/{반}/{번호}/{id}
//   교사: 교사 메뉴 「💬 학생 의견」 → 최근 순 목록 · 안 읽은 수 · 지우기 (읽음 표시는 이 기기)
//   보낼 때 화면 · 판(버전) · 수업 코드를 함께 적어 버그를 찾기 쉽게 · 하루 5번까지 (이 기기)
window.DS = window.DS || {};

DS.Feedback = (function () {
  const N = () => DS.Net, { esc } = DS.UI;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const KINDS = [['bug', '🐞 버그'], ['idea', '💡 아이디어'], ['love', '💌 선생님께'], ['etc', '❓ 기타']];
  const DAY_MAX = 5;
  const dayKey = () => { const d = new Date(Date.now() + 9 * 3600e3); return `citadel-fb-${d.getUTCFullYear()}${d.getUTCMonth() + 1}${d.getUTCDate()}`; };
  const used = () => { try { return Number(localStorage.getItem(dayKey())) || 0; } catch (e) { return 0; } };

  // 학생 보내기 창 · m = { c, n, name } · ctx = { code, where }
  function open(m, ctx = {}) {
    if (!m || m.c == null || !m.n) { DS.UI.toast('로그인한 학생만 보낼 수 있어요.'); return; }
    let kind = ctx.kind || 'bug';
    const el = document.createElement('div'); el.className = 'modal camp-modal fb-modal'; document.body.appendChild(el);
    const draw = (txt = '') => {
      el.innerHTML = `<div class="quiz-box framed fb-box"><div class="set-head"><h2>💬 의견 보내기</h2><button class="btn" id="fb-x">✕ 닫기</button></div>
        <p class="muted small">버그 · 하고 싶은 말 · 이런 게 있으면 좋겠다 — 무엇이든 선생님만 읽어요. (하루 ${DAY_MAX}번 · 오늘 ${used()}번 보냄)</p>
        <div class="fb-kinds">${KINDS.map(([k, n]) => `<button class="btn${k === kind ? ' on' : ''}" data-k="${k}">${n}</button>`).join('')}</div>
        <textarea id="fb-t" maxlength="400" rows="6" placeholder="${kind === 'bug' ? '어디서 · 무엇을 눌렀더니 · 어떻게 됐는지 적어 주면 빨리 고칠 수 있어요' : kind === 'idea' ? '이런 기능 · 이런 몬스터 · 이런 스킬이 있으면 좋겠어요!' : kind === 'love' ? '선생님께 하고 싶은 말' : '무엇이든'}">${esc(txt)}</textarea>
        <div class="row"><span class="muted small" id="fb-n">0 / 400</span><button class="btn primary" id="fb-send">📨 보내기</button></div></div>`;
      const ta = el.querySelector('#fb-t'), cnt = el.querySelector('#fb-n'); ta.oninput = () => { cnt.textContent = `${ta.value.length} / 400`; }; ta.oninput();
      el.querySelector('#fb-x').onclick = () => el.remove();
      el.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => { kind = b.dataset.k; draw(ta.value); }));
      el.querySelector('#fb-send').onclick = () => DS.Control.run(async () => {
        const t = ta.value.trim(); if (t.length < 2) { DS.UI.toast('조금만 더 적어 주세요.'); return; }
        if (used() >= DAY_MAX) { DS.UI.toast(`오늘은 ${DAY_MAX}번 다 보냈어요 — 내일 또 보내 주세요!`); return; }
        const scr = (document.querySelector('.screen.active') || {}).id || '';
        const item = { k: kind, t: t.slice(0, 400), at: N().TS, v: String(DS.VERSION || '').replace(/^citadel-/, ''), scr, ...(ctx.code ? { code: String(ctx.code) } : {}), ...(m.name ? { name: String(m.name).slice(0, 8) } : {}) };
        const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; await N().set(`fb/${ck(m.c)}/${m.n}/${id}`, item);
        try { localStorage.setItem(dayKey(), String(used() + 1)); } catch (e) { /* 이 기기만 */ }
        el.remove(); if (DS.Sound && DS.Sound.correct) DS.Sound.correct(); DS.UI.toast('📨 보냈어요! 선생님이 꼭 읽을게요.', 3000);
      });
      setTimeout(() => ta.focus(), 50);
    };
    draw();
  }

  // 교사: 모든 반 의견 (최근 순)
  async function all() {
    const v = (await N().get('fb').catch(() => null)) || {}, out = [];
    Object.entries(v).forEach(([c, byN]) => Object.entries(byN || {}).forEach(([n, byId]) => Object.entries(byId || {}).forEach(([id, x]) => { if (x && x.t) out.push({ ...x, c, n: Number(n), id }); })));
    return out.sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
  }
  const SEEN = 'citadel-fb-seen';
  const seen = () => { try { return Number(localStorage.getItem(SEEN)) || 0; } catch (e) { return 0; } };
  async function unread() { const s = seen(); return (await all()).filter((x) => Number(x.at) > s).length; }
  async function teacher() {
    const list = await all(), s = seen(), K = Object.fromEntries(KINDS);
    const when = (t) => { const d = new Date(Number(t) + 9 * 3600e3); return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };
    const el = document.createElement('div'); el.className = 'modal fb-modal'; document.body.appendChild(el);
    let filt = '';
    const draw = (items) => {
      const shown = items.filter((x) => !filt || x.k === filt);
      el.innerHTML = `<div class="quiz-box framed fb-box wide"><div class="set-head"><h2>💬 학생 의견 <small class="muted">${items.length}개 · 새 의견 ${items.filter((x) => Number(x.at) > s).length}</small></h2><button class="btn" id="fb-x">✕ 닫기</button></div>
        <div class="fb-kinds"><button class="btn${filt ? '' : ' on'}" data-f="">전체</button>${KINDS.map(([k, n]) => `<button class="btn${filt === k ? ' on' : ''}" data-f="${k}">${n} ${items.filter((x) => x.k === k).length}</button>`).join('')}</div>
        <div class="fb-list">${shown.map((x) => `<div class="fb-item${Number(x.at) > s ? ' new' : ''}"><div class="fb-meta"><b>${esc(K[x.k] || x.k)}</b> · ${esc(x.c)}반 ${x.n}번 ${esc(x.name || '')} · ${when(x.at)}${x.v ? ` · v${esc(x.v)}` : ''}${x.scr ? ` · ${esc(String(x.scr).replace('screen-', ''))}` : ''}${x.code ? ` · 수업 ${esc(x.code)}` : ''}<button class="btn small fb-del" data-del="${esc(x.c)}|${x.n}|${esc(x.id)}">지우기</button></div><p>${esc(x.t)}</p></div>`).join('') || '<p class="muted">아직 의견이 없어요.</p>'}</div></div>`;
      el.querySelector('#fb-x').onclick = () => el.remove();
      el.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { filt = b.dataset.f; draw(items); }));
      el.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { if (!confirm('이 의견을 지울까요?')) return; const [c, n, id] = b.dataset.del.split('|'); await N().remove(`fb/${ck(c)}/${n}/${id}`); draw(items.filter((x) => !(x.c === c && String(x.n) === n && x.id === id))); })));
    };
    draw(list);
    try { localStorage.setItem(SEEN, String(Date.now())); } catch (e) { /* 이 기기만 */ }
  }
  return { open, teacher, unread, all, KINDS };
})();
