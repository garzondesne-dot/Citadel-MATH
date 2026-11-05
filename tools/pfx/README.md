# pixelfx 이펙트 굽기 (2026-11-06)

[patch-gg/pixelfx](https://github.com/patch-gg/pixelfx) (MIT · 코드로 그리는 도트 이펙트 244종)를 **그림 띠(webp)로 구워** 게임에 넣는다.
게임은 빌드 도구 없이 돌아가므로 라이브러리(ES 모듈)를 그대로 넣지 않는다.

1. `git clone --depth 1 https://github.com/patch-gg/pixelfx.git` (scratchpad 에)
2. 우리가 새로 만든 탄: `custom/*.js` → `pixelfx/src/fx/projectiles/` 에 복사 (`node tools/new.mjs projectiles/<이름> --loop` 로 목록 등록 뒤 덮어쓰기)
   - `note-bolt` 🎵 음유시인 · `potion-flask` 🧪 연금술사 · `sigma-rune` ∑ 수학자
3. `node tools/render.mjs <분류/이름> --sheet --no-actor` → `records/<id>/<이름>.png + .json`
4. `python3 -I bake.py <records> <id> <출력 이름> <최대 초> <fps> <출력 폴더>` → 가로 띠 webp + 메타(크기 · 프레임 · fps · 맞는 점 px/py · 타격감 act)
5. 후보 갤러리: `gallery_gen.py` + `gallery_tpl.html` (meta.jsonl · fx/ · 용사 시트로 움직이는 비교 페이지)

크레딧: pixelfx (MIT) · 일부는 Hugo Duprez · Sprite Fusion (MIT) 방식. 갤러리 폰트(Patch Pixel)는 쓰지 않는다.
