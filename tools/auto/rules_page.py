# 📋 Firebase 규칙 복사 페이지 만들기 (2026-11-09 선생님 「규칙은 다운로드 말고 복붙하게」)
#   python3 tools/auto/rules_page.py <out.html> → Artifact 로 다시 게시 (같은 URL: https://claude.ai/artifact/8d1rYHXCaErGi9ct49JdDU · 다른 대화에서는 url 로)
import html, hashlib, datetime, subprocess
src='/home/user/Citadel-MATH/firebase/database.rules.json'; txt=open(src,encoding='utf-8').read()
ver=subprocess.run(['git','-C','/home/user/Citadel-MATH','log','-1','--format=%h · %ad','--date=format:%Y-%m-%d %H:%M','--','firebase/database.rules.json'],capture_output=True,text=True).stdout.strip()
page=f'''<title>Firebase 규칙 복사</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* 한 화면 도구: 위 = 순서 안내 + 큰 복사 단추 · 아래 = 규칙 전문(직접 선택해도 됨) */
:root {{ --bg:#f6f3ee; --fg:#22201c; --muted:#6d665b; --line:#d9d1c3; --panel:#fffdf9; --accent:#b4651d; --ok:#2f7d4f; --code-bg:#f1ece3;
  --f-ui: "Noto Sans KR", system-ui, sans-serif; --f-code: "JetBrains Mono", ui-monospace, Menlo, monospace; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#1b1916; --fg:#efe9df; --muted:#a59c8e; --line:#3a352e; --panel:#24211d; --accent:#e39a50; --ok:#6cc995; --code-bg:#15130f; color-scheme: dark; }} }}
:root[data-theme="dark"] {{ --bg:#1b1916; --fg:#efe9df; --muted:#a59c8e; --line:#3a352e; --panel:#24211d; --accent:#e39a50; --ok:#6cc995; --code-bg:#15130f; color-scheme: dark; }}
body {{ background: var(--bg); color: var(--fg); font: 15px/1.6 var(--f-ui); padding-block: 20px 32px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }}
main {{ max-width: 760px; margin: 0 auto; display: grid; gap: 16px; }}
h1 {{ font-size: 22px; margin: 0; text-wrap: balance; }}
.meta {{ color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; }}
ol {{ margin: 0; padding-left: 1.3em; display: grid; gap: 4px; }}
.copy {{ font: 700 18px var(--f-ui); color: #fff; background: var(--accent); border: 0; border-radius: 10px; padding: 14px 18px; cursor: pointer; }}
.copy:focus-visible {{ outline: 3px solid var(--fg); outline-offset: 2px; }}
.status {{ min-height: 1.4em; color: var(--ok); font-weight: 700; }}
textarea {{ width: 100%; min-width: 0; box-sizing: border-box; height: 46vh; font: 12px/1.45 var(--f-code); color: var(--fg); background: var(--code-bg); border: 1px solid var(--line); border-radius: 8px; padding: 10px; resize: vertical; }}
</style>
<main>
  <h1>Firebase 규칙 복사</h1>
  <p class="meta">모두의 던전 · firebase/database.rules.json · 마지막 변경 {html.escape(ver)} · {len(txt):,}자</p>
  <ol><li>아래 <b>「규칙 전체 복사」</b>를 누르세요.</li><li>Firebase 콘솔 → Realtime Database → <b>규칙</b> 탭을 엽니다.</li><li>기존 내용을 모두 지우고 붙여 넣은 뒤 <b>게시</b>를 누릅니다.</li></ol>
  <button class="copy" id="copy" type="button">📋 규칙 전체 복사</button>
  <p class="status" id="status" aria-live="polite"></p>
  <textarea id="rules" readonly spellcheck="false" aria-label="규칙 전문">{html.escape(txt)}</textarea>
</main>
<script>
const ta = document.getElementById('rules'), st = document.getElementById('status');
document.getElementById('copy').addEventListener('click', async () => {{
  try {{ await navigator.clipboard.writeText(ta.value); st.textContent = '✅ 복사했어요 — 콘솔 규칙 칸에 붙여 넣으세요'; }}
  catch (e) {{ ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length); try {{ document.execCommand('copy'); st.textContent = '✅ 복사했어요 (안 되면 선택된 글을 길게 눌러 복사)'; }} catch (e2) {{ st.textContent = '글이 선택됐어요 — 길게 눌러 「복사」를 고르세요'; }} }}
}});
</script>
'''
open(__import__('sys').argv[1] if len(__import__('sys').argv) > 1 else 'rules-copy.html','w',encoding='utf-8').write(page); print('ok', len(page))
