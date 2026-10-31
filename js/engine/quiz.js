// 문제 창 (DIMENSION SLASHER 엔진): 형식 6종 — 고르기 · 기호 넣기 · O/X · 숫자 패드 · 여러 개 고르기 · 부분집합 모두 만들기
// ask(card, prob, opt) → Promise<true|false|{ given }>  (opt.collect: 채점하지 않고 학생 답만 돌려준다 — 협동 전투용)
// grade(prob, given) 는 화면과 분리돼 있어 교사 기기·테스트에서 그대로 쓴다
window.DS = window.DS || {};

DS.Quiz = (function () {
  const $ = (s) => document.querySelector(s);
  const { pretty, esc } = DS.UI;
  const S = () => DS.SetGen;
  const setLabel = (arr) => S().setStr(arr);

  // 채점 (화면과 분리, 테스트에서도 쓴다). given: 형식별 학생 답
  //  choice: 번호 / blanks: 기호 배열 / ox: true·false / number: 수 / multi: 번호 배열 / subsets: 부분집합 배열
  function grade(prob, given) {
    switch (prob.type) {
      case 'blanks': return prob.items.every((it, k) => given[k] === it.answer);
      case 'ox': return given === prob.answer;
      case 'number': return Number(given) === prob.answer;
      case 'multi': return given.slice().sort().join(',') === prob.answer.slice().sort().join(',');
      case 'subsets': {
        const want = new Set(S().allSubsets(prob.base).map(S().key));
        const got = new Set(given.map(S().key));
        return got.size === given.length && got.size === want.size && [...want].every((k) => got.has(k));
      }
      default: return given === prob.answerIndex;
    }
  }
  // 부분집합 모두 만들기: 무엇이 빠졌는지 개념 메시지
  function subsetsNote(prob, given) {
    const keys = given.map(S().key), n = prob.base.length;
    if (new Set(keys).size !== keys.length) return '같은 부분집합을 두 번 만들었어요.';
    if (!keys.includes('')) return '∅ (공집합)이 빠졌어요. 공집합은 모든 집합의 부분집합!';
    if (!keys.includes(S().key(prob.base))) return `${setLabel(prob.base)} 자신이 빠졌어요. 모든 집합은 자기 자신의 부분집합!`;
    return `${given.length}개를 만들었어요. 원소가 ${n}개면 부분집합은 2${'⁰¹²³⁴⁵⁶⁷⁸⁹'[n]} = ${2 ** n}개!`;
  }

  // 문제를 띄우고 정답 여부를 Promise 로 돌려준다. 오답이면 해설을 보여 준 뒤 닫는다.
  // opt.tag: 머리말 (예: '✨ 연성 예제'), opt.teacher: 문제풀이모드 표시
  function ask(card, prob, opt = {}) {
    DS.Quiz.last = prob; // 자동 플레이 테스트용 (읽기 전용)
    return new Promise((resolve) => {
      const root = $('#quiz');
      $('#quiz-card').textContent = (opt.tag ? opt.tag + ' · ' : '') + (card.name || '');
      $('#quiz-formula').innerHTML = pretty(card.formula || '');
      $('#quiz-q').innerHTML = pretty(prob.question);
      const sol = $('#quiz-sol'), next = $('#quiz-next'), box = $('#quiz-choices');
      sol.classList.add('hidden');
      next.classList.add('hidden');
      box.innerHTML = '';
      box.className = `choices q-${prob.type || 'choice'}`;
      root.classList.remove('hidden', 'ok', 'ng');
      let done = false;
      const finish = (ok, note) => {
        if (done) return;
        done = true;
        box.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        if (ok) {
          DS.Sound.correct();
          root.classList.add('ok');
          setTimeout(() => { root.classList.add('hidden'); resolve(true); }, 700);
          return;
        }
        DS.Sound.wrong();
        root.classList.add('ng');
        sol.innerHTML = (note ? `<b class="ng-note">${pretty(note)}</b><br>` : '') + `<b>해설</b> ${pretty(prob.solution)}`;
        sol.classList.remove('hidden');
        next.classList.remove('hidden');
        next.onclick = () => { root.classList.add('hidden'); resolve(false); };
      };
      // 협동 전투: 채점·정답 공개 없이 학생 답만 모은다 (정답은 공동 공격 연출 뒤에 공개)
      const collect = (given) => {
        if (!opt.collect) return false;
        done = true;
        box.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        DS.Sound.clank();
        setTimeout(() => { root.classList.add('hidden'); resolve({ given }); }, 250);
        return true;
      };
      const submitBtn = (label, onClick) => {
        const b = document.createElement('button');
        b.className = 'btn primary q-submit';
        b.textContent = label;
        b.addEventListener('click', onClick);
        box.appendChild(b);
        return b;
      };
      const t = prob.type || 'choice';

      if (t === 'choice') {
        prob.choices.forEach((ch, i) => {
          const b = document.createElement('button');
          b.className = 'choice';
          b.innerHTML = `<span class="no">${i + 1}</span><span class="math">${pretty(ch)}</span>`;
          b.addEventListener('click', () => {
            if (done) return;
            if (collect(i)) { b.classList.add('on'); return; }
            box.children[prob.answerIndex].classList.add('right');
            if (i !== prob.answerIndex) b.classList.add('wrong');
            finish(i === prob.answerIndex);
          });
          box.appendChild(b);
        });
      } else if (t === 'blanks') {
        // □ 칸마다 기호 버튼. 모두 채우면 [제출]
        const picks = prob.items.map(() => null);
        prob.items.forEach((it, k) => {
          const row = document.createElement('div');
          row.className = 'blank-row';
          row.innerHTML = `<span class="math bl-side">${pretty(it.left)}</span><b class="bl-box">□</b><span class="math bl-side">${pretty(it.right)}</span>`
            + `<span class="bl-opts">${prob.options.map((o) => `<button class="choice sym" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</span>`;
          row.querySelectorAll('.sym').forEach((b) => b.addEventListener('click', () => {
            if (done) return;
            picks[k] = b.dataset.o;
            row.querySelector('.bl-box').textContent = picks[k];
            row.querySelectorAll('.sym').forEach((x) => x.classList.toggle('on', x === b));
            sub.disabled = picks.some((p) => p == null);
            DS.Sound.clank();
          }));
          box.appendChild(row);
        });
        const sub = submitBtn('제출', () => {
          if (collect(picks.slice())) return;
          box.querySelectorAll('.blank-row').forEach((row, k) => row.classList.add(picks[k] === prob.items[k].answer ? 'right' : 'wrong'));
          finish(grade(prob, picks));
        });
        sub.disabled = true;
      } else if (t === 'ox') {
        [['O', true], ['X', false]].forEach(([lab, v]) => {
          const b = document.createElement('button');
          b.className = `choice ox ox-${lab}`;
          b.textContent = lab;
          b.addEventListener('click', () => {
            if (done) return;
            if (collect(v)) { b.classList.add('on'); return; }
            const ok = grade(prob, v);
            b.classList.add(ok ? 'right' : 'wrong');
            finish(ok);
          });
          box.appendChild(b);
        });
      } else if (t === 'number') {
        // 숫자 패드 (폰에서 키보드가 화면을 가리지 않게)
        let v = '';
        const disp = document.createElement('div');
        disp.className = 'num-disp';
        disp.textContent = '?';
        box.appendChild(disp);
        const pad = document.createElement('div');
        pad.className = 'num-pad';
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '−', '0', '⌫'].forEach((k) => {
          const b = document.createElement('button');
          b.className = 'choice key';
          b.textContent = k;
          b.addEventListener('click', () => {
            if (done) return;
            if (k === '⌫') v = v.slice(0, -1);
            else if (k === '−') v = v.startsWith('-') ? v.slice(1) : '-' + v;
            else if (v.replace('-', '').length < 4) v += k;
            disp.textContent = v ? v.replace('-', '−') : '?';
            sub.disabled = !/\d/.test(v);
            DS.Sound.clank();
          });
          pad.appendChild(b);
        });
        box.appendChild(pad);
        const sub = submitBtn('제출', () => {
          if (collect(Number(v))) return;
          const ok = grade(prob, Number(v));
          disp.classList.add(ok ? 'right' : 'wrong');
          finish(ok, ok ? '' : `정답은 ${String(prob.answer).replace('-', '−')}`);
        });
        sub.disabled = true;
      } else if (t === 'multi') {
        const on = new Set();
        prob.options.forEach((o, i) => {
          const b = document.createElement('button');
          b.className = 'choice multi';
          b.innerHTML = `<span class="no">${'①②③④⑤⑥⑦⑧'[i]}</span><span class="math">${pretty(o)}</span>`;
          b.addEventListener('click', () => {
            if (done) return;
            if (on.has(i)) on.delete(i); else on.add(i);
            b.classList.toggle('on', on.has(i));
            sub.disabled = !on.size;
            DS.Sound.clank();
          });
          box.appendChild(b);
        });
        const sub = submitBtn('모두 골랐어요 · 제출', () => {
          if (collect([...on])) return;
          const btns = box.querySelectorAll('.choice.multi');
          prob.answer.forEach((i) => btns[i].classList.add('right'));
          on.forEach((i) => { if (!prob.answer.includes(i)) btns[i].classList.add('wrong'); });
          finish(grade(prob, [...on]));
        });
        sub.disabled = true;
      } else if (t === 'subsets') {
        // 원소를 눌러 집합을 만들고 [추가] → 모은 부분집합 목록 → [제출]
        const made = [];
        let cur = new Set();
        const pickRow = document.createElement('div');
        pickRow.className = 'sub-pick';
        const shelf = document.createElement('div');
        shelf.className = 'sub-shelf';
        const now = document.createElement('div');
        now.className = 'sub-now math';
        const draw = () => {
          const arr = prob.base.filter((x) => cur.has(x));
          now.textContent = `만드는 중: ${setLabel(arr)}`;
          shelf.innerHTML = made.length ? made.map((m, k) => `<button class="sub-chip" data-k="${k}">${esc(setLabel(m))} ✕</button>`).join('') : '<span class="muted small">아직 없음</span>';
          shelf.querySelectorAll('.sub-chip').forEach((c) => c.addEventListener('click', () => { if (done) return; made.splice(Number(c.dataset.k), 1); draw(); }));
          cnt.textContent = `모은 부분집합 ${made.length}개`;
          sub.disabled = !made.length;
        };
        prob.base.forEach((x) => {
          const b = document.createElement('button');
          b.className = 'choice key elem';
          b.textContent = String(x).replace('-', '−');
          b.addEventListener('click', () => { if (done) return; if (cur.has(x)) cur.delete(x); else cur.add(x); b.classList.toggle('on', cur.has(x)); draw(); DS.Sound.clank(); });
          pickRow.appendChild(b);
        });
        const add = document.createElement('button');
        add.className = 'btn small sub-add';
        add.textContent = '＋ 이 집합 추가';
        add.addEventListener('click', () => {
          if (done) return;
          const arr = prob.base.filter((x) => cur.has(x));
          if (made.some((m) => S().key(m) === S().key(arr))) { DS.UI.toast('이미 모은 부분집합이에요.'); return; }
          made.push(arr);
          cur = new Set();
          pickRow.querySelectorAll('.elem').forEach((e) => e.classList.remove('on'));
          DS.Sound.clank();
          draw();
        });
        const cnt = document.createElement('p');
        cnt.className = 'sub-count';
        box.append(pickRow, now, add, cnt, shelf);
        const sub = submitBtn('다 모았어요 · 제출', () => {
          if (collect(made.map((m) => m.slice()))) return;
          const ok = grade(prob, made);
          finish(ok, ok ? '' : subsetsNote(prob, made));
        });
        draw();
      }
    });
  }

  return { ask, grade, subsetsNote };
})();
