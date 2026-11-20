import sys, numpy as np
from PIL import Image, ImageDraw
def checker(w,h,s=8):
    y,x=np.mgrid[0:h,0:w]; c=np.where(((x//s+y//s)%2==0)[...,None],np.array([70,70,80]),np.array([90,90,100])).astype(np.uint8); return Image.fromarray(c).convert('RGBA')
def show(cell,z=4,hl=None):
    bg=checker(cell.shape[1],cell.shape[0]); bg.alpha_composite(Image.fromarray(cell,'RGBA'))
    if hl is not None:
        arr=np.array(bg); arr[hl]=(255,255,0,255); bg=Image.fromarray(arr,'RGBA')
    return bg.resize((cell.shape[1]*z,cell.shape[0]*z),Image.NEAREST)
def pair(orig,fixed,cells,out,title,z=4):
    ims=[]
    for r,c in cells:
        sl=(slice(r*144,(r+1)*144),slice(c*256,(c+1)*256)); o=orig[sl]; f=fixed[sl]
        diff=(o!=f).any(-1)
        ims.append((show(o,z,diff),show(f,z)))
    w=ims[0][0].width; h=ims[0][0].height
    cv=Image.new('RGBA',(w*2+10,(h+4)*len(ims)+24),(30,30,36,255)); d=ImageDraw.Draw(cv); d.text((4,6),title+'  [left: original + changed px yellow | right: fixed]',fill=(255,255,255,255))
    for i,(a,b) in enumerate(ims): cv.alpha_composite(a,(0,24+i*(h+4))); cv.alpha_composite(b,(w+10,24+i*(h+4)))
    cv.convert('RGB').save(out)
if __name__=='__main__':
    o=np.array(Image.open(sys.argv[1]).convert('RGBA')); f=np.array(Image.open(sys.argv[2]).convert('RGBA'))
    cells=[tuple(map(int,x.split(','))) for x in sys.argv[4:]]
    pair(o,f,cells,sys.argv[3],sys.argv[1].split('/')[-1],3)
