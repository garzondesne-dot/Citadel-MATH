// 📖 기호 톡 (2026-11-10 #54 · 문구 원본 = docs/SYMBOL-TALK.md · 문구는 그 파일 그대로)
//   학생 폰 문제 화면의 연산 기호를 톡 → 기호 바로 위 말풍선: ① 정확한 뜻(굵게) ② 💬 쉽게 말하면(기울임 · 옅은 다른 색) ③ 더 보기 = 기억 고리(작게)
//   바깥을 누르거나 4초 뒤 닫힘 (더 보기를 펼치면 닫을 때까지) · 누를 수 있는 기호 = 옅은 점선 밑줄
//   어디서: #st-body(수업 몬스터 · 소레이드 · 한 판 더 · 형성평가 · ✍ 쓰기) · #quiz(성채 · 허수아비 문제 창) · .bn-fight(성채 나의 풀이) — 화면을 다시 그려도 저절로 다시 표시 (MutationObserver · 화면 코드는 손대지 않음 · paint() 스크롤 · 입력 그대로)
//   기록: xp/{반}/{번호}/st/{차시}/{기호} = 누른 횟수 (자기 칸 · 규칙 변경 없음 · 테스트 계정은 안 셈) → 대시보드 「📖 기호 톡」
window.DS = window.DS || {};

