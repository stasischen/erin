// 純資料規則 v1：秒、相對世界座標；不讀全域遊戲狀態或繪圖物件。
globalThis.SurvivorEffectBlocks = (() => {
  // ✏️ Erin 可以改的地方：在這裡重組已支援的觸發、條件、動作與修飾。
  const recipes = [
    {feature:'thunder-static', rules:[{id:'thunder-static', trigger:'onTimer',
      interval:{ref:'schoolRules.staticSeconds'},
      conditions:[{type:'touching', padding:3}],
      actions:[{type:'cue', cue:'lightning'}, {type:'damage', amount:{ref:'schoolRules.staticDamage'}}]}]},
    {feature:'item-crown', modifiers:[
      {stat:'neutralDamageMultiplier', op:'multiply', value:{op:'add',args:[1,{ref:'neutralRules.crownDamage'}]}},
      {stat:'maxHealth', op:'subtract', value:{ref:'neutralRules.crownHealth'}}
    ]}
  ];
  const refs = new Set(['schoolRules.staticSeconds','schoolRules.staticDamage','neutralRules.crownDamage','neutralRules.crownHealth']);
  function value(expression, data) {
    if (typeof expression === 'number' && Number.isFinite(expression)) return expression;
    if (expression && refs.has(expression.ref)) {
      const [group,key] = expression.ref.split('.');
      const result = data[group][key];
      if (typeof result === 'number' && Number.isFinite(result)) return result;
    }
    if (expression && expression.op === 'add' && Array.isArray(expression.args)) return expression.args.reduce((n,arg)=>n+value(arg,data),0);
    throw new Error('Unsupported effect expression');
  }
  // levels 已由 effectLevel 合併及封頂；存在才掛一次，不按等級重複掛載。
  function modify(stat, base, levels, data, definitions=recipes) {
    let result=base;
    for (const recipe of definitions) if (levels[recipe.feature]) for (const modifier of recipe.modifiers || []) {
      if (modifier.stat !== stat) continue;
      const amount=value(modifier.value,data);
      if (modifier.op === 'multiply') result *= amount;
      else if (modifier.op === 'subtract') result -= amount;
      else throw new Error('Unsupported effect modifier');
    }
    return result;
  }
  // timers 用規則 id（本階段每 feature 一個 card instance）。回傳副本，最多補一跳。
  // targets 已由接合層過濾合法目標，dx/dy 是環繞地圖最短距離。
  function step(input, definitions=recipes) {
    const timers={...input.timers}, events=[];
    for (const recipe of definitions) if (input.levels[recipe.feature]) for (const rule of recipe.rules || []) {
      if (rule.trigger !== 'onTimer') throw new Error('Unsupported effect trigger');
      const seconds=value(rule.interval,input.data);
      timers[rule.id]=(timers[rule.id] === undefined ? seconds : timers[rule.id])-input.dt;
      if (timers[rule.id]>0) continue;
      timers[rule.id]+=seconds;
      for (const target of input.targets) {
        if (!(rule.conditions || []).every(condition=>{
          if (condition.type !== 'touching') throw new Error('Unsupported effect condition');
          return Math.hypot(target.dx,target.dy)<input.player.r+target.r+value(condition.padding,input.data);
        })) continue;
        for (const action of rule.actions) {
          if (action.type === 'cue' && action.cue === 'lightning') events.push({type:'cue',cue:action.cue,targetId:target.id,source:rule.id});
          else if (action.type === 'damage') events.push({type:'damage',amount:value(action.amount,input.data),targetId:target.id,source:rule.id});
          else throw new Error('Unsupported effect action');
        }
      }
    }
    return {timers,events};
  }
  function attackTick(previous, weapon, dt, moving) {
    const p=previous || {number:0,idle:0,charge:0,moving:false};
    const idle=p.idle+dt;
    let charge=weapon.chargeEnabled ? p.charge : 0;
    if (moving && !p.moving) charge*=weapon.moveRetention;
    if (!moving && weapon.chargeEnabled) charge=Math.min(weapon.chargeSeconds,charge+dt);
    return {number:idle>=weapon.comboReset?0:p.number,idle,charge,moving};
  }
  function attack(previous, weapon, fallbackNumber=0) {
    const p=previous || {number:fallbackNumber,idle:0,charge:0,moving:false};
    const number=weapon.comboEnabled ? (p.idle>=weapon.comboReset?1:p.number%weapon.comboEvery+1) : 1;
    const charged=weapon.chargeEnabled && p.charge>=weapon.chargeSeconds;
    return {state:{...p,number,idle:0,charge:charged?0:p.charge},
      event:{type:'weapon-attack',weaponId:weapon.id,number,finisher:weapon.comboEnabled && number===weapon.comboEvery,charged}};
  }
  return {version:1,recipes,modify,step,attackTick,attack};
})();
