import sys; from PIL import Image; import numpy as np
from scipy import ndimage
src,out,mode,rows,names=sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]),sys.argv[5].split(',')
a=np.array(Image.open(src).convert('RGB')).astype(float)
if mode=='mag':
  key=(a[...,0]>170)&(a[...,1]<110)&(a[...,2]>170); al=np.where(key,0,255.); rgb=a
  px=rgb.copy(); sp=(px[...,0]>px[...,1]+60)&(px[...,2]>px[...,1]+60)&~key
  px[sp,0]=np.minimum(px[sp,0],px[sp,1]+60); px[sp,2]=np.minimum(px[sp,2],px[sp,1]+60); rgb=px
  m=al>0
else:
  mx=a.max(2); al=np.clip((mx-12)*255/(243),0,255); al[mx<20]=0
  rgb=np.where(al[...,None]>0,np.clip(a*255/np.maximum(al[...,None],1),0,255),0); m=mx>40
H,W=m.shape
def cuts(v,n,L):
  c=[0]
  for k in range(1,n):
    x=int(k*L/n); w=int(L/n*0.25); seg=v[x-w:x+w]; c.append(x-w+int(np.argmin(seg)))
  return c+[L]
R=cuts(m.sum(1),rows,H)
rgba=np.dstack([rgb,al]).astype(np.uint8)
S=256
for i,nm in enumerate(names):
  band=m[R[i]:R[i+1]]; C=cuts(band.sum(0),6,W)
  fr=[]
  for j in range(6):
    c=rgba[R[i]:R[i+1],C[j]:C[j+1]]; im=Image.fromarray(c,'RGBA')
    h,w=c.shape[:2]; sc=min(1,S/max(h,w))
    if sc<1: im=im.resize((round(w*sc),round(h*sc)),Image.NEAREST)
    cv=Image.new('RGBA',(S,S)); cv.paste(im,((S-im.width)//2,(S-im.height)//2)); fr.append(cv)
  st=Image.new('RGBA',(S*6,S)); [st.paste(f,(S*j,0)) for j,f in enumerate(fr)]
  st.save(f'{out}/{nm}.webp',lossless=True,method=6)
  print(nm, R[i],R[i+1], C, [int(band.sum(0)[x]) for x in C[1:-1]], int(m[R[i]].sum()) if R[i]>0 else 0)
