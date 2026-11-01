// 엑셀 문제 은행 → 차시 묶음 (레이드 수업에 그대로 쓰는 pack). 순수 함수라서 테스트에서도 쓴다 (tests/sheet.test.js).
// 탭 3개: 「차시」(한 줄) · 「순서」(수업 단계) · 「문항」(한 줄 = 한 문제). 양식: assets/templates/question-bank-v1.xlsx
// 문항: 단계ID · 칸 · 버전(0 = 학습지 원문 = 첫 시도, 1·2… = 재도전용) · 형식 · 문제 · 보기1~5 · 정답 · 해설 · 꼬리표 · 세트(형성평가 1/2)
// 형식: 선다 · OX · 숫자 · 여러개 · 기호(문제 칸에 "조건 || 3 □ A" 처럼) · 단답(정답 여러 개는 쉼표)
// 시트 차시는 코드 검산이 없으므로 교사가 미리보기에서 확인한 뒤 저장한다 (Firebase sheets/{id}).
window.DS = window.DS || {};

DS.SheetLesson = (function () {
  const KIND = { 도입: 'intro', 개념: 'concept', 문제: 'monster', 보강: 'special', 복습: 'review', 형성평가: 'boss' };
  const TYPE = { 선다: 'choice', 선다형: 'choice', ox: 'ox', OX: 'ox', 숫자: 'number', 여러개: 'multi', 복수: 'multi', 기호: 'blanks', 단답: 'text', 단답형: 'text' };
  const SPRITES = ['new:0', 'new:2', 'new:3', 'new:5', 'new:1', 'new:4', 'new:9', 'new:7', 'new:8', 'extra:0', 'extra:4', 'extra:7'];
  const trim = (s) => String(s == null ? '' : s).trim();
  // 헤더 줄을 찾아 { 칸이름: 값 } 목록으로
  function table(rows, must) {
    rows = (rows || []).filter((r) => r && r.some((x) => trim(x)));
    const hi = rows.findIndex((r) => r.map(trim).includes(must));
    if (hi < 0) return [];
    const head = rows[hi].map(trim);
    return rows.slice(hi + 1).map((r, k) => { const o = { _row: hi + k + 2 }; head.forEach((h, i) => { if (h) o[h] = trim(r[i]); }); return o; });
  }
  const norm = (s) => String(s).replace(/\s+/g, '').toLowerCase();
  // 한 줄 → DS.Quiz 문제 (오류면 { error })
  function toQuestion(r) {
    const type = TYPE[r['형식']] || TYPE[trim(r['형식']).toUpperCase()];
    if (!type) return { error: `형식 "${r['형식'] || '(빈칸)'}" 을 모르겠어요 (선다 · OX · 숫자 · 여러개 · 기호 · 단답)` };
    const q = trim(r['문제']), ans = trim(r['정답']), sol = trim(r['해설']);
    if (!q) return { error: '문제 칸이 비어 있어요' };
    if (!ans) return { error: '정답 칸이 비어 있어요' };
    const opts = [1, 2, 3, 4, 5].map((i) => trim(r[`보기${i}`])).filter(Boolean);
    const base = { solution: sol, tag: trim(r['꼬리표']) };
    if (type === 'choice') {
      const n = Number(ans);
      if (opts.length < 2) return { error: '선다는 보기가 2개 이상 있어야 해요' };
      if (!(n >= 1 && n <= opts.length)) return { error: `정답 "${ans}" 은 보기 번호(1~${opts.length})여야 해요` };
      return { ...base, type, question: q, choices: opts, answerIndex: n - 1 };
    }
    if (type === 'ox') {
      const a = ans.toUpperCase();
      if (!['O', 'X', '○', '×'].includes(a)) return { error: 'OX 정답은 O 또는 X 예요' };
      return { ...base, type, question: q, answer: a === 'O' || a === '○' };
    }
    if (type === 'number') {
      const n = Number(ans);
      if (!Number.isInteger(n) || n < 0 || n > 99) return { error: '숫자 정답은 0~99 정수예요 (다이얼 입력)' };
      return { ...base, type, question: q, answer: n };
    }
    if (type === 'multi') {
      if (opts.length < 2) return { error: '여러개는 보기가 2개 이상 있어야 해요' };
      const idx = ans.split(/[,\s]+/).filter(Boolean).map(Number);
      if (!idx.length || idx.some((n) => !(n >= 1 && n <= opts.length))) return { error: `정답 "${ans}" 은 보기 번호를 쉼표로 (예: 1,3)` };
      return { ...base, type, question: q, options: opts, answer: [...new Set(idx.map((n) => n - 1))].sort((a, b) => a - b) };
    }
    if (type === 'blanks') {
      const [cond, expr] = q.includes('||') ? q.split('||').map(trim) : ['', q];
      if (!expr.includes('□')) return { error: '기호 문제는 문제 칸에 □ 를 넣어요 (예: A = {1, 3} 일 때 || 3 □ A)' };
      const [left, right] = [expr.slice(0, expr.indexOf('□')).trim(), expr.slice(expr.indexOf('□') + 1).trim()];
      const symbols = opts.length ? opts : ['∈', '∉'];
      if (!symbols.includes(ans)) return { error: `정답 기호 "${ans}" 가 보기에 없어요` };
      return { ...base, type, question: cond || '□ 에 알맞은 기호를 고르시오.', items: [{ left, right, answer: ans }], options: symbols };
    }
    const answers = ans.split(',').map(trim).filter(Boolean);
    return { ...base, type: 'text', question: q, answers };
  }
  const textOk = (prob, given) => prob.answers.some((a) => norm(a) === norm(given || ''));

  // rows: { 차시: [[…]], 순서: [[…]], 문항: [[…]] } → { pack(JSON), errors, warnings, summary }
  function build(tabs) {
    const errors = [], warnings = [];
    const info = table(tabs['차시'], '제목')[0] || {};
    const steps0 = table(tabs['순서'], '단계ID');
    const qrows = table(tabs['문항'], '단계ID');
    if (!info['제목']) errors.push('「차시」 탭에 제목이 없어요');
    if (!steps0.length) errors.push('「순서」 탭에 단계가 없어요');
    const ids = new Set();
    const steps = [];
    let si = 0;
    steps0.forEach((s) => {
      const id = s['단계ID'], k = KIND[s['종류']];
      if (!id) return;
      if (ids.has(id)) { errors.push(`「순서」 ${s._row}줄: 단계ID "${id}" 가 겹쳐요`); return; }
      if (!k) { errors.push(`「순서」 ${s._row}줄: 종류 "${s['종류']}" (도입 · 개념 · 문제 · 보강 · 복습 · 형성평가)`); return; }
      ids.add(id);
      const step = { kind: k === 'special' || k === 'review' ? 'monster' : k, id, title: s['제목'] || id, say: s['요약'] || '' };
      if (k === 'special') step.special = true;
      if (k === 'review') step.review = true;
      if (step.kind === 'monster' || step.kind === 'boss') step.sprite = s['몬스터'] || (step.kind === 'boss' ? 'new:6' : SPRITES[si++ % SPRITES.length]);
      steps.push(step);
    });
    const boss = steps.filter((s) => s.kind === 'boss');
    if (boss.length > 1) errors.push('형성평가(보스)는 한 단계만 둘 수 있어요');
    // 문항 묶기: 단계 → 칸 → 버전 (보스는 칸 → 세트)
    const bank = {};
    qrows.forEach((r) => {
      if (!r['단계ID'] && !r['문제']) return;
      const step = steps.find((s) => s.id === r['단계ID']);
      if (!step) { errors.push(`「문항」 ${r._row}줄: 단계ID "${r['단계ID']}" 가 「순서」에 없어요`); return; }
      if (step.kind !== 'monster' && step.kind !== 'boss') { errors.push(`「문항」 ${r._row}줄: "${step.id}" 는 ${step.kind === 'concept' ? '개념' : '도입'} 단계라 문제를 넣을 수 없어요`); return; }
      const q = toQuestion(r);
      if (q.error) { errors.push(`「문항」 ${r._row}줄: ${q.error}`); return; }
      const slot = Number(r['칸']) || 1, ver = step.kind === 'boss' ? (Number(r['세트']) === 2 ? 1 : 0) : Number(r['버전']) || 0;
      ((bank[step.id] = bank[step.id] || {})[slot] = bank[step.id][slot] || {})[ver] = q;
    });
    const monsters = {};
    steps.filter((s) => s.kind === 'monster').forEach((s) => {
      const slots = Object.keys(bank[s.id] || {}).map(Number).sort((a, b) => a - b);
      if (!slots.length) { errors.push(`"${s.title}" 에 문항이 없어요`); return; }
      const table0 = slots.map((k) => { const vs = bank[s.id][k]; const vers = Object.keys(vs).map(Number).sort((a, b) => a - b); return vers.map((v) => vs[v]); });
      table0.forEach((vs, i) => { if (vs.length < 3) warnings.push(`"${s.title}" ${slots[i]}칸: 버전이 ${vs.length}개 — 재도전 때 같은 문제가 나올 수 있어요 (3개 이상 권장)`); });
      monsters[s.id] = { title: s.title, sprite: s.sprite, special: !!s.special, review: !!s.review, slots: table0 };
    });
    let bossPack = null;
    if (boss[0]) {
      const b = boss[0], slots = Object.keys(bank[b.id] || {}).map(Number).sort((x, y) => x - y);
      if (!slots.length) errors.push('형성평가에 문항이 없어요');
      else {
        const set1 = slots.map((k) => bank[b.id][k][0] || bank[b.id][k][1]), set2 = slots.map((k) => bank[b.id][k][1] || bank[b.id][k][0]);
        if (slots.some((k) => !bank[b.id][k][1])) warnings.push('형성평가: 세트2 가 없는 문항은 세트1 문제를 다시 내요');
        bossPack = { title: b.title, sprite: b.sprite, items: slots.length, hpItems: slots.length, sets: { 1: set1, 2: set2 } };
      }
    } else errors.push('「순서」에 형성평가(보스) 단계가 필요해요');
    const id = `xl-${(info['차시ID'] || info['제목'] || 'lesson').replace(/[^0-9A-Za-z가-힣]+/g, '-').slice(0, 30)}`;
    const pack = {
      id, sheetLesson: true, no: Number(info['차시 번호'] || info['차시번호']) || 0,
      title: info['제목'] || '', unit: [info['과목'] || info['에디션'] || '', info['단원'] || ''].filter(Boolean).join(' · '),
      sheet: info['학습지'] || '엑셀 문제 은행', theme: info['던전 테마'] || info['던전테마'] || '03-dimensional',
      defaultPct: Number(info['기준%']) || 90, think: info['생각 시간'] !== undefined && info['생각 시간'] !== '' ? Number(info['생각 시간']) : null,
      steps: steps.map((s) => ({ kind: s.kind, id: s.id, title: s.title, say: s.say, ...(s.special ? { special: true } : {}), ...(s.review ? { review: true } : {}) })),
      monsters, boss: bossPack,
    };
    const summary = steps.map((s) => ({ id: s.id, kind: s.kind, title: s.title, items: s.kind === 'monster' && monsters[s.id] ? monsters[s.id].slots.length : s.kind === 'boss' && bossPack ? bossPack.items : 0 }));
    return { pack, errors, warnings, summary };
  }

  // 저장된 pack(JSON) → DS.Lessons 에 등록 (items 함수 붙이기)
  // 서버(또는 체험 모드)를 거치면 배열이 {0: …, 1: …} 객체로 돌아올 수 있어 다시 배열로
  function arr(v) {
    if (Array.isArray(v)) return v.map(arr);
    if (v && typeof v === 'object') {
      const ks = Object.keys(v);
      if (ks.length && ks.every((k) => /^\d+$/.test(k))) { const out = []; ks.forEach((k) => { out[Number(k)] = arr(v[k]); }); return Array.from(out, (x) => (x === undefined ? null : x)); }
      return Object.fromEntries(ks.map((k) => [k, arr(v[k])]));
    }
    return v;
  }
  function attach(pack) {
    const P = arr(JSON.parse(JSON.stringify(pack)));
    P.steps.forEach((s) => { if (s.kind === 'monster' && P.monsters[s.id]) s.title = s.title || P.monsters[s.id].title; });
    // 재도전: 같은 칸의 다른 버전을 학생마다 무작위 (직전 시도와 다른 것 우선)
    const pick = (slot, seed, id, k, attempt) => {
      if (!attempt || slot.length === 1) return slot[0];
      const pool = slot.map((_, i) => i).filter((i) => i > 0);
      const prev = pick.idx(slot, seed, id, k, attempt - 1);
      const choice = pool.filter((i) => i !== prev);
      const list = choice.length ? choice : pool;
      return slot[list[Math.floor(DS.Rng(`${seed}|${id}|${k}|${attempt}`)() * list.length)]];
    };
    pick.idx = (slot, seed, id, k, attempt) => slot.indexOf(pick(slot, seed, id, k, attempt));
    P.items = (id, seed, attempt) => (P.monsters[id] ? P.monsters[id].slots.map((slot, k) => JSON.parse(JSON.stringify(pick(slot, seed, id, k, attempt)))) : []);
    Object.values(P.monsters).forEach((m) => { m.make = () => []; });
    if (DS.Lessons.get(P.id)) { const i = DS.Lessons.list.findIndex((l) => l.id === P.id); DS.Lessons.list.splice(i, 1); }
    DS.Lessons.register(P);
    return P;
  }
  // 앱 시작 때 서버의 시트 차시를 모두 불러와 등록
  async function loadAll() {
    try { const all = (await DS.Net.get('sheets')) || {}; Object.values(all).forEach((p) => { try { attach(p); } catch (e) { console.error('엑셀 차시 불러오기 실패', p && p.id, e); } }); } catch (e) { /* 규칙 게시 전이면 조용히 */ }
  }
  return { build, attach, loadAll, toQuestion, textOk, KIND, TYPE };
})();
