// 可移植規則：抽樣由呼叫者傳入；時間用秒，回傳值只有資料。
(function(root) {
  const pick = (rows, sample) => rows[Math.min(rows.length-1,Math.floor(sample*rows.length))];
  function drawTwo(rows, samples) {
    const pool=rows.slice(), result=[];
    for(let i=0;i<2 && pool.length;i++) {const id=pick(pool,samples[i]);result.push(id);pool.splice(pool.indexOf(id),1);}
    return result;
  }
  function plan(data,stageId,samples) {
    const themes=data.pacing.themes[stageId];
    const extra=drawTwo(data.enemies.slice(2).map(e=>e.id).filter(id=>!themes.includes(id)),samples);
    return {stageId,types:['jaben','otsubon',...themes,...extra],events:drawTwo(data.pacing.eventPool,samples.slice(2)),eventIndex:0,queue:[],cursor:0};
  }
  function candidates(run,seconds) {
    if(seconds<20) return ['jaben'];
    if(seconds<45) return ['jaben','otsubon'];
    if(seconds<70) return run.types.filter(id=>!['pudding','pop-candy'].includes(id));
    return run.types;
  }
  function density(config,seconds) { return config.density * ((config.pattern==='steady' || Math.floor(seconds/config.cycleSeconds)%2) ? config.strongScale : config.weakScale); }
  root.SurvivorPacing={plan,candidates,density,pick};
})(globalThis);

