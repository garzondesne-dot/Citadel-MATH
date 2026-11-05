# ⚔ 공격 이펙트 후보 v1 (2026-11-06) — 다른 대화방에서 보는 법

- 저장소 브랜치 `hero-v2` (= `ccr-c61d0766-y8aopp`) 의 이 폴더. 받기: `git fetch origin hero-v2 && git checkout origin/hero-v2 -- tools/pfx assets/art`
- **움직이는 갤러리**: `gallery.html` 을 브라우저로 연다 (같은 폴더 `fx/` 와 저장소 `assets/art/` 용사 · 몬스터 그림을 불러옴 → 폴더 구조 그대로 둘 것).
  `python3 -m http.server 8765` (저장소 맨 위) 뒤 `http://localhost:8765/tools/pfx/out/candidates-v1/gallery.html` 도 됨. 스크린샷은 playwright.
- **정지 그림** (`preview/`): `library-samples.png` pixelfx 원본 샘플 · `new-projectiles.png` 새로 만든 탄 3종 · `ranged-hero-poses.png` 원거리 8명 공격 줄(왼쪽 4칸) · 두 손 줄(오른쪽 2칸) · `ranged-demo-frames.png` 원거리 시연 프레임 · `melee-and-effects-frames.png` 근접 시연 + 이펙트 타일.
- `fx/*.webp` = 가로 띠(칸 w×h · n칸 · fps) · `meta.jsonl` = 칸마다 { id(pixelfx), w, h, n, fps, px, py(맞는 점), loop, act(타격감: freeze · shake · amp · push) }.

## 후보 표 (사용자 선택 기다림)

| 이펙트 (지금 이름) | 후보 1 (`fx/<칸>1`) | 후보 2 (`fx/<칸>2`) |
|---|---|---|
| ⚔ 베기 `cut` | melee/sword-slash | impacts/hit-spark |
| 🔥 불꽃 `flame` | explosions/small-explosion | fire/fire-ring |
| ⚡ 번개 `spark` | lightning/zap-hit | lightning/chain-lightning |
| ❄ 얼음 `frost` | ice/snowflake-burst | ice/ice-spikes |
| ✨ 별 `twinkle` | arcane/mana-burst | holy/sunburst |
| 🔮 마법탄 `orb` | arcane/arcane-missiles | impacts/crit-hit |
| 🔥 화염 폭발 `fire` | explosions/big-explosion | fire/flame-pillar |
| ⚡ 천둥 낙뢰 `lightning` | lightning/lightning-strike | lightning/thunderclap |
| ❄ 얼음 파쇄 `ice` | ice/ice-shatter | ice/frost-nova |
| ✨ 별빛 폭죽 `stars` | explosions/firework-burst | arcane/star-fall |
| ⚔ 삼연 참격 `slash` | melee/dagger-flurry | melee/double-slash |
| 🌀 차원 소용돌이 `vortex` | arcane/portal | shadow/black-hole |
| 🪶 황금 날개 `wings` | holy/feather-burst | holy/smite |

| 원거리 용사 | 탄 (`fx/p-*`) |
|---|---|
| 엘프 궁수 | `p-elf` projectiles/arrow |
| 마녀 | `p-witch` arcane/arcane-orb (보라) |
| 현자 | `p-sage` fire/fireball |
| 빙결 마법사 | `p-frost` ice/ice-lance |
| 사제 | `p-priest` arcane/arcane-orb (금빛 팔레트) |
| 음유시인 | `p-bard` 새로 만듦 `tools/pfx/custom/note-bolt.js` |
| 연금술사 | `p-alch` 새로 만듦 `tools/pfx/custom/potion-flask.js` |
| 수학자 | `p-math` 새로 만듦 `tools/pfx/custom/sigma-rune.js` |

근접 10: 검사 · 금발 검사 · 닌자 · 창술사 · 드워프 · 성기사 · 격투가 · 무희 · 해적 · 조련사. 결정 = `docs/DECISIONS.md` 「⚔ 공격 = 근접 / 원거리」.
라이선스: pixelfx MIT (크레딧 표기) · 이 폴더는 미리보기용이라 게임(`index.html` · `sw.js`)에 연결돼 있지 않음.
