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
    if (i >= L.steps.length) return '수업 끝 (학생은 내 캠프로)';
    if (i + 1 >= L.steps.length) return FINALE;
    return L.steps[i + 1].title;
  };
  // 오른쪽 수업 순서 목록 (마무리 포함)
  const stepTitles = (L) => L.steps.map((s) => ({ title: s.title, sp: !!s.special })).concat([{ title: FINALE, sp: false }]);

  // ▶ 를 눌렀을 때: 몬스터가 아직 남았으면 확인을 한 번 더 받는다 (미제출 → 빼고 판정 / 체력 남음 → 그래도 넘어가기)
  let armed = '';
  async function forward(code, R, L) {
    // 🏕 2026-11-13 선생님 「쉼터상태에서 앞으로누르면 자동으로 수업으로」: 쉼터(놀이 중이어도) = 「쉼터 끝」과 똑같이 닫고(놀이 결과 · 보상 그대로) 이어서 다음 단계
    if (Raid().restOn(R)) { await Act().setRest(code, false); R = Act().unpackRoom(await DS.Net.get(`rooms/${code}`)) || R; }
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
    if ((R.state.step ?? -1) < 0 && DS.Sound && DS.Sound.fx) DS.Sound.fx('class-start', 0.85); // 🔊 2차 📯 수업 시작
    await Act().go(code, R, L, 1);
  }
  const back = (code, R, L, out) => { armed = ''; if (Raid().isClosed(R)) return out ? out() : null; return Act().go(code, R, L, -1); }; // 🏁 #68 C①: 끝난 수업에서 ◀ = 다시 열지 않고 교사 캠프 · 메뉴로 (예전: closed 를 지워 끝난 수업이 다시 열림)
  // 마무리에서 ▶ = 수업 끝: 한 번 더 확인
  async function forwardEnd(code, R, L) {
    armed = ''; if (!confirm(END_ASK)) return true; // 📱 #70: 두 번 누르기 → 확인 한 번
    await Act().go(code, R, L, 1); return true;
  }
  // 🏕 쉼터 버튼 (아무 단계에서나): 켜면 종합상황실 · 학생 폰이 쉼터 장면 · 끄면 하던 단계로 · 타이머는 교사가 −1 / +1 분 (기본 5분)
  const restLeft = (R) => { const r = (R.state || {}).rest; return r ? Math.max(0, Math.round(((r.at || 0) + (r.min || 5) * 60000 - DS.Net.now()) / 1000)) : 0; };
  const restEnd = (R) => { const r = (R.state || {}).rest; return r ? (r.at || 0) + (r.min || 5) * 60000 : 0; };
  // 쉼터 타이머: 화면에 있는 [data-rest-end] 를 1초마다 고침 (끝나도 자동으로 넘어가지 않음 · 0:00 이 되면 깜빡)
  if (typeof document !== 'undefined') setInterval(() => document.querySelectorAll('[data-rest-end]').forEach((e) => { const s = Math.max(0, Math.round((Number(e.dataset.restEnd) - DS.Net.now()) / 1000)); e.textContent = mmss(s); e.classList.toggle('over', s === 0); }), 1000);
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const restBtn = (R) => Raid().restOn(R)
    ? `<div class="rest-ctl"><button class="btn primary rest-btn on" data-rest>▶ ${((R.state || {}).rest || {}).quiz ? 'OX 타임' : '쉼터'} 끝 · 수업으로</button><span class="rest-t">⏱ <b data-rest-end="${restEnd(R)}">${mmss(restLeft(R))}</b></span><button class="btn small" data-rest-min="-1">−1분</button><button class="btn small" data-rest-min="1">+1분</button></div>${DS.Fun ? DS.Fun.ctlHtml(R) : ''}`
    : '<button class="btn rest-btn" data-rest>🏕 쉼터 (잠깐 쉬기 · 5분)</button>'; // 2026-11-05: ⭕ OX 지난 · 오늘은 쉼터 안에서만
  // 🖥 종합상황실 아이콘 막대 (2026-11-04 사용자 요청 「버튼이 많아져 복잡」): 같은 기능을 아이콘 + 짧은 글자 (마우스를 올리면 설명)
  //   쉼터 중에는 [▶ 수업으로 · ⏱ · −1 · +1] 만
  function iconBar(L, R, videos, demo) {
    if (Raid().restOn(R)) return `<div class="ic-bar rest"><button class="icb wide on" data-rest title="쉼터를 끝내고 하던 단계로">▶<small>수업으로</small></button><span class="icb-t">⏱ <b data-rest-end="${restEnd(R)}">${mmss(restLeft(R))}</b></span><button class="icb" data-rest-min="-1" title="쉼터 1분 줄이기">−1<small>분</small></button><button class="icb" data-rest-min="1" title="쉼터 1분 늘리기">+1<small>분</small></button>${DS.Fun ? (R.fun ? '<button class="icb" data-fun="stop" title="밸런스 게임 끝">⏹<small>게임 끝</small></button>' : '<button class="icb" data-fun="start:bal" title="밸런스 게임 — 적은 쪽 탈락">⚖<small>밸런스</small></button><button class="icb" data-fun="start:rev" title="반대로 밸런스 — 많은 쪽 탈락">🔄<small>반대로</small></button><button class="icb" data-fun="start:ox" title="수학 OX — 틀리면 탈락">⭕<small>OX</small></button><button class="icb" data-fun="start:nun" title="눈치 게임 — 1부터 차례로 · 겹치면 탈락">🙊<small>눈치</small></button><button class="icb" data-oxq="prev" title="OX 타임 — 지난 차시 복습 5문장 (탈락 없음)">⭕<small>OX 지난</small></button><button class="icb" data-oxq="now" title="OX 타임 — 이번 차시 점검 5문장 (탈락 없음)">⭕<small>OX 오늘</small></button>') : ''}</div>`;
    const st = Raid().stepOf(L, R), fight = st && (st.kind === 'monster' || st.kind === 'boss');
    const vid = st && DS.Video.ok(DS.Video.pick(L, videos, st.id)), von = vid && Raid().videoOn(R, st.id);
    const b = (attr, ic, cap, tip, on) => `<button class="icb${on ? ' on' : ''}" ${attr} title="${tip}">${ic}<small>${cap}</small></button>`;
    return `<div class="ic-bar">${b('data-rest', '🏕', '쉼터', '쉼터 — 잠깐 쉬기 (기본 5분)')}${vid ? b(`data-video="${st.id}"`, '🎬', von ? '닫기' : '영상', von ? '설명 영상 닫기' : '설명 영상 틀기 (큰 화면)', von) : ''}${fight ? b('data-sheet', '📄', Raid().sheetOn(R) ? '레이드' : '문제', Raid().sheetOn(R) ? '레이드 화면으로' : '문제 화면 (학습지 해설)', Raid().sheetOn(R)) : ''}${b('data-focus', '🔴', '집중', Raid().focusOn(R) ? '집중모드 끄기' : '집중모드 켜기 (학생 폰 잠깐 멈춤)', Raid().focusOn(R))}${fight && demo ? b('id="h-demo"', '🎮', '시연', st.kind === 'boss' ? '시연: 형성평가 풀어 보기' : '시연: 문제 풀어 보기') : ''}</div>`;
  }
  const bindRest = (el, code, R) => {
    el.querySelectorAll('[data-rest]').forEach((b) => (b.onclick = () => run(() => Act().setRest(code, !Raid().restOn(R), Act().restMinDef ? Act().restMinDef() : 5))));
    el.querySelectorAll('[data-rest-min]').forEach((b) => (b.onclick = () => run(() => Act().setRestMin(code, (((R.state || {}).rest || {}).min || (Act().restMinDef ? Act().restMinDef() : 5)) + Number(b.dataset.restMin)))));
    if (DS.Fun && Raid().restOn(R)) DS.Fun.bind(el, code, R); // ⚖ 밸런스 게임 (v0.9.7.7)
    el.querySelectorAll('[data-oxq]').forEach((b) => (b.onclick = () => run(async () => { // ⭕ OX 타임 (v0.9.8.1): 쉼터처럼 멈춤 → 탈락 없는 OX 5문장
      if (!DS.Fun) return; if (!Raid().restOn(R)) await Act().setRest(code, true, 5, { quiz: true }); else await DS.Net.set(`rooms/${code}/state/rest/quiz`, true).catch(() => {}); await DS.Fun.start(code, R, 'quiz', b.dataset.oxq);
    })));
  };
  // 📱 교사 리모컨 아이콘 4칸 (2026-11-05 사용자 「리모컨 정리」): 쉼터 · 영상 · 문제 · 집중 — 해당 없으면 흐리게 · 쉼터 중에는 쉼터 조절판(OX · 놀이 포함)
  function remoteGrid(L, R, videos) {
    if (Raid().restOn(R)) return restBtn(R);
    const st = Raid().stepOf(L, R), fight = st && (st.kind === 'monster' || st.kind === 'boss');
    const vid = st && DS.Video.ok(DS.Video.pick(L, videos, st.id)), von = vid && Raid().videoOn(R, st.id);
    const t = (attr, ic, cap, on, off) => `<button class="rg-b${on ? ' on' : ''}" ${off ? 'disabled' : attr}><i>${ic}</i><span>${cap}</span></button>`;
    return `<div class="rg">${t('data-rest', '🏕', '쉼터')}${t(vid ? `data-video="${st.id}"` : '', '🎬', von ? '영상 닫기' : '영상', von, !vid)}${t('data-sheet', '📄', Raid().sheetOn(R) ? '레이드로' : '문제', Raid().sheetOn(R), !fight)}${t('data-focus', '🔴', Raid().focusOn(R) ? '집중 끄기' : '집중', Raid().focusOn(R))}</div>`;
  }
  const focusBtn = (R) => `<button class="btn focus-btn${Raid().focusOn(R) ? ' on' : ''}" data-focus>${Raid().focusOn(R) ? '🔴 집중모드 끄기' : '🔴 집중모드 켜기'}</button>`;
  // 📄 문제 화면 버튼 (문제 · 보강 · 형성평가 단계에서만)
  const sheetBtn = (L, R) => { const st = Raid().stepOf(L, R); return st && (st.kind === 'monster' || st.kind === 'boss') ? `<button class="btn sheet-btn${Raid().sheetOn(R) ? ' on' : ''}" data-sheet>${Raid().sheetOn(R) ? '⚔ 레이드 화면으로' : '📄 문제 화면 (학습지 해설)'}</button>` : ''; };
  const bindSheet = (el, code, R) => el.querySelectorAll('[data-sheet]').forEach((b) => (b.onclick = () => run(() => Act().setSheet(code, !Raid().sheetOn(R)))));
  // 🎬 설명 영상 버튼 (v0.8.6): 수업 준비에서 이 단계에 영상 링크를 넣었을 때만. 누르면 종합상황실에 크게 재생 · 한 번 더 누르면 닫기 (이미지는 그대로)
  const videoBtn = (L, R, videos) => { const st = Raid().stepOf(L, R); if (!st || !DS.Video.ok(DS.Video.pick(L, videos, st.id))) return ''; const on = Raid().videoOn(R, st.id);
    return `<button class="btn video-btn${on ? ' on' : ''}" data-video="${st.id}">${on ? '🎬 영상 닫기' : '🎬 설명 영상 틀기 (큰 화면)'}</button>`; };
  const bindVideo = (el, code, R) => el.querySelectorAll('[data-video]').forEach((b) => (b.onclick = () => run(() => Act().setVideoOn(code, Raid().videoOn(R, b.dataset.video) ? null : b.dataset.video))));
  const bindFocus = (el, code, R) => el.querySelectorAll('[data-focus]').forEach((b) => (b.onclick = () => run(() => { const on = !Raid().focusOn(R); if (on && DS.Sound && DS.Sound.fx) DS.Sound.fx('focus', 0.8); return Act().setFocus(code, on); })));

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

  // ⏳ 보스 타임바 (2026-11-05 사용자 확정): 교시 끝 = 👑 보스가 던전 문을 닫는 시각 · 종합상황실 늘 · 리모컨 늘 · 학생 폰은 남은 10분부터
  //   막대 = 남은 시간 (50분 기준) · 👑 보스가 🚪 문 쪽으로 다가옴 · 10분 노랑 · 5분 빨강 · 1분 큰 숫자 · 아래 ⚔ 던전 진행 막대 (진행이 시간보다 앞서면 초록)
  const TB_TOTAL = 50 * 60e3;
  const hm = (ms) => { const d = new Date(ms + 9 * 3600e3); return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };
  function tbarHtml(L, R, opt = {}) {
    const d = Raid().deadline(R); if (!d || Raid().isClosed(R) || Raid().isLobby(R)) return '';
    const prog = Raid().progress(L, R), ext = Number((R.state || {}).extend) || 0, won = Raid().bossHp(L, R).won || Raid().isEnd(L, R);
    const total0 = TB_TOTAL + ext * 60e3, left0 = Math.max(0, d - DS.Net.now()), f0 = (Math.max(0, Math.min(1, left0 / total0)) * 100).toFixed(2), s0 = Math.ceil(left0 / 1000); // 처음 그릴 때부터 제자리 (0 에서 늘어나는 깜빡임 없음)
    return `<div class="tb${opt.mini ? ' mini' : ''}${opt.compact ? ' compact' : ''}${won ? ' won' : ''}" data-dl="${d}" data-total="${TB_TOTAL + ext * 60e3}" data-prog="${prog}"${opt.only ? ` data-only="${opt.only}"` : ''}>
      <div class="tb-row"><span class="tb-t">${won ? '⏰ 시간 안에 클리어!' : `⏳ <b>${hm(d)}</b> 👑 보스가 문을 닫아요`} · 남은 <b class="tb-left">${Math.floor(s0 / 60)}:${String(s0 % 60).padStart(2, '0')}</b></span>${opt.ext && !ext && !won ? '<button class="btn small tb-ext" data-extend>⏰ +5분</button>' : ext ? '<span class="muted small">(+5분 연장)</span>' : ''}</div>
      <div class="tb-bar"><i class="tb-door">🚪</i><div class="tb-fill" style="width:${f0}%"></div><i class="tb-boss" style="left:calc(${f0}% - 10px)">👑</i></div>
      ${opt.prog ? `<div class="tb-prog"><div class="tb-pf" style="width:${(prog * 100).toFixed(1)}%"></div><span>⚔ 던전 진행 ${Math.round(prog * 100)}%</span></div>` : ''}</div>`;
  }
  // 🔄 차시 바꾸기 (2026-11-06 사용자 「차시 변경을 빠르게」): 수업 시작 전(대기실)만 · 같은 코드 그대로 학생 폰 · 종합실이 바로 새 차시로
  const lessonBtn = (R) => (Raid().isLobby(R) && !Raid().isClosed(R) ? '<button class="btn ls-btn" data-lswitch>🔄 차시 바꾸기</button>' : '');
  function lessonPick(code, R) {
    const cur = (R.meta || {}).lesson, list = DS.Lessons.list.filter((x) => /^set-/.test(x.id)).sort((a, b) => (a.no || 0) - (b.no || 0));
    const ov = document.createElement('div'); ov.className = 'modal'; document.body.appendChild(ov);
    ov.innerHTML = `<div class="quiz-box framed ls-box"><div class="set-head"><h2>🔄 차시 바꾸기</h2><button class="btn" data-lsx>✕ 닫기</button></div>
      <p class="muted small">같은 수업 코드 그대로 — 들어와 있는 학생 폰과 종합실이 바로 새 차시로 바뀌어요. (수업 시작 전에만)</p>
      <div class="ls-grid">${list.map((x) => `<button class="btn${x.id === cur ? ' on' : ''}" data-ls="${x.id}"${x.id === cur ? ' disabled' : ''}><b>${DS.Lessons.noText(x.no)}차시</b>${x.id === cur ? ' · 지금' : ''}<small>${esc(x.title)}</small></button>`).join('')}</div></div>`;
    const close = () => ov.remove();
    ov.querySelector('[data-lsx]').onclick = close; ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov.querySelectorAll('[data-ls]').forEach((b) => (b.onclick = () => run(async () => { await Act().switchLesson(code, R, b.dataset.ls); close(); const L2 = DS.Lessons.get(b.dataset.ls); DS.UI.toast(`🔄 ${DS.Lessons.noText(L2.no)}차시로 바꿨어요 — 학생들은 그대로 기다리면 돼요`); })));
  }
  // 📝 풀이 시간 조절 칸 (2026-11-06): 몬스터 · 형성평가 단계에서 · 켜져 있으면 남은 시간 + 지금 풀기 · +30초 / 꺼져 있으면 켜기 + 기본 초
  function solveHtml(L, R) {
    const st = Raid().stepOf(L, R); if (!st || !['monster', 'boss'].includes(st.kind) || Raid().isClosed(R)) return '';
    const lk = Raid().solveLock(L, R, DS.Net.now()), base = (R.state || {}).solve != null ? Number(R.state.solve) : (R.meta || {}).solve != null ? Number(R.meta.solve) : 60;
    // 🌫 2026-11-09 #17: 「❄ 학생 60초 얼리기」 버튼은 없앰 → 몬스터마다 정찰 (기본 60초) · 준비 완료가 많으면 「⚔ 등장!」
    const rd = lk ? Raid().readyOf(R, lk.id).length : 0, all = Raid().activeIds(R).filter((u) => u !== (R.meta || {}).teacher).length;
    return `<div class="sl-row${lk && lk.on ? ' sl-scout' : ''}">${lk && lk.on ? `<p class="sl-info">🌫 정찰 중 · 등장까지 <b class="sl-left" data-sl-end="${lk.end - lk.cur}"${lk.frz ? ` data-fz="${(R.state || {}).fzAt}"` : ''}>${Math.ceil(lk.left / 1000)}초</b> · ✋ 준비 <b>${rd}</b> / ${all}</p><div class="sl-btns"><button class="btn" data-sl="cut">−30초</button><button class="btn" data-sl="add">+30초</button><button class="btn primary big sl-now" data-sl="now">⚔ 지금 등장</button></div><button class="btn small" data-sl="add">+30초</button>`
      : `<span>🌫 정찰 시간</span><button class="btn small" data-sl="dn">−30</button><b>${base}초</b><button class="btn small" data-sl="up">+30</button><span class="muted small">다음 몬스터부터</span>`}</div>`;
  }
  const bindSolve = (el, code, R, L) => el.querySelectorAll('[data-sl]').forEach((b) => (b.onclick = () => run(async () => {
    const k = b.dataset.sl, base = (R.state || {}).solve != null ? Number(R.state.solve) : (R.meta || {}).solve != null ? Number(R.meta.solve) : 60;
    if (k === 'now') await Act().setSolve(code, R, L, { now: true });
    else if (k === 'add') await Act().setSolve(code, R, L, { add: 30 });
    else if (k === 'cut') await Act().setSolve(code, R, L, { add: -30 }); // ⏩ 2026-11-09 선생님: 정찰 중 등장 시간 줄이기 (남은 시간이 30초 이하면 바로 등장)
    else if (k === 'on') await Act().setSolve(code, R, L, { on: true, onSec: base || 60 });
    else await Act().setSolve(code, R, L, { sec: Math.max(0, base + (k === 'up' ? 30 : -30)) });
  })));
  // ⚔ 소레이드 리모컨 (2026-11-09 #18): 🙋 확인 필요(남은 기회 1칸 · 잠김) → 「✔ 풀어주기」 · 학생별 지금 단계
  const handSeen = {}; // 🔊 2차 🙋 도움 요청 (❤ 0 잠김이 새로 생길 때 리모컨에서 한 번)
  function handSnd(mid, us) { let nw = false; (us || []).forEach((u) => { const k = `${mid}|${u}`; if (!handSeen[k]) { handSeen[k] = 1; nw = true; } }); if (nw && DS.Sound && DS.Sound.fx && document.getElementById('screen-teacher') && document.getElementById('screen-teacher').classList.contains('active')) DS.Sound.fx('raise-hand', 0.8); }
  function chainHtml(L, R) {
    const st = Raid().stepOf(L, R); if (!st || st.kind !== 'monster') return '';
    if (!Raid().isChain(L, R, st.id)) { // ❤ 2026-11-13 밤: 일반 몬스터도 ❤ 0 = 🙋 잠김 → 「✔ 풀어주기」 (❤ +1)
      const nm0 = (u) => { const p = (R.players || {})[u] || {}; return `${p.num != null ? `${p.num} ` : ''}${p.nick || ''}`; };
      const lk = Raid().activeIds(R).filter((u) => u !== (R.meta || {}).teacher).filter((u) => Raid().record(L, R, st.id, u).locked); handSnd(st.id, lk);
      return lk.length ? `<div class="cr-ctl"><p class="cr-need"><b>🙋 ❤ 0 · 확인 필요 ${lk.length}</b></p>${lk.map((u) => `<div class="cr-lockrow"><span>${esc(nm0(u))} · ${esc(st.title)}</span><button class="btn small primary" data-crok="${u}">✔ 풀어주기</button></div>`).join('')}</div>` : '';
    }
    const ids = Raid().activeIds(R).filter((u) => u !== (R.meta || {}).teacher), recs = ids.map((u) => [u, Raid().record(L, R, st.id, u)]);
    const nm = (u) => { const p = (R.players || {})[u] || {}; return `${p.num != null ? `${p.num} ` : ''}${p.nick || ''}`; }, mark = (r) => (r.done ? (r.perfect ? '🌟' : '👑✔') : r.fail ? '✘' : r.stage === r.n - 1 ? '👑' : '①②③④⑤⑥'[r.stage]);
    const lock = recs.filter(([, r]) => r.locked); handSnd(st.id, lock.map(([u]) => u));
    const n = recs[0] ? recs[0][1].n : 0, by = Array.from({ length: n + 1 }, (_, i) => recs.filter(([, r]) => (i === n ? r.done : !r.done && r.stage === i)).length);
    const dn = Raid().chainDown(L, R, st.id);
    return `<div class="cr-ctl"><p><b>⚔ 소레이드</b> ${by.map((c, i) => `<span>${i === n ? '완료' : i === n - 1 ? '👑' : '①②③④⑤⑥'[i]} ${c}</span>`).join(' · ')}</p>
      <div class="cr-down">${dn.map((d) => `<span class="${d.down ? 'on' : ''}">졸개 ${'①②③④⑤⑥'[d.k]} 넘은 학생 <b>${d.past}</b> / ${d.all}${d.down ? ' 💥 쓰러짐' : ` <button class="btn small" data-crdown="${d.k}">💥 쓰러뜨리기</button>`}</span>`).join('')}</div>
      ${lock.length ? `<p class="cr-need"><b>🙋 확인 필요 ${lock.length}</b></p>${lock.map(([u, r]) => `<div class="cr-lockrow"><span>${esc(nm(u))} · ${r.stage === n - 1 ? '👑 대장' : `졸개 ${'①②③④⑤⑥'[r.stage]}`}에서 막힘</span><button class="btn small primary" data-crok="${u}">✔ 풀어주기</button></div>`).join('')}` : ''}
      <details><summary>학생별 단계</summary><p class="small">${recs.map(([u, r]) => `${esc(nm(u))} ${mark(r)}`).join(' · ')}</p></details></div>`;
  }
  const bindChain = (el, code, R, L) => (el.querySelectorAll('[data-crdown]').forEach((b) => (b.onclick = () => run(async () => { const st = Raid().stepOf(L, R); await Act().chainKnock(code, st.id, Number(b.dataset.crdown)); DS.UI.toast('💥 졸개를 쓰러뜨렸어요'); }))), el.querySelectorAll('[data-crok]')).forEach((b) => (b.onclick = () => run(async () => { const st = Raid().stepOf(L, R); await Act().chainRelease(code, st.id, b.dataset.crok, Raid().relOf(R, st.id, b.dataset.crok) + 1); DS.UI.toast('✔ 풀어 줬어요 · ❤ +1'); })));
  // ⏸ 수업 끝 (저장) — 진행 중이면 늘 (교사 리모컨 · 종합실)
  // 📱 #70 (11/11): 「수업 끝 ▶」 하나 + 확인 한 번 · 끝내면 늘 진행 저장 (마무리까지 왔으면 그 차시 진도도 끝냄) · 교사 메뉴 「▶ 지난 수업 이어서」 · 「다른 단계부터 이어서 ▾」 그대로
  const END_ASK = '수업을 끝낼까요?\n\n진행은 저장돼요 · 다음에 「다른 단계부터 이어서」로 원하는 곳부터 시작할 수 있어요.';
  const saveBtn = (R, L) => (!Raid().isLobby(R) && !Raid().isClosed(R) && !(L && Raid().isEnd(L, R)) ? '<button class="btn t-save" data-saveend>수업 끝 ▶</button>' : '');
  const bindSave = (el, code, R, L) => el.querySelectorAll('[data-saveend]').forEach((b) => (b.onclick = () => run(async () => {
    if (!confirm(END_ASK)) return;
    if (Raid().isEnd(L, R)) { await Act().go(code, R, L, 1); DS.UI.toast('수업을 끝냈어요 — 학생들은 캠프로', 3000); return; } // 마무리 = 그 차시 끝 (진도)
    await Act().saveEnd(code); DS.UI.toast('수업을 끝냈어요 · 진행은 저장했어요 — 다음 시간에 이어서!', 3600);
  })));
  const bindLesson = (el, code, R) => el.querySelectorAll('[data-lswitch]').forEach((b) => (b.onclick = () => lessonPick(code, R)));
  const timeUpFns = {};
  const onTimeUp = (key, fn) => { if (fn) timeUpFns[key] = fn; else delete timeUpFns[key]; };
  const tbSeen = {}; // 마감 시각별 마지막 단계 (2026-11-06 검증: 막대를 새로 그려도 알림을 놓치지 않게 · 같은 시각 막대가 여러 개여도 한 번만)
  function tbTick() {
    const now = DS.Net.now(); let lastMin = false;
    document.querySelectorAll('.tb[data-dl]').forEach((e) => {
      const dl = Number(e.dataset.dl), total = Number(e.dataset.total) || TB_TOTAL, left = Math.max(0, dl - now), frac = Math.max(0, Math.min(1, left / total));
      const only = Number(e.dataset.only || 0); e.hidden = !!only && left > only * 60e3 && !e.classList.contains('won');
      const s = Math.ceil(left / 1000), t = e.querySelector('.tb-left'); if (t) t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      const f = e.querySelector('.tb-fill'); if (f) f.style.width = `${(frac * 100).toFixed(2)}%`;
      const b = e.querySelector('.tb-boss'); if (b) b.style.left = `calc(${(frac * 100).toFixed(2)}% - 10px)`;
      e.classList.toggle('warn', left <= 10 * 60e3); e.classList.toggle('hot', left <= 5 * 60e3); e.classList.toggle('last', left <= 60e3 && left > 0);
      // ⏰ 10 · 5 · 1분 남음 알림 (2026-11-06 사용자 「시간 제한 연출이 없음」): 그 순간 한 번 · 종합실 = 큰 알림 · 폰 = 작은 알림 · 마지막 1분 = 화면 테두리 붉게
      if (!e.classList.contains('won') && e.closest('.screen.active')) { // 2026-11-06 검증: 지금 보이는 화면의 막대만 (수업 끝난 뒤 캠프에 남은 옛 막대가 울리지 않게)
        const ms = left <= 0 ? 0 : left <= 60e3 ? 1 : left <= 5 * 60e3 ? 5 : left <= 10 * 60e3 ? 10 : 99, was = tbSeen[dl] != null ? tbSeen[dl] : null; tbSeen[dl] = ms;
        if (was != null && ms < was && ms > 0) tbAlert(ms, e);
        if (ms === 1) lastMin = true;
      }
      const pf = e.querySelector('.tb-pf'); if (pf) pf.parentElement.classList.toggle('behind', Number(e.dataset.prog) + 0.02 < 1 - frac);
    });
    document.querySelectorAll('[data-sl-end]').forEach((e) => { const l = Math.max(0, Number(e.dataset.slEnd) - (e.dataset.fz ? Number(e.dataset.fz) : now)); e.textContent = `${Math.ceil(l / 1000)}초`; }); // 📝 풀이 시간 남은 초
    document.body.classList.toggle('tb-last-min', lastMin); // 이긴 뒤 · 수업 끝 · 화면 바뀜이면 붉은 테두리 끔
    Object.values(timeUpFns).forEach((fn) => { try { fn(now); } catch (err) { console.error(err); } });
    try { doorPaint(); } catch (err) { console.error(err); } // ⏰ #68 A 남은 초
  }

  // ⏰ #68 A 보스 문 닫기 장면 (2026-11-11 선생님 「추천대로」): 마감(50분 · 연장 뒤 55분) → 그 차시 보스가 문 앞에 · 15초 「5분 연장할까요?」
  //   리모컨 · 종합실 = [+5분 연장] · [그대로 닫기] · 학생 폰 = 위쪽 띠(풀기는 계속) · 15초 지남 · 그대로 닫기 = 끝 · 연장을 이미 썼으면 묻지 않고 닫힘 장면(3.5초)만
  //   보스를 이겼거나 마무리 단계면 장면 없이 평소처럼 끝 · 새 그림 없음(차시 보스 · 선생님 용사 도트) · transform/opacity 만
  const DOOR_ASK = 15e3, DOOR_SHUT = 3500, DOOR_EXT = 6000;
  const doorBoss = (L) => { const b = (L && L.boss) || {}; return { name: String(b.title || '보스').split('·').pop().trim() || '보스', sprite: b.sprite || '' }; };
  function doorState(R, L, now = DS.Net.now()) {
    if (!R || !R.state || Raid().isClosed(R)) return null;
    const s = R.state, d = Raid().deadline(R), dr = s.door;
    if (dr && d && Number(dr.d) === d && Number(dr.at)) { const lim = dr.ask ? DOOR_ASK : DOOR_SHUT; return { kind: dr.ask ? 'ask' : 'shut', left: Math.max(0, Math.ceil((Number(dr.at) + lim - now) / 1000)) }; }
    if (s.doorExt && now - Number(s.doorExt) < DOOR_EXT) return { kind: 'ext' };
    return null;
  }
  // 마감 시계 (리모컨 · 종합실 onTimeUp 이 부름 · 예전 「바로 timeUp」 대신)
  function doorHost(code, R, L, now) {
    const d = Raid().deadline(R); if (!d || now < d || Raid().isClosed(R) || Raid().isLobby(R)) return;
    if (Raid().bossHp(L, R).won || Raid().isEnd(L, R)) return Act().timeUp(code, R, L).catch(() => {});
    const dr = (R.state || {}).door;
    if (!dr || Number(dr.d) !== d) return Act().doorStart(code, R, d).catch(() => {});
    if (Number(dr.at) && now >= Number(dr.at) + (dr.ask ? DOOR_ASK : DOOR_SHUT)) return Act().timeUp(code, R, L).catch(() => {});
  }
  let DM = null; // { role: 'hall' | 'teacher' | 'student', code, R, L }
  function doorMount(role, code, R, L) { DM = R && L ? { role, code, R, L } : null; doorPaint(); }
  function doorPaint() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('door-ov');
    const scr = DM && document.getElementById(`screen-${DM.role}`), st = DM && scr && scr.classList.contains('active') ? doorState(DM.R, DM.L) : null;
    if (!st) { if (el) el.remove(); return; }
    const { role, code, R, L } = DM, B = doorBoss(L), sig = `${role}|${st.kind}`;
    if (!el || el.dataset.sig !== sig) {
      if (!el) { el = document.createElement('div'); el.id = 'door-ov'; document.body.appendChild(el); }
      el.dataset.sig = sig; el.className = `door-ov ${role} ${st.kind}`;
      const boss = B.sprite && DS.Art.monster ? `<div class="dr-boss">${DS.Art.monster(B.sprite, st.kind === 'ext' ? 'down' : 'idle')}</div>` : '<div class="dr-boss">👑</div>';
      const door = '<div class="dr-door"><i class="l"></i><i class="r"></i></div>';
      const btns = role !== 'student' && st.kind === 'ask' ? '<div class="dr-btns"><button class="btn primary" data-door-ext>⏰ +5분 연장</button><button class="btn" data-door-close>그대로 닫기</button></div>' : '';
      const sec = '<b class="dr-sec"></b>';
      if (role === 'student') el.innerHTML = `<div class="dr-band">${st.kind === 'ext' ? '🧙 선생님이 5분을 벌었다!' : st.kind === 'ask' ? `👑 보스가 문을 닫으려 해요… 선생님을 기다리는 중 ${sec}` : '👑 보스가 문을 닫아요'}</div>`;
      else if (st.kind === 'ext') el.innerHTML = `<div class="dr-card">${door}${boss}<div class="dr-hero">${DS.Art.hero(DS.Art.teacherHero(R), 'attack')}</div><p class="dr-t">🧙 선생님이 문을 밀어 열었다!</p><b class="dr-plus">⏳ +5분!</b></div>`;
      else el.innerHTML = `<div class="dr-card">${door}${boss}<p class="dr-t">👑 ${esc(B.name)}${st.kind === 'ask' ? '가 던전 문을 닫으려 한다!' : '가 던전 문을 닫는다!'}</p>${st.kind === 'ask' ? `<p class="dr-q">${role === 'teacher' ? '⏰ 5분 연장할까요?' : '⏰ 선생님, 5분 연장할까요?'} ${sec}</p>` : ''}${btns}</div>`;
      el.querySelectorAll('[data-door-ext]').forEach((b) => (b.onclick = () => run(async () => { b.disabled = true; await Act().doorExtend(code, R); })));
      el.querySelectorAll('[data-door-close]').forEach((b) => (b.onclick = () => run(async () => { b.disabled = true; await Act().timeUp(code, R, L); })));
    }
    const sc = el.querySelector('.dr-sec'); if (sc && st.left != null) sc.textContent = st.left;
  }
  function tbAlert(min, e) {
    const big = !!e.closest('#screen-hall');
    const txt = min === 1 ? '⏰ 1분 남았어요! 👑 보스가 문을 닫아요!' : `⏳ ${min}분 남았어요 — 👑 보스가 문을 닫으려 해요`;
    if (DS.Sound && DS.Sound.warn) DS.Sound.warn();
    if (big && DS.Thrill && DS.Thrill.note) DS.Thrill.note(`<p>${min === 1 ? '⏰' : '⏳'} ${min}분 남음!</p><b>${min === 1 ? '👑 보스가 문을 닫아요 — 마지막 공격!' : '👑 보스가 문을 닫으려 해요'}</b>`, `tb-note tb-note-${min}`, 3200);
    else if (DS.UI && DS.UI.toast) DS.UI.toast(txt, 3200);
    e.classList.remove('ping'); void e.offsetWidth; e.classList.add('ping');
  }
  if (typeof document !== 'undefined') setInterval(tbTick, 1000);
  const bindExtend = (el, code, R) => el.querySelectorAll('[data-extend]').forEach((b) => (b.onclick = () => run(async () => { if (!confirm('⏰ 문 닫히는 시각을 5분 늦출까요? (한 번만)')) return; await Act().extendTime(code, R); DS.UI.toast('⏰ 5분 늘렸어요'); if (DS.Sound && DS.Sound.fx) DS.Sound.fx('plus5', 0.8); })));
  // 🆙 머리 위 「+12 EXP」 (2026-11-05): 몬스터 · 보스를 쓰러뜨리는 순간 (정답 · 오답 글자 대신 숫자만)
  function xpFloat(host, text, cls = '') {
    if (!host) return; const e = document.createElement('span'); e.className = `xp-pop ${cls}`; e.textContent = text;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.appendChild(e); setTimeout(() => e.remove(), 2400);
  }
  const xpOf = (rec) => (rec && rec.tries ? rec.tries.length * 2 + (Number(rec.best) || 0) * 2 : 0); // 제출 2 + 맞힌 소문제 2 (EXP 표와 같게)
  // 🧮 아직 안 들어온 번호 (2026-11-09 #24 · 1-4반 「17명이지?」): 반 명단(rosterMask 번호) − 들어온 학생 − 교사가 뺀 결석(state/absent)
  const rosterCache = {};
  function rosterNums(cls) {
    if (!cls) return null;
    if (rosterCache[cls] === undefined) { rosterCache[cls] = null; DS.Net.get(`rosterMask/${cls}`).then((v) => { rosterCache[cls] = Object.keys(v || {}).map(Number).filter((n) => n > 0).sort((a, b) => a - b); window.dispatchEvent(new Event('ds-roster')); }).catch(() => {}); }
    return rosterCache[cls];
  }
  function missing(R) {
    const all = rosterNums(R.meta && R.meta.cls); if (!all || !all.length) return null;
    const inN = new Set(Object.values(R.players || {}).filter((p) => !p.teacher).map((p) => Number(p.num))), ab = (R.state || {}).absent || {};
    return { miss: all.filter((n) => !inN.has(n) && !ab[n]), absent: all.filter((n) => ab[n] && !inN.has(n)), total: all.length };
  }
  function missingHtml(R, big) {
    const m = missing(R); if (!m) return '';
    if (!m.miss.length && !m.absent.length) return `<div class="miss-row${big ? ' big' : ''}"><b>🧮 명단 ${m.total}명 모두 들어왔어요</b></div>`;
    return `<div class="miss-row${big ? ' big' : ''}"><b>🧮 아직 ${m.miss.length}명${m.miss.length ? ':' : ''}</b>${m.miss.map((n) => `<button class="miss-n" data-absent="${n}" title="눌러서 결석으로 빼기">${n}</button>`).join('')}${m.absent.length ? `<span class="miss-ab">결석 ${m.absent.map((n) => `<button class="miss-n ab" data-unabsent="${n}" title="다시 넣기">${n}</button>`).join('')}</span>` : ''}${m.miss.length ? '<span class="miss-tip">번호를 누르면 결석으로 빼요</span>' : ''}</div>`;
  }
  const bindMissing = (el, code) => el.querySelectorAll('[data-absent],[data-unabsent]').forEach((b) => (b.onclick = () => run(() => DS.Net.set(`rooms/${code}/state/absent/${b.dataset.absent || b.dataset.unabsent}`, b.dataset.absent ? true : null))));
  // 🔄 #24 옛 판 학생 (들어올 때 적은 앱 판 v 가 이 기기 판과 다름 · 옛 판은 v 가 없음)
  function oldHtml(R) {
    const old = Object.values(R.players || {}).filter((p) => !p.teacher && p.v !== DS.VERSION).map((p) => p.num).filter((n) => n != null).sort((a, b) => a - b);
    return old.length ? `<p class="old-row">🔄 옛 판 ${old.length}명: <b>${old.join(' · ')}번</b> <span class="muted small">— 폰 위 「🔄 새로 고침」 띠를 누르거나 앱을 다시 열게 해 주세요</span></p>` : '';
  }
  // ⚔ #24 다 채우고 공격을 안 누른 학생 (지금 몬스터 · 아직 안 낸 시도)
  function draftHtml(L, R) {
    const st = Raid().stepOf(L, R); if (!st || st.kind !== 'monster' || !L.monsters[st.id] || Raid().isChain(L, R, st.id)) return '';
    const who = Raid().activeIds(R).filter((u) => { const p = (R.players || {})[u] || {}; return !p.teacher && p.draft && p.draft === `${st.id}|${Raid().record(L, R, st.id, u).nextAttempt}`; }).map((u) => R.players[u].num).sort((a, b) => a - b);
    return who.length ? `<p class="draft-row">⌛ 입력 다 함 · <b>공격 안 누름 ${who.length}명: ${who.join(' · ')}번</b> <span class="muted small">— 「⚔ 공격!」을 눌러야 내져요</span></p>` : '';
  }
  return { doorHost, doorMount, doorState, draftHtml, oldHtml, missing, missingHtml, bindMissing, chainHtml, bindChain, solveHtml, bindSolve, saveBtn, bindSave, lessonBtn, bindLesson, remoteGrid, xpFloat, xpOf, tbarHtml, onTimeUp, bindExtend, hm, iconBar, restBtn, bindRest, restLeft, restEnd, mmss, name, run, wordsHtml, bindWords, stepName, nextName, stepTitles, FINALE, forward, back, pctHtml, bindPct, focusBtn, bindFocus, sheetBtn, bindSheet, videoBtn, bindVideo, esc };
})();
