import json, numpy as np
from PIL import Image, ImageOps
L=json.load(open('looks.json')); BEN='../bench/'; HA='/home/user/hv2/docs/handoff/assets/hero-awaken/'
A='/home/user/hv2/docs/handoff/assets/hero-idle8-hd/'
TITLE={"witch":"열세 번째 주문","elf":"숲 끝의 눈","ninja":"그림자 지름길","priest":"넘어진 이의 등불","lancer":"한 걸음의 수호자","dwarf":"심층 광맥","paladin":"첫 방의 방패","monk":"맨주먹 전설","dancer":"박자의 여왕","bard":"노래가 된 레이드","alchemist":"드디어 성공","pirate":"진짜 선장","frost":"흔들리지 않는 침착","tamer":"몬스터의 친구","mathboy":"풀이로 이긴 참모","mathgirl":"끝까지 쓴 전략가","mechanic":"다 고친 손","hacker":"빈틈 없는 해커","dragoon":"다 자란 용의 기사","spellblade":"둘 다 고른 자","bone":"해골 반장 졸업","crossbow":"한 발의 전설","abacus":"검산의 대가","geometry":"성채의 지도 제작자","merchant":"대박 상인","drone":"먼저 다녀온 눈","valkyrie":"다시 오른 날개","elemental":"세 정령의 단짝","astro":"맞을 때까지 읽은 별"}
entries=[]
for k,(en,ko,look) in L.items():
  S=Image.open(f'/home/user/beta/public/art/heroes/hero-{k}-v5.webp').convert('RGBA')
  B=Image.open(A+f'hero-{k}-idle8-v1.webp').convert('RGBA')
  cells=[(r,c) for r in range(12) for c in range(4) if S.crop((256*c,144*r,256*c+256,144*r+144)).getbbox()]
  n=len(cells); W,H=256,144; out=Image.new('RGBA',(W*6,H*7),(255,255,255,255)); slots=[]
  for i,(r,c) in enumerate(cells):
    out.alpha_composite(S.crop((256*c,144*r,256*c+256,144*r+144)),((i%6)*W,(i//6)*H)); slots.append({'slot':i,'src':[r,c]})
  for j in range(8):
    i=34+j; out.alpha_composite(B.crop((256*j,0,256*j+256,144)),((i%6)*W,(i//6)*H)); slots.append({'slot':i,'breath':j})
  g=np.array(ImageOps.grayscale(out.convert('RGB'))).astype(float); al=np.array(out.getchannel('A'))
  white=(np.array(out.convert('RGB')).min(-1)>=250); g=150+g*0.35; g[white]=255
  Image.fromarray(g.clip(0,255).astype('uint8')).convert('RGB').save(BEN+f'ref-awk-{k}-pose.png')
  json.dump({'cols':6,'rows':7,'cell':[W,H],'n':n,'slots':slots,'breath_src':f'hero-{k}-idle8-v1.webp'},open(HA+f'gpt-layout-{k}.json','w'))
  lk=Image.open(f'{k}-awk0.png').convert('RGBA'); m=Image.new('RGBA',lk.size,(255,0,255,255)); m.alpha_composite(lk)
  m.convert('RGB').resize((768,432),Image.NEAREST).save(BEN+f'ref-awk-{k}-look.png')
  empty=f"Cells {n+1}-34 = empty." if n<34 else ""
  entries.append((k,en,ko,look,n))
js=[]
for k,en,ko,look,n in entries:
  det='- '+look.replace(', ','\n- ')
  js.append("O.push({ id: 'awk-%s', tab: 'awk', name: '⚡ %s 각성 · 전투 시트 + 숨쉬기 한 번에', kind: '첨부 2장 · 결과 6×7칸 1536×1008', use: '🏅 「%s」 장착 + 🔨 +10 + Ⅳ 스킬 · ① = 모습(이것만 따라 그림) · ② = 자세 지도(회색 · 모습은 무시) · 지금 %d칸 + 숨쉬기 8칸 · 받은 1장을 머리 방에 「%s」와 함께', att: ['① 각성 모습 (이 모습 그대로)', '② 자세 지도 · 회색 6×7칸'], ref: ['ref-awk-%s-look.png', 'ref-awk-%s-pose.png'], prompt: AWK2(%s, %s).replace('Cells 1-31 = battle poses', 'Cells 1-%d = battle poses').replace('Cells 32-34 = empty', '%s'), fix: [] });" % (k,ko,TITLE[k],n,f'awk-{k}',k,k,json.dumps('"'+en+'" (chibi pixel-art hero), awakened form'),json.dumps(det+'\n- overall: much more detailed, glowing and dramatic than the plain version, but clearly the same hero with the same face and hair'),n,(f'Cells {n+1}-34 = empty' if n<34 else 'No empty cells')))
open('entries.js','w').write('\n'.join(js)+'\n')
print(len(js),[e[4] for e in entries])
