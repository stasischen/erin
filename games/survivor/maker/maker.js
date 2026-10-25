(function () {
  'use strict';
  const api = SurvivorData, loaded = api.load();
  let draft = loaded.data, tab = 'schools', cardIndex = 0, dirty = false;
  const editor = document.getElementById('editor'), status = document.getElementById('status');
  const labels = { damage: '傷害', radius: '範圍／大小', speed: '速度', count: '數量', spread: '散射角度', duration: '持續秒數', interval: '間隔秒數', multiplier: '緩速後剩餘速度', distance: '擊退／衝撞距離', gap: '缺口角度', warning: '預警秒數', pulse: '連發間隔', hp: '血量', maxLevel: '最高等級', power: '原本效果強度' };
  function el(tag, text, parent) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (parent) parent.appendChild(node); return node; }
  function message(text, error = false) { status.textContent = text; status.className = error ? 'error' : ''; }
  function changed() { dirty = true; const result = api.validate(draft); message(result.valid ? '作品已修改，記得儲存或按試玩！' : result.errors.join('；'), !result.valid); }
  function panel(title) { const node = el('section', undefined, editor); node.className = 'panel'; el('h2', title, node); return node; }
  function grid(parent) { const node = el('div', undefined, parent); node.className = 'grid'; return node; }
  function text(parent, label, object, key, maxLength = 24) { const row = el('label', label, parent), input = el('input', undefined, row); input.type = 'text'; input.maxLength = maxLength; input.value = object[key] || ''; input.addEventListener('input', () => { object[key] = input.value; changed(); }); }
  function select(parent, label, object, key, choices, onChange) {
    const row = el('label', label, parent), input = el('select', undefined, row);
    Object.entries(choices).forEach(([value, title]) => { const option = el('option', title, input); option.value = value; });
    input.value = object[key] || ''; input.addEventListener('change', () => { object[key] = input.value; changed(); if (onChange) onChange(); }); return input;
  }
  function range(parent, object, key, limits, label) {
    const bounds = limits || api.BOUNDS[key], row = el('label', undefined, parent), heading = el('span', (label || labels[key] || key) + '：', row), value = el('output', String(object[key]), heading), input = el('input', undefined, row);
    input.type = 'range'; input.min = bounds[0]; input.max = bounds[1]; input.step = bounds[2]; input.value = object[key]; input.setAttribute('aria-label', label || labels[key] || key);
    input.addEventListener('input', () => { object[key] = Number(input.value); value.textContent = input.value; changed(); });
  }
  function drawSchools() {
    const p = panel('替流派取名字');
    for (const school of ['water','wind','thunder']) text(p, api.defaults().build[school].name, draft.build[school], 'name');
  }
  function drawCards() {
    const p = panel('設計技能樹');
    const picker = { card: String(cardIndex) };
    select(p, '先挑一張卡', picker, 'card', Object.fromEntries(draft.cards.map((c,i) => [i, c.icon + c.name])), () => { cardIndex = Number(picker.card); render(); });
    const c = draft.cards[cardIndex], fields = grid(p);
    text(fields, '卡片名稱', c, 'name'); text(fields, '卡片說明', c, 'description', 120); range(fields, c, 'maxLevel');
    select(fields, '流派', c, 'school', { '': '支援', water: draft.build.water.name, wind: draft.build.wind.name, thunder: draft.build.thunder.name });
    select(fields, '欄位', c, 'slot', {attack:'普攻',skill:'技能',dash:'衝刺',passive:'被動'});
    select(fields, '技能樹階段', c, 'tier', {'':'支援',entry:'入門','advanced-a':'進階 A','advanced-b':'進階 B',fusion:'合體',ultimate:'終極（每場一種）'});
    const prerequisites = el('details', undefined, p); el('summary', '選擇前置卡片（目前 ' + c.requires.length + ' 張）', prerequisites);
    el('p', '每張前置卡達到 Lv1 即可。不要選自己，或讓前置卡互相繞成圈。', prerequisites);
    const checks = grid(prerequisites);
    draft.cards.filter(other => other.id !== c.id).forEach(other => {
      const row = el('label', undefined, checks); row.className = 'check'; const check = el('input', undefined, row); check.type = 'checkbox'; check.checked = c.requires.includes(other.id); el('span', other.icon + other.name, row);
      check.addEventListener('change', () => { c.requires = check.checked ? c.requires.concat(other.id) : c.requires.filter(id => id !== other.id); changed(); });
    });
    c.effects.forEach((effect, index) => drawEffect(p, c, effect, index));
    if (c.effects.length < 3) { const add = el('button', '＋ 加一個積木', p); add.type = 'button'; add.addEventListener('click', () => { c.effects.push({type:'aoe',trigger:'skill',...api.PARAMS}); changed(); render(); }); }
  }
  function drawEffect(parent, card, effect, index) {
    const box = el('fieldset', undefined, parent); el('legend', '積木 ' + (index + 1), box);
    const holder = { recipe: effect.feature ? 'recipe:' + effect.feature : effect.type };
    const recipes = Object.fromEntries(api.defaults().cards.map(c => ['recipe:' + c.id, '原本組合：' + c.name]));
    select(box, '選擇效果', holder, 'recipe', { ...api.TYPES, ...recipes }, () => {
      if (holder.recipe.startsWith('recipe:')) { const base = api.defaults().cards.find(c => c.id === holder.recipe.slice(7)); card.effects[index] = api.copy(base.effects[0]); }
      else card.effects[index] = { type: holder.recipe, trigger: card.slot === 'dash' ? 'dash' : card.slot === 'skill' ? 'skill' : card.slot === 'passive' ? 'interval' : 'hit', ...api.PARAMS };
      changed(); render();
    });
    if (effect.feature) { el('p', '使用這張原本卡片的效果組合；數值可到「共用數值」調整。最多合計 5 級的效果。', box); range(box, effect, 'power'); }
    else {
      select(box, '什麼時候發動？', effect, 'trigger', {hit:'水球命中時',skill:'按技能時',dash:'按衝刺時',interval:'每隔一段時間'});
      el('p', '「間隔秒數」也是這個積木再次發動前的休息時間。傷害隨卡片等級增加。', box);
      const fields = grid(box), keys = { projectile:['damage','speed','count','spread','interval'], aoe:['damage','radius','interval'], chain:['damage','radius','count','interval'], 'dash-trail':['damage','radius','duration','interval'], slow:['radius','duration','multiplier','interval'], stun:['radius','duration','interval'], knockback:['radius','distance','interval'], summon:['damage','radius','duration','speed','count','interval'], 'ring-with-gap':['damage','radius','gap','interval'] };
      keys[effect.type].forEach(key => range(fields, effect, key));
      if (effect.type === 'dash-trail') el('p', '按衝刺時會在沿路留下範圍痕跡。', box);
      if (effect.type === 'summon') el('p', '小幫手留在召喚位置，暫時自動發射水球。', box);
    }
    if (card.effects.length > 1) { const remove = el('button', '移除這個積木', box); remove.type = 'button'; remove.addEventListener('click', () => { card.effects.splice(index,1); changed(); render(); }); }
  }
  function drawEnemies() {
    draft.enemies.forEach(e => {
      const p = panel(e.name), fields = grid(p); text(fields, '怪物名稱', e, 'name'); range(fields, e, 'hp'); range(fields, e, 'speed', [0,170,5], '移動速度'); range(fields, e, 'radius', [10,35,1], '身體大小'); range(fields, e, 'damage', [0,40,1], '碰撞傷害');
      select(fields, '移動方式', e, 'behavior', {chase:'追著主角',still:'站在原地',retreat:'靠近時後退'});
      const attack = el('fieldset', undefined, p); el('legend','怪物的攻擊',attack);
      select(attack, '攻擊積木', e.attack, 'type', {none:'不攻擊',projectile:'發射國字',aoe:'預警後範圍傷害',summon:'召喚怪物'});
      const controls = grid(attack); range(controls,e.attack,'interval',[1,15,.5]); range(controls,e.attack,'level',[2,20,1],'開始攻擊等級'); range(controls,e.attack,'damage',[0,30,1]); range(controls,e.attack,'speed',[50,200,5]); range(controls,e.attack,'radius',[10,100,1]); range(controls,e.attack,'count',[1,5,1]); range(controls,e.attack,'spread',[0,.6,.05]);
    });
  }
  function drawBoss() {
    const p = panel('魔王與三個階段'), fields = grid(p); text(fields,'魔王名稱',draft.boss,'name'); range(fields,draft.boss,'hp',[500,5000,100]); range(fields,draft.boss,'speed',[0,100,5]); range(fields,draft.boss,'radius',[20,50,1],'身體大小');
    draft.boss.phases.forEach((phase,i) => { const box=el('fieldset',undefined,p); el('legend','第 '+(i+1)+' 階段',box); if(i) range(box,phase,'threshold',[.05,.95,.01],'血量低於比例'); range(box,phase,'rest',[.4,8,.1],'招式休息秒數'); const holder={combo:phase.combo||''}; select(box,'範圍招式搭配的合招',holder,'combo',{'':'不合招',...Object.fromEntries(draft.boss.moves.map(m=>[m.id,m.name]))},()=>{phase.combo=holder.combo||null;changed();}); });
    draft.boss.moves.forEach(m => { const box=panel(m.name), f=grid(box); text(f,'招式名稱',m,'name'); select(f,'招式積木',m,'kind',api.KINDS); range(f,m,'minPhase',[1,3,1],'第幾階段開始使用'); ['warning','damage','speed','count','spread','radius','duration','pulse','gap','distance'].forEach(key=>range(f,m,key)); range(f,m,'phaseCount',[0,1,1],'每個階段是否多一個目標'); el('p','招式只使用相關參數：扇形用速度／數量／角度；範圍用大小／數量；衝撞用速度／距離；圈用大小／缺口／持續時間。老師在畫面外不出招。',box); });
  }
  function drawNumbers() {
    const defaults=api.defaults();
    for(const [key,title] of [['tuning','基本玩法'],['build','流派共用數值'],['bossTuning','魔王共用數值']]) {
      const p=panel(title), fields=grid(p);
      for(const [field,value] of Object.entries(draft[key])) {
        if(typeof value!=='number') continue;
        if(key==='bossTuning' && !['phasePause','hazardLimit','shakeSeconds','shakePixels'].includes(field)) continue;
        if(key==='tuning' && ['enemySpeed','enemyRadius','enemyDamage','enemyHealth','secondEnemySpeed','secondEnemyDamage','enemyShootLevel','enemyShotInterval','secondEnemyShotInterval','enemyShotSpeed','enemyShotDamage','secondEnemyHealth','teacherHealth','teacherShotDamage','teacherShotCount','teacherShotSpread'].includes(field)) continue;
        const integer=['maxUpgradeLevel','enemyLimit','enemyShotLimit','teacherShotCount','teacherShotLimit','projectileLimit','gemLimit','xpToLevel','xpGrowthPerLevel','enemyShootLevel','fieldLimit','hazardLimit'].includes(field);
        let min=integer?1:value===0?0:Math.min(.01,defaults[key][field]), max=integer?defaults[key][field]:Math.max(5,defaults[key][field]*3), step=integer?1:defaults[key][field]>=5?1:.01;
        if(field==='slowMultiplier') {min=.2;max=1;step=.05;} if(field==='supportChance') {min=0;max=1;step=.05;}
        range(fields,draft[key],field,api.TUNING_BOUNDS[field] || [min,max,step],NUMBER_NAMES[field]||field);
      }
    }
  }
  const NUMBER_NAMES = {
    splashDamageBase:'水花基本傷害比例', splashDamageGrowth:'水花每級傷害加成', chainGrowth:'跳電每級傷害加成', fieldRadiusGrowth:'痕跡每級範圍加成', supportSplashDamage:'支援水花傷害比例', healIntervalMultiplier:'補血每級間隔倍率', shieldHealthDivisor:'護盾增血除數', maxUpgradeLevel:'卡片等級上限', splashBaseRadius:'水花基本範圍', splashPerLevel:'每級水花範圍', invincibleSeconds:'受傷後保護秒數', waterSizePerLevel:'每級水球大小加成', damagePerLevel:'每級水球傷害加成', fireRateReduction:'每級連發間隔減少比例', extraShotAngle:'多重水球間隔角度', moveSpeedPerLevel:'每級移速加成', magnetPerLevel:'每級磁鐵加成', playerSpeed:'主角速度', playerHealth:'主角血量', enemyLimit:'怪物數量上限', enemySpeed:'甲本預設移速', enemyRadius:'甲本預設大小', enemyDamage:'甲本預設碰撞傷害', enemyHealth:'甲本預設血量', secondEnemySpeed:'乙本預設移速', secondEnemyDamage:'乙本預設碰撞傷害', enemyShootLevel:'預設開始丟字等級', enemyShotInterval:'甲本預設丟字間隔', secondEnemyShotInterval:'乙本預設丟字間隔', enemyShotSpeed:'預設國字速度', enemyShotDamage:'預設國字傷害', enemyShotGap:'怪物共同丟字間隔', enemyShotLimit:'怪物國字上限', enemySpeedGrowth:'每半分鐘怪物加速比例', secondEnemyHealth:'乙本預設血量', waveSeconds:'魔王出場秒數', teacherHealth:'魔王預設血量', teacherShotDamage:'魔王預設國字傷害', teacherShotCount:'魔王預設國字數量', teacherShotSpread:'魔王預設國字角度', teacherShotLimit:'魔王國字上限', shotInterval:'自動水球間隔', projectileDamage:'基本水球傷害', projectileSpeed:'基本水球速度', projectileLimit:'水球數量上限', gemLimit:'寶石數量上限', gemPullRadius:'寶石吸取範圍', xpToLevel:'初次升級需求', xpGrowthPerLevel:'每級增加需求', dashCooldown:'衝刺休息秒數', dashSeconds:'衝刺持續秒數', dashMultiplier:'衝刺速度倍率', bombCooldown:'泡泡炸彈休息秒數', bombDelay:'泡泡延遲秒數', bombDamage:'泡泡傷害', bombRadius:'泡泡範圍', bombKnockback:'泡泡擊退距離', actionButtonSize:'動作按鈕大小', autoHealSeconds:'自動補血秒數', ultimateSeconds:'海嘯間隔', cloudSeconds:'雷雲間隔', ultimateDamage:'終極傷害', ultimateGrowth:'終極每級加成', tornadoRadius:'龍捲風環繞範圍', tornadoSpeed:'龍捲風旋轉速度', tornadoTick:'龍捲風傷害間隔', attackRadius:'主角攻擊最遠距離', shotRange:'水球飛行距離', windSpeed:'風入門每級速度加成', movingRate:'疾行每級攻速加成', stunSeconds:'電泡泡暈眩秒數', counterRadius:'反擊範圍', counterDamage:'反擊傷害', supportChance:'支援卡出現機率', slowSeconds:'水窪緩速秒數', slowMultiplier:'緩速剩餘速度', pushDistance:'旋風擊退距離', pullDistance:'風技能拉近距離', chainRadius:'跳電範圍', chainDamage:'跳電傷害比例', fieldSeconds:'痕跡持續秒數', fieldRadius:'痕跡範圍', fieldInterval:'痕跡傷害間隔', fieldDamage:'痕跡傷害', fieldLimit:'痕跡上限', trailSpacing:'痕跡間距', skillRadiusMultiplier:'流派技能範圍倍率', skillDamageMultiplier:'流派技能傷害倍率', warningSeconds:'預設預警秒數', phasePause:'轉階段休息秒數', damage:'魔王預設傷害', chalkSpeed:'預設粉筆速度', dashSpeed:'預設衝撞速度', dashDistance:'預設衝撞距離', rainRadius:'預設考卷範圍', callRadius:'預設點名範圍', ringRadius:'預設圈大小', ringGap:'預設圈缺口', ringSeconds:'預設圈持續秒數', hazardLimit:'預警招式上限', shakeSeconds:'震動秒數', shakePixels:'震動畫素'
  };
  function render() { editor.textContent=''; document.querySelectorAll('[data-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tab===tab))); ({schools:drawSchools,cards:drawCards,enemies:drawEnemies,boss:drawBoss,numbers:drawNumbers})[tab](); }
  document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{tab=button.dataset.tab;render();}));
  function save() { const result=api.save(draft); if(result.valid){draft=result.data;dirty=false;message('作品已儲存在這台裝置！');}else message(result.errors.join('；'),true);return result.valid; }
  document.getElementById('save').addEventListener('click',save);
  document.getElementById('play').addEventListener('click',()=>{if(save()) location.href='../?maker=1';});
  document.getElementById('reset').addEventListener('click',()=>{draft=api.defaults();if(save()){render();message('已恢復預設作品。');}});
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  render(); message(loaded.valid?'挑一項開始設計吧！':loaded.errors.join('；'),!loaded.valid);
})();
