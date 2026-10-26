// 可移植純函式：輸入目前作品與招式 id，回傳可序列化資料；時間皆為秒。
globalThis.SurvivorPracticeRules = (() => {
  const phases=['windup','active','recovery','cooldown'];
  const labels=['預警','生效','反擊機會','冷卻'];
  const colors=['#efc94e','#ed5966','#6ac68a','#8493a2'];
  const seconds=n=>String(Number(n.toFixed(3)));
  function moves(data) {
    return [{id:'water-ball',name:'水球',icon:'big-water',kind:'weapon'},
      {id:'candy-hammer',name:'棒棒糖錘',icon:'candy-hammer',kind:'weapon'},
      {id:'item-wall',name:data.cards.find(c=>c.id==='item-wall').name,icon:'item-wall',kind:'weapon'},
      ...['pudding','mushroom','fairy','donut','pop-candy'].map(id=>({id,name:data.enemies.find(e=>e.id===id).name,icon:'monster',kind:'enemy'}))];
  }
  function model(data,id) {
    const move=moves(data).find(m=>m.id===id), t=data.tuning, p=data.pacing;
    if(move.kind==='weapon') {
      const w=data.weapons.find(w=>w.id===(id==='item-wall'?'water-ball':id));
      const interval=w.kind==='melee'?w.interval:t.shotInterval;
      // 普攻沒有預警或收招無敵窗；時間軸紅段代表本次發射／揮擊的間隔。
      return {...move,enabled:true,windup:0,active:interval,recovery:0,cooldown:0,
        damage:t.projectileDamage*(w.damageMultiplier||1),shape:w.kind==='melee'?'sector':'projectiles',
        radius:w.radius,angle:w.arcDegrees,spinEvery:w.spinEvery,interval,
        speed:t.projectileSpeed,length:data.build.shotRange,push:w.push||0,
        wavePush:id==='item-wall'?data.neutralRules.wavePush:0,
        waveDamage:id==='item-wall'?data.neutralRules.waveDamage:0};
    }
    const e=data.enemies.find(e=>e.id===id);
    if(e.phaseAttack.enabled) return {...move,...e.phaseAttack,legacy:false};
    // 這兩招在正式遊戲仍為舊招式：不捏造收招時間；冷卻照引擎原值。
    if(e.behavior==='charger') return {...move,enabled:true,legacy:true,windup:p.warning,active:p.chargeSeconds,recovery:0,cooldown:3,shape:'charge',length:p.chargeSpeed*p.chargeSeconds,radius:e.radius,speed:p.chargeSpeed,damage:data.bodyContact.pushOnly?0:e.damage*data.bodyContact.damageScale};
    if(e.behavior==='bomber') return {...move,enabled:true,legacy:true,windup:p.fuseSeconds,active:0,recovery:0,cooldown:0,shape:'blast',radius:p.blastRadius,damage:p.blastDamage};
    return {...move,enabled:false,windup:0,active:0,recovery:0,cooldown:0,shape:'none',damage:0};
  }
  function timeline(config,phase,left) {
    let total=0;
    const segments=phases.map((id,i)=>{const duration=Math.max(0,config[id]||0),start=total;total+=duration;return {id,label:labels[i],color:colors[i],duration,start,end:total};});
    const current=segments.find(s=>s.id===phase);
    const elapsed=current?current.start+Math.max(0,Math.min(current.duration,current.duration-left)):0;
    return {segments,total,elapsed,progress:total?elapsed/total:0,phase:current?current.id:'ready'};
  }
  function describe(c) {
    if(!c.enabled) return c.name+'：此招已停用';
    const shapes={sector:`扇形 ${c.angle}°`,circle:`圓形 半徑 ${c.radius}`,ring:`圓環 ${c.innerRadius}–${c.radius}`,
      line:`直線 ${c.length} × ${c.radius*2}`,projectiles:c.radial?`${c.count} 發｜缺口 ${c.gapDegrees}°｜速度 ${c.speed}｜距離 ${c.length}`:`子彈 速度 ${c.speed}｜距離 ${c.length}`,
      charge:`衝撞 ${c.length}｜速度 ${c.speed}`,blast:`自爆 半徑 ${c.radius}`};
    return `${c.name}：${phases.map(p=>seconds(c[p]||0)+'s').join(' → ')}｜${shapes[c.shape]}｜傷害 ${seconds(c.damage)}${c.push?'｜擊退 '+c.push:''}${c.spinEvery?'｜每 '+c.spinEvery+' 下旋轉':''}${c.wavePush?'｜浪花擊退 '+c.wavePush+' 互撞傷害 '+c.waveDamage:''}${c.legacy?'｜舊招式，無收招階段':''}${c.kind==='weapon'?'｜紅段為攻擊間隔，飛行可重疊':''}`;
  }
  return {moves,model,timeline,describe};
})();
