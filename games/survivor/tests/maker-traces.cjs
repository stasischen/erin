// 與重構前來源產生的固定亂數快照比較；只記錄玩法，略過新增的資料欄位。
module.exports = function traces(run) {
  const rows=[];
  function seed() {run('globalThis.seed=42; Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)');}
  function fresh(){run(`resetGame();state.mode='playing';state.spawnTimer=999;state.shotTimer=999;settingsPanel.hidden=true;
    state.enemies=[70,110,155].map((offset,i)=>({typeId:'jaben',x:state.player.x+offset,y:state.player.y+i*20,r:17,speed:0,damage:0,hp:100000,maxHp:100000,wobble:0,alive:true,flash:0,shotCooldown:999}));`);seed();}
  function capture(){return JSON.parse(run(`JSON.stringify({health:state.player.health,damage:effectiveDamage(),interval:effectiveShotInterval(),hp:state.enemies.map(e=>e.hp),
      position:[state.player.x,state.player.y],shots:state.projectiles.map(s=>[s.x,s.y,s.vx,s.vy,s.r,s.damage,s.pierce]),fields:state.fields.map(f=>[f.school,f.x,f.y,f.radius,f.life]),
      enemyShots:state.enemyShots.map(s=>[s.x,s.y,s.vx,s.vy,s.damage]),boss:state.boss?[state.boss.x,state.boss.y,state.boss.hp]:null,phase:state.bossPhase,
      moves:state.bossMoves.map(m=>[m.id,m.x,m.y,m.warning,m.active,m.life,["words","chalk"].includes(m.id)?m.count:null,m.radius,m.points]),ultimate:state.ultimateTimer})`));}
  const ids=JSON.parse(run('JSON.stringify(UPGRADES.slice(0,24).map(c=>c.id))'));
  for(const id of ids) for(const level of [1,5]){
    fresh();run(`state.upgrades[${JSON.stringify(id)}]=${level};state.moveRate=1;fireAtNearest();activateSkill();activateDash();`);
    for(let i=0;i<40;i++)run('tick(.05)');rows.push({id,level,state:capture()});
  }
  for(const id of ['words','chalk','dash','rain','call','summon','ring']) for(const phase of [1,2,3]){
    fresh();run(`state.boss={x:state.player.x-150,y:state.player.y,r:32,hp:2000,maxHp:2000,speed:0,wobble:0,flash:0};state.bossPhase=${phase};state.boss.hp=${phase===1?2000:phase===2?1100:500};state.bossRest=999;beginBossMove('${id}');`);
    for(let i=0;i<40;i++){run('updateBoss(.05)');if([10,17,18,24,39].includes(i))rows.push({boss:id,phase,frame:i,state:capture()});}
  }
  return rows;
};