function resetPacing() { state.pacing=null; }
function ensurePacing() {
  if(!state.pacing || state.pacing.stageId!==currentStage().id) state.pacing=SurvivorPacing.plan(GAME_DATA,currentStage().id,Array.from({length:4},()=>Math.random()));
  return state.pacing;
}
function pacingType() {
  if(PREVIEW_MODE) return ENEMY_TYPES[0].id;
  const run=ensurePacing(), ids=SurvivorPacing.candidates(run,state.stageElapsed);
  // 每三隻至少一隻沙包，始終保留容易打倒的目標。
  return run.cursor++%3===0 ? 'jaben' : SurvivorPacing.pick(ids,Math.random());
}
function updatePacing(dt) {
  if(PREVIEW_MODE || state.boss || state.bossIntro>0) return;
  const run=ensurePacing(), cfg=GAME_DATA.pacing;
  const times=[45,90];
  if(run.eventIndex<2 && state.stageElapsed>=times[run.eventIndex]) {
    const kind=run.events[run.eventIndex++];
    run.queue=Array.from({length:cfg.eventCount},(_,i)=>({kind,index:i}));
    run.warning=cfg.warning; run.timer=0;
    state.bookNoticeTimer=4;
    enemyNotice.textContent={ring:'小怪包圍！找空隙衝出去',tide:'蒲公英湧潮！', 'elite-squad':'精英小隊靠近了！','candy-rain':'跳跳糖來了！'}[kind];
    enemyNotice.hidden=false; playSound('warning');
  }
  if(run.warning>0) {run.warning=countdown(run.warning,dt);return;}
  run.timer=countdown(run.timer||0,dt);
  if(run.queue.length && !run.timer) {
    const entry=run.queue[0], kind=entry.kind;
    const side=kind==='ring' ? entry.index%4 : kind==='tide' ? 0 : undefined;
    const enemy=spawnEnemy({typeId:kind==='tide'?'otsubon':kind==='candy-rain'?'pop-candy':'jaben',elite:kind==='elite-squad',side});
    if(enemy) run.queue.shift();
    // 精英仍遵守同時上限，滿額跳過，不能堵住事件佇列。
    else if(kind==='elite-squad' && state.enemies.filter(e=>e.alive&&e.elite).length>=GAME_DATA.elites.limit) run.queue.shift();
    run.timer=cfg.eventSeconds/cfg.eventCount;
  }
}
function updateEnemyBehavior(e,dt) {
  if(e.miniboss) return;
  const cfg=GAME_DATA.pacing;
  e.actionCooldown=countdown(e.actionCooldown===undefined ? 2 : e.actionCooldown,dt);
  e.fairyShieldLife=countdown(e.fairyShieldLife||0,dt);
  if(!e.fairyShieldLife) e.fairyShield=0;
  if(e.stunTimer>0 || state.bossIntro>0) return;
  const visible=targetVisible(e), distance=encounterDistance(e,state.player);
  if(!visible) {e.action=null;return;}
  if(e.action) {
    e.action.warning=countdown(e.action.warning,dt);
    if(e.action.warning>0) return;
    if(e.action.kind==='charge') {
      if(e.action.life===undefined) e.action.life=cfg.chargeSeconds;
      const step=Math.min(dt,e.action.life); e.action.life=countdown(e.action.life,dt);
      e.x+=Math.cos(e.action.angle)*cfg.chargeSpeed*step;
      e.y+=Math.sin(e.action.angle)*cfg.chargeSpeed*step;
      clampToMap(e);
      if(!e.action.life) {e.action=null;e.actionCooldown=3;}
    } else if(e.action.kind==='blast') {
      const point={x:e.x,y:e.y,r:cfg.blastRadius};
      e.alive=false; // 消耗自己，不觸發擊敗獎勵或遞迴自爆。
      skillVisual('splash',e.x,e.y,{radius:cfg.blastRadius,color:'#ffad91',life:.4});
      if(distance<cfg.blastRadius+state.player.r) pacingHurtPlayer(cfg.blastDamage);
      for(const other of state.enemies.slice()) if(other!==e && other.alive && encounterDistance(point,other)<cfg.blastRadius+other.r) damageEnemy(other,cfg.blastEnemyDamage);
      e.action=null;
    } else {
      for(const other of state.enemies) if(other!==e && other.alive && !other.miniboss && encounterDistance(e,other)<cfg.shieldRadius) {
        other.fairyShield=cfg.shieldHits; other.fairyShieldLife=cfg.shieldSeconds;
      }
      e.action=null;e.actionCooldown=cfg.shieldSeconds;
    }
    return;
  }
  if(e.actionCooldown>0) return;
  if(e.behavior==='charger' && distance<420) e.action={kind:'charge',warning:cfg.warning,angle:Math.atan2(deltaY(state.player.y,e.y),deltaX(state.player.x,e.x))};
  if(e.behavior==='bomber' && distance<cfg.blastRadius+70) e.action={kind:'blast',warning:cfg.fuseSeconds};
  if(e.behavior==='support') e.action={kind:'shield',warning:cfg.warning};
  if(e.action) playSound('warning');
}
function enemyDirection(e,distance) {
  if(e.action || e.behavior==='still') return 0;
  if(['retreat','shooter','support'].includes(e.behavior)) {
    const range=e.behavior==='support'?280:230;
    return distance<range ? -1 : distance<range+60 ? 0 : 1;
  }
  return 1;
}
function separateTanks() {
  for(const tank of state.enemies) if(tank.alive && tank.behavior==='tank') {
    for(const other of state.enemies) if(other!==tank && other.alive && !other.miniboss) {
      const dx=deltaX(other.x,tank.x),dy=deltaY(other.y,tank.y),d=Math.hypot(dx,dy),gap=tank.r+other.r;
      if(d<gap) {other.x+=(d?dx/d:1)*(gap-d);other.y+=(d?dy/d:0)*(gap-d);clampToMap(other);}
    }
  }
}
function splitJelly(e) {
  if(e.behavior!=='splitter' || e.small) return;
  // 只入列可序列化的死亡位置；下一個更新邊界才生成，避免遍歷時遞迴。
  for(let i=0;i<2 && state.jellyQueue.length<18;i++) state.jellyQueue.push({typeId:e.typeId,x:e.x+(i?10:-10),y:e.y});
}

function pacingHurtPlayer(damage) {
  if(state.player.damageDisabled || state.dashTimer>0 || state.player.invincible>0) return;
  state.player.health=Math.max(0,state.player.health-absorbSchoolHit(damage));
  state.player.invincible=INVINCIBLE_SECONDS;state.player.hitFlash=.16;
  playSound('hurt'); updateHud(); counterDischarge();
  if(state.player.health<=0) finishRun(false);
}
Survivor.engine.pacing={rules:SurvivorPacing,resetPacing,ensurePacing,updatePacing,updateEnemyBehavior,splitJelly};
