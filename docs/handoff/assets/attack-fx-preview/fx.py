import numpy as np
from PIL import Image
U='/root/.claude/uploads/200064ad-3bc5-5006-ac5e-36f4c66832ff/'
ART='/home/user/garzondesne-dot/citadel-math-test/public/art/'
def black_sheet():
    im=np.array(Image.open(U+'fb858dc1-image.png').convert('RGB')).astype(float)
    a=im.max(-1)/255; a=np.clip((a-0.04)*1.15,0,1)       # 밝기 = 투명도
    rgb=np.where(a[...,None]>0, im/np.maximum(a[...,None],1e-3), 0).clip(0,255)
    return Image.fromarray(np.dstack([rgb,a*255]).astype(np.uint8),'RGBA')
def magenta_sheet():
    im=np.array(Image.open(U+'f1428199-image.png').convert('RGB')).astype(float)
    d=np.sqrt(((im-np.array([252,3,250]))**2).sum(-1))
    a=np.clip((d-70)/60,0,1)
    out=np.dstack([im,a*255]).astype(np.uint8)
    # 가장자리 마젠타 번짐: 알파 낮은 곳 색을 어둡게 눌러 테두리 분홍 줄이기
    m=(a>0)&(a<1); out[m,0]=(out[m,0]*0.6).astype(np.uint8); out[m,2]=(out[m,2]*0.6).astype(np.uint8)
    return Image.fromarray(out,'RGBA')
def cells(sheet,cols,rows,row):
    W,H=sheet.size; cw,ch=W/cols,H/rows
    return [sheet.crop((int(c*cw),int(row*ch),int((c+1)*cw),int((row+1)*ch))) for c in range(cols)]
def bbox_trim(frames):
    # 같은 위치 기준을 유지하려고 전체 합집합 bbox 로 자름
    bb=None
    for f in frames:
        b=f.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox()
        if b: bb=b if bb is None else (min(bb[0],b[0]),min(bb[1],b[1]),max(bb[2],b[2]),max(bb[3],b[3]))
    return [f.crop(bb) for f in frames]
def bg(w,h):
    y,x=np.mgrid[0:h,0:w]; c=np.zeros((h,w,3),np.uint8); c[...]=(34,30,48); c[int(h*0.82):]=(52,44,64); return Image.fromarray(c).convert('RGBA')
def scene(hero_sheet,hero_row,fxframes,out,fxscale=0.62,fxdx=0,fxdy=0,blend='alpha',shake=True,mon='mon-extra0-v1.webp',z=3):
    W,H=360,170; hs=Image.open(hero_sheet if hero_sheet.startswith('/') else ART+'heroes/'+hero_sheet).convert('RGBA')
    hf=[hs.crop((c*256,hero_row*144,(c+1)*256,(hero_row+1)*144)) for c in range(4)]
    idle=hs.crop((0,0,256,144))
    mc=Image.open(ART+mon).convert('RGBA'); mw=mc.width//3; mon0=mc.crop((0,0,mw,mc.height)).resize((120,120),Image.NEAREST)
    fx=[f.resize((int(f.width*fxscale),int(f.height*fxscale)),Image.LANCZOS) for f in fxframes]
    frames=[]; seq=[('i',0)]*2+[('a',i) for i in range(4) for _ in range(2)]
    nfx=len(fx); total=len(seq)+nfx*2+4
    for t in range(total):
        im=bg(W,H)
        if t<2: h=idle
        elif t<10: h=hf[(t-2)//2]
        else: h=hf[3] if t<14 else idle
        im.alpha_composite(h,(0,H-144-6))
        mx,my=225,H-120-8
        k=t-8   # fx 시작
        hit=0<=k<nfx*2
        dx=(2 if (k//2)%2==0 else -2) if (shake and hit and 2<=k<nfx*2-2) else 0
        m=mon0.copy()
        if hit and 2<=k<8:   # 맞는 순간 하얗게 번쩍
            arr=np.array(m).astype(int); arr[...,:3]=np.minimum(255,arr[...,:3]+60); m=Image.fromarray(arr.astype(np.uint8),'RGBA')
        im.alpha_composite(m,(mx+dx,my))
        if hit:
            f=fx[k//2]; fxp=(mx+60-f.width//2+fxdx,my+60-f.height//2+fxdy)
            if blend=='screen':
                layer=Image.new('RGBA',im.size,(0,0,0,0)); layer.alpha_composite(f,(fxp[0],fxp[1])); 
                a=np.array(im).astype(float); b=np.array(layer).astype(float); al=b[...,3:4]/255
                a[...,:3]=255-(255-a[...,:3])*(255-b[...,:3]*al)/255; im=Image.fromarray(a.astype(np.uint8),'RGBA')
            else: im.alpha_composite(f,fxp)
        frames.append(im.resize((W*z,H*z),Image.NEAREST).convert('P',palette=Image.ADAPTIVE,colors=128))
    frames[0].save(out,save_all=True,append_images=frames[1:],duration=70,loop=0,disposal=2)
if __name__=='__main__':
    B=black_sheet(); M=magenta_sheet()
    # 정확한 칸 경계 확인용: 전체 시트 5행 6열
    names_b=['fire','ice','lightning','poison','beam']; names_m=['claw','bite','impact','dash','slash']
    import os; os.makedirs('frames',exist_ok=True)
    for i,n in enumerate(names_b):
        fr=bbox_trim(cells(B,6,5,i)); Image.fromarray(np.hstack([np.array(f.resize((120,int(120*f.height/f.width)))) if False else np.array(f.resize((120,120))) for f in fr]),'RGBA').save(f'frames/b_{n}.png')
    for i,n in enumerate(names_m):
        fr=bbox_trim(cells(M,6,5,i)); Image.fromarray(np.hstack([np.array(f.resize((120,120))) for f in fr]),'RGBA').save(f'frames/m_{n}.png')
