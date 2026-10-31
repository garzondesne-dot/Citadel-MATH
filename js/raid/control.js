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
    if (Raid().isEnd(L, R)) return '수업 끝';
    return Raid().stepOf(L, R).title;
  };
  const nextName = (L, R) => {
    const i = R.state.step ?? -1;
    if (i < 0) return '수업 시작';
    if (i + 1 >= L.steps.length) return '수업 끝';
    return L.steps[i + 1].title;
  };

  // ▶ 를 눌렀을 때: 몬스터가 아직 남았으면 확인을 한 번 더 받는다 (미제출 → 빼고 판정 / 체력 남음 → 그래도 넘어가기)
  let armed = '';
  async function forward(code, R, L) {
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
  const back = (code, R, L) => { armed = ''; return Act().go(code, R, L, -1); };

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

  return { name, run, stepName, nextName, forward, back, pctHtml, bindPct, esc };
})();
