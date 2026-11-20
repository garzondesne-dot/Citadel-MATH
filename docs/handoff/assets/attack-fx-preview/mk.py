import sys; sys.path.insert(0,'.')
import fx
V='/home/user/Citadel-MATH/docs/handoff/asset-audit-1120/v7/'
B=fx.black_sheet(); M=fx.magenta_sheet()
L=fx.bbox_trim(fx.cells(B,6,5,2)); F=fx.bbox_trim(fx.cells(B,6,5,0)); S=fx.bbox_trim(fx.cells(M,6,5,4)); C=fx.bbox_trim(fx.cells(M,6,5,0))
fx.scene(V+'hero-spellblade-v7.webp',2,L,'fx-lightning-spellblade.gif',fxscale=0.55)
fx.scene(V+'hero-mathgirl-v7.webp',2,F,'fx-fire-mathgirl.gif',fxscale=0.5)
fx.scene(V+'hero-paladin-v7.webp',2,S,'fx-slash-paladin.gif',fxscale=0.5,fxdx=-6)
fx.scene(V+'hero-valkyrie-v7.webp',2,C,'fx-claw-valkyrie.gif',fxscale=0.5)
