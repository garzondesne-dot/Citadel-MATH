const REL='/tmp/claude-0/-home-user-Citadel-MATH/96641048-e4d5-5899-b47f-8ffcee49194e/scratchpad/rel';
const load=require(REL+'/tests/load.js');
const fs=require('fs');
const id=process.argv[2];
const DS=load(['assets/manifest.js','js/engine/ui.js','js/engine/setgen.js','js/engine/quiz.js','js/engine/lessons.js','lessons/'+id+'.js']);
const L=DS.Lessons.get(id);
const types={};
const cq=(x)=>{types[x.type]=(types[x.type]||0)+1;let q=x.question+(x.box?'\n'+x.box:'');const o={type:x.type,q};
 if(x.type==='choice'){o.a=String(x.answerIndex);o.ch=x.choices.map(String);}
 else if(x.type==='multi'){o.a=x.answer.join(',');o.ch=x.options.map(String);}
 else if(x.type==='ox'){o.a=x.answer?'O':'X';o.ch=[];}
 else if(x.type==='number'){o.a=String(x.answer).replace('-','−');o.ch=[];}
 else throw new Error('type '+x.type+' '+JSON.stringify(x).slice(0,200));
 o.sol=x.solution||''; if(x.ref) o.ref=x.ref; if(x.groups) o.groups=x.groups; if(x.say) o.say=x.say; if(x.why) o.why=x.why; if(x.note) o.note=x.note; return o;};
const rooms=L.rooms.map(r=>{
  const chain=(L.chain||[]).includes(r.id);
  const vers=[];
  for(let a=0;a<7;a++){ const qs=chain?L.chainItems(r.id,'pack',a):L.items(r.id,'pack',a); vers.push(qs.map(cq)); }
  const m=L.monsters[r.id];
  const o={id:r.id,no:r.no,title:r.title,sprite:m.sprite,vers};
  if(r.boss)o.boss=true; if(r.photo)o.photo=true; if(chain)o.chain=true; if(m.note)o.note=m.note;
  if(L.videos&&L.videos[r.id]) o.video=L.videos[r.id].replace(/^.*\//,'').replace(/\.mp4$/,'');
  return o;});
const out={kind:'castle',id:L.id,floor:L.floor,after:L.after,title:L.title,unit:L.unit,theme:L.theme,goal:L.goal,bossPct:60,rooms};
fs.writeFileSync(id+'.json',JSON.stringify(out,null,1));
console.log(id,'rooms',rooms.length,'types',JSON.stringify(types),'items v0',rooms.map(r=>r.vers[0].length).join(','),'chain',rooms.filter(r=>r.chain).map(r=>r.id).join(','),'photo',rooms.filter(r=>r.photo).map(r=>r.id).join(','));
