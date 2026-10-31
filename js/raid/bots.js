// 체험판 가상 학생: 입장 → 몬스터마다 답 제출(가끔 틀리고 재도전) → 형성평가. demo.html 에서만 쓴다.
// 실제 학생과 똑같은 경로(rooms/{code}/…)에 쓰므로 교사 폰·종합상황실은 진짜 수업과 똑같이 움직인다.
window.DS = window.DS || {};

DS.Bots = (function () {
  const NICK = ['민준', '서연', '도윤', '하은', '시우', '지유', '주원', '서아', '하준', '지안', '은우', '수아', '건우', '윤서', '선우', '채원', '유준', '다은', '이안', '소율', '태윤', '예린', '로운', '하린', '지호', '아린', '준서', '서윤', '현우'];
  const WORDS = ['벤 다이어그램 이제 알겠다!', '오늘 재밌었어요', '공집합 헷갈렸는데 해결', 'n(∅)=0 외웠다', '재도전 2번 만에 성공!', '다음 던전 언제해요?', '조건제시법 어려워요 ㅠ', '보스 막타 내가 침'];
  let code = null, n = 0, stop = null, R = null, L = null, speed = 1, acc = { item: 0.8, boss: 0.8 };
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
      case 'multi': return right ? q.answer.slice() : q.answer.slice(1).concat(q.options.findIndex((_, i) => !q.answer.includes(i)));
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
    const st = DS.Raid.stepOf(L, R);
    ids().forEach((u, i) => {
      if (DS.Raid.isLobby(R)) later(`join|${u}`, 300 + i * rand(150, 450), () => N().set(P(`players/${u}`), { num: i + 2, nick: NICK[i % NICK.length], hero: Math.floor(Math.random() * 7), fx: DS.FX ? DS.FX.BASE[i % 6] : 'flame', cls: '1-1', at: N().TS }).then(() => N().set(P(`online/${u}`), true)));
      if (!(R.active || {})[u]) return;
      // 마무리: 대기실로 이동 → 한마디
      if (DS.Raid.isFinale(L, R) || (st && st.kind === 'boss' && DS.Raid.canLobby(L, R, u))) {
        later(`lobby|${u}`, rand(1500, 6000), () => N().set(P(`players/${u}/lobby`), true));
        if (DS.Raid.isFinale(L, R) && Math.random() < 0.7) later(`say|${u}`, rand(3000, 15000), () => N().set(P(`words/${u}`), { t: WORDS[i % WORDS.length], n: 1 }));
      }
      if (!st) return;
      if (st.kind === 'monster') {
        const rec = DS.Raid.record(L, R, st.id, u);
        const a = rec.nextAttempt;
        const go = !rec.submitted || (rec.canRetry && Math.random() < 0.85);
        if (go) later(`sub|${st.id}|${u}|${a}`, rand(a ? 4000 : 6000, a ? 9000 : 18000), () => {
          const items = DS.Raid.itemsFor(L, R, st.id, u, a);
          N().set(P(`subs/${st.id}/${u}/${a}`), N().pack(items.map((q) => given(q, Math.random() < acc.item + a * 0.08))));
        });
      }
      if (st.kind === 'boss') {
        const set1 = L.boss.sets[1].map((q) => given(q, Math.random() < acc.boss));
        later(`boss1|${u}`, rand(6000, 20000), () => N().set(P(`bossAns/${u}/1`), N().pack(set1)));
        later(`boss2|${u}`, rand(24000, 40000), () => N().set(P(`bossAns/${u}/2`), N().pack(L.boss.sets[2].map((q) => given(q, true)))));
      }
    });
  }
  return { start, stop: stopAll, given, ids, NICK };
})();
