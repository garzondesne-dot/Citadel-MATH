// 교사 기기(교사 폰·종합상황실)가 함께 쓰는 조각: ◀ / ▶ 진행 · 기준% 조절 · 이름 표시
window.DS = window.DS || {};

DS.Control = (function () {
  const { esc } = DS.UI;
  const Act = () => DS.Act, Raid = () => DS.Raid;
  const name = (R, u) => (u === R.meta.teacher ? '선생님' : `${(R.players[u] || {}).num}번 ${(R.players[u] || {}).nick || ''}`);
  async function run(fn) {
    try { await fn(); } catch (e) { DS.UI.toast(e.message || String(e), 3200); if (!e.user) console.error(e); }
  }
  const stepName = (L, R) => {
    if (Raid().isLobby(R)) return '대기실 (입장)';
    if (Raid().isClosed(R)) return '수업 끝';
    if (Raid().isEnd(L, R)) return FINALE;
    return Raid().stepOf(L, R).title;
  };
  const FINALE = '마무리 · 마지막 한마디';
  const nextName = (L, R) => {
    const i = R.state.step ?? -1;
    if (i < 0) return '수업 시작';
    if (Raid().isClosed(R)) return '—';
    if (i >= L.steps.length) return '수업 끝 (학생은 모닥불로)';
    if (i + 1 >= L.steps.length) return FINALE;
    return L.steps[i + 1].title;
  };
  // 오른쪽 수업 순서 목록 (마무리 포함)
  const stepTitles = (L) => L.steps.map((s) => ({ title: s.title, sp: !!s.special })).concat([{ title: FINALE, sp: false }]);

  // ▶ 를 눌렀을 때: 몬스터가 아직 남았으면 확인을 한 번 더 받는다 (미제출 → 빼고 판정 / 체력 남음 → 그래도 넘어가기)
  let armed = '';
  async function forward(code, R, L) {
    if (Raid().isFinale(L, R)) return forwardEnd(code, R, L);
    const step = Raid().stepOf(L, R);
    if (step && step.kind === 'monster' && !Raid().cleared(L, R, step.id)) {
      const wait = Raid().waiting(L, R, step.id);
      const key = `${R.state.step}|${wait.length}`;
      if (wait.length) {
        if (armed !== key) { armed = key; DS.UI.toast(`아직 안 낸 학생 ${wait.length}명: ${wait.map((u) => `${R.players[u].num}번`).join(', ')} — ▶ 를 한 번 더 누르면 빼고 판정해요`, 4200); return; }
        armed = '';
        await Act().skip(code, step.id, wait);
        DS.UI.toast('미제출 학생을 빼고 판정했어요.');
        return;
      }
      const hp = Raid().monsterHp(L, R, step.id);
      if (armed !== key + 'hp') { armed = key + 'hp'; DS.UI.toast(`몬스터 체력이 ${hp.left} 남았어요. 기준%를 낮추거나, ▶ 를 한 번 더 누르면 그대로 넘어가요`, 4200); return; }
    }
    armed = '';
    await Act().go(code, R, L, 1);
  }
  const back = (code, R, L) => { armed = ''; if (Raid().isClosed(R)) return DS.Net.set(`rooms/${code}/state/closed`, null); return Act().go(code, R, L, -1); };
  // 마무리에서 ▶ = 수업 끝: 한 번 더 확인
  async function forwardEnd(code, R, L) {
    if (armed !== 'end') { armed = 'end'; DS.UI.toast('▶ 를 한 번 더 누르면 수업을 끝내고 학생들은 모닥불로 돌아가요', 4200); return true; }
    armed = ''; await Act().go(code, R, L, 1); return true;
  }
  // 🏕 쉼터 버튼 (아무 단계에서나): 켜면 종합상황실 · 학생 폰이 쉼터 장면 · 끄면 하던 단계로 · 타이머는 교사가 −1 / +1 분 (기본 5분)
  const restLeft = (R) => { const r = (R.state || {}).rest; return r ? Math.max(0, Math.round(((r.at || 0) + (r.min || 5) * 60000 - DS.Net.now()) / 1000)) : 0; };
  const restEnd = (R) => { const r = (R.state || {}).rest; return r ? (r.at || 0) + (r.min || 5) * 60000 : 0; };
  // 쉼터 타이머: 화면에 있는 [data-rest-end] 를 1초마다 고침 (끝나도 자동으로 넘어가지 않음 · 0:00 이 되면 깜빡)
  if (typeof document !== 'undefined') setInterval(() => document.querySelectorAll('[data-rest-end]').forEach((e) => { const s = Math.max(0, Math.round((Number(e.dataset.restEnd) - DS.Net.now()) / 1000)); e.textContent = mmss(s); e.classList.toggle('over', s === 0); }), 1000);
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const restBtn = (R) => Raid().restOn(R)
    ? `<div class="rest-ctl"><button class="btn primary rest-btn on" data-rest>▶ 쉼터 끝 · 수업으로</button><span class="rest-t">⏱ <b data-rest-end="${restEnd(R)}">${mmss(restLeft(R))}</b></span><button class="btn small" data-rest-min="-1">−1분</button><button class="btn small" data-rest-min="1">+1분</button></div>`
    : '<button class="btn rest-btn" data-rest>🏕 쉼터 (잠깐 쉬기 · 5분)</button>';
  // 🖥 종합상황실 아이콘 막대 (2026-11-04 사용자 요청 「버튼이 많아져 복잡」): 같은 기능을 아이콘 + 짧은 글자 (마우스를 올리면 설명)
  //   쉼터 중에는 [▶ 수업으로 · ⏱ · −1 · +1] 만
  function iconBar(L, R, videos, demo) {
    if (Raid().restOn(R)) return `<div class="ic-bar rest"><button class="icb wide on" data-rest title="쉼터를 끝내고 하던 단계로">▶<small>수업으로</small></button><span class="icb-t">⏱ <b data-rest-end="${restEnd(R)}">${mmss(restLeft(R))}</b></span><button class="icb" data-rest-min="-1" title="쉼터 1분 줄이기">−1<small>분</small></button><button class="icb" data-rest-min="1" title="쉼터 1분 늘리기">+1<small>분</small></button></div>`;
    const st = Raid().stepOf(L, R), fight = st && (st.kind === 'monster' || st.kind === 'boss');
    const vid = st && DS.Video.ok(DS.Video.pick(L, videos, st.id)), von = vid && Raid().videoOn(R, st.id);
    const b = (attr, ic, cap, tip, on) => `<button class="icb${on ? ' on' : ''}" ${attr} title="${tip}">${ic}<small>${cap}</small></button>`;
    return `<div class="ic-bar">${b('data-rest', '🏕', '쉼터', '쉼터 — 잠깐 쉬기 (기본 5분)')}${vid ? b(`data-video="${st.id}"`, '🎬', von ? '닫기' : '영상', von ? '설명 영상 닫기' : '설명 영상 틀기 (큰 화면)', von) : ''}${fight ? b('data-sheet', '📄', Raid().sheetOn(R) ? '레이드' : '문제', Raid().sheetOn(R) ? '레이드 화면으로' : '문제 화면 (학습지 해설)', Raid().sheetOn(R)) : ''}${b('data-focus', '🔴', '집중', Raid().focusOn(R) ? '집중모드 끄기' : '집중모드 켜기 (학생 폰 잠깐 멈춤)', Raid().focusOn(R))}${fight && demo ? b('id="h-demo"', '🎮', '시연', st.kind === 'boss' ? '시연: 형성평가 풀어 보기' : '시연: 문제 풀어 보기') : ''}</div>`;
  }
  const bindRest = (el, code, R) => {
    el.querySelectorAll('[data-rest]').forEach((b) => (b.onclick = () => run(() => Act().setRest(code, !Raid().restOn(R), 5))));
    el.querySelectorAll('[data-rest-min]').forEach((b) => (b.onclick = () => run(() => Act().setRestMin(code, (((R.state || {}).rest || {}).min || 5) + Number(b.dataset.restMin)))));
  };
  const focusBtn = (R) => `<button class="btn focus-btn${Raid().focusOn(R) ? ' on' : ''}" data-focus>${Raid().focusOn(R) ? '🔴 집중모드 끄기' : '🔴 집중모드 켜기'}</button>`;
  // 📄 문제 화면 버튼 (문제 · 보강 · 형성평가 단계에서만)
  const sheetBtn = (L, R) => { const st = Raid().stepOf(L, R); return st && (st.kind === 'monster' || st.kind === 'boss') ? `<button class="btn sheet-btn${Raid().sheetOn(R) ? ' on' : ''}" data-sheet>${Raid().sheetOn(R) ? '⚔ 레이드 화면으로' : '📄 문제 화면 (학습지 해설)'}</button>` : ''; };
  const bindSheet = (el, code, R) => el.querySelectorAll('[data-sheet]').forEach((b) => (b.onclick = () => run(() => Act().setSheet(code, !Raid().sheetOn(R)))));
  // 🎬 설명 영상 버튼 (v0.8.6): 수업 준비에서 이 단계에 영상 링크를 넣었을 때만. 누르면 종합상황실에 크게 재생 · 한 번 더 누르면 닫기 (이미지는 그대로)
  const videoBtn = (L, R, videos) => { const st = Raid().stepOf(L, R); if (!st || !DS.Video.ok(DS.Video.pick(L, videos, st.id))) return ''; const on = Raid().videoOn(R, st.id);
    return `<button class="btn video-btn${on ? ' on' : ''}" data-video="${st.id}">${on ? '🎬 영상 닫기' : '🎬 설명 영상 틀기 (큰 화면)'}</button>`; };
  const bindVideo = (el, code, R) => el.querySelectorAll('[data-video]').forEach((b) => (b.onclick = () => run(() => Act().setVideoOn(code, Raid().videoOn(R, b.dataset.video) ? null : b.dataset.video))));
  const bindFocus = (el, code, R) => el.querySelectorAll('[data-focus]').forEach((b) => (b.onclick = () => run(() => Act().setFocus(code, !Raid().focusOn(R)))));

  // 기준% 조절 (몬스터·보스 단계에서)
  function pctHtml(L, R) {
    const step = Raid().stepOf(L, R);
    if (!step || (step.kind !== 'monster' && step.kind !== 'boss')) return '';
    const hp = step.kind === 'boss' ? Raid().bossHp(L, R) : Raid().monsterHp(L, R, step.id);
    return `<div class="pct-row"><span>기준</span><button class="btn" data-pct="-5">−5</button><b class="pct-val">${hp.pct}%</b><button class="btn" data-pct="5">+5</button><span class="muted small">체력 ${hp.left}/${hp.max}</span></div>`;
  }
  function bindPct(el, code, R, L) {
    const step = Raid().stepOf(L, R);
    el.querySelectorAll('[data-pct]').forEach((b) => (b.onclick = () => run(() => Act().setPct(code, step.id, Raid().pctOf(L, R, step.id) + Number(b.dataset.pct)))));
  }

  // 마지막 한마디 관리: 욕설 걸린 것 맨 위 · 숨김(오늘만) · 🔒(다음 차시에도 이 학생 한마디 잠금)
  function wordsHtml(R) {
    const W = Object.entries(R.words || {}).filter(([u]) => R.players[u]).sort((a, b) => (b[1].bad ? 1 : 0) - (a[1].bad ? 1 : 0) || R.players[a[0]].num - R.players[b[0]].num);
    if (!W.length) return '<p class="muted small">💬 아직 남긴 한마디가 없어요</p>';
    return `<p class="gold small">💬 말풍선 관리 <span class="muted">숨김 = 오늘만 · 🔒 = 다음 차시에도 잠금</span></p><div class="wlist">${W.map(([u, w]) => { const p = R.players[u], hid = (R.hide || {})[u];
      return `<div class="wrow${w.bad ? ' bad' : ''}${hid ? ' hid' : ''}"><span>${p.num} ${esc(p.nick)}: ${esc(w.t)}</span><button class="btn small" data-hide="${u}">${hid ? '보이기' : '숨김'}</button>${p.cls ? `<button class="btn small" data-lock="${u}">🔒</button>` : ''}</div>`; }).join('')}</div>`;
  }
  function bindWords(el, code, R) {
    el.querySelectorAll('[data-hide]').forEach((b) => (b.onclick = () => run(() => Act().hideWord(code, b.dataset.hide, !(R.hide || {})[b.dataset.hide]))));
    el.querySelectorAll('[data-lock]').forEach((b) => (b.onclick = () => run(async () => {
      const p = R.players[b.dataset.lock];
      if (!confirm(`${p.num}번 ${p.nick} 의 한마디를 다음 차시에도 잠글까요? (수업 준비 화면에서 풀 수 있어요)`)) return;
      await Act().hideWord(code, b.dataset.lock, true); await Act().lockWords(p.cls, p.num, true); DS.UI.toast('잠갔어요.');
    })));
  }

  return { iconBar, restBtn, bindRest, restLeft, restEnd, mmss, name, run, wordsHtml, bindWords, stepName, nextName, stepTitles, FINALE, forward, back, pctHtml, bindPct, focusBtn, bindFocus, sheetBtn, bindSheet, videoBtn, bindVideo, esc };
})();
