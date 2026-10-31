// 마지막 한마디 거르개: 20자로 자르고, 욕설·비하 표현은 ＊ 로 가린다 (bad = true → 교사 목록 맨 위)
// 띄어쓰기·숫자·특수문자를 섞어 피해 가는 것도 잡도록 글자만 남겨 비교한다. 완벽하지 않으니 교사 숨김·잠금이 함께 있다.
window.DS = window.DS || {};

DS.Words = (function () {
  const MAX = 20;
  // 자주 쓰는 욕설·비하 표현의 뿌리 (부분 일치)
  const BAD = ['시발', '씨발', '씨빨', '시바', '씨바', 'ㅅㅂ', 'ㅆㅂ', '병신', 'ㅂㅅ', '븅신', '빙신', '좆', 'ㅈㄴ', '존나', '졸라', '개새', '개색', '새끼', 'ㅅㄲ', '닥쳐', '꺼져', '미친', 'ㅁㅊ', '지랄', 'ㅈㄹ', '엿먹', 'fuck', 'shit', '애미', '애비', '느금', '니미', '엠창', '등신', '찐따', '죽어', '꺼지', '빡대가리', '돌대가리', '장애'];
  const strip = (s) => s.toLowerCase().replace(/[\s\d!-/:-@[-`{-~·…ㆍ_]/g, '');
  function clean(text) {
    let t = String(text || '').replace(/\s+/g, ' ').trim().slice(0, MAX);
    let bad = false;
    const flat = strip(t);
    BAD.forEach((w) => {
      if (!flat.includes(w)) return;
      bad = true;
      // 원문에서 그 글자들을 찾아 가린다 (사이에 낀 공백·기호까지)
      const re = new RegExp(w.split('').map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s\\d!-/:-@[-`{-~·…ㆍ_]*'), 'gi');
      t = t.replace(re, (m) => '＊'.repeat(Math.min(3, m.length)));
    });
    return { text: t, bad };
  }
  const CHIPS = ['오늘 재밌었어요', '이제 알겠다!', '조금 어려워요 ㅠ', '다음 던전 기대!', '재도전 성공!', '보스 잡았다!'];
  return { clean, MAX, CHIPS };
})();
