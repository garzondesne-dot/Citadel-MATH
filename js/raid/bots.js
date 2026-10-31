// 체험판 가상 학생: 입장 → 단계 카드 연성 → 전투 답 제출(대부분 정답) → 형성평가. demo.html 에서만 쓴다.
// 실제 학생과 똑같은 경로(rooms/{code}/…)에 쓰므로 교사 폰·종합상황실은 진짜 수업과 똑같이 움직인다.
window.DS = window.DS || {};

DS.Bots = (function () {
  const NICK = ['민준', '서연', '도윤', '하은', '시우', '지유', '주원', '서아', '하준', '지안', '은우', '수아', '건우', '윤서', '선우', '채원', '유준', '다은', '이안', '소율', '태윤', '예린', '로운', '하린', '지호', '아린', '준서', '서윤', '현우'];
  let code = null, n = 0, stop = null, R = null, L = null, speed = 1, acc = { first: 0.96, retry: 1, boss: 0.8 };
  const done = new Set();
  const N = () => DS.Net, P = (s) => `rooms/${code}/${s}`;
  const ids = () => Array.from({ length: n }, (_, i) => `bot${String(i + 1).padStart(2, '0')}`);
  const later = (key, ms, fn) => { if (done.has(key)) return; done.add(key); setTimeout(() => { if (code) fn(); }, ms / speed); };
  const rand = (a, b) => a + Math.random() * (b - a);

  // 문제 → 정답(또는 일부러 틀린 답)
  function given(q, right) {
    const S = DS.SetGen;
    switch (q.type) {
      case 'blanks': { const g = q.items.map((i) => i.answer); if (!right) g[0] = q.options.find((o) => o !== g[0]); return g; }
      case 'ox': return right ? q.answer : !q.answer;
      case 'number': return right ? q.answer : q.answer + 1;
      case 'multi': return right ? q.answer.slice() : q.answer.slice(1);
      case 'subsets': { const all = S.allSubsets(q.base); return right ? all : all.slice(1); }
      default: return right ? q.answerIndex : (q.answerIndex + 1) % q.choices.length;
    }
  }

  function start(c, count, opt = {}) {
    stopAll();
    code = c; n = count; speed = opt.speed || 1; Object.assign(acc, opt.acc || {});
    stop = N().watch(`rooms/${code}`, (v) => { if (!v) return; R = DS.Act.unpackRoom(v); L = DS.Lessons.get(R.meta.lesson); step(); });
  }
  function stopAll() { if (stop) stop(); stop = null; code = null; done.clear(); }

  function step() {
    const ph = R.state.phase;
    ids().forEach((u, i) => {
      if (ph === 'lobby') later(`join|${u}`, 300 + i * rand(150, 450), () => N().set(P(`players/${u}`), { num: i + 2, nick: NICK[i % NICK.length], hero: Math.floor(Math.random() * 7), at: N().TS }));
      if (!(R.active || {})[u]) return;
      if (ph === 'forge') {
        const st = L.stages[R.state.stage];
        st.cards.forEach((c, k) => later(`card|${u}|${c}`, rand(2500, 12000) + k * 2000, () => N().set(P(`cards/${u}/${c}`), true)));
      }
      if (ph === 'battle') {
        const rd = R.state.round;
        later(`seen|${rd.id}|${u}`, rand(500, 2500), () => N().set(P(`seen/${rd.id}/${u}`), N().TS));
        later(`sub|${rd.id}|${u}`, rand(4000, 14000), () => {
          const q = L.question(rd.type, DS.Raid.seedOf(rd.id, u));
          const right = Math.random() < (rd.attempt > 1 ? acc.retry : acc.first);
          const card = q.cards.find((c) => DS.Raid.owns(R, u, c)) || q.cards[0];
          N().set(P(`subs/${rd.id}/${u}`), { card, given: N().pack(given(q, right)), at: N().TS });
        });
      }
      if (ph === 'boss') {
        const set1 = L.boss.sets[1].map((q) => given(q, Math.random() < acc.boss));
        later(`boss1|${u}`, rand(6000, 20000), () => N().set(P(`bossAns/${u}/1`), N().pack(set1)));
        later(`boss2|${u}`, rand(24000, 40000), () => N().set(P(`bossAns/${u}/2`), N().pack(L.boss.sets[2].map((q) => given(q, true)))));
      }
    });
  }
  return { start, stop: stopAll, given, ids };
})();
