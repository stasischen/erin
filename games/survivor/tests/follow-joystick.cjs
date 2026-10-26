const assert = require('node:assert/strict');
const run = require('./maker-support.cjs')();
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-8, `${a} != ${b}`);
run(`globalThis.cfg={follow:true,radius:35,deadZone:4}; globalThis.bounds=joystickBounds(800,600,35);
  globalThis.calc=(x,y,px,py,c=cfg)=>calculateJoystick({baseX:x,baseY:y},{x:px,y:py},c,bounds);`);
let j=run('calc(100,300,170,300)'); close(j.baseX,135); close(j.x,1); close(j.y,0);
j=run('calc(100,300,160,380)'); close(j.baseX,139);close(j.baseY,352);close(j.x,.6);close(j.y,.8);
// 逐步漂移可持續全速；函式不改輸入。
run('globalThis.origin={baseX:100,baseY:300}; globalThis.j=origin; for(let x=135;x<=250;x++)j=calculateJoystick(j,{x,y:300},cfg,bounds);');
close(run('j.baseX'),215);close(run('j.x'),1);close(run('origin.baseX'),100);
for(const [px,py] of [[-500,300],[900,300],[100,-500],[100,900],[-500,-500],[900,900]]){
  j=run(`calc(100,300,${px},${py})`);
  assert.ok(j.baseX>=54-1e-8&&j.baseX<=346+1e-8&&j.baseY>=54-1e-8&&j.baseY<=546+1e-8);
  close(j.x,(px-100)/Math.hypot(px-100,py-300));close(j.y,(py-300)/Math.hypot(px-100,py-300));close(Math.hypot(j.x,j.y),1);
}
for(const d of [0,2,4]) {j=run(`calc(100,300,${100+d},300)`);close(j.x,0);close(j.y,0);}
j=run('calc(100,300,119.5,300)');close(j.x,.5);
j=run('calc(100,300,250,300,{...cfg,follow:false})');close(j.baseX,100);close(j.x,1);
for(const radius of [20,35,70]) {j=run(`calc(100,300,250,300,{...cfg,radius:${radius}})`);close(j.baseX,250-radius);close(j.x,1);}
// 左手拖動時，其他指頭不能搶方向或放開它；右手技能／衝刺保持可用。
run(`resetGame();state.mode='playing';settingsPanel.hidden=true;
  globalThis.pointer=(id,x,y)=>({pointerId:id,clientX:x,clientY:y,target:{closest:()=>null},preventDefault(){},stopPropagation(){}});
  globalThis.send=(type,id,x,y)=>document.getElementById('gameCanvas').listeners[type](pointer(id,x,y));
  send('pointerdown',11,100,300);send('pointermove',11,200,300);
  send('pointerdown',12,150,300);send('pointermove',12,50,100);
  document.getElementById('dashButton').listeners.pointerdown(pointer(22,700,500));
  document.getElementById('skillButton').listeners.pointerdown(pointer(23,650,450));
  send('pointerup',22,700,500);send('pointercancel',12,150,300);`);
assert.equal(run('state.pointerId'),11);close(run('state.joy.baseX'),165);close(run('state.joy.x'),1);
assert.equal(run('state.dashCharges'),1);assert.ok(run('state.bomb'));
for(const end of ['pointerup','pointercancel','lostpointercapture']){
 run(`send('${end}',11,200,300);`);assert.equal(run('state.joy'),null);assert.equal(run('state.pointerId'),null);
 run("send('pointerdown',11,240,220);");close(run('state.joy.baseX'),240);close(run('state.joy.baseY'),220);close(run('movementInput().x'),0);
}
run("send('pointerup',11,240,220);send('pointerdown',11,0,0);");close(run('state.joy.baseX'),54);close(run('state.joy.baseY'),54);close(run('state.joy.x'),0);
run("showOverlay('paused');");assert.equal(run('state.joy'),null);
// 舊作品遷移、合法開關／範圍及拒絕非有限值。
assert.equal(run('(()=>{const d=SurvivorData.defaults();delete d.joystick;const r=SurvivorData.validate(d);return r.valid&&r.data.joystick.follow&&r.data.joystick.radius===35&&r.data.joystick.deadZone===4;})()'),true);
for(const values of [{follow:false,radius:20,deadZone:0},{follow:true,radius:70,deadZone:10}]) {
 assert.equal(run(`(()=>{const d=SurvivorData.defaults();d.joystick=${JSON.stringify(values)};return SurvivorData.save(d).valid&&JSON.stringify(SurvivorData.load().data.joystick)===JSON.stringify(d.joystick);})()`),true);
}
for(const patch of ['radius:NaN','radius:Infinity','radius:19','radius:71','deadZone:-1','deadZone:11','follow:1']) assert.equal(run(`(()=>{const d=SurvivorData.defaults();Object.assign(d.joystick,{${patch}});return SurvivorData.validate(d).valid;})()`),false);
console.log('PASS: follow/dead-zone/speed/direction/edge math, gradual drift, multipointer actions/release/cancel/capture/pause, Maker bounds/migration/persistence');
