// 玩家可讀性：魔王倒數、同怪傷害數字合併、低血量紅框。固定輸入 → 預期輸出。
const assert=require('node:assert/strict');
const run=require('./maker-support.cjs')();
// 同一隻怪 0.3 秒內兩次受傷 → 只有一個數字，顯示總和；另一隻怪各自顯示。
run(`state.effects.length=0;globalThis.a={x:100,y:100,r:10};globalThis.b={x:300,y:100,r:10};
damageNumber(a,12);damageNumber(a,30.4);damageNumber(b,5);`);
assert.deepEqual(JSON.parse(run('JSON.stringify(state.effects.filter(e=>e.kind==="number").map(e=>e.text))')),['42','5']);
// 超過 0.3 秒後再受傷 → 新的數字。
run('state.effects[0].life-=.31;damageNumber(a,7)');
assert.equal(run('state.effects.filter(e=>e.kind==="number"&&e.owner===a).length'),2);
// 魔王、試煉王、大熊、精英每一擊各自顯示（弱點大傷害要看得到）。
for(const flag of ['trialActor','miniboss','elite']){run(`state.effects.length=0;globalThis.c={x:5,y:5,r:10,${flag}:true};damageNumber(c,20);damageNumber(c,300)`);assert.deepEqual(JSON.parse(run('JSON.stringify(state.effects.map(e=>e.text))')),['20','300']);}
run('state.effects.length=0;globalThis.prevBoss=state.boss;state.boss=globalThis.c={x:5,y:5,r:10};damageNumber(c,20);damageNumber(c,300);state.boss=prevBoss');assert.equal(run('state.effects.length'),2);
// 回收後的特效不會留著舊主人，不會被誤合併。
run('const old=state.effects.splice(0,1)[0];state.effectPool.push(old);globalThis.spark=takeFromPool(state.effectPool,{kind:"spark",x:0,y:0})');
assert.equal(run('spark.owner===undefined&&spark.total===undefined'),true);
// 低血量：30% 以下加 low-health，回到 30% 以上移除。
run(`globalThis.shellClasses=new Set();document.querySelector=sel=>sel==='.game-shell'?{classList:{add:c=>shellClasses.add(c),remove:c=>shellClasses.delete(c)}}:({children:[],style:{},dataset:{},classList:{add(){},remove(){}}});`);
run('state.player.health=maxPlayerHealth()*.2;updateHud()');assert.equal(run('shellClasses.has("low-health")'),true);
run('state.player.health=maxPlayerHealth()*.5;updateHud()');assert.equal(run('shellClasses.has("low-health")'),false);
run('state.player.health=0;updateHud()');assert.equal(run('shellClasses.has("low-health")'),false);
console.log('PASS: merged per-target damage numbers within .3s for ordinary enemies only (boss/trial/bear/elite stay separate), pooled effects drop owner, low-health border at <30% only');
// 魔王倒數：一般局出場前顯示「魔王 N 秒後來」，魔王在場時不顯示。
run('startGame();state.mode="playing";state.stageElapsed=10;statusEl.children.length=0;delete statusEl.dataset.key;tick(.016)');
const eta=run('statusEl.children.map(c=>c.textContent).join()');
assert.match(eta,new RegExp('^魔王 '+Math.ceil(run('SurvivorWaves.bossTime()')-10-0.016)+' 秒後來$'));
// 暫停／選卡在同秒覆寫文字；第一個正常 tick 必須恢復秒數與倒數。
const statusKey=run('statusEl.dataset.key');
for(const label of ['已暫停','選一張升級卡']){
  run(`statusEl.textContent=${JSON.stringify(label)};statusEl.children.length=0;tick(.016)`);
  assert.equal(run('statusEl.dataset.key'),statusKey);
  assert.equal(run('statusEl.textContent'),run('`${Math.floor(state.elapsed)} 秒`'));
  assert.equal(run('statusEl.children.length'),1);
  assert.equal(run('statusEl.children[0].textContent'),eta);
}
const cachedEta=run('statusEl.children[0]');run('tick(.016)');
assert.equal(run('statusEl.children.length'),1);assert.equal(run('statusEl.children[0]'),cachedEta);
run('state.boss={x:0,y:0,hp:1};statusEl.children.length=0;delete statusEl.dataset.key;state.elapsed+=1;tick(.016)');
assert.equal(run('statusEl.children.length'),0);
run('statusEl.textContent="已暫停";tick(.016)');
assert.equal(run('statusEl.textContent'),run('`${Math.floor(state.elapsed)} 秒`'));
assert.equal(run('statusEl.children.length'),0);
console.log('PASS: boss countdown under the timer before the teacher arrives, hidden once the boss is present');
