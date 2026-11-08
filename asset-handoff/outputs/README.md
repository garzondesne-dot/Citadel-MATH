# outputs/ — GPT 가 쓸 수 있는 **유일한** 곳

> ⛔ 여기 말고는 쓰지 않는다 (`assets/` · `js/` · `lessons/` · `css/` · main 브랜치 금지). 자르기 · 팔레트 · webp · 배치표 · 버전은 #4 가 한다.

## 이름 규칙

```
outputs/{ID}/{ID}_{동작}_{번호}.png
```

| 부분 | 값 |
|---|---|
| `{ID}` | ASSET_LIST · 작업 파일의 고유 ID (예: `m11-01`, `b11-01`, `bg-11`, `r-mon-new-03`) |
| `{동작}` | 몬스터 · 보스: `idle` (= 마스터) · `attack` · `down` / 배경: `bg` / 소품: `state` · `frame` / 아이콘: `icon` |
| `{번호}` | 그 동작의 프레임 번호 (1부터 · 몬스터 · 보스는 모두 1) |
| 다시 만든 것 | `_r2` · `_r3` 를 붙임 (예: `m11-01_attack_1_r2.png`). 같은 프레임 최대 3번 → 그다음은 선생님께 |

예: `outputs/m11-01/m11-01_idle_1.png` (마스터) · `outputs/m11-01/m11-01_attack_1.png` · `outputs/m11-01/m11-01_down_1.png` · `outputs/bg-11/bg-11_bg_1.png`

## 규칙

- 한 파일 = 한 프레임 · 한 그림. 여러 칸 시트를 그리지 않는다.
- PNG · 캐릭터는 마젠타 `#FF00FF` 단색 배경 · 배경 그림은 꽉 채움.
- 템플릿의 선 · 번호 · 글자를 그리지 않는다.
- 다 만들면 `ASSET_LIST.md` 의 그 줄 「마스터」 또는 「상태」 칸만 **생성 완료** 로.
- 승인된 마스터는 #4 가 `references/masters/{ID}_master.png` 로 옮겨 고정한다 (GPT 가 옮기지 않음).
