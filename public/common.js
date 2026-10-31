// 세 화면 공통: 화면 버전과 서버 상태를 표시한다.
import { VERSION } from './version.js';

export async function showStatus(el) {
  el.textContent = `화면 v${VERSION} · 서버 확인 중…`;
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    const h = await res.json();
    const same = h.version === VERSION ? '' : ` (서버 v${h.version} — 새로고침 필요)`;
    el.textContent = `화면 v${VERSION}${same} · 서버 ${h.ok ? '✅ 연결됨' : '❌ ' + (h.db && h.db.error || '오류')}`;
    el.dataset.state = h.ok ? 'ok' : 'bad';
  } catch (e) {
    el.textContent = `화면 v${VERSION} · 서버 ❌ 응답 없음`;
    el.dataset.state = 'bad';
  }
}