DS.SymTalk = (function () {
  // 기호 · ① 쉬운 한 줄 · ② 읽는 법 · 교과서 정의 · ③ 기억 고리 (SYMBOL-TALK.md 집합 단원 16줄 그대로 · ③ 「—」 = 없음)
  const ROWS = [
    { id: 'in', sym: 'a ∈ A', easy: 'a 는 A 팀 소속!', def: '「a 는 집합 A 에 속한다」 · a 가 집합 A 의 원소일 때', memo: '∈ = 원소(element)의 e 를 바꾼 기호 · 왼쪽 = 원소, 오른쪽 = 집합' },
    { id: 'notin', sym: 'b ∉ A', easy: 'b 는 A 팀 소속이 아니다', def: '「b 는 집합 A 에 속하지 않는다」 · b 가 A 의 원소가 아닐 때', memo: '' },
    { id: 'list', sym: '{1, 2, 4, 8}', easy: '원소를 하나하나 다 적기 (원소나열법)', def: '집합에 속하는 모든 원소를 { } 안에 나열', memo: '순서는 상관없음 · 같은 원소는 한 번만' },
    { id: 'build', sym: '{x | 조건}', easy: '{ 누구 | 어떤 애들 } · 조건에 맞는 x 를 다 모은 것 (조건제시법)', def: '원소들이 갖는 공통된 성질을 조건으로 제시 · x = 원소를 대표하는 문자', memo: '| 는 「그중에서 이런 것」이라고 읽으면 쉬움' },
    { id: 'n', sym: 'n(A)', easy: 'A 안에 원소가 몇 개?', def: '유한집합 A 의 원소의 개수', memo: 'n = 개수(number)의 첫 글자 · 예 n({1, 2, 4, 8}) = 4' },
    { id: 'empty', sym: '∅', easy: '텅 빈 집합 (원소 0개)', def: '원소가 하나도 없는 집합 = 공집합', memo: 'n(∅) = 0 · {0} 은 0 이 들어 있으니 공집합 아님' },
    { id: 'sub', sym: 'A ⊂ B', easy: 'A 가 B 안에 쏙 들어간다 (A 의 원소는 모두 B 에도 있다)', def: 'A 의 모든 원소가 B 에 속할 때 A 는 B 의 부분집합 · 「A 는 B 에 포함된다」', memo: '자기 자신도 부분집합(A ⊂ A) · ∅ 은 모든 집합의 부분집합 · 원소 n 개 → 부분집합 2ⁿ 개' },
    { id: 'nsub', sym: 'A ⊄ B', easy: 'A 에 B 밖으로 삐져나온 원소가 있다', def: 'A 가 B 의 부분집합이 아닐 때', memo: '하나만 삐져나와도 ⊄' },
    { id: 'eq', sym: 'A = B', easy: '원소가 똑같은 두 집합', def: 'A ⊂ B 이고 B ⊂ A 일 때 서로 같다', memo: '순서가 달라도 같은 집합' },
    { id: 'cap', sym: 'A ∩ B', easy: 'A 와 B 가 겹친 곳 (둘 다 있는 원소)', def: 'A 에도 속하고 B 에도 속하는 모든 원소로 이루어진 집합 = 교집합', memo: '「그리고」 · 모양이 아래로 열린 ∩ = 좁아진다' },
    { id: 'cup', sym: 'A ∪ B', easy: 'A 와 B 를 합친 것 (겹친 건 한 번만)', def: 'A 에 속하거나 B 에 속하는 모든 원소로 이루어진 집합 = 합집합', memo: '「또는」 · 위로 열린 ∪ = 담는 그릇' },
    { id: 'disj', sym: 'A ∩ B = ∅', easy: 'A 와 B 는 하나도 안 겹친다 (서로소)', def: '공통인 원소가 하나도 없을 때 A 와 B 는 서로소', memo: '서로소면 n(A ∪ B) = n(A) + n(B)' },
    { id: 'ncup', sym: 'n(A ∪ B)', easy: '합친 개수 = 더하고, 겹친 만큼 한 번 빼기', def: 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B)', memo: '겹친 곳을 두 번 세지 않게' },
    { id: 'U', sym: 'U', easy: '지금 다루는 원소 전부 (전체집합)', def: '부분집합을 생각할 때 처음의 집합', memo: 'U = universal set 의 첫 글자' },
    { id: 'compl', sym: 'Aᶜ', easy: 'U 안에서 A 밖에 있는 것 전부 (여집합)', def: 'U 의 원소 중 A 에 속하지 않는 모든 원소로 이루어진 집합', memo: 'C = complement 의 첫 글자 · Aᶜ = U − A · 「A 가 아니다」' },
    { id: 'diff', sym: 'A − B', easy: 'A 에서 B 를 빼고 남은 것 (A 쪽만)', def: 'A 에 속하지만 B 에는 속하지 않는 모든 원소로 이루어진 집합 = A 에 대한 B 의 차집합', memo: 'A − B ≠ B − A · A − B = A ∩ Bᶜ' },
  ];
  // 📖 개념 톡 (#58 F · SYMBOL-TALK.md 「개념 톡」 절 그대로): 기호가 아니라 개념 · 부분집합의 개수를 묻는 문제 글 끝에 「2ⁿ」 칩 · 기록 키 「2^n」
  const CONCEPTS = [
    { id: '2^n', sym: '2ⁿ', easy: '원소마다 「넣을까 뺄까」 2가지씩 → 2 × 2 × … (원소 수만큼)', def: '원소가 n 개인 집합의 부분집합의 개수는 2ⁿ 개', memo: '2³ = 2 × 2 × 2 = 8 · 2⁵ = 2 × 2 × 2 × 2 × 2 = 32 (25 아님) · 지수 n = 원소의 개수', where: /집합 X 의 개수는\?|부분집합의 개수/ },
  ];
  // 📖 명제 단원 (#62 · SYMBOL-TALK.md 「명제 단원」 절 그대로 · 8차시분): ~p 기호 + 「명제」 · 「조건」 · 「진리집합」 낱말 (그 낱말에 점선 밑줄)
  //   붙는 범위 = 명제 차시(8차시부터) · 성채 2층 명제 방만 (집합 차시의 「조건제시법」과 안 겹침) · 진리집합 기호 P 는 같은 문제 글에 「진리집합」 낱말이 있을 때만
  const PROP = [
    { id: 'neg', sym: '~p', easy: 'p를 거꾸로 뒤집은 말', def: '「p가 아니다」 = p의 부정 · p가 참이면 ~p는 거짓, p가 거짓이면 ~p는 참', memo: '~(~p) = p · 「x > 2」의 부정은 「x ≤ 2」 (같다도 들어감)' },
    { id: 'prop', sym: '명제', easy: '참 · 거짓이 딱 정해지는 말', def: '참 또는 거짓을 명확하게 판별할 수 있는 문장이나 식', memo: '「아름답다」 · 「높다」처럼 기준이 사람마다 다르면 명제가 아님' },
    { id: 'cond', sym: '조건', easy: 'x가 정해져야 참 · 거짓이 정해지는 말', def: '변수의 값에 따라 참, 거짓을 판별할 수 있는 문장이나 식', memo: '「x는 3의 배수」 → x = 6이면 참, x = 5이면 거짓' },
    { id: 'truth', sym: '진리집합 P', easy: 'U에서 조건을 통과한 것만 모은 집합', def: '전체집합 U의 원소 중 조건 p를 참이 되게 하는 모든 원소의 집합', memo: 'U가 바뀌면 진리집합도 바뀜(x² = 4 → 자연수면 {2}, 정수면 {−2, 2}) · ~p의 진리집합 = Pᶜ' },
    // 9차시 (#66 · SYMBOL-TALK 「9차시」 표 그대로)
    { id: 'imp', sym: 'p → q', easy: 'p이면 q (p일 때 꼭 q)', def: '명제 「p이면 q이다」를 기호로 나타낸 것 · p = 가정, q = 결론', memo: 'P ⊂ Q이면 참 · 하나라도 어긋나면 거짓' },
    { id: 'counter', sym: '반례', easy: '「아닌데?」 하나면 끝', def: '명제가 거짓임을 보이는 예', memo: '「소수는 홀수」 → 2' },
    { id: 'conv', sym: '역', easy: '앞뒤를 바꾼 말', def: 'p → q의 가정과 결론을 서로 바꾼 명제 q → p', memo: '원래가 참이어도 역은 거짓일 수 있음' },
    { id: 'contra', sym: '대우', easy: '앞뒤를 바꾸고 둘 다 뒤집은 말', def: 'p → q의 가정과 결론을 각각 부정하여 서로 바꾼 명제 ~q → ~p', memo: '원래 명제와 참 · 거짓이 같음' },
  ];
  const BY = Object.fromEntries([...ROWS, ...CONCEPTS, ...PROP].map((r) => [r.id, r]));
  const WORDY = new Set(['prop', 'cond', 'truth', 'counter', 'conv', 'contra']); // 낱말 톡 = 보기 단추 안엔 안 붙임 (고르기를 막지 않게) · ~ · → 기호는 붙임
  const propOn = () => { const id = ctx && ctx.lesson; if (!id) return false; if (id === 'eval-2') return true; const L = DS.Lessons && DS.Lessons.get && DS.Lessons.get(id); return !!(L && !L.eval && Number(L.no) >= 8); };
  // 명제 낱말 · 기호 찾기: text 한 줄 · whole = 문제 글 전체 → [{ i, len, id }]
  function propHits(t, whole) {
    const out = [], re = /~(?=\s*[pqr](?![A-Za-z]))|(?<=~?[pqr] )→(?= ~?[pqr](?![A-Za-z]))|반례|(?<![가-힣])대우(?=[은는이가를와의도]|[\s」:.,]|$)|(?<![가-힣])역(?=[은는이을과의도]|[\s」:.,]|$)|진리집합|명제|조건(?!제시)|(?<![A-Za-z])P(?![A-Za-z])/g; let m;
    const tp = /진리집합/.test(whole || t);
    while ((m = re.exec(t))) { const w = m[0]; const id = w === '~' ? 'neg' : w === '→' ? 'imp' : w === '반례' ? 'counter' : w === '역' ? 'conv' : w === '대우' ? 'contra' : w === '명제' ? 'prop' : w === '조건' ? 'cond' : 'truth'; if (w === 'P' && !tp) continue; out.push({ i: m.index, len: w.length, id }); }
    return out;
  }
  const esc = (s) => (DS.UI ? DS.UI.esc(s) : String(s));
  const pretty = (s) => (DS.UI ? DS.UI.pretty(s) : esc(s));

  // ── 문맥으로 기호 고르기 (#54 「A ∩ B = ∅ → 서로소 · n(A ∪ B) → 개수 공식 · Aᶜ → 여집합 · A − B → 차집합 · a ∈ A → 속한다」) ──
  //   text = 그 기호가 들어 있는 줄 전체(보이는 글자) · i = 기호 자리 → 기호 id (null = 누를 수 없음)
  const SETR = /[A-ZU)ᶜ}∅]$/; // 집합 쪽 끝 (대문자 · 괄호 · ᶜ · } · ∅)
  const before = (t, i) => t.slice(0, i).replace(/\s+$/, ''), after = (t, i, n = 1) => t.slice(i + n).replace(/^\s+/, '');
  const inNum = (t, i) => /n\(\s*[^()]*$/.test(t.slice(0, i)); // n( … 안
  const isDisj = (t, i) => { // A ∩ B = ∅ 한 덩어리 안
    const m = /[A-Z](?:ᶜ)?\s*∩\s*[A-Z](?:ᶜ)?\s*=\s*∅/g; let x;
    while ((x = m.exec(t))) { if (i >= x.index && i < x.index + x[0].length) return true; }
    return false;
  };
  const setLeft = (t, i) => { const b = before(t, i); if (!SETR.test(b)) return false; if (/\)$/.test(b)) { const k = b.lastIndexOf('('); if (k > 0 && /n$/.test(b.slice(0, k).replace(/\s+$/, ''))) return false; } return true; }; // 왼쪽이 집합 (n(…) 은 수)
  const setRight = (t, i, n = 1) => /^[A-Z(∅{]/.test(after(t, i, n)) && !/^n\(/.test(after(t, i, n));
  function pick(t, i) {
    const c = t[i];
    if (c === '∈') return 'in';
    if (c === '∉') return 'notin';
    if (c === '⊂') return 'sub';
    if (c === '⊄') return 'nsub';
    if (c === '∅') return isDisj(t, i) ? 'disj' : 'empty';
    if (c === '∩') return isDisj(t, i) ? 'disj' : 'cap';
    if (c === '∪') return inNum(t, i) ? 'ncup' : 'cup';
    if (c === 'ᶜ') return 'compl';
    if (c === '=') { if (isDisj(t, i)) return 'disj'; return setLeft(t, i) && !inNum(t, i) && setRight(t, i) && !/^\{[^}]*\|/.test(after(t, i)) ? 'eq' : null; }
    if (c === '−') return setLeft(t, i) && setRight(t, i) && !inNum(t, i) ? 'diff' : null;
    if (c === 'U') return /[A-Za-z가-힣]/.test(t[i - 1] || '') || /[A-Za-z]/.test(t[i + 1] || '') ? null : 'U';
    if (c === 'n' && t[i + 1] === '(' && !/[A-Za-z]/.test(t[i - 1] || '')) { const close = t.indexOf(')', i); return /∪/.test(t.slice(i, close < 0 ? undefined : close)) ? 'ncup' : 'n'; }
    if (c === '{') { const close = t.indexOf('}', i), inner = t.slice(i + 1, close < 0 ? undefined : close); if (/\|/.test(inner)) return 'build'; return /,/.test(inner) || /^\s*[0-9a-z]/.test(inner) ? 'list' : null; }
    if (c === '|') { const o = t.lastIndexOf('{', i), cl = t.lastIndexOf('}', i); return o > cl ? 'build' : null; }
    return null;
  }
  const CH = /[∈∉⊂⊄∅∩∪=−U{|]|n(?=\()/g;

  // ── 표시 (화면에 그린 뒤 텍스트에 점선 밑줄 칸을 씌움) ──
  const ROOTS = '#st-body .paper, #st-body .cr-story, #st-body .cr-prob, #st-body .cr-why, #st-body .items, #st-body .st-res, #quiz-q, #quiz-choices, .bn-fight .cr-story, .bn-fight .bf-body > p';
  const SKIP = 'button.btn, .sym-t, svg, input, textarea, .sheet-tag, .q-no, .item-no, small, .muted';
  const ANS = 'button, .choice, label, [data-o]'; // 🐞 2026-11-11 선생님(체험판): 답 칸(보기 · 칩 · 단추) 안의 기호는 톡을 붙이지 않음 — 누르면 기호 톡이 떠서 답 고르기를 막았음
  const lineOf = (el) => { const blk = el.closest('li, p, .item-q, .choice, .why-q, .bl-q, .mark, summary, div') || el.parentElement; return blk; };
  function textOf(blk) { // 보이는 글자 · ᶜ 위첨자(<sup class="cpl">C</sup>)는 ᶜ 한 글자로
    let s = ''; const map = []; // map[k] = { node, off } (ᶜ 는 { sup })
    const walk = (n) => {
      if (n.nodeType === 3) { for (let k = 0; k < n.data.length; k++) { map.push({ node: n, off: k }); } s += n.data; return; }
      if (n.nodeType !== 1) return;
      if (n.matches && n.matches('sup.cpl')) { map.push({ sup: n }); s += 'ᶜ'; return; }
      n.childNodes.forEach(walk);
    };
    walk(blk); return { s, map };
  }
  function markEl(root) {
    if (!root || root.dataset.stDone === root.innerHTML.length + '') return;
    const blocks = new Set();
    const pOn = propOn(), whole = pOn ? root.textContent : '';
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => ((/[∈∉⊂⊄∅∩∪=−U{|]|n\(/.test(n.data) || (pOn && /~|명제|조건|진리집합|P/.test(n.data))) && !(n.parentElement && n.parentElement.closest(SKIP)) ? 1 : 3) });
    let n; while ((n = tw.nextNode())) blocks.add(lineOf(n.parentElement));
    root.querySelectorAll('sup.cpl').forEach((sp) => { if (!sp.closest('.sym-t')) blocks.add(lineOf(sp)); });
    blocks.forEach((blk) => {
      if (!blk || !root.contains(blk)) return;
      const { s, map } = textOf(blk), hits = [];
      CH.lastIndex = 0; let m; while ((m = CH.exec(s))) { const id = pick(s, m.index); if (id) hits.push({ i: m.index, len: m[0] === 'n' ? 1 : 1, id }); }
      for (let k = 0; k < s.length; k++) if (s[k] === 'ᶜ' && map[k] && map[k].sup) hits.push({ i: k, id: 'compl' });
      if (pOn) propHits(s, whole).forEach((h) => hits.push(h));
      hits.sort((a, b) => b.i - a.i).forEach((h) => { // 뒤에서부터 (앞 자리 그대로)
        const at = map[h.i]; if (!at) return;
        if (at.sup) { if (at.sup.closest('.sym-t') || at.sup.closest(SKIP) || at.sup.closest(ANS)) return; const w = document.createElement('span'); w.className = 'sym-t'; w.dataset.st = h.id; at.sup.replaceWith(w); w.appendChild(at.sup); return; }
        if (!at.node.parentNode || (at.node.parentElement && at.node.parentElement.closest(SKIP))) return;
        const len = h.len || 1, last = map[h.i + len - 1]; if (!last || last.node !== at.node) return; // 낱말이 두 칸에 걸치면 건너뜀
        if (at.node.parentElement && at.node.parentElement.closest(ANS)) return; // 답 칸 안 = 기호 · 낱말 모두 안 붙임 (옛 #62 = 낱말만 뺐음) // #62 명제 낱말은 보기 단추 안엔 안 붙임 (「명제 · 참」 보기마다 있어 고르기를 막음 · ~ 기호는 붙임)
        const tail = at.node.splitText(at.off), rest = tail.splitText(len), w = document.createElement('span'); w.className = 'sym-t'; w.dataset.st = h.id;
        tail.replaceWith(w); w.appendChild(tail); void rest;
      });
    });
    // 개념 톡: 문제 글(.item-q · 문제 창 · 쓰기 화면 문제)에 칩 하나
    root.querySelectorAll('.item-q, .bl-q').forEach((q) => { if (q.querySelector('.sym-c')) return; const c = CONCEPTS.find((x) => x.where.test(q.textContent)); if (c) q.insertAdjacentHTML('beforeend', ` <span class="sym-t sym-c" data-st="${c.id}">${esc(c.sym)}</span>`); });
    if (root.id === 'quiz-q' && !root.querySelector('.sym-c')) { const c = CONCEPTS.find((x) => x.where.test(root.textContent)); if (c) root.insertAdjacentHTML('beforeend', ` <span class="sym-t sym-c" data-st="${c.id}">${esc(c.sym)}</span>`); }
    root.dataset.stDone = root.innerHTML.length + '';
  }
  let busy = false;
  function scan() { if (busy || !on()) return; busy = true; try { document.querySelectorAll(ROOTS).forEach(markEl); } finally { busy = false; } }
  const on = () => !document.body.classList.contains('st-off');

  // ── 말풍선 ──
  let bub = null, timer = 0;
  function close() { if (bub) { bub.remove(); bub = null; } clearTimeout(timer); }
  function open(el) {
    close(); const r = BY[el.dataset.st]; if (!r) return;
    bub = document.createElement('div'); bub.className = 'st-bub'; bub.setAttribute('role', 'tooltip');
    bub.innerHTML = `<b class="st-def"><span class="st-sym">${pretty(r.sym)}</span> ${pretty(r.def)}</b><i class="st-easy">💬 쉽게 말하면 ${pretty(r.easy)}</i>${r.memo ? `<button class="st-more" type="button">더 보기 ▾</button><small class="st-memo" hidden>${pretty(r.memo)}</small>` : ''}`;
    document.body.appendChild(bub);
    const a = el.getBoundingClientRect(), bw = Math.min(320, window.innerWidth - 16);
    bub.style.width = `${bw}px`;
    const x = Math.max(8, Math.min(window.innerWidth - bw - 8, a.left + a.width / 2 - bw / 2)), h = bub.offsetHeight;
    const up = a.top - h - 10 >= 4; bub.style.left = `${x}px`; bub.style.top = `${up ? a.top - h - 10 : a.bottom + 10}px`; bub.classList.add(up ? 'up' : 'down');
    bub.style.setProperty('--ax', `${Math.round(a.left + a.width / 2 - x)}px`);
    const mb = bub.querySelector('.st-more'); if (mb) mb.onclick = (e) => { e.stopPropagation(); const mm = bub.querySelector('.st-memo'); mm.hidden = false; mb.remove(); clearTimeout(timer); }; // 펼치면 닫을 때까지
    timer = setTimeout(close, 4000);
    count(r.id);
  }
  // 눌렀을 때: 기호 칸이면 말풍선 (보기 단추 안이어도 고르기는 안 함) · 말풍선 안은 그대로 · 바깥 = 닫기
  function onTap(e) {
    const t = e.target, s = t && t.closest && t.closest('.sym-t');
    if (bub && t && bub.contains(t)) return;
    if (s && on() && !s.closest(ANS)) { e.preventDefault(); e.stopPropagation(); open(s); return; } // 답 칸 안에 이미 붙은 톡이 있어도 누르면 그냥 고르기
    if (bub) close();
  }

  // ── 기록 ──
  let ctx = null; // { m: 계정 { c, n, test }, lesson }
  const setCtx = (m, lesson) => { ctx = lesson ? { m: m || null, lesson } : null; }; // #62: 계정이 없어도(성채 미리 보기 · 테스트) 차시는 기억 = 명제 낱말 표시 · 기록은 계정 있을 때만
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const pend = {}; let ptimer = 0;
  function count(id) {
    const c = ctx; if (!c || !c.m || c.m.c == null || !c.m.n || c.m.test || c.m.teacher || !DS.Net) return;
    const p = `xp/${ck(c.m.c)}/${c.m.n}/st/${ck(c.lesson)}/${id}`; pend[p] = (pend[p] || 0) + 1;
    clearTimeout(ptimer); ptimer = setTimeout(flush, 1500); // 모아서 한 번에 (가벼움)
  }
  async function flush() {
    const ps = Object.keys(pend); for (const p of ps) { const add = pend[p]; delete pend[p]; try { const cur = Number(await DS.Net.get(p)) || 0; await DS.Net.set(p, cur + add); } catch (e) { /* 기록은 덤 */ } }
  }

  // 대시보드: xp/{반} → [{ id, sym, n, who }] 많이 누른 순 (lesson = 차시 거르기 · 없으면 모두)
  function rank(xpByNum, lesson) {
    const agg = {};
    Object.values(xpByNum || {}).forEach((x) => { const st = (x || {}).st || {}; Object.entries(st).forEach(([lid, bySym]) => { if (lesson && lid !== lesson) return; Object.entries(bySym || {}).forEach(([id, n]) => { const a = (agg[id] = agg[id] || { n: 0, who: 0 }); a.n += Number(n) || 0; a.who += 1; }); }); });
    return Object.entries(agg).filter(([id]) => BY[id]).map(([id, a]) => ({ id, sym: BY[id].sym, easy: BY[id].easy, n: a.n, who: a.who })).sort((a, b) => b.n - a.n);
  }

  function start() {
    if (typeof document === 'undefined' || start.done) return; start.done = true;
    document.addEventListener('click', onTap, true);
    window.addEventListener('scroll', () => { if (bub) close(); }, true);
    let raf = 0; const mo = new MutationObserver(() => { if (busy || raf) return; raf = requestAnimationFrame(() => { raf = 0; scan(); }); });
    mo.observe(document.body, { childList: true, subtree: true });
    scan();
  }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start(); }
  return { ROWS, CONCEPTS, PROP, BY, pick, propHits, propOn, setCtx, rank, scan, close, flush, _markEl: markEl };
})();
