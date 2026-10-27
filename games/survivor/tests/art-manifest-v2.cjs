const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const run=require('./maker-support.cjs')(),json=code=>JSON.parse(run('JSON.stringify('+code+')'));
run("globalThis.sample='sample/player-directions';globalThis.clone=()=>JSON.parse(JSON.stringify(SurvivorArtManifest));");
assert.equal(run('SurvivorArt.validate(SurvivorArtManifest)'),true);
run('globalThis.legacy=clone();legacy.schemaVersion=1');assert.equal(run('SurvivorArt.validate(legacy)'),true);
const defaults=json("SurvivorArt.lookup('character/player')");
assert.equal(defaults.directions,1);assert.equal(defaults.scale,1);assert.equal(defaults.flipX,false);
assert.deepEqual(defaults.vfx,{fitTo:'bounds',rotateWithAim:false,zLayer:'actor',blend:'source-over',alpha:1,progressMode:'time'});
for(const [aim,count,want] of [[{x:1,y:0},4,'E'],[{x:0,y:1},4,'S'],[{x:-1,y:0},4,'W'],[{x:0,y:-1},4,'N'],[{x:-1,y:-1},8,'NW'],[{x:0,y:0},4,'S']])assert.equal(run(`SurvivorArt.direction(${JSON.stringify(aim)},${count})`),want);
assert.equal(run('SurvivorArt.direction(NaN)'),'S');
for(const [direction,row,flip] of [['S',0,false],['E',1,false],['N',2,false],['W',1,true]]) {
 const d=json(`SurvivorArt.lookup(sample,'idle',0,SurvivorArtManifest,{direction:'${direction}'})`);
 assert.equal(d.row,row);assert.equal(d.flipX,flip);assert.equal(d.frame,0);
 assert.deepEqual(run(`JSON.stringify(SurvivorArt.frameRect(SurvivorArt.lookup(sample,'idle',0,SurvivorArtManifest,{direction:'${direction}'}),198,198))`),JSON.stringify([1,1+row*66,64,64]));
}
assert.deepEqual(json("SurvivorArt.frameRect(SurvivorArt.lookup(sample,'run',0,SurvivorArtManifest,{direction:'N'}),198,198)"),[67,133,64,64]);
assert.equal(run("SurvivorArt.frameRect(SurvivorArt.lookup(sample),128,128)"),null);
// Alternate direction maps use absolute atlas indices; separate animation sheets join precache discovery.
run("globalThis.m=clone();m.assets[sample].animations.active_2={sheet:'art/samples/player-directions.png',frames:{S:[0,1],E:[3,4],N:[6,7]},frameDurations:[.1,.3],loop:true};");
assert.equal(run('SurvivorArt.validate(m)'),true);
for(const [time,frame] of [[0,3],[.099,3],[.1,4],[.399,4],[.4,3],[.5,4]])assert.equal(run(`SurvivorArt.lookup(sample,'active_2',${time},m,{direction:'W'}).frame`),frame);
assert.deepEqual(json("SurvivorArt.frameRect(SurvivorArt.lookup(sample,'active_2',.1,m,{direction:'N'}),198,198)"),[67,133,64,64]);
assert.equal(run("SurvivorArt.sheetPaths().includes('art/samples/player-directions.png')"),true);
assert.equal(run("SurvivorArtManifest.assets[sample].sheet"),null,'fixture sheet exists only on its animations');
// Logical phase progress retimes only visual frames; no supplied phase duration preserves legacy fps.
run("m.assets[sample].animations.windup={frames:[0,1,2],frameDurations:[.1,.2,.1],loop:false};");
for(const [elapsed,frame] of [[0,0],[.49,0],[.5,1],[1.49,1],[1.5,2],[2,2],[99,2]])assert.equal(run(`SurvivorArt.lookup(sample,'windup',99,m,{phaseElapsed:${elapsed},phaseDuration:2}).frame`),frame);
run("m.assets[sample].animations.windup.syncToPhase=false");assert.equal(run("SurvivorArt.lookup(sample,'windup',.1,m,{phaseElapsed:.1,phaseDuration:2}).frame"),1);
assert.deepEqual(json("SurvivorArt.phaseContext({phase:'active',left:.75},{active:2})"),{phaseDuration:2,phaseElapsed:1.25});
for(const [name,want] of [['spawn','idle'],['death','hurt'],['phase2','idle'],['dodge','run'],['stun','hurt'],['active_9','idle']])assert.equal(run(`SurvivorArt.lookup(sample,'${name}').animation`),want);
run("m.assets[sample].animations.active={frames:[2],fps:0,loop:false}");assert.equal(run("SurvivorArt.lookup(sample,'active_9',0,m).animation"),'active');
// Display resize keeps the old world anchor; collider and input data are never changed.
assert.deepEqual(json("SurvivorArt.bounds(sample,-20,-30,40,40)"),[-32,-48,64,64]);
run("SurvivorArtManifest.assets[sample].scale=1.5");assert.deepEqual(json("SurvivorArt.bounds(sample,-20,-30,40,40)"),[-48,-72,96,96]);
run("SurvivorArtManifest.assets[sample].scale=1;globalThis.before=JSON.stringify(state);SurvivorArt.lookup(sample,'windup',1,m,{phaseDuration:2});SurvivorArt.bounds(sample,1,2,40,40)");
assert.equal(run('JSON.stringify(state)===before'),true);
run("SurvivorArt.lookup(sample).palette[0]='#000000';SurvivorArt.lookup(sample).outline.width=8");assert.equal(run('SurvivorArtManifest.assets[sample].outline.width'),1);
// Whitelist malformed directions, cycles, atlas metadata, clips, paths and VFX settings.
for(const edit of ["a.directions=3","a.mirror={W:'E',E:'W'}","a.directionOrder=['S','S','N']","a.layout.spacing=-1","a.displaySize=[0,64]","a.scale=Infinity","a.animations.hurt.sheet='../private.png'","a.animations.hurt.frameDurations=[0]","a.animations.hurt.frames={S:[2],N:[8]}","delete a.animations.hurt","a.outline={color:'url(x)',width:1}","a.vfx={alpha:2}","a.vfx={blend:'copy'}","a.vfx={zLayer:'bad'}"]) {
 run('globalThis.invalid=clone();globalThis.a=invalid.assets[sample];'+edit);assert.equal(run('SurvivorArt.validate(invalid)'),false,edit);
}
// Real adapter crop/mirror/cache and per-animation sheet, without any screenshot fixture.
run("globalThis.loads=[];globalThis.Image=class{constructor(){loads.push(this)}};drawCalls.length=0");
assert.equal(run("SurvivorArt.picture(sample,'idle',0,{direction:'W'})"),null);
run('loads[0].width=198;loads[0].height=198;loads[0].onload();drawCalls.length=0');
run("SurvivorArt.picture(sample,'idle',0,{direction:'W'})");
assert.equal(run("drawCalls.some(c=>c[0]==='scale'&&c[1]===-1&&c[2]===1)"),true);
assert.deepEqual(json("drawCalls.find(c=>c[0]==='drawImage').slice(2)"),[1,67,64,64,0,0,64,64]);
assert.equal(run("SurvivorArt.picture(sample,'idle',0,{direction:'W'})===SurvivorArt.picture(sample,'idle',0,{direction:'W'})"),true);
assert.equal(run("SurvivorArt.picture(sample,'idle',0,{direction:'W'})===SurvivorArt.picture(sample,'idle',0,{direction:'E'})"),false);
run("drawCalls.length=0;SurvivorArt.picture(sample,'hurt',0,{direction:'N',tint:'#ffffff'})");assert.equal(run("drawCalls.some(c=>c[0]==='fillRect')"),true,'loaded sprites can flash white');
// VFX geometry and composition consume visual data; warning fallback always runs.
run("globalThis.effect=SurvivorArt.lookup(sample);effect.vfx={fitTo:'path',rotateWithAim:true,zLayer:'ground',blend:'lighter',alpha:.5,progressMode:'fade'}");
const plan=json('SurvivorArt.vfxPlan(effect,{x:0,y:0,width:20,height:20,origin:{x:10,y:20},target:{x:10,y:120},radius:5,phaseElapsed:1,phaseDuration:2})');
assert.deepEqual(plan.box,[10,15,100,10]);assert.equal(plan.angle,Math.PI/2);assert.equal(plan.alpha,.25);assert.equal(plan.zLayer,'ground');
run("SurvivorArtManifest.assets['move/boss-chalk']=JSON.parse(JSON.stringify(SurvivorArtManifest.assets[sample]));globalThis.warnings=0;SurvivorArt.paint('move/boss-chalk',{context:ctx,x:0,y:0,width:64,height:64},()=>warnings++)");assert.equal(run('warnings'),1);
assert.ok(run("SurvivorArt.lookup('effect/gust')"));
// Actor rendering consumes direction metadata without applying the old horizontal flip twice.
run("resetGame();SurvivorArt.picture(sample,'run',0,{direction:'W'});SurvivorArtManifest.assets['character/player']=JSON.parse(JSON.stringify(SurvivorArtManifest.assets[sample]));state.faceX=-1;state.faceY=0;state.player.facing=-1;state.player.moving=true;drawCalls.length=0;globalThis.collider=state.player.r;drawHero()");
assert.equal(run("drawCalls.filter(c=>c[0]==='scale'&&c[1]===-1).length"),0);
assert.equal(run('state.player.r===collider'),true);

const generator=spawnSync('python3',[path.join(__dirname,'../tools/player-directions-art.py'),'--check'],{encoding:'utf8'});
assert.equal(generator.status,0,generator.stderr);
const png=fs.readFileSync(path.join(__dirname,'../art/samples/player-directions.png'));assert.equal(png.readUInt32BE(16),198);assert.equal(png.readUInt32BE(20),198);
console.log('PASS: art v2 optional defaults / S E N and mirrored W / atlas margins / variable frames / phase sync / fallbacks / display anchors / VFX / white flash / original deterministic fixture');
