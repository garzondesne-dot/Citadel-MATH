import sys,contextlib,io
sys.argv=['gen_merge.py','out']
exec(open('gen_merge.py').read().split("if __name__")[0])
import wslib
wslib.STAMP=''
g=globals(); orig=chain_block
def ptr(fl,rid):
    return (f'<div class="rm"><div class="tagl"><b>{rid[1:]}</b><span class="pill">🏰 {fl}층 {rid[1:]}번 방</span><span class="pill ph">📷 서술형</span></div>'
            f'→ 뒷장 <b>✍ 서술형 · 소레이드</b> 쪽에서 풀어요.</div>')
HOW1=('<div class="how"><b>🏰 성채던전 1 · 2층과 같은 문제 · 같은 숫자</b>예요. 먼저 여기에 풀고, 캠프 → 🏰 성채던전의 그 방에서 답을 넣어 보세요. '
      '꼬리표의 차시 수업을 하면 방이 열려요. 한 번 틀리면 방의 숫자가 바뀌어요. <span class="pill ph">📷 서술형</span> 방은 뒷장에 모았어요.</div>')
HOW2=('<div class="how"><b>🏰 성채던전의 서술형 방 7개</b>(1층 2 · 2층 2 · 3층 3)를 ⚔ 소레이드로 풀어요(게임과 같은 숫자). ① ② … 빈칸을 채우고 → '
      '<b>✍ 서술형 답</b>을 손으로 써서 📷 찍어 올리면 통과(📜 서술 조각 +1).</div>')
def front(E,M):
    g['chain_block']=lambda fl,rid,e: ptr(fl,rid)
    b=HOW1+''.join(floor_blocks(1,W.F1,E,M,0)+floor_blocks(2,W.F2,E,M,0)); g['chain_block']=orig; return b
def back(S,S3=None,Q15=None):
    S3=S3 or S; Q15=Q15 or S3
    b=HOW2
    for fl,lab in ((1,'1층 · 집합'),(2,'2층 · 명제'),(3,'3층')):
        b+=f'<div class="sec">✍ {lab} 서술형</div>'+''.join(orig(int(p[-1]),r,(Q15 if r=='q15' else S3) if fl==3 else S) for p,r,*_ in ROOMS if int(p[-1])==fl)
    return b
def bld(out,body,title,rng,goal):
    with contextlib.redirect_stdout(io.StringIO()):
        return build(out,title,rng,goal,body,EXTRA)
G1='① 집합 · 명제 중단원 문제를 스스로 풀어 본다. ② 같은 문제를 🏰 성채던전에서 숫자를 바꿔 다시 도전한다.'
G2='① 서술형 문제의 풀이를 단계로 나누어 쓸 수 있다. ② 근거를 넣어 풀이 과정을 끝까지 서술한다.'
M=10
while max(bld('out/_f.pdf',front(4,M+2),'🏰 성채던전 1 · 2층','x',G1))<=281: M+=2
SS=18
while max(bld('out/_b.pdf',back(SS+3),'🏰 성채 서술형','x',G2))<=281: SS+=3
S3=SS
while max(bld('out/_b.pdf',back(SS,S3+6),'🏰 성채 서술형','x',G2))<=281: S3+=6
Q15=S3
while True:
    bt=bld('out/_b.pdf',back(SS,S3,Q15+6),'🏰 성채 서술형','x',G2)
    if max(bt)>281 or bt[2]>275: break
    Q15+=6
print('나머지',M,'서술형',SS,'3층',S3,'15',Q15)
b1=bld('out/a.pdf',front(4,M),'🏰 성채던전 1 · 2층','공통수학2 Ⅱ. 집합과 명제 · 성채 1층 12방 · 2층 11방 (1 · 2쪽)',G1)
b2=bld('out/b.pdf',back(SS,S3,Q15),'🏰 성채 서술형 · 소레이드','성채던전 1 ~ 3층 서술형 방 7문항 (3 · 4쪽)',G2)
print(b1,b2)
