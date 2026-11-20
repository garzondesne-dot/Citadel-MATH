import sys,random
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sim
V=dict(sub_n=1,boss_gap=12,single=0.10,aoe=0.05,skill=30,atk=8)
HPn={1:240,2:560,3:860,4:1160}; HPe={1:170,2:390,3:600,4:810}
def tab(title,over,healer=False,solo=None):
    P=dict(sim.BASE);P.update(over); rows=sim.table(P,healer=healer,N=2000)
    if solo:
        Q=dict(P);Q.update(solo); r1=sim.table(Q,N=2000); rows=[r for r in r1 if r[0]==1]+[r for r in rows if r[0]>1]
    sim.show(title,rows)
tab('V-일반 · 힐러 없음 (1인만 보스 공격 7% / 3.5%)',dict(V,boss_hp=HPn),solo=dict(single=0.07,aoe=0.035))
tab('V-일반 · 힐러 1명',dict(V,boss_hp=HPn),healer=True,solo=dict(single=0.07,aoe=0.035))
E2=dict(V,single=0.06,aoe=0.03,boss_hp=HPe,shields={1:1,2:2,3:2,4:3})
tab('V-연습 · 힐러 없음 (1인만 보스 공격 4.5% / 2%)',E2,solo=dict(single=0.045,aoe=0.02))
P=dict(sim.BASE);P.update(V,boss_hp=HPn); rng=random.Random(3)
print('\n### V-일반 · 문제 0개(타이밍 바만)\n')
for n in (1,2,3,4):
    R=[sim.run(n,0.6,P,masher=True,rng=rng) for _ in range(500)]
    print(n, sum(r['win'] for r in R), {r['why'] for r in R}, 'boss 남은 몫은 실드에서 멈춤')
