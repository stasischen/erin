// 獨立 iframe 的平台接合層：正式 tick、碰撞、攻擊與繪圖照用，僅隔離生成／傷害／結算。
const practiceRules=SurvivorPracticeRules;
let practiceId=frameElement._practiceId||'water-ball',practiceConfig,practiceEnemy=null,practiceHome,practiceClock=0,practiceHold=0;
let practiceRequest=null,practiceLast=0,practiceVisible=true;
const practiceNav=document.getElementById('practiceMoves');
const practiceOriginalBehavior=updateEnemyBehavior, practiceOriginalBlob=drawBlob;
// 木頭假人是本機程式圖，攻擊來源仍保留原來的怪物造型。
drawBlob=function(x,y,r,color,wobble,flash,id,...rest) {
  if(id!=='practice-dummy') return practiceOriginalBlob(x,y,r,color,wobble,flash,id,...rest);
  ctx.save();ctx.translate(x,y);ctx.fillStyle=flash?'#fff4cf':'#98693e';ctx.fillRect(-5,-28,10,55);ctx.fillRect(-27,-12,54,9);ctx.fillRect(-15,-32,30,24);
  ctx.fillStyle='#d9ae72';ctx.fillRect(-11,-29,22,17);ctx.fillStyle='#533d2d';ctx.fillRect(-7,-24,4,4);ctx.fillRect(4,-24,4,4);ctx.fillRect(-18,24,36,6);ctx.restore();
};
// 固定鏡頭讓主角可走位；世界規則仍為遊戲單位。
updateCamera=function(){state.cameraX=practiceHome?practiceHome.x-state.width/2:0;state.cameraY=practiceHome?practiceHome.y-state.height/2:0;};
canvasPoint=function(event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)*state.width/r.width,y:(event.clientY-r.top)*state.height/r.height};};
updateEnemyBehavior=function(e,dt) {
  if(e!==practiceEnemy) return;
  if(!practiceConfig.legacy) {
    // 只推進目前這一輪，ready 由重播接合層重新定位，避免在遠處重新觸發。
    if(e.phaseAttack && e.phaseAttack.phase!=='ready') updatePhasedAttack(e,dt);
  } else if(e.action) practiceOriginalBehavior(e,dt);
};
// 舊招式也以主角中心的真實碰撞區顯示：衝撞為掃掠膠囊、自爆加上主角半徑。
drawPacingWarnings=function() {
  const e=practiceEnemy,a=e&&e.action;if(!a)return;
  ctx.save();ctx.strokeStyle='#efc94e';ctx.fillStyle='rgba(239,201,78,.22)';
  if(a.kind==='charge') {
    ctx.lineCap='round';ctx.lineWidth=2*(e.r+state.player.r);ctx.globalAlpha=.25;
    ctx.beginPath();ctx.moveTo(e.x,e.y);const distance=GAME_DATA.pacing.chargeSpeed*(a.life===undefined?GAME_DATA.pacing.chargeSeconds:a.life);
    ctx.lineTo(e.x+Math.cos(a.angle)*distance,e.y+Math.sin(a.angle)*distance);ctx.stroke();
  } else {ctx.beginPath();ctx.arc(e.x,e.y,GAME_DATA.pacing.blastRadius+state.player.r,0,Math.PI*2);ctx.fill();ctx.lineWidth=2;ctx.stroke();}
  ctx.restore();
};
function practiceSize() {
  const r=canvas.getBoundingClientRect();state.width=800;state.height=800*r.height/Math.max(1,r.width);
  const scale=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(state.width*scale);canvas.height=Math.round(state.height*scale);ctx.setTransform(scale,0,0,scale,0,0);ctx.imageSmoothingEnabled=false;
  state.pointerId=null;state.joy=null;state.keys.clear();
}
function practiceButtons() {
  practiceNav.textContent='';
  for(const m of practiceRules.moves(GAME_DATA)) {
    const b=document.createElement('button');b.type='button';b.title=m.name;b.setAttribute('aria-label',m.name);b.setAttribute('aria-pressed',String(m.id===practiceId));
    if(m.kind==='enemy') {const image=document.createElement('canvas');image.width=image.height=32;const g=image.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(SurvivorMonsters.picture(GAME_DATA.enemies.find(e=>e.id===m.id).spriteId),0,0,32,32);b.appendChild(image);}
    else b.innerHTML=SurvivorIcons.html(m.icon);
    b.addEventListener('click',()=>{practiceId=m.id;frameElement._practiceId=m.id;practiceReset();practiceButtons();});practiceNav.appendChild(b);
  }
  document.getElementById('practiceReplay').innerHTML=SurvivorIcons.html('reroll');
}
function practiceReset(keepPosition=false) {
  const position=keepPosition?{x:state.player.x,y:state.player.y}:null;
  const home=practiceHome,joy=state.joy,pointerId=state.pointerId,keys=new Set(state.keys);
  resetGame();state.mode='playing';settingsPanel.hidden=true;
  gameSettings.music=false;gameSettings.sound=false;gameSettings.vibration=false;
  practiceHome=home||{x:state.player.x,y:state.player.y};updateCamera();
  state.player.x=position?position.x:practiceHome.x-80;state.player.y=position?position.y:practiceHome.y;
  if(keepPosition) {state.joy=joy;state.pointerId=pointerId;state.keys=keys;}
  state.player.damageDisabled=true;practiceClock=0;practiceHold=0;practiceEnemy=null;
  practiceConfig=practiceRules.model(GAME_DATA,practiceId);
  if(practiceConfig.kind==='weapon') {
    state.weaponId=practiceId==='item-wall'?'water-ball':practiceId;
    if(practiceId==='item-wall') state.upgrades['item-wall']=1;
    const distance=activeWeapon().kind==='melee'?55:150;
    state.enemies=[0,1].map(i=>({typeId:'practice-dummy',spriteId:'practice-dummy',behavior:'still',x:state.player.x+distance+i*65,y:state.player.y,homeX:state.player.x+distance+i*65,homeY:state.player.y,r:18,speed:0,damage:0,hp:1e9,maxHp:1e9,alive:true,flash:0,wobble:0,shotCooldown:Infinity}));
    state.shotTimer=0;
  } else if(practiceConfig.enabled) {
    practiceEnemy=spawnEnemy({typeId:practiceId});
    Object.assign(practiceEnemy,{x:practiceHome.x+40,y:practiceHome.y,speed:0,shotCooldown:Infinity,actionCooldown:Infinity});
    const e=practiceEnemy,c=practiceConfig,angle=Math.atan2(deltaY(state.player.y,e.y),deltaX(state.player.x,e.x));
    if(!c.legacy) e.phaseAttack={phase:'windup',left:c.windup,x:e.x,y:e.y,angle,config:{...c},hit:false};
    else e.action={kind:c.shape==='charge'?'charge':'blast',warning:c.windup,angle};
  }
  document.getElementById('practiceName').textContent=practiceConfig.name+' · 免傷練習';
  document.getElementById('practiceDescription').textContent=practiceRules.describe(practiceConfig);
  practiceBuildTimeline();practicePaint();
}
function practiceTimelineState() {
  const c=practiceConfig,e=practiceEnemy;
  if(!c.enabled) return {phase:'ready',left:0};
  if(c.kind==='weapon') return {phase:'active',left:Math.max(0,state.shotTimer)};
  if(!c.legacy) return e.phaseAttack||{phase:'ready',left:0};
  if(e.action) return e.action.warning>0?{phase:'windup',left:e.action.warning}:{phase:'active',left:e.action.life||0};
  return {phase:'cooldown',left:Math.max(0,c.cooldown-practiceHold)};
}
function practiceStep(dt) {
  if(state.mode!=='playing') return;
  const c=practiceConfig;
  // 停用遊戲事件與自然生成；不修改共享作品中的設定值。
  state.spawnTimer=Infinity;state.eliteTimer=Infinity;state.bearSpawned=true;state.stageElapsed=0;
  state.bossRest=Infinity;state.bookShotTimer=Infinity;
  if(c.kind!=='weapon') state.shotTimer=Infinity;
  practiceClock+=dt;
  tick(dt);
  // 沙盒不收集經驗；玩家與來源留在固定可視練習區。
  state.gems=[];state.xp=0;state.rewardChoices=0;
  state.player.x=Math.max(state.cameraX+state.player.r,Math.min(state.cameraX+state.width-state.player.r,state.player.x));
  state.player.y=Math.max(state.cameraY+state.player.r,Math.min(state.cameraY+state.height-state.player.r,state.player.y));
  if(c.kind==='weapon') {
    // 木頭假人受擊後回到原位，讓第四下與浪花互撞可以持續練習。
    for(const e of state.enemies) if(!e.flash) {const blend=Math.min(1,dt*6);e.x+=(e.homeX-e.x)*blend;e.y+=(e.homeY-e.y)*blend;}
    if(practiceClock>=effectiveShotInterval()*Math.max(4,activeWeapon().spinEvery||4)) practiceReset(true);
  } else if(c.enabled) {
    if(!c.legacy && practiceEnemy.phaseAttack.phase==='ready') practiceReset(true);
    if(c.legacy && !practiceEnemy.action) {
      practiceHold+=dt;
      // 自爆沒有收招／冷卻；稍留畫面看爆炸，時間軸停在終點。
      if(practiceHold>=Math.max(.45,c.cooldown)) practiceReset(true);
    }
  }
  practicePaint();
}
function practiceBuildTimeline() {
  const line=practiceRules.timeline(practiceConfig,'ready',0);
  const segments=document.getElementById('practiceSegments'),legend=document.getElementById('practiceLegend');segments.textContent='';legend.textContent='';
  line.segments.forEach(s=>{
    const node=document.createElement('span');node.style.width=(line.total?s.duration/line.total*100:0)+'%';node.style.background=s.color;segments.appendChild(node);
    const label=document.createElement('span');label.style.borderColor=s.color;label.textContent=s.label+' '+Number(s.duration.toFixed(3))+'s';legend.appendChild(label);
  });
}
function practicePaint() {
  render();
  const current=practiceTimelineState(),line=practiceRules.timeline(practiceConfig,current.phase,current.left);
  document.getElementById('practiceCursor').style.left=(line.progress*100)+'%';
}
window.updatePracticeData=function(data) {
  const result=SurvivorData.validate(data);if(!result.valid)return;
  // 引擎尚有啟動時綁定的常數；重載這個獨立沙盒，確保所有滑桿真的改到攻擊。
  frameElement._practicePayload={data:result.data};location.reload();
};
function practiceFrame(now) {
  practiceRequest=null;if(!practiceVisible||document.hidden)return;
  if(practiceLast) practiceStep(Math.min(.05,(now-practiceLast)/1000));practiceLast=now;
  practiceRequest=requestAnimationFrame(practiceFrame);
}
function practiceVisibility(visible) {
  practiceVisible=visible;practiceLast=0;state.keys.clear();state.joy=null;state.pointerId=null;
  if(practiceRequest!==null)cancelAnimationFrame(practiceRequest);
  state.mode='playing';practiceRequest=visible?requestAnimationFrame(practiceFrame):null;
}
document.getElementById('practiceReplay').addEventListener('click',()=>practiceReset());
window.addEventListener('resize',()=>{practiceSize();practiceHome=null;practiceReset();});
window.addEventListener('blur',()=>{state.keys.clear();state.joy=null;state.pointerId=null;state.mode='playing';});window.addEventListener('focus',()=>practiceVisibility(true));
document.addEventListener('visibilitychange',()=>practiceVisibility(!document.hidden));
practiceSize();practiceReset();practiceButtons();practiceVisibility(true);
