(function () {
  'use strict';
  const api = SurvivorData, loaded = api.load();
  let draft = loaded.data, tab = 'weapons', selected = {}, defaultsOpen = false, previewOpen = false, cardIndex = 0, moveIndex = 0, dirty = false;
  let content, previewPane, defaultsDetails;
  const editor = document.getElementById('editor'), status = document.getElementById('makerStatus');
  const labels = { damage: '傷害', radius: '範圍／大小', speed: '速度', count: '數量', spread: '散射角度', duration: '持續秒數', interval: '間隔秒數', multiplier: '緩速後剩餘速度', distance: '擊退／衝撞距離', gap: '缺口角度', warning: '預警秒數', pulse: '連發間隔', hp: '血量', maxLevel: '最高等級', power: '原本效果強度' };
  function el(tag, text, parent) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (parent) parent.appendChild(node); return node; }
  function message(text, error = false) { status.textContent = text; status.className = error ? 'error' : ''; }
  function changed() { if (globalThis.SurvivorPreview) SurvivorPreview.refresh(); if (globalThis.SurvivorPractice) SurvivorPractice.refresh(draft); dirty = true; const result = api.validate(draft); message(result.valid ? '作品已修改，記得儲存或按試玩！' : result.errors.join('；'), !result.valid); }
  function panel(title) { const node = el('section', undefined, content); node.className = 'panel'; el('h2', title, node); return node; }
  function grid(parent) { const node = el('div', undefined, parent); node.className = 'grid'; return node; }
  function text(parent, label, object, key, maxLength = 24) { const row = el('label', label, parent), input = el('input', undefined, row); input.type = 'text'; input.maxLength = maxLength; input.value = object[key] || ''; input.addEventListener('input', () => { object[key] = input.value; changed(); }); }
  function button(parent, title, action, pressed) {
    const node = el('button', title, parent); node.type = 'button';
    if (pressed !== undefined) node.setAttribute('aria-pressed', String(pressed));
    node.addEventListener('click', action); return node;
  }
  function select(parent, label, object, key, choices, onChange) {
    const row = el('details', undefined, parent); row.className = 'maker-choice';
    const heading = el('summary', label + '：' + (choices[object[key] || ''] || '請選擇'), row);
    const options = grid(row);
    Object.entries(choices).forEach(([value, title]) => button(options, title, () => {
      object[key] = value; heading.textContent = label + '：' + title; row.open = false;
      changed(); if (onChange) onChange(); else render();
    }, String(object[key] || '') === value));
    return row;
  }
  function range(parent, object, key, limits, label, iconOnly = false) {
    if (key === 'phaseCount') {
      const toggle = button(parent, (label || labels[key] || key) + (object[key] ? '：開' : '：關'), () => { object[key] = object[key] ? 0 : 1; changed(); render(); });
      toggle.setAttribute('role', 'switch'); toggle.setAttribute('aria-checked', String(!!object[key])); return;
    }
    const bounds = limits || api.BOUNDS[key], row = el('div', undefined, parent); row.className = 'maker-number';
    el('span', label || labels[key] || key, row);
    const controls = el('div', undefined, row), value = el('output', String(object[key]), controls);
    const slider = el('input', undefined, row); slider.type = 'range'; slider.className = 'maker-slider';
    slider.min = bounds[0]; slider.max = bounds[1]; slider.step = bounds[2]; slider.value = object[key];
    slider.setAttribute('aria-label', label || labels[key] || key);
    slider.addEventListener('input', () => { object[key] = Number(slider.value); value.textContent = String(object[key]); changed(); });
    function adjust(direction) {
      object[key] = Number(Math.max(bounds[0], Math.min(bounds[1], object[key] + direction * bounds[2])).toFixed(4));
      value.textContent = String(object[key]); slider.value = object[key]; changed();
    }
    const minus = button(controls, '−', () => adjust(-1)), plus = button(controls, '＋', () => adjust(1));
    minus.setAttribute('aria-label', (label || labels[key] || key) + ' 減少');
    plus.setAttribute('aria-label', (label || labels[key] || key) + ' 增加');
    if (iconOnly) for (const [b,id] of [[minus,'minus'],[plus,'plus']]) { b.textContent=''; b.innerHTML=SurvivorIcons.html(id); b.className='encounter-adjust'; }

  }
  function iconPicker(parent, card) {
    const picker = el('details', undefined, parent);
    const summary = el('summary', '挑選圖示', picker);
    summary.innerHTML = SurvivorIcons.html(card.icon) + summary.innerHTML;
    const choices = grid(picker); choices.className += ' icon-picker';
    SurvivorIcons.ids.forEach(id => {
      const option = button(choices, '', () => { card.icon = id; changed(); render(); }, card.icon === id);
      option.innerHTML = SurvivorIcons.html(id); option.setAttribute('aria-label', SurvivorIcons.labels[id]); option.title = SurvivorIcons.labels[id];
    });
  }
  function drawSchools() {
    const p = panel('替流派取名字');
    for (const school of draft.schools.map(s => s.id)) text(p, api.defaults().build[school].name, draft.build[school], 'name');
  }
  function drawCards() {
    const p = panel('設計技能卡');
    const edit = el('section', undefined, p); edit.id = 'makerCardEdit'; edit.className = 'maker-card-edit';
    el('h3', '編輯選中的卡片', edit);
    const c = draft.cards[cardIndex], fields = grid(edit);
    if (globalThis.SurvivorPreview) { const host=el('div',undefined,previewPane); host.className='skill-preview-host'; SurvivorPreview.mount(host,draft,{kind:'card',id:c.id}); }
    iconPicker(fields, c); text(fields, '卡片名稱', c, 'name'); text(fields, '遠程說明', c, 'description', 120); text(fields, '近戰說明', c, 'descriptionMelee', 120); text(fields, '大劍說明', c, 'descriptionSword', 120); range(fields, c, 'maxLevel');
    if (!c.neutral) select(fields, '流派', c, 'school', { '': '支援', ...Object.fromEntries(draft.schools.map(s => [s.id,draft.build[s.id].name])) });
    select(fields, '欄位', c, 'slot', {attack:'普攻',skill:'技能',dash:'衝刺',passive:'被動'});
    select(fields, '品質', c, 'rarity', {common:'普通',rare:'稀有',legendary:'傳說'});
    if (!c.neutral) select(fields, '技能樹階段', c, 'tier', {'':'支援',entry:'入門','advanced-a':'進階 A','advanced-b':'進階 B',fusion:'合體',ultimate:'終極（同流派 5 張）'});
    const prerequisites = el('details', undefined, edit); el('summary', '選擇前置卡片（目前 ' + c.requires.length + ' 張）', prerequisites);
    el('p', '每張前置卡達到 Lv1 即可。不要選自己，或讓前置卡互相繞成圈。', prerequisites);
    const checks = grid(prerequisites);
    draft.cards.filter(other => !c.neutral && other.id !== c.id).forEach(other => {
      const prerequisite = button(checks, (c.requires.includes(other.id) ? '✓ ' : '＋ ') + other.name, () => {
        c.requires = c.requires.includes(other.id) ? c.requires.filter(id => id !== other.id) : c.requires.concat(other.id); changed(); render();
      }, c.requires.includes(other.id));
      prerequisite.innerHTML = SurvivorIcons.html(other.icon) + prerequisite.innerHTML;
    });
    c.effects.forEach((effect, index) => drawEffect(edit, c, effect, index));
    if (c.effects.length < 3) { const add = el('button', '＋ 加一個積木', edit); add.type = 'button'; add.addEventListener('click', () => { c.effects.push({type:'aoe',trigger:'skill',...api.PARAMS}); changed(); render(); }); }
  }
  function drawEffect(parent, card, effect, index) {
    const box = el('fieldset', undefined, parent); const legend = el('legend', '積木 ' + (index + 1), box); legend.innerHTML = SurvivorIcons.html(effect.type) + legend.innerHTML;
    if (globalThis.SurvivorPreview) button(box,'看這個積木的效果',()=>{ previewOpen=true;render();const host=previewPane.querySelector('.skill-preview-host'); SurvivorPreview.mount(host,draft,{kind:'effect',id:card.id,index}); });
    const holder = { recipe: effect.feature ? 'recipe:' + effect.feature : effect.type };
    const recipes = Object.fromEntries(api.defaults().cards.map(c => ['recipe:' + c.id, '原本組合：' + c.name]));
    select(box, '選擇效果', holder, 'recipe', { ...api.TYPES, ...recipes }, () => {
      if (holder.recipe.startsWith('recipe:')) { const base = api.defaults().cards.find(c => c.id === holder.recipe.slice(7)); card.effects[index] = api.copy(base.effects[0]); }
      else card.effects[index] = { type: holder.recipe, trigger: card.slot === 'dash' ? 'dash' : card.slot === 'skill' ? 'skill' : card.slot === 'passive' ? 'interval' : 'hit', ...api.PARAMS };
      changed(); render();
    });
    if (effect.feature) { el('p', '使用這張原本卡片的效果組合；數值可到「規則」調整。最多合計 5 級的效果。', box); range(box, effect, 'power'); }
    else {
      if(effect.trigger==='combo') {if(effect.comboStep===undefined)effect.comboStep=3;range(box,effect,'comboStep',[1,10,1],'第幾下');}
      select(box, '什麼時候發動？', effect, 'trigger', {combo:'第 N 下攻擊時',hit:'武器命中時',skill:'按技能時',dash:'按衝刺時',interval:'每隔一段時間'});
      el('p', '「間隔秒數」也是這個積木再次發動前的休息時間。傷害隨卡片等級增加。', box);
      const fields = grid(box), keys = { projectile:['damage','speed','count','spread','interval'], aoe:['damage','radius','interval'], chain:['damage','radius','count','interval'], 'dash-trail':['damage','radius','duration','interval'], slow:['radius','duration','multiplier','interval'], stun:['radius','duration','interval'], knockback:['radius','distance','interval'], summon:['damage','radius','duration','speed','count','interval'], 'ring-with-gap':['damage','radius','gap','interval'] };
      keys[effect.type].forEach(key => range(fields, effect, key, key === 'distance' && effect.type === 'knockback' ? [-300,300,5] : undefined));
      if (effect.type === 'knockback') el('p', '距離正數推開，負數拉近。', box);
      if (effect.type === 'dash-trail') el('p', '按衝刺時會在沿路留下範圍痕跡。', box);
      if (effect.type === 'summon') el('p', '小幫手留在召喚位置，暫時自動發射水球。', box);
    }
    if (card.effects.length > 1) { const remove = el('button', '移除這個積木', box); remove.type = 'button'; remove.addEventListener('click', () => { card.effects.splice(index,1); changed(); render(); }); }
  }
  function monsterPicker(parent, enemy) {
    const picker = el('details', undefined, parent); picker.className = 'maker-choice';
    el('summary', '怪物造型：' + SurvivorMonsters.labels[enemy.spriteId], picker);
    el('p', '只換造型，招式另外設定。', picker);
    const choices = grid(picker);
    SurvivorMonsters.ids.forEach(id => {
      const option = button(choices, '', () => { enemy.spriteId = id; changed(); render(); }, enemy.spriteId === id);
      option.setAttribute('aria-label', SurvivorMonsters.labels[id]);
      const image = el('canvas', undefined, option); image.width = image.height = 48;
      image.setAttribute('aria-hidden', 'true');
      const g = image.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(SurvivorMonsters.picture(id), 0, 0, 48, 48);
      el('span', SurvivorMonsters.labels[id], option);
    });
  }
  function drawEncounters(key, title) {
    const p = panel(title), cfg = draft[key]; p.className += ' maker-encounters';
    const toggle = (parent, label, value, action) => {
      const row = el('div',undefined,parent); row.className='encounter-toggle';
      el('span',label,row);
      const b = button(row,'',action); b.innerHTML=SurvivorIcons.html(value ? 'confirm' : 'pause');
      b.setAttribute('aria-label',label + (value ? '：開' : '：關')); b.title=label;
      b.setAttribute('role','switch'); b.setAttribute('aria-checked',String(value));
    };
    toggle(p,'啟用'+title,cfg.enabled,()=>{cfg.enabled=!cfg.enabled;changed();render();});
    if (key==='elites') {
      for (const [id,name] of Object.entries(api.ELITE_ABILITIES)) toggle(p,name,cfg.abilities.includes(id),()=>{
        if (cfg.abilities.includes(id) && cfg.abilities.length===1) { message('至少保留一種能力；可用總開關停用精英。'); return; }
        cfg.abilities=cfg.abilities.includes(id)?cfg.abilities.filter(a=>a!==id):cfg.abilities.concat(id); changed();render();
      });
      el('p','每隔一段時間抽一次精英。分裂的三隻小怪也從畫面外進場。擊敗精英立即得到經驗獎勵。',p);
    } else {
      text(p,'小頭目名稱',cfg,'name');
      el('p','每關出現一次；時間比例乘上老師出場秒數。打破糖衣後才能傷害本體；擊敗後依序選兩張不同的升級卡。',p);
    }
    const names={interval:'精英抽選間隔秒數',chance:'每次抽選出現機率',limit:'同時精英上限',sizeScale:'精英身體倍率',healthScale:'精英血量倍率',rewardXp:'擊敗精英獎勵經驗',shieldHits:'糖霜擋住幾下',auraRadius:'加速光環範圍',auraSpeed:'光環速度倍率',syrupInterval:'留下糖漿間隔秒數',syrupSeconds:'糖漿持續秒數',syrupRadius:'糖漿範圍',syrupSlow:'糖漿內剩餘速度',teleportInterval:'傳送休息秒數',teleportWarning:'傳送預警秒數',teleportDistance:'傳送落點離主角距離',stageFraction:'每關出場時間比例',hp:'本體血量',armor:'糖衣盔甲血量',radius:'身體大小',speed:'移動速度',damage:'碰撞傷害',slamInterval:'重擊休息秒數',slamWarning:'重擊預警秒數',slamRadius:'重擊範圍',slamDamage:'重擊傷害'};
    const fields=grid(p);
    for (const [field,bounds] of Object.entries(api.ENCOUNTER_BOUNDS[key])) range(fields,cfg,field,bounds,names[field],true);
  }

  function drawBodyRules() {
    const body=grid(panel('怪物身體碰撞'));
    const toggle=(parent,label,obj,key)=>{const b=button(parent,label+'：'+(obj[key]?'開':'關'),()=>{obj[key]=!obj[key];changed();render();});b.setAttribute('role','switch');b.setAttribute('aria-checked',String(obj[key]));};
    toggle(body,'碰撞只會推開，不會受傷',draft.bodyContact,'pushOnly');
    range(body,draft.bodyContact,'damageScale',[0,1,.05],'身體傷害倍率（所有小怪，Boss 除外）');
    toggle(body,'身體柔性分離',draft.bodySeparation,'enabled');
    range(body,draft.bodySeparation,'radiusScale',[.5,1.5,.05],'身體半徑倍率');
    range(body,draft.bodySeparation,'playerForce',[0,1,.05],'主角與怪物推力');
    range(body,draft.bodySeparation,'enemyForce',[0,1,.05],'怪物之間推力');
    el('p','衝刺及衝刺保護期間可以穿過怪物；大怪會擋路。分離逐幀推開，怪群推動主角有共同上限。',body);
    const weight=grid(panel('擊退與吸引重量'));
    toggle(weight,'重量影響推拉',draft.knockback,'enabled');
    range(weight,draft.knockback,'strength',[0,5,.1],'重量影響（越大越難推動大怪）');
    range(weight,draft.knockback,'minibossMass',[1,100,1],'小頭目重量');
    range(weight,draft.knockback,'bossMass',[1,100,1],'老師重量');
    range(weight,draft.knockback,'bossMultiplier',[0,1,.05],'老師推拉倍率（0 固定不動）');
    el('p','一般怪重量 1；坦克預設 8。重量也用於身體分離；關閉重量效果會恢復原本推拉距離。',weight);
  }
  function drawPacing() {
    const pacing = grid(panel('出怪節奏'));
    select(pacing,'波次型態',draft.pacing,'pattern',{alternating:'強弱交替',steady:'穩定出怪'});
    const names = {density:'出怪密度倍率',strongScale:'強波密度倍率',weakScale:'喘息波密度倍率',cycleSeconds:'強弱交替秒數',eventCount:'每次事件怪物數',eventSeconds:'事件進場秒數',warning:'招式預警秒數',chargeSpeed:'衝撞速度',chargeSeconds:'衝撞持續秒數',fuseSeconds:'跳跳糖引信（固定兩秒）',blastRadius:'自爆半徑',blastDamage:'自爆對主角傷害',blastEnemyDamage:'自爆對怪物傷害',shieldRadius:'仙子護盾範圍',shieldSeconds:'護盾施放間隔秒數',shieldHits:'護盾擋住幾下'};
    for(const [key,bounds] of Object.entries(api.PACING_BOUNDS)) range(pacing,draft.pacing,key,bounds,names[key]);
    el('p','每關主題怪＋隨機兩種，最後混合本場怪物。45／90 秒各抽一個不同事件；先預警，再從畫面外進場。主角升到設定等級後，小熊與蒲公英仍會丟字。',pacing);
  }
  function drawStage(stage) {
    const f=grid(panel(stage.name+' 波次'));
    stage.waves.forEach(wave=>range(f,wave,'every',[.3,5,.05],wave.start+' 秒起出怪間隔'));
  }
  function drawEnemies() {
    const toggle=(parent,label,obj,key)=>{const b=button(parent,label+'：'+(obj[key]?'開':'關'),()=>{obj[key]=!obj[key];changed();render();});b.setAttribute('role','switch');b.setAttribute('aria-checked',String(obj[key]));};
    draft.enemies.filter(e=>e.id===selected.enemies).forEach(e => {
      const p = panel(e.name); const portrait = el('canvas', undefined, p); portrait.className = 'maker-portrait'; portrait.width = 128; portrait.height = 100; portrait.setAttribute('aria-label', e.name + '角色預覽'); const preview = portrait.getContext('2d'); preview.imageSmoothingEnabled = false; drawBlob(64, 50, e.radius, e.color, 0, false, e.id, preview, e.shadowSize, 0, e.spriteId); const fields = grid(p); text(fields, '怪物名稱', e, 'name'); range(fields, e, 'hp'); range(fields, e, 'speed', [0,170,5], '移動速度'); range(fields, e, 'radius', [10,35,1], '身體大小'); range(fields, e, 'damage', [0,40,1], '碰撞傷害'); range(fields,e,'mass',[1,100,1],'重量'); range(fields, e, 'shadowSize', [.3,1.8,.1], '影子寬度倍率');
      button(p,'試這隻',()=>SurvivorPractice.open(draft,editor,null,e.id));
      const live=el('details',undefined,previewPane);live.className='enemy-preview-toggle';el('summary','即時預覽（點開／收起）',live);live.open=previewOpen;
      const arena=el('div',undefined,live);arena.className='enemy-live-preview';
      live.addEventListener('toggle',()=>{if(live.open && previewPane.contains(live))SurvivorPractice.mount(arena,draft,e.id);else SurvivorPractice.unmount(arena);});
      monsterPicker(fields, e);
      select(fields, '移動方式', e, 'behavior', api.BEHAVIORS);
      const phase=el('fieldset',undefined,p);el('legend','起手 → 生效 → 收招 → 冷卻',phase);
      toggle(phase,'使用分階段攻擊',e.phaseAttack,'enabled');
      select(phase,'預警與命中形狀',e.phaseAttack,'shape',api.PHASE_SHAPES);
      toggle(phase,'子彈向四周發射（留缺口）',e.phaseAttack,'radial');
      const phaseNames={radius:'半徑／子彈半徑／直線半寬',innerRadius:'圓環內半徑',length:'直線／子彈飛行距離',angle:'扇形角度',windup:'起手預警秒數',active:'生效秒數（子彈最長壽命）',recovery:'收招停頓秒數',cooldown:'冷卻秒數',damage:'攻擊傷害',triggerDistance:'觸發距離',speed:'子彈速度',count:'子彈數',gapDegrees:'四周子彈缺口角度'};
      for(const [key,bounds] of Object.entries(api.PHASE_BOUNDS)) range(phase,e.phaseAttack,key,bounds,phaseNames[key]);
      el('p','分階段攻擊開啟時取代下方舊攻擊。起手鎖定方向；子彈飛完才收招。紅色是危險範圍，收招時可以反擊。',phase);
      const attack = el('fieldset', undefined, p); el('legend','怪物的攻擊',attack);
      select(attack, '攻擊積木', e.attack, 'type', {none:'不攻擊',projectile:'發射國字',aoe:'預警後範圍傷害',summon:'召喚怪物'});
      const controls = grid(attack); range(controls,e.attack,'interval',[1,15,.5]); range(controls,e.attack,'level',[2,20,1],'開始攻擊等級'); range(controls,e.attack,'damage',[0,30,1]); range(controls,e.attack,'speed',[50,200,5]); range(controls,e.attack,'radius',[10,100,1]); range(controls,e.attack,'count',[1,5,1]); range(controls,e.attack,'spread',[0,.6,.05]);
    });
  }
  function drawBoss() {
    if(selected.boss==='phases') {
    const p = panel('魔王與三個階段'), fields = grid(p); text(fields,'魔王名稱',draft.boss,'name'); range(fields,draft.boss,'hp',[500,5000,100]); range(fields,draft.boss,'speed',[0,100,5]); range(fields,draft.boss,'radius',[20,50,1],'身體大小');
    draft.boss.phases.forEach((phase,i) => { const box=el('fieldset',undefined,p); el('legend','第 '+(i+1)+' 階段',box); if(i) range(box,phase,'threshold',[.05,.95,.01],'血量低於比例'); range(box,phase,'rest',[.4,8,.1],'招式休息秒數'); const holder={combo:phase.combo||''}; select(box,'範圍招式搭配的合招',holder,'combo',{'':'不合招',...Object.fromEntries(draft.boss.moves.map(m=>[m.id,m.name]))},()=>{phase.combo=holder.combo||null;changed();}); });
    } else if(selected.boss==='zone') {
    const zone = panel('老師戰安全圈'), zf = grid(zone), z = draft.bossZone;
    const toggle = button(zf, '紫霧縮圈：' + (z.enabled ? '開' : '關'), () => { z.enabled = !z.enabled; changed(); render(); });
    toggle.setAttribute('role', 'switch'); toggle.setAttribute('aria-checked', String(z.enabled));
    range(zf,z,'steps',[0,3,1],'縮圈次數（每階段一次）');
    range(zf,z,'speed',[10,160,5],'縮圈速度（每秒距離）');
    range(zf,z,'damage',[0,4,.5],'紫霧每秒扣血');
    el('p','每次提前 4 秒顯示下一圈。圈外速度剩 80%；最小圈直徑是 1.5 個螢幕寬。完整效果請按試玩，單招展示不縮圈。',zone);
    } else {
    moveIndex=draft.boss.moves.findIndex(m=>m.id===selected.boss);
    [draft.boss.moves[moveIndex]].forEach(m => { const box=panel(m.name), f=grid(box); if(globalThis.SurvivorPreview){const host=el('div',undefined,previewPane);host.className='skill-preview-host';SurvivorPreview.mount(host,draft,{kind:'move',id:m.id});} box.className += ' maker-move'; text(f,'招式名稱',m,'name'); select(f,'招式積木',m,'kind',api.KINDS); range(f,m,'minPhase',[1,3,1],'第幾階段開始使用'); ['warning','damage','speed','count','spread','radius','duration','pulse','gap','distance'].forEach(key=>range(f,m,key)); range(f,m,'phaseCount',[0,1,1],'每個階段是否多一個目標'); el('p','招式只使用相關參數：扇形用速度／數量／角度；範圍用大小／數量；衝撞用速度／距離；圈用大小／缺口／持續時間。老師在畫面外不出招。',box); });
    }
  }
  function drawDefaults() {
    const pp=panel('預設設定'), details=el('details',undefined,pp), p=draft.playerDefaults;
    defaultsDetails=details;details.open=defaultsOpen;details.addEventListener('toggle',()=>{defaultsOpen=details.open;});
    el('summary','調整新玩家的預設值',details);
    const pf=grid(details);
    el('p','只供沒有個人設定的新玩家使用；你自己的操作、手感、聲音請到齒輪設定調整。',pp);
    select(pf,'預設攻擊模式',p,'attackMode',{manual:'手動',auto:'自動'},()=>{p.attackModeChosen=true;changed();});
    for (const [key,label] of Object.entries({joystickFollow:'搖桿跟隨',hitFeedback:'打擊回饋',vibration:'畫面震動',sound:'音效',music:'音樂',lowEffects:'低特效（省電）'})) {
      const b=button(pf,label+'：'+(p[key]?'開':'關'),()=>{defaultsOpen=details.open;p[key]=!p[key];changed();render();});
      b.setAttribute('role','switch');b.setAttribute('aria-checked',String(p[key]));
    }
    for (const [key,bounds] of Object.entries(api.PLAYER_BOUNDS)) range(pf,p,key,bounds,api.PLAYER_LABELS[key]);
  }
  function drawWeapons() {
    const weaponNames={interval:'揮擊間隔秒',arcDegrees:'揮擊角度',radius:'揮擊距離',damageMultiplier:'水球傷害的幾倍',push:'擊退距離',spinEvery:'每幾下旋轉一圈',damageReduction:'受到傷害減少比例'};
    const attackNames={chargeStun:'蓄力暈眩秒數',splashSize:'大泡泡水花半徑倍率',splashDamage:'大泡泡水花傷害比例',comboEvery:'連段下數',comboReset:'停止攻擊幾秒重置',comboMultiplier:'最後一段傷害倍率',chargeSeconds:'站定聚氣秒數',chargeMultiplier:'蓄力傷害倍率',moveRetention:'開始移動保留聚氣比例（0 為重置）',chargeSize:'蓄力範圍倍率',comboSize:'最後一段範圍倍率',comboPush:'蓄力／重刺額外擊退',finisherRecovery:'最後一段額外收招秒',stepDistance:'重刺踏步距離',thrustWidth:'突刺半寬'};
    for(const w of draft.weapons.filter(w=>w.id===selected.weapons)) {
      const fields=grid(panel(w.name+'連段與聚氣'));
      select(fields,'攻擊方向',w,'direction',{nearest:'朝最近的敵人',facing:'朝移動面向'});
      if(w.kind==='melee') for(const [key,label] of [['baseShape','普通招式'],['comboShape','最後一段招式'],['chargeShape','蓄力招式']]) select(fields,label,w,key,key==='comboShape'?{sector:'前方扇形',line:'前方直線',spin:'旋轉一圈'}:{sector:'前方扇形',line:'前方直線'});
      if(w.kind==='melee') for(const [key,bounds] of Object.entries(api.WEAPON_BOUNDS)) if(key!=='spinEvery') range(fields,w,key,bounds,weaponNames[key]);
      for(const [key,bounds] of Object.entries(api.ATTACK_BOUNDS)) {
        if(w.kind!=='projectile' && ['splashSize','splashDamage'].includes(key)) continue;
        if(w.kind==='projectile' && ['comboPush','finisherRecovery','stepDistance','thrustWidth','chargeStun'].includes(key) || w.id!=='candy-sword' && ['stepDistance','thrustWidth'].includes(key)) continue;
        range(fields,w,key,bounds,attackNames[key]);
      }
      for(const [key,label] of [['comboEnabled','連段'],['chargeEnabled','自動聚氣'],['dashThrust','衝刺突刺']]) {
        if(key==='dashThrust' && w.id!=='candy-sword') continue;
        const toggle=button(fields,label+'：'+(w[key]?'開':'關'),()=>{w[key]=!w[key];changed();render();});
        toggle.setAttribute('role','switch');toggle.setAttribute('aria-checked',String(w[key]));
      }
    }
  }
  function drawNumbers() {
    const defaults=api.defaults();
    if(selected.rules==='neutral') {
    const nf=grid(panel('中立道具數值'));
    const names={wavePush:"浪花額外擊退距離",waveDamage:"浪花互撞傷害",waveCooldown:"浪花每隻冷卻秒", "itemsPerRun": "每場道具卡池張數", "bombChance": "炸彈掉落機率", "bombDelay": "炸彈等待秒", "bombRadius": "炸彈半徑", "bombDamage": "炸彈傷害", "birdRadius": "小鳥繞行半徑", "birdReach": "小鳥啄擊距離", "birdSeconds": "小鳥攻擊間隔秒", "birdDamage": "小鳥傷害", "bankEvery": "金庫每幾顆球成長", "bankStep": "金庫每次傷害加成", "bankCap": "金庫傷害加成上限", "splitDamage": "分裂傷害倍率", "splitAngle": "分裂角度", "magnetMultiplier": "磁鐵拾取倍率", "crownDamage": "王冠傷害加成", "crownHealth": "王冠減少最大血量", "luckyRareMultiplier": "幸運草稀有權重倍率", "cookieKills": "餅乾回血所需擊倒數"};
    for(const [key,bounds] of Object.entries(api.NEUTRAL_BOUNDS)) range(nf,draft.neutralRules,key,bounds,names[key]);
    }
    if(selected.rules==='schoolRules') {
    const schoolPanel=panel('流派數值'), schoolFields=grid(schoolPanel);
    for (const [key,bounds] of Object.entries(api.SCHOOL_BOUNDS)) range(schoolFields,draft.schoolRules,key,bounds,SCHOOL_NAMES[key]);
    }
    for(const [key,title] of [['tuning','基本玩法'],['build','流派共用數值'],['bossTuning','魔王共用數值']]) {
      if(selected.rules!==key) continue;
      const p=panel(title), fields=grid(p);
      for(const [field,value] of Object.entries(draft[key])) {
        if(typeof value!=='number') continue;
        if(key==='bossTuning' && !['phasePause','hazardLimit','shakeSeconds','shakePixels'].includes(field)) continue;
        if(key==='tuning' && ['enemySpeed','enemyRadius','enemyDamage','enemyHealth','secondEnemySpeed','secondEnemyDamage','enemyShootLevel','enemyShotInterval','secondEnemyShotInterval','enemyShotSpeed','enemyShotDamage','secondEnemyHealth','teacherHealth','teacherShotDamage','teacherShotCount','teacherShotSpread'].includes(field)) continue;
        const integer=['maxUpgradeLevel','enemyLimit','enemyShotLimit','teacherShotCount','teacherShotLimit','projectileLimit','gemLimit','xpToLevel','xpGrowthPerLevel','enemyShootLevel','fieldLimit','hazardLimit'].includes(field);
        let min=integer?1:value===0?0:Math.min(.01,defaults[key][field]), max=integer?defaults[key][field]:Math.max(5,defaults[key][field]*3), step=integer?1:defaults[key][field]>=5?1:.01;
        if(field==='slowMultiplier') {min=.2;max=1;step=.05;} if(field==='supportChance') {min=0;max=1;step=.05;}
        range(fields,draft[key],field,api.TUNING_BOUNDS[field] || [min,max,step],NUMBER_NAMES[field]);
      }
    }
  }
  const SCHOOL_NAMES = {
    schoolsPerRun:'每場流派數',cardsPerSchool:'每流派一般卡池張數',transformCards:'變身所需不同卡數',ultimateCards:'終極所需不同卡數',fusionCards:'合體各流派卡數',legendaryChance:'傳說額外抽選權重',rareWeight:'稀有抽選權重',ownedWeight:'每張同流派卡增加權重',starterWeight:'起始流派額外權重',bigDropEvery:'每幾發出大水滴',bigDropSize:'大水滴大小倍率',bigDropDamage:'大水滴傷害倍率',bigDropPush:'大水滴擊退距離',fountainSeconds:'噴泉間隔秒',fountainRadius:'噴泉範圍',fountainPush:'噴泉擊退距離',wetSeconds:'濕潤秒數',wetDamage:'濕答答額外傷害比例',rainSeconds:'下雨間隔秒',rainDuration:'下雨持續秒',windBladeDamage:'風刃傷害比例',windBladeRange:'風刃飛行距離',gustSeconds:'吹飛間隔秒',gustRadius:'吹飛範圍',gustPush:'吹飛距離',refundCharge:'順風回充格數',lightSpeed:'輕飄飄移速比例',lightMagnet:'輕飄飄拾取加成',eyeWait:'風牆站定等待秒',eyeRadius:'風牆範圍',eyePush:'風牆每秒推力',chargeKills:'蓄電擊倒數',chargeDamage:'大閃電傷害倍率',rodSeconds:'避雷針間隔秒',rodDuration:'避雷針持續秒',rodRadius:'避雷針範圍',rodDamage:'避雷針傷害',rodTick:'避雷針攻擊間隔秒',thunderStepStun:'雷步暈眩秒',staticSeconds:'靜電間隔秒',staticDamage:'靜電傷害',superconductorJumps:'超導體多跳數',waterFormSize:'水變身水球大小加成',windFormCharges:'風變身衝刺格數',thunderFormRange:'雷變身連鎖範圍加成'
  };
  const NUMBER_NAMES = {
    levelupRerolls:'每場升級重抽次數', splashDamageBase:'水花基本傷害比例', splashDamageGrowth:'水花每級傷害加成', chainGrowth:'跳電每級傷害加成', fieldRadiusGrowth:'痕跡每級範圍加成', supportSplashDamage:'支援水花傷害比例', healIntervalMultiplier:'補血每級間隔倍率', shieldHealthDivisor:'護盾增血除數', maxUpgradeLevel:'卡片等級上限', splashBaseRadius:'水花基本範圍', splashPerLevel:'每級水花範圍', invincibleSeconds:'受傷後保護秒數', waterSizePerLevel:'每級水球大小加成', damagePerLevel:'每級水球傷害加成', fireRateReduction:'每級連發間隔減少比例', extraShotAngle:'多重水球間隔角度', moveSpeedPerLevel:'每級移速加成', magnetPerLevel:'每級磁鐵加成', playerSpeed:'主角速度', playerHealth:'主角血量', enemyLimit:'怪物數量上限', enemySpeed:'甲本預設移速', enemyRadius:'甲本預設大小', enemyDamage:'甲本預設碰撞傷害', enemyHealth:'甲本預設血量', secondEnemySpeed:'乙本預設移速', secondEnemyDamage:'乙本預設碰撞傷害', enemyShootLevel:'預設開始丟字等級', enemyShotInterval:'甲本預設丟字間隔', secondEnemyShotInterval:'乙本預設丟字間隔', enemyShotSpeed:'預設國字速度', enemyShotDamage:'預設國字傷害', enemyShotGap:'怪物共同丟字間隔', enemyShotLimit:'怪物國字上限', enemySpeedGrowth:'每半分鐘怪物加速比例', secondEnemyHealth:'乙本預設血量', waveSeconds:'魔王出場秒數', teacherHealth:'魔王預設血量', teacherShotDamage:'魔王預設國字傷害', teacherShotCount:'魔王預設國字數量', teacherShotSpread:'魔王預設國字角度', teacherShotLimit:'魔王國字上限', shotInterval:'自動水球間隔', projectileDamage:'基本水球傷害', projectileSpeed:'基本水球速度', projectileLimit:'水球數量上限', gemLimit:'寶石數量上限', gemPullRadius:'寶石吸取範圍', xpToLevel:'初次升級需求', xpGrowthPerLevel:'每級增加需求', dashCharges:'衝刺格數',dashInvincible:'衝刺無敵秒數',perfectWindow:'完美閃避時間窗',perfectHeal:'完美閃避回血量',perfectShield:'完美閃避保護秒數',perfectSlowSeconds:'慢動作持續秒數',perfectSlowScale:'慢動作速度倍率',dashAttackSeconds:'衝刺強化有效秒數',dashAttackDamage:'衝刺水球傷害倍率',dashAttackSize:'衝刺水球大小倍率',dashCooldown:'每格衝刺恢復秒數', dashSeconds:'衝刺持續秒數', dashMultiplier:'衝刺速度倍率', bombCooldown:'泡泡炸彈休息秒數', bombDelay:'泡泡延遲秒數', bombDamage:'泡泡傷害', bombRadius:'泡泡範圍', bombKnockback:'泡泡擊退距離', actionButtonSize:'動作按鈕大小', autoHealSeconds:'自動補血秒數', ultimateSeconds:'海嘯間隔', cloudSeconds:'雷雲間隔', ultimateDamage:'終極傷害', ultimateGrowth:'終極每級加成', tornadoRadius:'龍捲風環繞範圍', tornadoSpeed:'龍捲風旋轉速度', tornadoTick:'龍捲風傷害間隔', attackRadius:'主角攻擊最遠距離', shotRange:'水球飛行距離', windSpeed:'風入門每級速度加成', movingRate:'疾行每級攻速加成', stunSeconds:'電泡泡暈眩秒數', counterRadius:'反擊範圍', counterDamage:'反擊傷害', supportChance:'支援卡出現機率', slowSeconds:'水窪緩速秒數', slowMultiplier:'緩速剩餘速度', pushDistance:'旋風擊退距離', pullDistance:'風技能拉近距離', chainRadius:'跳電範圍', chainDamage:'跳電傷害比例', fieldSeconds:'痕跡持續秒數', fieldRadius:'痕跡範圍', fieldInterval:'痕跡傷害間隔', fieldDamage:'痕跡傷害', fieldLimit:'痕跡上限', trailSpacing:'痕跡間距', skillRadiusMultiplier:'流派技能範圍倍率', skillDamageMultiplier:'流派技能傷害倍率', warningSeconds:'預設預警秒數', phasePause:'轉階段休息秒數', damage:'魔王預設傷害', chalkSpeed:'預設粉筆速度', dashSpeed:'預設衝撞速度', dashDistance:'預設衝撞距離', rainRadius:'預設考卷範圍', callRadius:'預設點名範圍', ringRadius:'預設圈大小', ringGap:'預設圈缺口', ringSeconds:'預設圈持續秒數', hazardLimit:'預警招式上限', shakeSeconds:'震動秒數', shakePixels:'震動畫素'
  };
  // 外殼只選擇要編輯的資料；不改作品格式或戰鬥規則。
  function items() {
    if(tab==='weapons') return draft.weapons.map(w=>({id:w.id,name:w.name,icon:w.icon,draw:drawWeapons,practice:w.id}));
    if(tab==='cards') return [{id:'schools',name:'流派名稱',icon:'water',draw:drawSchools},...draft.cards.map((c,i)=>({id:c.id,name:c.name,icon:c.icon,note:(c.school?draft.build[c.school].name:'支援')+' · '+(c.requires.length?'↳ '+c.requires.map(id=>draft.cards.find(x=>x.id===id).name).join(' ＋ '):'起點'),draw:()=>{cardIndex=i;drawCards();},spec:{kind:'card',id:c.id}}))];
    if(tab==='enemies') return draft.enemies.map(e=>({id:e.id,name:e.name,icon:'monster',draw:drawEnemies,practice:e.id}));
    if(tab==='boss') return [{id:'phases',name:'魔王階段',icon:'boss',draw:drawBoss},{id:'zone',name:'安全圈',icon:'ring',draw:drawBoss},...draft.boss.moves.map(m=>({id:m.id,name:m.name,icon:m.kind,draw:drawBoss,spec:{kind:'move',id:m.id}}))];
    if(tab==='stages') return [{id:'pacing',name:'出怪節奏',icon:'monster',draw:drawPacing},...draft.stages.map(stage=>({id:stage.id,name:stage.name,icon:'play',draw:()=>drawStage(stage)})),{id:'elites',name:'精英怪',icon:'monster',draw:()=>drawEncounters('elites','精英怪')},{id:'chocobear',name:'巧克力大熊',icon:'boss',draw:()=>drawEncounters('chocobear','巧克力大熊')}];
    return [{id:'defaults',name:'預設設定',draw:drawDefaults},{id:'body',name:'碰撞與重量',draw:drawBodyRules},{id:'neutral',name:'中立道具',draw:drawNumbers},{id:'schoolRules',name:'流派數值',draw:drawNumbers},{id:'tuning',name:'基本玩法',draw:drawNumbers},{id:'build',name:'流派共用',draw:drawNumbers},{id:'bossTuning',name:'魔王共用',draw:drawNumbers}].map(x=>({icon:'numbers',...x}));
  }
  function trial(item) {
    if(!api.validate(draft).valid) {message('請先修正作品中的錯誤再試玩。',true);return;}
    if(item.practice && globalThis.SurvivorPractice) {SurvivorPractice.open(draft,editor,null,item.practice);return;}
    if(item.spec && globalThis.SurvivorPreview) {
      SurvivorPreview.stop();
      const dock=el('section',undefined,document.getElementById('makerPanel'));dock.className='maker-trial';
      button(dock,'返回編輯',()=>{SurvivorPreview.stop();dock.remove();render();});
      const host=el('div',undefined,dock);host.className='skill-preview-host';SurvivorPreview.mount(host,draft,item.spec);return;
    }
    if(save()) location.href='?maker=1&play=1';
  }
  function render() {
    if (globalThis.SurvivorPreview) SurvivorPreview.stop();
    if (globalThis.SurvivorPractice) SurvivorPractice.close();
    if(defaultsDetails) {defaultsOpen=defaultsDetails.open;defaultsDetails=null;}
    const scroll = content ? content.scrollTop : 0; editor.textContent = '';
    document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tab === tab)));
    const entries=items();
    const current=entries.find(x=>x.id===selected[tab])||entries[0];selected[tab]=current.id;
    const list=el('nav',undefined,editor);list.className='maker-items';list.setAttribute('aria-label','選擇編輯項目');
    for(const item of entries) {
      const tile=button(list,item.name,()=>{selected[tab]=item.id;render();content.scrollTop=0;},item.id===current.id);
      tile.dataset.item=item.id;tile.title=item.name;tile.setAttribute('aria-label',item.name);
      tile.innerHTML=SurvivorIcons.html(item.icon)+tile.innerHTML;
      if(item.note) el('small',item.note,tile);
    }
    content=el('div',undefined,editor);content.className='maker-content';
    const heading=el('div',undefined,content);heading.className='maker-item-heading';
    el('strong',current.name,heading);button(heading,'試玩',()=>trial(current));
    const toggle=button(heading,previewOpen?'收起預覽':'預覽',()=>{previewOpen=!previewOpen;render();});toggle.setAttribute('aria-expanded',String(previewOpen));
    previewPane=el('aside',undefined,editor);previewPane.className='maker-preview';previewPane.hidden=!previewOpen;editor.dataset.preview=previewOpen?'open':'closed';
    el('h3','預覽',previewPane);
    current.draw();content.scrollTop=scroll;
    if(previewOpen && current.practice && tab==='weapons' && globalThis.SurvivorPractice) {const host=el('div',undefined,previewPane);host.className='enemy-live-preview';SurvivorPractice.mount(host,draft,current.practice);}
    if(!current.spec && !current.practice) el('p','按「試玩」到遊戲裡看看這個設定的效果。',previewPane);
  }
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    tab = button.dataset.tab; render();content.scrollTop=0;
  }));
  function save() { const result=api.save(draft); if(result.valid){dirty=false;message('作品已儲存在這台裝置！');}else message(result.errors.join('；'),true);return result.valid; }
  document.getElementById('save').addEventListener('click',save);
  document.getElementById('play').addEventListener('click',()=>{if(save()) location.href='?maker=1&play=1';});
  document.getElementById('reset').addEventListener('click',()=>{draft=api.defaults();if(globalThis.SurvivorPractice) SurvivorPractice.refresh(draft);if(save()){render();message('已恢復預設作品。');}});
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  const room = document.getElementById('makerPanel');
  function openMaker(result) {
    render(); state.keys.clear(); state.pointerId = null; state.joy = null; state.mode = 'maker'; updateActionControls();
    room.hidden = false; document.getElementById('overlay').classList.add('hidden');
    message(result || '挑一項開始設計吧！'); document.getElementById('play').focus();
  }
  window.openSurvivorMaker = openMaker;
  document.getElementById('makerLink').addEventListener('click', () => openMaker());
  document.getElementById('makerClose').addEventListener('click', () => {
    if(globalThis.SurvivorPractice) SurvivorPractice.close();
    if(globalThis.SurvivorPreview) SurvivorPreview.stop();
    if (MAKER_MODE) { if (dirty && !save()) return; location.href = './'; }
    else { if (dirty && !save()) return; room.hidden = true; showOverlay('ready'); document.getElementById('makerLink').focus(); }
  });
  render();
  if (new URLSearchParams(location.search).get('editor') === '1') openMaker();
  message(loaded.valid?'挑一項開始設計吧！':loaded.errors.join('；'),!loaded.valid);
})();
