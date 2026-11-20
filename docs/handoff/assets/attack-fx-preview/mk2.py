import sys; sys.path.insert(0,'.')
import numpy as np
from PIL import Image
import fx
V='/home/user/Citadel-MATH/docs/handoff/asset-audit-1120/v7/'; ART=fx.ART
B=fx.black_sheet(); M=fx.magenta_sheet()
def scene(hero,fxf,out,flip=True,scale=0.55,mon='mon-extra0-v1.webp',z=3,fxdx=0):
    W,H=360,170; hs=Image.open(V+hero).convert('RGBA'); idle=hs.crop((0,0,256,144)); hit=hs.crop((0,3*144,256,4*144))
    mc=Image.open(ART+mon).convert('RGBA'); mw=mc.width//3
    mI=mc.crop((0,0,mw,mc.height)).resize((120,120),Image.NEAREST); mA=mc.crop((mw,0,2*mw,mc.height)).resize((120,120),Image.NEAREST)
    f=[x.transpose(Image.FLIP_LEFT_RIGHT) if flip else x for x in fxf]
    f=[x.resize((int(x.width*scale),int(x.height*scale)),Image.LANCZOS) for x in f]
    n=len(f); frames=[]
    for t in range(4+n*2+5):
        im=fx.bg(W,H); k=t-4; hitnow=0<=k<n*2
        h=hit if (hitnow or (n*2<=k<n*2+2)) else idle
        dx=(-3 if (k//2)%2==0 else 3) if (hitnow and 2<=k<n*2-2) else 0
        hh=np.array(h).astype(int)
        if hitnow and 2<=k<8: hh[...,:3]=np.minimum(255,hh[...,:3]+55)   # 맞는 순간 번쩍
        im.alpha_composite(Image.fromarray(hh.astype(np.uint8),'RGBA'),(10+dx,H-144-6))
        m=mA if (1<=t<=4+n) else mI
        mx=dx and 0 or 0
        im.alpha_composite(m,(225-(8 if 1<=t<=4+n else 0),H-120-8))
        if hitnow:
            x=f[k//2]; im.alpha_composite(x,(10+128-x.width//2+fxdx,H-144-6+80-x.height//2))
        frames.append(im.resize((W*z,H*z),Image.NEAREST).convert('P',palette=Image.ADAPTIVE,colors=128))
    frames[0].save(out,save_all=True,append_images=frames[1:],duration=70,loop=0,disposal=2)
FI=fx.bbox_trim(fx.cells(B,6,5,0)); IC=fx.bbox_trim(fx.cells(B,6,5,1)); CL=fx.bbox_trim(fx.cells(M,6,5,0)); BI=fx.bbox_trim(fx.cells(M,6,5,1)); DA=fx.bbox_trim(fx.cells(M,6,5,3)); LI=fx.bbox_trim(fx.cells(B,6,5,2))
scene('hero-mathgirl-v7.webp',FI,'mfx-fire.gif')
scene('hero-paladin-v7.webp',BI,'mfx-bite.gif',flip=False,scale=0.5)
scene('hero-valkyrie-v7.webp',CL,'mfx-claw.gif')
scene('hero-spellblade-v7.webp',DA,'mfx-dash.gif',scale=0.5)
