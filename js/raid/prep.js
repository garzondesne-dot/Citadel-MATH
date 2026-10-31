// 수업 준비 화면 (PC): 차시를 고르고 → 도입·개념 설명 단계마다 학습지 이미지 올리기 · 기준% 기본값
// 이미지는 줄여서(가로 최대 1400px, JPEG) Firebase prep/{차시}/img/{단계} 에 저장한다 — 저장소에는 넣지 않는다.
// 학생 명단 올리기 · 피드백 잠금 목록은 계정(2단계)·마무리(3단계)에서 이 화면에 붙는다.
window.DS = window.DS || {};

DS.Prep = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  let L = null, data = {}, stop = null;

  function enter(lessonId) {
    L = DS.Lessons.get(lessonId);
    DS.UI.show('screen-prep');
    if (stop) stop();
    stop = DS.Net.watch(`prep/${L.id}`, (v) => { data = v || {}; render(); });
  }
  function render() {
    const slots = L.steps.filter((s) => s.kind === 'intro' || s.kind === 'concept');
    $('#p-body').innerHTML = `<div class="panel framed"><h2>📋 수업 준비 · ${esc(L.unit)} ${esc(L.title)}</h2>
        <p class="muted small">학습지: ${esc(L.sheet || '')} · 이미지는 종합상황실 화면 절반에 떠요. 저장소에는 올라가지 않고 Firebase 에만 저장돼요.</p>
        <div class="pct-row"><span>몬스터 체력 기준% 기본값</span><input id="p-pct" type="number" min="10" max="100" step="5" value="${data.pct || L.defaultPct || 90}"><button class="btn" id="p-pct-save">저장</button><span class="muted small">수업 중에는 교사 폰에서 몬스터마다 바꿔요</span></div></div>
      ${slots.map((s) => {
        const img = (data.img || {})[s.id];
        return `<div class="panel framed p-slot"><div class="p-slot-head"><b>${esc(s.title)}</b><label class="btn small">🖼 이미지 고르기<input type="file" accept="image/*" data-slot="${s.id}" hidden></label>${img ? `<button class="btn small" data-del="${s.id}">지우기</button>` : ''}</div>
          ${img ? `<img class="p-prev" src="${img}" alt="${esc(s.title)}">` : '<p class="muted small">아직 없음 — 학습지에서 이 부분을 캡처해 올려 주세요.</p>'}</div>`;
      }).join('')}`;
    $('#p-pct-save').onclick = () => DS.Control.run(async () => { await DS.Act.setDefaultPct(L.id, Math.max(10, Math.min(100, Number($('#p-pct').value) || 90))); DS.UI.toast('기준% 기본값을 저장했어요. 새로 만드는 수업부터 적용돼요.'); });
    document.querySelectorAll('[data-slot]').forEach((inp) => (inp.onchange = () => DS.Control.run(async () => {
      const f = inp.files[0]; if (!f) return;
      DS.UI.toast('이미지를 줄여서 올리는 중…');
      await DS.Act.setImage(L.id, inp.dataset.slot, await shrink(f));
      DS.UI.toast('올렸어요!');
    })));
    document.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { if (confirm('이 이미지를 지울까요?')) await DS.Act.setImage(L.id, b.dataset.del, null); })));
  }
  // 가로 최대 1400px · JPEG 0.82 로 줄인다 (Realtime Database 한 칸에 담기 좋게)
  function shrink(file) {
    return new Promise((res, rej) => {
      const rd = new FileReader();
      rd.onerror = () => rej(new Error('이미지를 읽지 못했어요.'));
      rd.onload = () => {
        const img = new Image();
        img.onerror = () => rej(new Error('이미지 파일이 아니에요.'));
        img.onload = () => {
          const k = Math.min(1, 1400 / img.width), cv = document.createElement('canvas');
          cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
          const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
          res(cv.toDataURL('image/jpeg', 0.82));
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }
  return { enter };
})();
