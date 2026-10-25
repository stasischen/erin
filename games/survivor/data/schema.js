// 共用格式、安全界線與本機儲存。只有明列的欄位可以進入引擎；不執行輸入的程式碼。
(function (root) {
  'use strict';
  const KEY = 'erin-survivor-maker-v1';
  const copy = value => JSON.parse(JSON.stringify(value));
  const TYPES = { projectile: '發射水球', aoe: '範圍傷害', chain: '連鎖閃電', 'dash-trail': '留下痕跡', slow: '緩速', stun: '暈眩', knockback: '擊退', summon: '召喚小幫手', 'ring-with-gap': '留缺口的圈' };
  const KINDS = { words: '國字扇形', chalk: '粉筆連發', dash: '直線衝撞', rain: '多點範圍', call: '單點範圍', summon: '召喚', ring: '留缺口的圈', wall: '粉筆牆', cage: '衝刺縮圈' };
  const BOUNDS = { damage: [0, 300, 1], radius: [10, 180, 1], speed: [30, 450, 5], count: [1, 8, 1], spread: [0, 1, .05], duration: [.1, 5, .1], interval: [.4, 15, .1], multiplier: [.2, 1, .05], distance: [0, 300, 5], gap: [1.2, 3, .1], power: [1, 3, 1], warning: [.6, 3, .1], pulse: [.2, 2, .05], hp: [10, 500, 10], maxLevel: [1, 5, 1] };
  const TUNING_BOUNDS = {
    dashCharges:[1,4,1], dashInvincible:[.05,.5,.01], perfectWindow:[.05,.4,.01], perfectHeal:[0,10,1], perfectShield:[0,2,.05], perfectSlowSeconds:[0,1,.05], perfectSlowScale:[.2,1,.05], dashAttackSeconds:[.2,2,.1], dashAttackDamage:[1,3,.1], dashAttackSize:[1,2,.1], levelupRerolls:[0,9,1], playerSpeed:[80,320,5], playerHealth:[40,270,10], actionButtonSize:[72,104,4], waveSeconds:[60,300,10],
    invincibleSeconds:[.3,3,.1], dashCooldown:[1,8,.5], dashSeconds:[.1,.4,.05], dashMultiplier:[2,5,.5],
    bombCooldown:[2,15,1], bombDelay:[.2,1.5,.1], bombDamage:[20,300,10], bombRadius:[50,180,5], bombKnockback:[10,100,5],
    shotInterval:[.25,1.5,.05], projectileSpeed:[150,600,10], projectileDamage:[10,100,5], autoHealSeconds:[2,30,1],
    fireRateReduction:[0,.18,.01], enemyShotGap:[.4,3,.05], enemySpeedGrowth:[0,.2,.01],
    slowMultiplier:[.2,1,.05], supportChance:[0,1,.05], shieldHealthDivisor:[2,10,1], healIntervalMultiplier:[.5,1,.05],
    fieldInterval:[.2,3,.1], trailSpacing:[12,60,1], fieldSeconds:[.2,5,.1], fieldRadius:[10,100,1],
    ultimateSeconds:[2,30,1], cloudSeconds:[.5,10,.5], tornadoTick:[.2,3,.1], attackRadius:[80,900,10], shotRange:[80,900,10],
    warningSeconds:[.6,3,.1], phasePause:[.6,3,.1], shakeSeconds:[0,.4,.01], shakePixels:[0,6,1]
  };
  const SCHOOL_BOUNDS = {
    schoolsPerRun:[1,3,1], cardsPerSchool:[3,8,1], transformCards:[2,5,1], ultimateCards:[3,8,1], fusionCards:[1,4,1],
    legendaryChance:[0,.1,.005],rareWeight:[.1,1,.05],ownedWeight:[0,2,.05],starterWeight:[0,4,.1],
    bigDropEvery:[2,12,1],bigDropSize:[1,3,.1],bigDropDamage:[1,3,.1],bigDropPush:[0,100,1],
    fountainSeconds:[2,20,.5],fountainRadius:[40,240,1],fountainPush:[0,100,1],wetSeconds:[.5,6,.1],wetDamage:[0,.5,.01],rainSeconds:[4,30,.5],rainDuration:[1,5,.1],
    windBladeDamage:[.1,1,.05],windBladeRange:[50,300,1],gustSeconds:[3,20,.5],gustRadius:[40,240,1],gustPush:[0,100,1],refundCharge:[0,.75,.05],lightSpeed:[0,.3,.01],lightMagnet:[0,1,.05],eyeWait:[.2,3,.1],eyeRadius:[30,100,1],eyePush:[0,60,1],
    chargeKills:[3,30,1],chargeDamage:[1,4,.1],rodSeconds:[3,20,.5],rodDuration:[1,6,.1],rodRadius:[40,200,1],rodDamage:[5,80,1],rodTick:[.4,3,.1],thunderStepStun:[.1,1.5,.1],staticSeconds:[.4,4,.1],staticDamage:[5,60,1],superconductorJumps:[1,3,1],waterFormSize:[0,.5,.05],windFormCharges:[0,2,1],thunderFormRange:[0,1,.1]
  };
  const ENCOUNTER_BOUNDS = {
    elites: {interval:[5,60,1],chance:[0,1,.05],limit:[1,3,1],sizeScale:[1.1,1.5,.05],healthScale:[2,8,.5],rewardXp:[1,15,1],shieldHits:[1,6,1],auraRadius:[50,240,5],auraSpeed:[1,1.8,.05],syrupInterval:[.4,3,.1],syrupSeconds:[1,6,.5],syrupRadius:[12,50,1],syrupSlow:[.4,1,.05],teleportInterval:[4,15,.5],teleportWarning:[.8,3,.1],teleportDistance:[100,240,5]},
    chocobear: {stageFraction:[.25,.75,.05],hp:[100,1500,10],armor:[20,600,10],radius:[26,44,1],speed:[20,80,1],damage:[0,25,1],slamInterval:[2,10,.5],slamWarning:[.8,3,.1],slamRadius:[45,120,1],slamDamage:[0,30,1]}
  };
  const ELITE_ABILITIES = {shield:'糖霜護盾',split:'分裂',haste:'加速光環',syrup:'黏黏糖漿',teleport:'傳送'};
  const PARAMS = { damage: 35, radius: 80, speed: 190, count: 1, spread: .2, duration: 1, interval: 2, multiplier: .55, distance: 40, gap: 1.8 };
  function defaults() { return copy(root.SURVIVOR_DEFAULTS); }
  function validate(input) {
    const data = defaults(), errors = [];
    const fail = message => { throw new Error(message); };
    const num = (v, min, max, label, integer = false) => {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max || (integer && !Number.isInteger(v))) fail(label + ' 超出安全範圍');
      return v;
    };
    // 名稱會顯示在既有技能樹 HTML；拒絕標籤及引號，保留中文字；舊作品的圖示文字自動轉換。
    const name = (v, label, max = 60) => { v = root.SurvivorIcons.clean(v); if (typeof v !== 'string' || !v.trim() || v.length > max || /[<>&"'`]/.test(v)) fail(label + ' 請使用簡短文字，不可包含 HTML 符號'); return v.trim(); };
    const choice = (v, list, label) => { if (!list.includes(v)) fail(label + ' 選項不正確'); return v; };
    try {
      if (!input || input.schemaVersion !== 1) fail('作品版本不支援');
      if (input.visuals !== undefined) {
        if (!input.visuals || typeof input.visuals.spriteOutline !== 'boolean') fail('角色外框需要開或關');
        data.visuals.spriteOutline = input.visuals.spriteOutline;
      }
      // 舊作品沒有縮圈設定時補預設；只接受有限、溫和的數值。
      if (input.bossZone !== undefined) {
        const z = input.bossZone;
        if (!z || typeof z.enabled !== 'boolean') fail('縮圈需要開或關');
        data.bossZone = { enabled: z.enabled, steps: num(z.steps, 0, 3, '縮圈次數', true), speed: num(z.speed, 10, 160, '縮圈速度'), damage: num(z.damage, 0, 4, '紫霧每秒傷害') };
      }
      for (const key of ['elites','chocobear']) {
        // 舊作品沒有此區塊時補預設；輸入值仍逐項驗證。
        if (input[key] === undefined) continue;
        const source = input[key];
        if (!source || typeof source.enabled !== 'boolean') fail(key + ' 需要開或關');
        data[key].enabled = source.enabled;
        for (const [field, bounds] of Object.entries(ENCOUNTER_BOUNDS[key])) {
          data[key][field] = num(source[field], bounds[0], bounds[1], field, ['limit','rewardXp','shieldHits'].includes(field));
        }
        if (key === 'chocobear') data[key].name = name(source.name, '小頭目名稱', 24);
        else {
          if (!Array.isArray(source.abilities) || !source.abilities.length || source.abilities.length > 5 || new Set(source.abilities).size !== source.abilities.length) fail('精英需要 1～5 種不同能力');
          data[key].abilities = source.abilities.map(id => choice(id, Object.keys(ELITE_ABILITIES), '精英能力'));
        }
      }
      for (const key of ['tuning', 'build', 'bossTuning']) {
        if (!input[key] || typeof input[key] !== 'object') fail('缺少 ' + key);
        for (const field of Object.keys(data[key])) {
          const base = data[key][field], value = ['levelupRerolls','dashCharges','dashInvincible','perfectWindow','perfectHeal','perfectShield','perfectSlowSeconds','perfectSlowScale','dashAttackSeconds','dashAttackDamage','dashAttackSize'].includes(field) && input[key][field] === undefined ? base : input[key][field];
          if (typeof base === 'number') {
            const bounds = TUNING_BOUNDS[field] || [base === 0 ? 0 : Math.min(.01, base), Math.max(5, base * 3)];
            data[key][field] = num(value, bounds[0], bounds[1], field, ["levelupRerolls","dashCharges"].includes(field));
          }
          else if (Array.isArray(base)) data[key][field] = base.map((n, i) => num(value && value[i], .4, 10, field));
          else {
            data[key][field].name = name(value && value.name, '流派名稱', 24);
            if (!/^#[0-9a-f]{6}$/i.test(value.color)) fail('流派顏色不正確');
            data[key][field].color = value.color;
          }
        }
      }
      // 新數值缺省補齊；舊作品保留既有卡片／積木，新增卡以 id 補入。
      if (input.schoolRules !== undefined) {
        for (const [field, base] of Object.entries(data.schoolRules)) {
          const bounds = SCHOOL_BOUNDS[field];
          data.schoolRules[field] = num(input.schoolRules[field], bounds[0], bounds[1], field, bounds[2] === 1);
        }
      }
      if (input.schools !== undefined && JSON.stringify(input.schools) !== JSON.stringify(data.schools)) fail('流派登錄表請由資料檔擴充');
      // 物件數量上限固定，避免作品讓裝置卡住；整數欄位不得帶小數。
      for (const field of ['maxUpgradeLevel','enemyLimit','enemyShotLimit','teacherShotCount','teacherShotLimit','projectileLimit','gemLimit','xpToLevel','xpGrowthPerLevel','enemyShootLevel']) data.tuning[field] = num(input.tuning[field], 1, root.SURVIVOR_DEFAULTS.tuning[field], field, true);
      data.build.fieldLimit = num(input.build.fieldLimit, 1, 18, '痕跡上限', true);
      data.bossTuning.hazardLimit = num(input.bossTuning.hazardLimit, 1, 8, '預警上限', true);
      data.build.slowMultiplier = num(input.build.slowMultiplier, .2, 1, '緩速倍率');
      data.build.supportChance = num(input.build.supportChance, 0, 1, '支援卡機率');
      if (!Array.isArray(input.cards) || input.cards.length > data.cards.length || new Set(input.cards.map(c => c.id)).size !== input.cards.length || input.cards.some(c => !data.cards.some(base => base.id === c.id)) || data.cards.slice(0,24).some(c => !input.cards.some(old => old.id === c.id))) fail('卡片數量不正確');
      const savedCards = input.cards;
      input = { ...input, cards: data.cards.map(base => savedCards.find(c => c.id === base.id) || base) };
      const features = new Map(data.cards.map(card => [card.id, card.effects[0].type]));
      data.cards = data.cards.map((base, i) => {
        const c = input.cards[i];
        if (!c || c.id !== base.id) fail('卡片識別碼不正確');
        const result = { ...base, name: name(c.name, '卡片名稱', 24), description: name(c.description, '卡片說明', 120), icon: root.SurvivorIcons.normalize(c.icon, base.icon), maxLevel: num(c.maxLevel, 1, 5, '最高等級', true), slot: choice(c.slot, ['attack','skill','dash','passive'], '欄位') };
        result.school = c.school ? choice(c.school, data.schools.map(s => s.id), '流派') : undefined;
        result.rarity = c.rarity === undefined ? base.rarity : choice(c.rarity, ['common','rare','legendary'], '品質');
        result.tier = c.tier ? choice(c.tier, ['entry','advanced-a','advanced-b','fusion','ultimate'], '階段') : undefined;
        if (!Array.isArray(c.requires) || c.requires.length > 6 || new Set(c.requires).size !== c.requires.length) fail('前置條件不正確');
        result.requires = (c.school && c.rarity === undefined ? [] : c.requires).map(id => { if (id === c.id || !features.has(id)) fail('前置卡不存在或指向自己'); return id; });
        if (!Array.isArray(c.effects) || c.effects.length < 1 || c.effects.length > 3) fail('每卡需要 1～3 個積木');
        result.effects = c.effects.map(effect => {
          if (effect.feature) {
            if (!features.has(effect.feature) || features.get(effect.feature) !== effect.type) fail('既有組合不正確');
            return { type: effect.type, feature: effect.feature, power: num(effect.power, 1, 3, '組合強度', true) };
          }
          const e = { type: choice(effect.type, Object.keys(TYPES), '積木'), trigger: choice(effect.trigger, ['hit','skill','dash','interval'], '觸發時機') };
          for (const key of Object.keys(PARAMS)) e[key] = num(effect[key], key === 'distance' && e.type === 'knockback' ? -300 : BOUNDS[key][0], BOUNDS[key][1], key, key === 'count');
          return e;
        });
        return result;
      });
      const visiting = new Set(), visited = new Set();
      function visit(id) {
        if (visiting.has(id)) fail('前置條件不能繞成圈');
        if (visited.has(id)) return;
        visiting.add(id); data.cards.find(c => c.id === id).requires.forEach(visit); visiting.delete(id); visited.add(id);
      }
      data.cards.forEach(c => visit(c.id));
      if (!Array.isArray(input.enemies) || input.enemies.length !== data.enemies.length) fail('怪物種類數量不正確');
      data.enemies = data.enemies.map((base, i) => {
        const e = input.enemies[i]; if (!e || e.id !== base.id) fail('怪物識別碼不正確');
        const result = { ...base, name: name(e.name, '怪物名稱', 24), hp: num(e.hp, 10, 500, '血量'), speed: num(e.speed, 0, 170, '移速'), radius: num(e.radius, 10, 35, '大小'), damage: num(e.damage, 0, 40, '碰撞傷害'), behavior: choice(e.behavior, ['chase','still','retreat'], '移動方式') };
        // 舊作品沒有造型欄位時，依原種類補上；保留名稱、能力與數值。
        result.spriteId = e.spriteId === undefined ? base.spriteId : choice(e.spriteId, root.SurvivorMonsters.ids, '怪物造型');
        result.shadowSize = e.shadowSize === undefined ? .9 : num(e.shadowSize, .3, 1.8, '影子寬度倍率');
        const a = e.attack;
        result.attack = { type: choice(a.type, ['none','projectile','aoe','summon'], '怪物攻擊'), interval: num(a.interval, 1, 15, '攻擊間隔'), speed: num(a.speed, 50, 200, '國字速度'), damage: num(a.damage, 0, 30, '攻擊傷害'), radius: num(a.radius, 10, 100, '攻擊大小'), count: num(a.count, 1, 5, '攻擊數量', true), spread: num(a.spread, 0, .6, '散射角度'), level: num(a.level, 2, 20, '開始攻擊等級', true) };
        return result;
      });
      const b = { ...input.boss };
      data.boss.name = name(b.name, '魔王名稱', 24); data.boss.hp = num(b.hp, 500, 5000, '魔王血量'); data.boss.speed = num(b.speed, 0, 100, '魔王速度'); data.boss.radius = num(b.radius, 20, 50, '魔王大小');
      if (!Array.isArray(b.phases) || b.phases.length !== 3) fail('需要三個魔王階段');
      data.boss.phases = b.phases.map((p, i) => ({ threshold: num(p.threshold, i === 0 ? 1 : .05, i === 0 ? 1 : .95, '階段血量比例'), rest: num(p.rest, .4, 8, '招式休息'), combo: p.combo === null ? null : choice(p.combo, data.boss.moves.map(m => m.id), '合招') }));
      if (data.boss.phases.some((p, i, rows) => i && p.threshold >= rows[i - 1].threshold)) fail('魔王階段血量比例必須遞減');
      if (Array.isArray(b.moves)) b.moves = b.moves.concat(data.boss.moves.filter(m => ['chalk-wall','shrinking-ring'].includes(m.id) && !b.moves.some(old => old.id === m.id)));
      if (!Array.isArray(b.moves) || b.moves.length !== data.boss.moves.length) fail('魔王招式數量不正確');
      data.boss.moves = data.boss.moves.map((base, i) => {
        const m = b.moves[i]; if (!m || m.id !== base.id) fail('招式識別碼不正確');
        const result = { ...base, name: name(m.name, '招式名稱', 24), kind: choice(m.kind, Object.keys(KINDS), '招式積木'), minPhase: num(m.minPhase, 1, 3, '開始階段', true), phaseCount: num(m.phaseCount, 0, 1, '每階段增加數量', true) };
        for (const key of ['warning','damage','speed','count','spread','radius','duration','pulse','gap','distance']) result[key] = num(m[key], BOUNDS[key][0], BOUNDS[key][1], key, key === 'count');
        return result;
      });
      // 舊作品缺少 stages 時補上預設；關卡資料保留給之後 Maker 使用，本版不開放編輯。
      const savedStages = input.stages && input.stages.map(stage => {
        const migrated = { ...stage };
        const base = data.stages.find(row => row.id === stage.id);
        if (base) {
          base.decorationDensity = stage.decorationDensity === undefined ? base.decorationDensity : num(stage.decorationDensity, 0, 1, "裝飾密度");
          migrated.decorationDensity = base.decorationDensity;
        }
        if (stage.id === "classroom" && stage.name === "教室" && stage.background === "classroom") {
          migrated.name = "糖果森林"; migrated.background = "candy-forest";
        } else if (stage.id === "playground" && stage.name === "操場" && stage.background === "playground") {
          migrated.name = "餅乾森林"; migrated.background = "cookie-forest";
        }
        return migrated;
      });
      const fixedStages = rows => rows.map(({ decorationDensity, ...stage }) => stage);
      if (input.stages !== undefined && JSON.stringify(fixedStages(savedStages)) !== JSON.stringify(fixedStages(data.stages))) fail('本版尚未開放關卡編輯');
      // 波次只預留資料位置，本版不提供編輯。
      if (JSON.stringify(input.waves) !== JSON.stringify(data.waves)) fail('本版尚未開放關卡編輯');
    } catch (error) { errors.push(error.message); }
    return { valid: errors.length === 0, data: errors.length ? defaults() : data, errors };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { valid: true, data: defaults(), errors: [] };
      if (raw.length > 150000) throw new Error('作品資料太大');
      return validate(JSON.parse(raw));
    } catch (_) { return { valid: false, data: defaults(), errors: ['無法讀取作品，已使用預設'] }; }
  }
  function save(input) {
    const result = validate(input);
    if (result.valid) { try { localStorage.setItem(KEY, JSON.stringify(result.data)); } catch (_) { result.valid = false; result.errors.push('這台裝置無法儲存，請允許本機儲存後再試'); } }
    return result;
  }
  root.SurvivorData = { KEY, TYPES, KINDS, BOUNDS, TUNING_BOUNDS, SCHOOL_BOUNDS, ENCOUNTER_BOUNDS, ELITE_ABILITIES, PARAMS, defaults, validate, load, save, copy };
})(globalThis);
