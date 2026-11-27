const {chromium}=require('playwright');const fs=require('fs');(async()=>{const dir=process.argv[2],out=process.argv[3],only=process.argv[4];
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+dir+'/scene.html');await p.waitForTimeout(1500);await p.evaluate(()=>document.fonts.ready);
const ts=only?only.split(',').map(Number):Array.from({length:690},(_,i)=>i/30);
for(let i=0;i<ts.length;i++){await p.evaluate(t=>render(t),ts[i]);await p.screenshot({path:`${out}/${only?'k'+ts[i]:String(i).padStart(4,'0')}.${only?'png':'jpg'}`,type:only?'png':'jpeg',...(only?{}:{quality:92})})}
await b.close()})()
