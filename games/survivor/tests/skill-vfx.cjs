// 執行：node games/survivor/tests/skill-vfx.cjs；真實遊戲函式＋Canvas 指令紀錄，無外部套件。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(process.env.SURVIVOR_SOURCE || `${__dirname}/../game.js`, 'utf8');
function setup(saved = {}) {
  const elements = {}; const windowListeners = {}; const documentListeners = {};
  const drawCalls = [];
  const context2d = new Proxy({}, { get: (target, key) => key in target ? target[key] : ((...args) => drawCalls.push([key, ...args])) });
  function element() { return { style: { setProperty() {} }, dataset: {}, querySelector: () => ({ textContent: "" }), setPointerCapture() {}, hidden: false, classList: { add() {}, remove() {} }, listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }, append() {}, appendChild() {}, setAttribute() {}, getContext: () => context2d, getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 }) }; }
  const storage = { ...saved };
  const context = vm.createContext({ console, Math: Object.create(Math), Set, performance: { now: () => 0 }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, navigator: {}, window: { innerWidth: 800, innerHeight: 600, addEventListener(name, callback) { (windowListeners[name] ||= []).push(callback); } }, document: { getElementById: (id) => elements[id] || (elements[id] = element()), querySelector: () => element(), createElement: element, addEventListener() {} }, localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => storage[key] = value } });
  vm.runInContext(fs.readFileSync(`${__dirname}/../icons.js`, "utf8"), context);
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/defaults.js`, "utf8"), context);
  vm.runInContext(fs.readFileSync(`${__dirname}/../data/schema.js`, "utf8"), context);
  vm.runInContext(source, context);
  context.windowListeners = windowListeners; context.elements = elements; context.storage = storage; context.drawCalls = drawCalls;
  return (code) => vm.runInContext(code, context);
}
const run = setup();
function fresh(upgrades = {}) {
  run(`resetGame(); state.mode='playing'; settingsPanel.hidden=true; state.spawnTimer=999; state.shotTimer=999;
    state.upgrades=${JSON.stringify(upgrades)};
    globalThis.book=(x=state.player.x+40,y=state.player.y,hp=10000)=>({x,y,r:17,hp,maxHp:hp,alive:true,speed:0,damage:1,wobble:0,flash:0,shotCooldown:999});
    state.enemies=[book(),book(state.player.x+85)]; drawCalls.length=0;`);
}
function visual(kind) { return run(`state.vfx.some(v=>v.kind===${JSON.stringify(kind)})`); }
function painted(code, method) {
  run(`drawCalls.length=0; ${code}`);
  assert.ok(run(`drawCalls.some(c=>c[0]===${JSON.stringify(method)})`), `${code} paints ${method}`);
}
// 每張卡的取得回饋，包括滿卡後的回血選項；真正的遊戲選卡流程。
const ids = JSON.parse(run('JSON.stringify(UPGRADES.map(c=>c.id))'));
for (const id of ids.concat('heal')) {
  fresh();
  run(`globalThis.card=UPGRADES.find(c=>c.id===${JSON.stringify(id)}) || {id:'heal',icon:'❤️'};
    for (const requirement of card.requires || []) state.upgrades[requirement]=1;
    state.mode='levelup'; state.pendingChoices=[card]; applyUpgrade(0);`);
  assert.ok(visual('card'), `${id}: selection visual`);
}
// 水入門濺水、水窪 A、水痕 B；合體導電水窪與暴風雨有兩種元素。
fresh({'water-attack':1}); run('schoolEffect("water",state.enemies[0],state.enemies[0].x,state.enemies[0].y,35);'); assert.ok(visual('splash'));
fresh({'water-skill':1}); run('schoolEffect("water",state.enemies[0],state.enemies[0].x,state.enemies[0].y,35); updateFields(.01);');
assert.equal(run('state.fields[0].school'),'water'); assert.ok(run('state.enemies[0].slowTimer>0')); painted('drawTargetStatus(state.enemies[0]);','fill');
fresh({'water-dash':1}); run('activateDash();'); assert.equal(run('state.fields[0].school'),'water');
fresh({'fusion-puddle':1}); run('addField("water",state.enemies[0].x,state.enemies[0].y); updateFields(.01);'); assert.ok(visual('lightning')); painted('drawFields();','lineTo');
fresh({'wind-dash':1,'fusion-storm':1}); run('activateDash();'); assert.equal(run('new Set(state.fields.map(f=>f.school)).size'),2); painted('drawFields();','ellipse'); painted('drawFields();','arc');
// 風入門水球有速度線、疾行與洋蔥加速有跑動線、旋風擊退有噴氣。
fresh({'wind-attack':1}); run('fireAtNearest();'); painted('render();','lineTo'); assert.equal(run('state.projectiles[0].schools.includes("wind")'),true);
for (const id of ['wind-speed','onion-dash']) { fresh({[id]:1}); run('state.player.moving=true;'); painted('drawSupportVisuals();','lineTo'); }
fresh({'wind-dash':1}); run('addField("wind",state.enemies[0].x-10,state.enemies[0].y); updateFields(.01);'); assert.ok(visual('gust'));
// 雷入門：端點是兩隻怪的世界位置、.22 秒可見，命中點有火花。
fresh({'thunder-attack':1}); run('globalThis.first={x:state.enemies[0].x,y:state.enemies[0].y}; globalThis.second={x:state.enemies[1].x,y:state.enemies[1].y}; schoolEffect("thunder",state.enemies[0],first.x,first.y,35);');
assert.ok(visual('lightning')); assert.ok(visual('sparkle'));
assert.equal(run('state.vfx[0].x===first.x && state.vfx[0].x2===second.x && state.vfx[0].life===.22'),true);
painted('drawSkillVisuals();','lineTo');
// 電泡泡 A：爆發與暈星；B：受傷後放電，即使沒敵人仍有環狀閃電。
fresh({'thunder-skill':1}); run('activateSkill(); updateBomb(1);'); assert.ok(visual('discharge')); assert.ok(visual('lightning')); assert.ok(run('state.enemies[0].stunTimer>0')); painted('drawTargetStatus(state.enemies[0]);','strokeText');
fresh({'thunder-counter':1}); run('state.enemies=[book(state.player.x,state.player.y)]; state.player.invincible=0; tick(.01);'); assert.ok(visual('discharge'));
fresh({'thunder-counter':1}); run('state.enemies=[]; counterDischarge();'); assert.ok(visual('discharge'));
fresh({'fusion-dash':1}); run('activateDash();'); assert.equal(run('state.fields[0].school'),'thunder'); painted('drawFields();','lineTo');
// 三種終極：有獨立可畫的巨浪、倒錐風圈、雷雲和劈落閃電。
for (const school of ['water','wind','thunder']) {
  fresh({[`${school}-ultimate`]:1}); run('state.elapsed=0; state.ultimateTimer=0; updateUltimate(.01);');
  assert.equal(run('state.ultimateVisual.school'),school);
  painted('drawUltimate();',school==='water'?'fillRect':school==='wind'?'arc':'ellipse');
  if(school==='thunder') assert.ok(visual('lightning'));
  if(school==='wind') { run('globalThis.old=state.ultimateVisual.x; state.elapsed+=.05; updateUltimate(.05);'); assert.notEqual(run('state.ultimateVisual.x'),run('old')); }
}
// 通用卡：尺寸、連發、多重、穿透、水花、盾、磁鐵、回血。
fresh({'big-water':1,'multi-water':1,'rapid-water':1,'piercing-water':1}); run('fireAtNearest();');
assert.ok(run('state.projectiles.length>1 && state.projectiles[0].r>state.player.r*2/3 && state.projectiles[0].piercing'));
assert.ok(run('effectiveShotInterval()<SHOT_INTERVAL')); painted('render();','lineTo');
fresh({'splash-water':1}); run('state.projectiles=[{x:state.enemies[0].x,y:state.enemies[0].y,vx:0,vy:0,r:12,damage:35,pierce:0,hitList:[],alive:true,rangeLeft:100}]; tick(0);'); assert.ok(visual('splash'));
for (const id of ['bubble-shield','gem-magnet']) { fresh({[id]:1}); painted('drawSupportVisuals();','arc'); }
fresh({'auto-heal':1}); run('state.player.health=50; state.healTimer=100; tick(.01);'); assert.equal(run('state.effects.some(e=>e.kind==="heal")'),true);
fresh(); run('activateSkill();'); assert.ok(run('state.bomb')); run('updateBomb(1);'); assert.ok(run('state.bombBlast')); assert.ok(visual('gust'));
// 堆滿粒子也能保留閃電及傷害數字；池與活動物件有上限。
fresh(); run('burst(100,100,"#fff",200); for(let i=0;i<200;i++) lightning(100,100,200,200); damageNumber(state.enemies[0],35);');
assert.equal(run('state.effects.length'),90); assert.equal(run('state.vfx.length'),48); assert.ok(run('state.effects.some(e=>e.kind==="number")'));
run('updateSkillVisuals(1);'); assert.equal(run('state.vfx.length'),0); assert.ok(run('state.vfxPool.length<=48'));
// 位移鏡頭不改變閃電、地面或浪的世界位置；所有技能在世界 transform 裡畫。
fresh({'water-ultimate':1}); run('lightning(1200,900,1250,900); addField("water",1200,900); state.ultimateTimer=0; updateUltimate(.01); globalThis.positions=JSON.stringify([state.vfx,state.fields,state.ultimateVisual]); state.player.x+=160; updateCamera();');
assert.equal(run('JSON.stringify([state.vfx,state.fields,state.ultimateVisual])===positions'),true);
painted('render();','translate'); assert.equal(run('drawCalls.some(c=>c[0]==="translate" && c[1]===-state.cameraX && c[2]===-state.cameraY)'),true);
run('showOverlay("paused"); tick(1);'); assert.equal(run('JSON.stringify([state.vfx,state.fields,state.ultimateVisual])===positions'),true);
// 不同手機／平板尺寸下渲染不丟錯、不產生 NaN，重開清空特效。
for (const [w,h] of [[667,375],[844,390],[1024,768]]) {
  run(`state.width=${w}; state.height=${h}; state.enemies[0].slowTimer=1; state.enemies[0].stunTimer=1; render();`);
  assert.equal(run('drawCalls.every(c=>c.slice(1).every(v=>typeof v!=="number" || Number.isFinite(v)))'),true);
}
run('resetGame();'); assert.equal(run('state.vfx.length'),0); assert.equal(run('state.ultimateVisual'),null);
console.log(`PASS: all ${ids.length} cards + heal, real effect triggers, status/ground/ultimate drawing, lightning endpoints/lifetime, camera/pause/reset, bounded pools, phone/iPad canvas commands`);
