// 這份腳本只在獨立 iframe 執行，所有狀態、亂數、物件池都屬於小場景。
const previewSpec = globalThis.SURVIVOR_PREVIEW.spec;
let previewTime = 0, previewFired = false, previewRequest = null, previewLast = 0;
let previewVisible = frameElement._previewVisible !== false;
const previewCard = UPGRADES.find(c=>c.id===previewSpec.id);
if(previewCard && previewSpec.kind==='effect') previewCard.effects=[previewCard.effects[previewSpec.index]];
gameSettings.sound = false; gameSettings.vibration = false;
state.width = 640; state.height = 360;
canvas.width = 640; canvas.height = 360; ctx.imageSmoothingEnabled = false;
function resetPreview() {
  resetGame(); state.mode = 'playing'; settingsPanel.hidden = true;
  state.spawnTimer = 999; state.shotTimer = 999; state.player.invincible = 999;
  previewTime = 0; previewFired = false;
  const p = state.player;
  state.enemies = [45,85,125,165].map((d,i) => ({typeId:'jaben',behavior:'chase',x:p.x+d,y:p.y+(i%2)*20,r:17,speed:12,damage:0,hp:100000,maxHp:100000,wobble:0,alive:true,flash:0,shotCooldown:999}));
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
  if (previewSpec.kind !== 'move') state.keys = new Set(previewTime < .8 ? ['s'] : []);
  const move = previewSpec.kind === 'move' && BOSS_MOVES.find(m=>m.id===previewSpec.id);
  const simulationSeconds = dt * (move ? Math.max(1,(move.warning+.7)/2.5) : 1);
  // 長預警加速展示，仍逐步跑真實引擎，單步不超過 .05 秒。
  for(let left=simulationSeconds;left>0;left-=.05) tick(Math.min(.05,left));
  // 老師召喚在正式遊戲從鏡頭外進場，展示縮短走入鏡頭的等待。
  if(previewSpec.kind==='move') state.enemies.forEach(e=>{ if(!targetVisible(e)){e.x=state.player.x+100;e.y=state.player.y+40;} });
  paintPreview();
}
function paintPreview() {
  render();
  ctx.fillStyle='#142331';ctx.fillRect(12,12,180,32);
  ctx.fillStyle='#5be08b';ctx.fillRect(16,16,Math.min(172,172*state.player.health/maxPlayerHealth()),24);
  ctx.fillStyle='#fff';ctx.font='16px system-ui';ctx.textAlign='left';ctx.fillText('血量 '+Math.ceil(state.player.health)+' / '+maxPlayerHealth(),20,34);
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
