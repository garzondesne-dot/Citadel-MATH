import sys; from PIL import Image; import numpy as np; from scipy import ndimage
d=sys.argv[1]; DIL={"buttons":4,"panel":4}
for n in ['slot','buttons','panel','banner']:
  a=np.array(Image.open(f'{d}/gpt-{n}.png').convert('RGB')).astype(int)
  r,g,b=a[...,0],a[...,1],a[...,2]
  key=(r>150)&(g<120)&(b>150)&(abs(r-b)<90)
  al=~key
  al=ndimage.binary_opening(al,iterations=1)
  grp=ndimage.binary_dilation(al,iterations=DIL.get(n,14))
  lab,k=ndimage.label(grp); objs=ndimage.find_objects(lab)
  items=[]
  for i,sl in enumerate(objs):
    m=(lab[sl]==i+1)&al[sl]
    if m.sum()<400: continue
    items.append((sl[0].start,sl[1].start,sl,m))
  items.sort(key=lambda t:(round(t[0]/120),t[1]))
  for j,(y,x,sl,m) in enumerate(items):
    rgba=np.dstack([a[sl],m*255]).astype(np.uint8)
    # despill magenta edge
    px=rgba[...,:3].astype(int); sp=(px[...,0]>px[...,1]+60)&(px[...,2]>px[...,1]+60)
    px[sp,0]=np.minimum(px[sp,0],px[sp,1]+60); px[sp,2]=np.minimum(px[sp,2],px[sp,1]+60); rgba[...,:3]=px
    Image.fromarray(rgba,'RGBA').save(f'{d}/out-{n}-{j}.png')
    print(n,j,sl[1].stop-sl[1].start,sl[0].stop-sl[0].start)
