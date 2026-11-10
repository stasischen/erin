// Real combat entry points: no alternative implementation of growth formulas.
const assert=require('node:assert/strict'),create=require('./maker-support.cjs');
for(const weapon of ['candy-hammer','candy-sword']) for(const level of [1,3,5]) for(const rear of [0,1]) {
 const run=create();run(`resetGame();GAME_DATA.hitJuice.enabled=false;state.mode='playing';state.weaponId='${weapon}';state.upgrades={'multi-water':${level},'item-rear':${rear}};
 globalThis.book=(x,y)=>({typeId:'jaben',x:state.player.x+x,y:state.player.y+y,r:3,hp:10000,maxHp:10000,alive:true,speed:0,damage:0,wobble:0});
 state.enemies=[book(35,0),book(-35,0),book(0,50)];globalThis.hits=[];const original=hitBuildTarget;hitBuildTarget=(target,damage,...args)=>{hits.push(state.enemies.indexOf(target));return original(target,damage,...args)};fireAtNearest({angle:0});`);
 const hits=JSON.parse(run('JSON.stringify(hits)'));
 assert.equal(new Set(hits).size,hits.length,'rear item and grown attack never double main hit');
 assert.ok(hits.includes(0));assert.equal(hits.includes(1),level>=3||!!rear);assert.equal(hits.includes(2),level===5);
}
for(const level of [1,2,3,4,5]) {
 const run=create();run(`resetGame();state.mode='playing';state.upgrades={'thunder-attack':${level},'thunder-ultimate':${level},'wind-ultimate':${level}};
 globalThis.book=(x,y)=>({typeId:'jaben',x:state.player.x+x,y:state.player.y+y,r:5,hp:10000,maxHp:10000,alive:true,speed:0,damage:0,wobble:0});
 globalThis.calls=[];const original=hitBuildTarget;hitBuildTarget=(target,damage,...args)=>{calls.push(target);return original(target,damage,...args)};
 state.enemies=[book(20,0),book(40,0),book(60,0),book(80,0)];schoolEffect('thunder',state.enemies[0],state.enemies[0].x,state.enemies[0].y,100,[state.enemies[0]]);`);
 const expected=Math.ceil(level/2);assert.equal(run('calls.length'),expected);assert.equal(run('new Set(calls).size'),expected);
 run("calls=[];state.ultimateTimer=0;updateOneUltimate(.01,'thunder')");assert.equal(run('calls.length'),expected);assert.equal(run('new Set(calls).size'),expected);
 run("calls=[];state.enemies=state.enemies.slice(0,1);state.ultimateTimer=0;updateOneUltimate(.01,'thunder')");assert.equal(run('calls.length'),1,'low population does not multiply lightning on one target');
 run("calls=[];state.enemies=ultimateOrbitPoints(cardBlock('wind-ultimate','onUltimate').actions[1]).map(p=>book(p.x-state.player.x,p.y-state.player.y));state.ultimateTimer=0;updateOneUltimate(.01,'wind')");assert.equal(run('calls.length'),expected);
 run("calls=[];BUILD_TUNING.fieldRadius=500;state.enemies=[book(0,0)];state.ultimateTimer=0;updateOneUltimate(.01,'wind')");assert.equal(run('calls.length'),1,'overlapping cyclones hit once per tick');
}
// Water multishot remains one extra projectile per level, not the melee coverage shape.
for(const level of [1,3,5]){const run=create();run(`resetGame();state.mode='playing';state.upgrades={'multi-water':${level}};state.enemies=[{x:state.player.x+80,y:state.player.y,r:8,hp:10000,alive:true}];fireAtNearest()`);assert.equal(run('state.projectiles.length'),level+1);}
// Sandbox choices and entering either player mode never write the player's saved preference.
const key='erin-survivor-player-settings-v1',saved={[key]:JSON.stringify({attackMode:'manual',attackModeChosen:true})};
const normal=create({saved});normal("startGame();setAttackMode('manual')");assert.equal(normal('GAME_DATA.attackMode'),'auto');
normal('startTrial(trialSettings().bosses[0].id);applyUpgrade(0);applyPlayerSettings()');assert.equal(normal('GAME_DATA.attackMode'),'manual');normal('startGame()');assert.equal(normal('GAME_DATA.attackMode'),'auto');assert.equal(JSON.parse(normal.storage[key]).attackMode,'manual');
const maker=create({maker:true,saved});maker("setAttackMode('auto');saveSettings();applyPlayerSettings()");assert.equal(maker('GAME_DATA.attackMode'),'auto');assert.equal(JSON.parse(maker.storage[key]).attackMode,'manual');
console.log('PASS: level 1/3/5 coverage, no double rear hit, unique chain/cloud targets, multiple orbit geometry, unchanged water spread and isolated run modes');
