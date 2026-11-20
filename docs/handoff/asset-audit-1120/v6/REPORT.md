# 🧙 용사 v6 · 가장자리 despill (2단계 · 2026-11-20 · 게임에 넣지 않음)

- 74개 파일(전투 시트 v5 · 각성 v5 · 숨쉬기 idle8 · 각성 idle8) 전부 + 마검사 오라 1개 = **75파일** · 같은 이름 규칙: `-v5`→`-v6` · `-idle8-v1`→`-idle8-v6` · `aura10-spellblade-v1`→`aura10-spellblade-v6`. 같은 칸 크기(256×144) · 무손실 webp.
- 방법 (`despill6.py` · `build_v6.py`): ① 투명에 닿은 2픽셀 띠 안에서 초록/분홍으로 쏠린 픽셀만 본다 ② 그 안쪽 5×5 에 같은 색 몸 · 이펙트가 많으면(진짜 마법진 · 옷) 그대로 둔다 ③ 어두운 초록 · 분홍 테두리 → 표준 윤곽선 색(#1a1228 남보라) ④ 밝은 것은 크로마키에 섞인 색(초록 쏠림 · 마젠타)만 이웃 몸 색 평균으로, 청록 · 분홍 이펙트 빛은 그대로 ⑤ 앞서 만든 fixed/ 15칸(떨어진 점 지우기)을 합침.
- 검증: **alpha 는 지울 때만 바뀜**(assert 통과 · 파일 75개) · 바뀐 곳은 모두 투명 옆 2px 띠 안 또는 fixed/ 와 같은 자리 · 가장자리 초록/분홍 쏠림 픽셀 합계 222,687 → 33,228 (같은 기준 · 74파일).
- 비교 그림 = `v6/cmp/<파일>.png` (파일마다 변화 가장 큰 3칸 · 왼쪽 = 원본 + 바뀐 픽셀 노랑 · 오른쪽 = 고침). 파일별 표 = `v6/v6.json`.

## 원래 색이라 남긴 곳 · 달라진 곳 (눈으로 본 것)
- 남김: 한수 · 미지 · 폴라 등 **마법진 · 룬 · 십자 이펙트 안의 초록 · 분홍 · 청록**(미지 초록 마법진 · 사제 · 해골 소환사 초록 십자 · 한수 분홍 룬 원).
- 남김: 머리 · 옷 안쪽(가장자리가 아닌 곳)의 초록 · 분홍 점(예: 미지 머리 옆 초록 잎 점 · 볼트 배낭 분홍 점) — 「테두리만」 원칙. 필요하면 안쪽 점도 다음 판.
- 달라진 것: 마검사 승리 반짝이(민트색 별)의 **초록 테두리가 사라져 조금 더 하얗게** 보임 · 나머지 몸 둘레 테두리는 모두 어두운 남보라 한 가지로 통일.

## 파일별 (바뀐 픽셀 수 · 가장자리 쏠림 전 → 후)

| 원본 | v6 | 바뀐 픽셀 | 쏠림 전 | 쏠림 후 |
|---|---|---|---|---|
| hero-dknight-v5.webp | hero-dknight-v6.webp | 14579 | 15022 | 2844 |
| hero-astro-v5.webp | hero-astro-v6.webp | 13204 | 11744 | 995 |
| hero-dancer-v5.webp | hero-dancer-v6.webp | 11842 | 9455 | 616 |
| hero-bone-v5.webp | hero-bone-v6.webp | 11380 | 12466 | 2868 |
| hero-valkyrie-v5.webp | hero-valkyrie-v6.webp | 10795 | 4373 | 394 |
| hero-mathgirl-v5.webp | hero-mathgirl-v6.webp | 10045 | 11252 | 2989 |
| hero-dragoon-v5.webp | hero-dragoon-v6.webp | 9864 | 5152 | 266 |
| hero-geometry-v5.webp | hero-geometry-v6.webp | 9562 | 4075 | 200 |
| hero-priest-v5.webp | hero-priest-v6.webp | 9140 | 10521 | 2743 |
| hero-spellblade-v5.webp | hero-spellblade-v6.webp | 8821 | 12168 | 4254 |
| hero-elemental-v5.webp | hero-elemental-v6.webp | 8491 | 5069 | 1023 |
| hero-pirate-v5.webp | hero-pirate-v6.webp | 8474 | 3463 | 170 |
| hero-sword-v5.webp | hero-sword-v6.webp | 8418 | 3666 | 187 |
| hero-lancer-v5.webp | hero-lancer-v6.webp | 8198 | 3412 | 104 |
| hero-math-v5.webp | hero-math-v6.webp | 8033 | 3295 | 79 |
| hero-mechanic-v5.webp | hero-mechanic-v6.webp | 8019 | 4482 | 125 |
| hero-drone-v5.webp | hero-drone-v6.webp | 7815 | 4413 | 411 |
| hero-paladin-v5.webp | hero-paladin-v6.webp | 7740 | 3445 | 315 |
| hero-monk-v5.webp | hero-monk-v6.webp | 7498 | 2775 | 164 |
| hero-witch-v5.webp | hero-witch-v6.webp | 7442 | 10949 | 4317 |
| hero-merchant-v5.webp | hero-merchant-v6.webp | 7334 | 3420 | 111 |
| hero-abacus-v5.webp | hero-abacus-v6.webp | 7249 | 1829 | 31 |
| hero-alchemist-v5.webp | hero-alchemist-v6.webp | 7123 | 4002 | 309 |
| hero-ninja-v5.webp | hero-ninja-v6.webp | 7105 | 3425 | 363 |
| hero-dwarf-v5.webp | hero-dwarf-v6.webp | 7103 | 3142 | 68 |
| hero-frost-v5.webp | hero-frost-v6.webp | 7075 | 3449 | 136 |
| hero-tamer-v5.webp | hero-tamer-v6.webp | 6715 | 3063 | 242 |
| hero-crossbow-v5.webp | hero-crossbow-v6.webp | 6686 | 2684 | 218 |
| hero-blond-v5.webp | hero-blond-v6.webp | 6519 | 2623 | 93 |
| hero-sage-v5.webp | hero-sage-v6.webp | 6361 | 3098 | 623 |
| hero-bard-v5.webp | hero-bard-v6.webp | 6271 | 3644 | 469 |
| hero-elf-v5.webp | hero-elf-v6.webp | 6140 | 3042 | 233 |
| hero-valkyrie-awk-v5.webp | hero-valkyrie-awk-v6.webp | 6034 | 0 | 0 |
| hero-mathboy-v5.webp | hero-mathboy-v6.webp | 5903 | 3142 | 770 |
| hero-paladin-awk-v5.webp | hero-paladin-awk-v6.webp | 5127 | 0 | 0 |
| hero-hacker-v5.webp | hero-hacker-v6.webp | 4539 | 2498 | 60 |
| hero-dknight-idle8-v1.webp | hero-dknight-idle8-v6.webp | 3498 | 2717 | 199 |
| hero-astro-idle8-v1.webp | hero-astro-idle8-v6.webp | 3289 | 2573 | 170 |
| hero-dancer-idle8-v1.webp | hero-dancer-idle8-v6.webp | 3133 | 2079 | 12 |
| hero-dknight-awk-v5.webp | hero-dknight-awk-v6.webp | 3087 | 0 | 0 |
| hero-valkyrie-idle8-v1.webp | hero-valkyrie-idle8-v6.webp | 3077 | 653 | 33 |
| hero-geometry-idle8-v1.webp | hero-geometry-idle8-v6.webp | 2908 | 1247 | 10 |
| hero-bone-idle8-v1.webp | hero-bone-idle8-v6.webp | 2873 | 2283 | 392 |
| hero-lancer-idle8-v1.webp | hero-lancer-idle8-v6.webp | 2628 | 992 | 19 |
| hero-sage-idle8-v1.webp | hero-sage-idle8-v6.webp | 2507 | 930 | 182 |
| hero-dragoon-idle8-v1.webp | hero-dragoon-idle8-v6.webp | 2460 | 1264 | 18 |
| hero-mechanic-idle8-v1.webp | hero-mechanic-idle8-v6.webp | 2281 | 1053 | 5 |
| hero-paladin-idle8-v1.webp | hero-paladin-idle8-v6.webp | 2222 | 480 | 39 |
| hero-merchant-idle8-v1.webp | hero-merchant-idle8-v6.webp | 2179 | 481 | 22 |
| hero-priest-idle8-v1.webp | hero-priest-idle8-v6.webp | 2171 | 2406 | 520 |
| hero-pirate-idle8-v1.webp | hero-pirate-idle8-v6.webp | 2084 | 614 | 6 |
| hero-crossbow-idle8-v1.webp | hero-crossbow-idle8-v6.webp | 2079 | 1188 | 96 |
| hero-sword-idle8-v1.webp | hero-sword-idle8-v6.webp | 2073 | 642 | 11 |
| hero-elemental-idle8-v1.webp | hero-elemental-idle8-v6.webp | 2072 | 1102 | 229 |
| hero-ninja-idle8-v1.webp | hero-ninja-idle8-v6.webp | 2056 | 964 | 80 |
| hero-spellblade-idle8-v1.webp | hero-spellblade-idle8-v6.webp | 2047 | 2551 | 735 |
| hero-mathgirl-idle8-v1.webp | hero-mathgirl-idle8-v6.webp | 1981 | 2298 | 651 |
| hero-dwarf-idle8-v1.webp | hero-dwarf-idle8-v6.webp | 1974 | 582 | 9 |
| hero-mathboy-idle8-v1.webp | hero-mathboy-idle8-v6.webp | 1943 | 995 | 144 |
| hero-alchemist-idle8-v1.webp | hero-alchemist-idle8-v6.webp | 1919 | 710 | 33 |
| hero-elf-idle8-v1.webp | hero-elf-idle8-v6.webp | 1877 | 590 | 14 |
| hero-tamer-idle8-v1.webp | hero-tamer-idle8-v6.webp | 1817 | 599 | 33 |
| hero-abacus-idle8-v1.webp | hero-abacus-idle8-v6.webp | 1815 | 515 | 3 |
| hero-witch-idle8-v1.webp | hero-witch-idle8-v6.webp | 1745 | 1990 | 653 |
| hero-blond-idle8-v1.webp | hero-blond-idle8-v6.webp | 1739 | 930 | 10 |
| hero-frost-idle8-v1.webp | hero-frost-idle8-v6.webp | 1712 | 332 | 8 |
| hero-math-idle8-v1.webp | hero-math-idle8-v6.webp | 1645 | 902 | 1 |
| hero-valkyrie-awk-idle8-v1.webp | hero-valkyrie-awk-idle8-v6.webp | 1570 | 0 | 0 |
| hero-hacker-idle8-v1.webp | hero-hacker-idle8-v6.webp | 1525 | 453 | 0 |
| hero-monk-idle8-v1.webp | hero-monk-idle8-v6.webp | 1444 | 288 | 23 |
| hero-drone-idle8-v1.webp | hero-drone-idle8-v6.webp | 1398 | 489 | 29 |
| hero-bard-idle8-v1.webp | hero-bard-idle8-v6.webp | 1204 | 537 | 49 |
| hero-dknight-awk-idle8-v1.webp | hero-dknight-awk-idle8-v6.webp | 707 | 0 | 0 |
| hero-paladin-awk-idle8-v1.webp | hero-paladin-awk-idle8-v6.webp | 31 | 0 | 0 |
