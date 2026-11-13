// 체험판 가상 학생: 입장 → 몬스터마다 답 제출(가끔 틀리고 재도전) → 형성평가. 교사 🧪 테스트 모드 · 체험판(trial/)에서 쓴다.
// 실제 학생과 똑같은 경로(rooms/{code}/…)에 쓰므로 교사 폰·종합상황실은 진짜 수업과 똑같이 움직인다.
window.DS = window.DS || {};

DS.Bots = (function () {
  const NICK = ['민준', '서연', '도윤', '하은', '시우', '지유', '주원', '서아', '하준', '지안', '은우', '수아', '건우', '윤서', '선우', '채원', '유준', '다은', '이안', '소율', '태윤', '예린', '로운', '하린', '지호', '아린', '준서', '서윤', '현우'];
  const WORDS = ['벤 다이어그램 이제 알겠다!', '오늘 재밌었어요', '공집합 헷갈렸는데 해결', 'n(∅)=0 외웠다', '재도전 2번 만에 성공!', '다음 던전 언제해요?', '조건제시법 어려워요 ㅠ', '보스 막타 내가 침'];
  let joinK = 1, code = null, n = 0, stop = null, R = null, L = null, speed = 1, acc = { item: 0.8, boss: 0.8 }, PER = null;
  // 👩‍🏫 교사 체험판 (2026-11-07): 친구마다 성격 { nick, hero, acc, slow, retry, heal, late, ok0 } — 없으면 예전처럼 모두 같게
  const per = (i) => (PER && PER[i]) || {};
  const done = new Set();
  const N = () => DS.Net, P = (s) => `rooms/${code}/${s}`;
  const ids = () => Array.from({ length: n }, (_, i) => `bot${String(i + 1).padStart(2, '0')}`);
  // ⏸ #117 집중 모드 = 가상 친구도 손을 멈춤 (학생 폰이 잠기는 것과 같게): 집중 중에 시간이 된 일은 모아 두었다가 끄면 차례로
  let held = [];
  const frozen = () => !!(R && DS.Raid.focusOn(R) && !DS.Raid.isLobby(R) && !DS.Raid.restOn(R));
  const later = (key, ms, fn) => { if (done.has(key)) return; done.add(key); const go = () => { if (!code) return; if (frozen()) { held.push(go); return; } fn(); }; setTimeout(go, ms / speed); };
  const thaw = () => { if (frozen() || !held.length) return; const h = held; held = []; h.forEach((go, i) => setTimeout(go, (600 + i * rand(250, 700)) / speed)); };
  const rand = (a, b) => a + Math.random() * (b - a);

  // 문제 → 정답(또는 일부러 틀린 답)
  function given(q, right) {
    const S = DS.SetGen;
    switch (q.type) {
      case 'blanks': { const g = q.items.map((i) => i.answer); if (!right) g[0] = q.options.find((o) => o !== g[0]); return g; }
      case 'ox': return right ? q.answer : !q.answer;
      case 'number': return right ? q.answer : q.answer + 1;
      case 'text': return right ? q.answers[0] : '모름';
      case 'multi': return right ? q.answer.slice() : q.answer.slice(1).concat(q.options.findIndex((_, i) => !q.answer.includes(i)));
      case 'subsets': { const all = S.allSubsets(q.base); return right ? all : all.slice(1); }
      default: return right ? q.answerIndex : (q.answerIndex + 1) % q.choices.length;
    }
  }

  function start(c, count, opt = {}) {
    stopAll();
    code = c; n = count; speed = opt.speed || 1; joinK = opt.joinFast ? speed : 1; Object.assign(acc, opt.acc || {}); PER = opt.personas || null; if (PER) n = PER.length; // 👩‍🏫 교사 판 joinFast: 풀이는 천천히 · 입장은 보통 빠르기
    stop = N().watch(`rooms/${code}`, (v) => { if (!v) return; R = DS.Act.unpackRoom(v); L = DS.Lessons.get(R.meta.lesson); step(); });
  }
  function stopAll() { if (stop) stop(); stop = null; code = null; done.clear(); held = []; }

  // 🏕 쉼터 놀이 (🧪 테스트 모드 · 2026-11-07): ⚖ 🔄 ⭕ = 고르는 시간 안에 한 번 고름 · 🏰 디펜스 = 내 능력치 · 빈 자리 선착순
  function fun() {
    const f = R.fun, now = N().now();
    if (f.kind === 'td') {
      if (f.phase !== 'pick' || !DS.TDMaps) return;
      const M = DS.TDMaps, sl = M.slots(M.get(f.map) || M.MAPS[0]);
      ids().forEach((u, i) => {
        if (!(R.active || {})[u]) return; const p = R.players[u] || {};
        later(`tdm|${f.g}|${u}`, rand(400, 1500), () => N().set(P(`tdm/${f.g}/${u}`), { lv: 2 + ((i * 3) % 7), enh: i % 4, hero: p.hero || 0, fx: p.fx || 'flame' }));
        later(`tdp|${f.g}|${u}`, rand(4000, 16000), async () => {
          const cur = (await N().get(P(`tdp/${f.g}`)).catch(() => null)) || {}; if (Object.values(cur).includes(u)) return;
          const free = sl.filter((s) => !cur[s.no]), star = free.filter((s) => s.star), pool = star.length && Math.random() < 0.5 ? star : free;
          const s = pool[Math.floor(Math.random() * pool.length)]; if (s) await N().set(P(`tdp/${f.g}/${s.no}`), u).catch(() => {});
        });
      });
      return;
    }
    if (f.kind === 'nun') { // 🙊 눈치 (2026-11-08): 판이 시작되면 봇마다 1~9초 사이 한 번 누름 (가끔 겹쳐 「💥 동시!」)
      if (f.phase !== 'play') return;
      ids().forEach((u) => { if (!(f.alive || {})[u]) return; later(`nun|${f.g}|${f.round}|${u}`, rand(900, 9000), () => N().set(P(`nun/${f.g}/${f.round}/${u}`), N().TS).catch(() => {})); });
      return;
    }
    const left = (f.to || 0) - now; if (f.phase !== 'pick' || left < 800) return;
    ids().forEach((u) => {
      if (!(f.alive || {})[u]) return;
      later(`fv|${f.g}|${f.rk}|${u}`, rand(0.15, 0.75) * left * speed, () => {
        const v = f.rps ? 'abc'[Math.floor(Math.random() * 3)] : f.ans ? (Math.random() < 0.7 ? f.ans : f.ans === 'a' ? 'b' : 'a') : Math.random() < 0.5 ? 'a' : 'b';
        N().set(P(`fv/${f.rk}/${u}`), v).catch(() => {});
      });
    });
  }

  function step() {
    if (frozen()) return; thaw();
    if (DS.Raid.restOn(R) && !DS.Raid.isLobby(R)) { if (R.fun) fun(); return; } // 쉼터: 공격은 쉬고 놀이만
    const st = DS.Raid.stepOf(L, R);
    ids().forEach((u, i) => {
      const pp = per(i), slow = pp.slow || 1;
      if (DS.Raid.isLobby(R) || (pp.late && !(R.players || {})[u])) later(`join|${u}`, pp.late ? pp.late * speed : (300 + i * rand(150, 450)) * joinK, () => N().set(P(`players/${u}`), { ver: DS.VERSION, v: String(DS.VERSION || ""), num: i + 2, nick: pp.nick || NICK[i % NICK.length], hero: pp.hero != null ? pp.hero : Math.floor(Math.random() * 7), fx: pp.fx || (DS.FX ? DS.FX.BASE[i % 6] : 'flame'), cls: (R.meta || {}).cls || '1-1', at: N().TS }).then(() => N().set(P(`online/${u}`), true)).then(() => { if (!DS.Raid.isLobby(R)) N().set(P(`active/${u}`), true).catch(() => {}); })); // 💤 늦게 온 친구: 들어오면 바로 함께
      if (!(R.active || {})[u]) return;
      // 마무리: 대기실로 이동 → 한마디
      if (DS.Raid.isFinale(L, R) || (st && st.kind === 'boss' && DS.Raid.canLobby(L, R, u))) {
        later(`lobby|${u}`, rand(1500, 6000), () => N().set(P(`players/${u}/lobby`), true));
        if (DS.Raid.isFinale(L, R) && Math.random() < 0.7) later(`say|${u}`, rand(3000, 15000), () => N().set(P(`words/${u}`), { t: WORDS[i % WORDS.length], n: 1 }));
      }
      if (!st) return;
      if (st.kind === 'monster' && DS.Raid.isChain && DS.Raid.isChain(L, R, st.id)) { // ⚔ 소레이드: 단계 하나씩 (70% 맞힘)
        const rec = DS.Raid.record(L, R, st.id, u);
        if (!rec.done && !rec.fail && !rec.locked) later(`ch|${st.id}|${u}|${rec.nextK}`, rand(3000, 9000) * slow, () => { const q = rec.items[rec.stage]; const g = DS.Bots.given(q, Math.random() < 0.7); N().set(P(`chain/${st.id}/${u}/${rec.nextK}`), { s: rec.stage, p: 0, g: q.type === 'number' ? Number(Array.isArray(g) ? g[0] : g) : g, at: N().TS }); });
        return;
      }
      if (st.kind === 'monster') {
        const rec = DS.Raid.record(L, R, st.id, u);
        const a = rec.nextAttempt;
        // v0.9.6 💚 다 맞힌 가상 친구는 절반쯤 힐을 고른다
        if (rec.canHeal && Math.random() < (pp.heal != null ? pp.heal : 0.5)) { const k = DS.Raid.healsGiven(R, st.id, u); later(`heal|${st.id}|${u}|${k}`, rand(3000, 8000), () => N().set(P(`heals/${st.id}/${u}/${k}`), DS.Raid.healTarget(L, R, st.id, u) || '_')); return; }
        const go = !rec.submitted || (rec.canRetry && Math.random() < (pp.retry != null ? pp.retry : 0.85));
        if (go) later(`sub|${st.id}|${u}|${a}`, rand(a ? 4000 : 6000, a ? 9000 : 18000) * slow, () => {
          const items = DS.Raid.itemsFor(L, R, st.id, u, a);
          const pa = pp.acc != null ? pp.acc : acc.item, all0 = a === 0 && pp.ok0; // ok0 = 첫 시도 퍼펙트(잘하는 친구)
          N().set(P(`subs/${st.id}/${u}/${a}`), N().pack(items.map((q) => given(q, all0 || Math.random() < pa + a * 0.12))));
        });
      }
      if (st.kind === 'boss') {
        // 2026-11-05: 문항 · 시도별 (첫 시도 → 틀린 문항은 숫자 바뀐 재도전에서 맞힘)
        L.boss.sets[1].slice(0, L.boss.items).forEach((q, i) => { const ok0 = pp.ok0 || Math.random() < (pp.acc != null ? pp.acc + 0.1 : acc.boss);
          later(`boss0|${u}|${i}`, rand(6000, 20000) * slow, () => N().set(P(`bossTry/${u}/${i}/0`), N().pack(given(q, ok0))));
          if (!ok0) later(`boss1|${u}|${i}`, rand(24000, 40000), () => N().set(P(`bossTry/${u}/${i}/1`), N().pack(given(DS.Raid.bossItem(L, R, u, i, 1), true)))); });
      }
    });
  }
  return { start, stop: stopAll, given, ids, NICK };
})();
