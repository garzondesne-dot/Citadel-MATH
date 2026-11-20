import sys; from PIL import Image; import numpy as np
from scipy import ndimage
out=sys.argv[1]
spec=[('a','mag',[0,208,426,617,816,1024],['claw','bite','smash','ram','lash'],
 [[0,235,489,760,999,1240,1536],[0,246,499,754,987,1240,1536],[0,216,493,756,994,1240,1536],[0,235,498,760,1001,1242,1536],[0,235,499,760,1004,1245,1536]]),
 ('b','blk',[0,236,445,671,881,1122],['fire','ice','bolt','poison','beam'],
 [[0,192,441,686,906,1122,1374],[0,201,452,677,898,1105,1374],[0,189,431,677,892,1113,1374],[0,202,430,683,881,1105,1374],[0,220,456,686,917,1130,1374]])]
S=256
for n,mode,rows,names,cols in spec:
  a=np.array(Image.open(f'{out}/gpt-pack-{n}.png').convert('RGB')).astype(float)
  if mode=='mag':
    key=(a[...,0]>170)&(a[...,1]<110)&(a[...,2]>170)
    al=np.where(key,0,255.)
    # remove tiny specks
    lab,k=ndimage.label(al>0); sz=ndimage.sum(np.ones_like(al),lab,range(1,k+1))
    for i,s in enumerate(sz):
      if s<6: al[lab==i+1]=0
    rgb=a
  else:
    mx=a.max(2); al=np.clip((mx-12)*255/(255-12),0,255); al[mx<20]=0
    rgb=np.where(al[...,None]>0, np.clip(a*255/np.maximum(al[...,None],1),0,255),0)
  rgba=np.dstack([rgb,al]).astype(np.uint8)
  for i,nm in enumerate(names):
    fr=[]
    for j in range(6):
      c=rgba[rows[i]:rows[i+1], cols[i][j]:cols[i][j+1]]
      h,w=c.shape[:2]; sc=min(1,S/max(h,w))
      im=Image.fromarray(c,'RGBA')
      if sc<1: im=im.resize((round(w*sc),round(h*sc)),Image.NEAREST)
      cv=Image.new('RGBA',(S,S),(0,0,0,0)); cv.paste(im,((S-im.width)//2,(S-im.height)//2)); fr.append(cv)
    st=Image.new('RGBA',(S*6,S)); [st.paste(f,(S*j,0)) for j,f in enumerate(fr)]
    st.save(f'{out}/mhit-{nm}-v1.webp',lossless=True,quality=100,method=6)
    bg=[Image.alpha_composite(Image.new('RGBA',(S,S),(40,36,56,255)),f).convert('P',palette=Image.ADAPTIVE) for f in fr]
    bg[0].save(f'{out}/prev-{nm}.gif',save_all=True,append_images=bg[1:],duration=70,loop=0)
