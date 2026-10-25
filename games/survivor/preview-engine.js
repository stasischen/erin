// 這份腳本只在獨立 iframe 執行，所有狀態、亂數、物件池都屬於小場景。
const previewSpec = globalThis.SURVIVOR_PREVIEW.spec;
let previewTime = 0, previewFired = false, previewRequest = null, previewLast = 0;
let previewVisible = frameElement._previewVisible !== false;
const previewCard = UPGRADES.find(c=>c.id===previewSpec.id);
if(previewCard && previewSpec.kind==='effect') previewCard.effects=[previewCard.effects[previewSpec.index]];
gameSettings.sound = false; gameSettings.vibration = false;
// 普攻鏡頭約放大 2.5 倍；範圍招式保留足夠場地。依 iframe 比例繪製，不拉伸。
const previewFeatures = previewCard ? previewCard.effects.map(e=>e.feature).filter(Boolean) : [];
const previewWide = previewSpec.kind === 'move' || previewFeatures.some(id=>/ultimate|dash|fusion-storm/.test(id)) || (previewCard && previewCard.effects.some(e=>!e.feature && (e.radius>100 || e.trigger==='dash')));
const previewRadii = {'water-skill':gameSettings.bombRadius,'thunder-skill':gameSettings.bombRadius,'thunder-counter':BUILD_TUNING.counterRadius,'fusion-puddle':gameSettings.bombRadius};
const previewRadius = Math.max(0,...previewFeatures.map(id=>previewRadii[id]||0),...(previewCard ? previewCard.effects.filter(e=>!e.feature).map(e=>e.radius||0) : []));
let previewOrigin = {x:0,y:0};
function sizePreview() {
  const width = document.documentElement ? document.documentElement.clientWidth : 640;
  const height = document.documentElement ? document.documentElement.clientHeight : 360;
  const ratio = Math.max(.5, width / Math.max(1,height));
  state.height = Math.max(previewWide ? 360 : height / 2.5, previewRadius ? (previewRadius+24)*2 : 0);
  state.width = state.height * ratio;
  canvas.width = Math.round(state.width * 3); canvas.height = Math.round(state.height * 3);
  ctx.setTransform(3,0,0,3,0,0); ctx.imageSmoothingEnabled = false;
}
// 展示用固定鏡頭：假怪從第一格就在命中位置，無須先走到定位。
updateCamera = function () {
  state.cameraX = previewOrigin.x - state.width/2;
  state.cameraY = previewOrigin.y - state.height/2;
};
sizePreview();
window.addEventListener('resize',()=>{sizePreview();resetPreview();paintPreview();});
function resetPreview() {
  resetGame(); state.mode = 'playing'; settingsPanel.hidden = true;
  state.spawnTimer = 999; state.shotTimer = 999; state.player.invincible = 999;
  previewTime = 0; previewFired = false;
  const p = state.player;
  previewOrigin = {x:p.x + (previewWide ? 0 : 45), y:p.y}; updateCamera();
  state.enemies = [50,85,120].map((d,i) => ({homeX:p.x+d,homeY:p.y+(i%2)*24-12,typeId:'jaben',behavior:'still',x:p.x+d,y:p.y+(i%2)*24-12,r:17,speed:0,damage:0,hp:100000,maxHp:100000,wobble:0,alive:true,flash:0,shotCooldown:999}));
  if (previewSpec.kind === 'move') {
    state.enemies = [];
    state.boss = {x:p.x-160,y:p.y,r:32,hp:2000,maxHp:2000,speed:0,wobble:0,flash:0};
    state.bossPhase = 3; state.boss.hp = 500; state.bossRest = 999;
    beginBossMove(previewSpec.id);
  } else {
    const card = UPGRADES.find(c=>c.id===previewSpec.id);
    // 效果積木單獨展示；合體卡同時保留前置，才能看見組合的兩種元素。
    if (card) {
      const acquire = (c,seen=new Set()) => { if(seen.has(c.id)) return; seen.add(c.id); (c.requires||[]).forEach(id=>{const pre=UPGRADES.find(c=>c.id===id);if(pre)acquire(pre,seen);}); state.upgrades[c.id]=1; };
      if (card.tier === 'fusion') acquire(card);
      state.upgrades[card.id] = previewSpec.level || 1;
    }
    state.player.health = PLAYER_HEALTH / 2;
    state.healTimer = UPGRADE_TUNING.autoHealSeconds;
    state.gems = [{x:p.x-90,y:p.y+60,r:8,value:0,alive:true,wobble:0}];
  }
}
function stepPreview(dt) {
  previewTime += dt;
  if (previewTime >= 3) resetPreview();
  if (!previewFired && previewTime >= .25) {
    previewFired = true;
    if (previewSpec.kind !== 'move') {
      const p = state.player;
      const effects = previewCard ? previewCard.effects : [];
      const features = effects.map(e=>e.feature).filter(Boolean);
      if (features.some(id=>['big-water','rapid-water','multi-water','piercing-water','splash-water','water-attack','wind-attack','thunder-attack','wind-speed'].includes(id)) || effects.some(e=>!e.feature && e.trigger==='hit')) {
        state.shotTimer=0; fireAtNearest(); triggerMakerEffects('hit',p.x+45,p.y);
      }
      if(features.some(id=>['water-skill','thunder-skill','fusion-puddle'].includes(id)) || effects.some(e=>!e.feature && e.trigger==='skill')) activateSkill();
      if(features.some(id=>['water-dash','wind-dash','fusion-storm','fusion-dash'].includes(id)) || effects.some(e=>!e.feature && e.trigger==='dash')) activateDash();
      if(features.includes('thunder-counter')) counterDischarge();
      if(previewSpec.id === 'heal') {state.player.health += Math.ceil(PLAYER_HEALTH/BUILD_TUNING.shieldHealthDivisor);addHealEffect();}
    }
  }
  // 不生成無關小怪、不抽卡、不結算；只推進這個沙盒的真實引擎。
  state.spawnTimer = 999; state.shotTimer = previewSpec.kind === 'move' ? 999 : state.shotTimer;
  state.bossRest = 999; state.player.invincible = 999;
  if (previewSpec.kind !== 'move') state.keys = new Set();
  const move = previewSpec.kind === 'move' && BOSS_MOVES.find(m=>m.id===previewSpec.id);
  const simulationSeconds = dt * (move ? Math.max(1,(move.warning+.7)/2.5) : 1);
  // 長預警加速展示，仍逐步跑真實引擎，單步不超過 .05 秒。
  for(let left=simulationSeconds;left>0;left-=.05) tick(Math.min(.05,left));
  // 老師召喚在正式遊戲從鏡頭外進場，展示縮短走入鏡頭的等待。
  if(previewSpec.kind==='move') state.enemies.forEach(e=>{ if(!targetVisible(e)){e.x=state.player.x+100;e.y=state.player.y+40;} });
  if (previewSpec.kind !== 'move') state.enemies.forEach(e=>{e.x=e.homeX;e.y=e.homeY;e.knockback=0;});
  paintPreview();
}
function paintPreview() {
  render();
  if (previewSpec.id === 'heal' || previewFeatures.some(id=>['bubble-shield','auto-heal'].includes(id))) {
    ctx.fillStyle='#142331';ctx.fillRect(4,4,90,16);
    ctx.fillStyle='#5be08b';ctx.fillRect(6,6,86*state.player.health/maxPlayerHealth(),12);
  }
}
function previewFrame(now) {
  previewRequest = null;
  if (!previewVisible || document.hidden) return;
  if (!previewLast) previewLast = now;
  if(now-previewLast >= 1000/30) {stepPreview(Math.min(.05,(now-previewLast)/1000));previewLast=now;}
  previewRequest = requestAnimationFrame(previewFrame);
}
window.setPreviewVisible = visible => {
  previewVisible = visible; previewLast = 0;
  if (previewRequest !== null) cancelAnimationFrame(previewRequest);
  previewRequest = visible && !document.hidden ? requestAnimationFrame(previewFrame) : null;
};
document.addEventListener('visibilitychange',()=>{state.mode='playing';window.setPreviewVisible(previewVisible);});
resetPreview(); paintPreview(); window.setPreviewVisible(previewVisible);
