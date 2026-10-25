// Deterministic fake Web Audio: no speakers, wall-clock timers or browser policy bypass.
const assert = require('node:assert/strict'), createRun = require('./maker-support.cjs');
const run = createRun();
const mock = `
const audioCalls={contexts:0,sources:[],oscillators:[],buffers:0,timers:new Map(),gains:[],filters:[],limiters:[],next:0};
globalThis.setTimeout=fn=>{audioCalls.timers.set(++audioCalls.next,fn);return audioCalls.next;};
globalThis.clearTimeout=id=>audioCalls.timers.delete(id);
class FakeNode {
 constructor(){this.gain={value:0,events:[],cancelScheduledValues(){},setValueAtTime(v,t){this.events.push([v,t]);},linearRampToValueAtTime(v,t){this.events.push([v,t]);}};this.frequency={value:0};this.stopped=false;}
 connect(){} disconnect(){this.disconnected=true;} start(time){this.started=time||0;}
 stop(time){this.end=time;if(time>0)return;this.stopped=true;if(this.onended)this.onended();}
}
window.AudioContext=class {
 constructor(){audioCalls.contexts++;this.currentTime=0;this.state='running';this.sampleRate=22050;this.destination={};}
 createGain(){const n=new FakeNode();audioCalls.gains.push(n);return n;}
 createBiquadFilter(){const n=new FakeNode();audioCalls.filters.push(n);return n;}
 createWaveShaper(){const n=new FakeNode();audioCalls.limiters.push(n);return n;}
 createBufferSource(){const n=new FakeNode();audioCalls.sources.push(n);return n;}
 createOscillator(){const n=new FakeNode();audioCalls.oscillators.push(n);return n;}
 createBuffer(channels,length,rate){audioCalls.buffers++;const samples=new Float32Array(length);return {duration:length/rate,getChannelData:()=>samples};}
 resume(){this.state='running';return Promise.resolve();}
};
`;
run(mock);
assert.equal(run('audioCalls.contexts'),0);
assert.equal(run('playSound("shoot")'),false,'no audio before gesture');
run('startAudio();startAudio();state.mode="playing";Survivor.audio.sync()');
assert.equal(run('audioCalls.contexts'),1,'one context across starts');
assert.equal(run('audioCalls.timers.size'),1,'one music scheduler');
assert.ok(run('audioCalls.oscillators.length>0'));
assert.equal(run('playSound("shoot")'),true);
assert.equal(run('playSound("shoot")'),false,'same-id cooldown');
run('sharedAudio.currentTime+=.1');assert.equal(run('playSound("shoot")'),true);
run('sharedAudio.currentTime+=.1');assert.equal(run('playSound("shoot")'),false,'per-id cap');
for(const id of ['water','hit','death','xp','dash','click'])assert.equal(run(`playSound('${id}')`),true);
assert.equal(run('playSound("warning")'),false,'global effect cap');
run('for(const source of audioCalls.sources)source.stop();sharedAudio.currentTime+=1');
assert.equal(run('playSound("warning")'),true,'ended voices release slots');
run('for(const source of audioCalls.sources)source.stop();sharedAudio.currentTime+=1');
for(const id of run('Object.keys(Survivor.audio.sounds)')) {
 assert.equal(run(`playSound('${id}')`),true,id);
 assert.ok(run(`audioCalls.sources[audioCalls.sources.length-1].buffer.getChannelData(0).every(Number.isFinite)`),id+' finite samples');
 run('audioCalls.sources[audioCalls.sources.length-1].stop()');
}
const buffers=run('audioCalls.buffers');
run('sharedAudio.currentTime+=10;playSound("shoot")');assert.equal(run('audioCalls.buffers'),buffers,'cached samples');
run('gameSettings.sound=false;Survivor.audio.sync()');
assert.equal(run('audioCalls.sources.every(s=>s.stopped)'),true,'mute stops current sounds');
assert.equal(run('audioCalls.timers.size'),1,'sound mute preserves music');
run('gameSettings.music=false;Survivor.audio.sync()');assert.equal(run('audioCalls.timers.size'),0);
run('gameSettings.sound=true;playSound("hit")');assert.equal(run('audioCalls.sources.at(-1).stopped'),false,'music mute preserves effects');
run('gameSettings.music=true;Survivor.audio.sync();state.boss={};Survivor.audio.sync()');
assert.equal(run('audioCalls.timers.size'),1,'boss replaces rather than stacks loop');
assert.ok(run('Survivor.audio.songs.boss.root !== Survivor.audio.songs.calm.root'),'boss tonality differs');
run('showOverlay("paused")');assert.equal(run('audioCalls.timers.size'),0,'pause cancels loop');
run('state.mode="playing";Survivor.audio.sync()');assert.equal(run('audioCalls.timers.size'),1);
run('document.hidden=true;Survivor.audio.sync()');assert.equal(run('audioCalls.timers.size'),0);
assert.equal(run('playSound("hit")'),false,'hidden app is silent');
run('document.hidden=false;state.mode="levelup";Survivor.audio.sync()');assert.equal(run('audioCalls.timers.size'),0);
run('gameSettings.sound=false;gameSettings.music=false;saveSettings()');
const reload = createRun({saved:run.storage});assert.equal(reload('gameSettings.music || gameSettings.sound'),false);
const old=createRun({saved:{'erin-survivor-settings-v3':'{"sound":false}'}});assert.equal(old('gameSettings.music && !gameSettings.sound'),true,'legacy sound preference survives');
const failed=createRun({storageFails:true});failed('gameSettings.music=false;saveSettings()');
for(const flag of ['globalThis.SURVIVOR_AUDIO_MUTED=true','']) {
 const muted=createRun(flag?{}:{preview:{data:run('SurvivorData.defaults()'),spec:{kind:'card',id:'big-water'}}});
 muted(mock);if(flag)muted(flag);
 muted('startAudio();startGame();Survivor.audio.sync()');
 assert.equal(muted('audioCalls.contexts'),0,'tests/previews cannot unlock sound');
}
const unsupported=createRun();unsupported('startAudio();startGame()');
console.log('PASS: lazy audio/one context, 15 finite ZzFX presets/cache, cooldown/per-id/global caps, independent mutes/storage migration/failure, calm/boss/pause/hidden/levelup scheduler, silent previews/tests, unsupported devices');

// 完整曲式、配器、三首區別，以及每首超過一輪的排程。
for (const id of ['calm','biscuit','boss']) {
 assert.ok(run(`Survivor.audio.songs.${id}.duration >= 60 && Survivor.audio.songs.${id}.duration <= 90`),id+' 60–90 seconds');
 assert.equal(run(`Survivor.audio.songs.${id}.sections.map(s=>s.name).join(',')`),'intro,A,B,Aprime,bridge,outro');
 assert.equal(run(`new Set(Survivor.audio.songs.${id}.events.flat().map(e=>e.instrument)).size`),7);
 assert.equal(run(`JSON.stringify(Survivor.audio.songs.${id}.events.slice(64,192)) !== JSON.stringify(Survivor.audio.songs.${id}.events.slice(320,448))`),true,'A prime varies');
 run(`gameSettings.music=true;document.hidden=false;state.mode='playing';state.stageIndex=${id==='biscuit'?1:0};state.boss=${id==='boss'?'{}':'null'};Survivor.audio.sync()`);
 for(let t=0;t<Math.ceil(run(`Survivor.audio.songs.${id}.duration`))+2;t++) {
  run(`sharedAudio.currentTime+=1;for(const [id,fn] of Array.from(audioCalls.timers)){audioCalls.timers.delete(id);fn();}`);
  assert.equal(run('audioCalls.timers.size'),1,'one scheduler through full loop');
 }
}
assert.equal(run('audioCalls.limiters.length'),1,'one shared mix limiter');
assert.ok(run('Array.from(audioCalls.limiters[0].curve).every(v=>Number.isFinite(v)&&Math.abs(v)<.95)'),'bounded mix, including crossfade and effects');
assert.ok(run('audioCalls.gains.every(n=>n.gain.events.every(e=>e.every(Number.isFinite)))'),'finite envelopes');
run("state.boss=null;state.stageIndex=0;Survivor.audio.sync();sharedAudio.currentTime+=2;for(const [id,fn] of Array.from(audioCalls.timers)){audioCalls.timers.delete(id);fn();}");
const gainStart=run('audioCalls.gains.length'), now=run('sharedAudio.currentTime');
run("state.mode='transition';state.stageIndex=1;Survivor.audio.sync()");
assert.equal(run('audioCalls.timers.size'),1,'stage transition continues music');
assert.ok(run(`audioCalls.gains.slice(${gainStart}).some(n=>n.gain.events.some(e=>e[0]===1&&e[1]===${now+1}))`),'incoming 1s fade');
assert.ok(run(`audioCalls.gains.slice(0,${gainStart}).some(n=>n.gain.events.some(e=>e[0]===0&&e[1]===${now+1}))`),'outgoing 1s fade');
run("state.mode='over';Survivor.audio.sync();gameSettings.sound=true;sharedAudio.currentTime+=10");
assert.equal(run('audioCalls.timers.size'),0);
assert.equal(run("playSound('over')"),true,'end jingle survives music stop');
console.log('PASS: three complete 60–90s forms, seven instruments, varied reprise, full-loop scheduling, bounded shared mix, finite ADSR, 1s stage crossfade and end jingle');

run("state.mode='playing';state.boss=null;Survivor.audio.sync()");
for(let frame=0;frame<1200;frame++) {
 run(`sharedAudio.currentTime+=.08;
  for(const n of [...audioCalls.sources,...audioCalls.oscillators])if(!n.stopped&&n.end<=sharedAudio.currentTime){n.stopped=true;if(n.onended)n.onended();}
  for(const [id,fn] of Array.from(audioCalls.timers)){audioCalls.timers.delete(id);fn();}`);
 assert.ok(run('audioCalls.oscillators.filter(n=>!n.stopped).length+audioCalls.sources.filter(n=>!n.stopped).length')<64,'bounded live notes through 96 seconds');
}
run("state.mode='levelup';Survivor.audio.sync()");
assert.equal(run('audioCalls.oscillators.filter(n=>!n.stopped).length'),0,'pause stops scheduled notes');
console.log('PASS: 96 seconds at scheduler cadence, bounded live nodes and complete pause cleanup');
run("state.mode='over';Survivor.audio.sync();state.mode='playing';state.stageIndex=0;state.boss=null;Survivor.audio.sync();sharedAudio.currentTime+=.30;state.mode='levelup';Survivor.audio.sync();sharedAudio.currentTime+=17");
const resumedNotes=run('audioCalls.oscillators.length');
run("state.mode='playing';Survivor.audio.sync();sharedAudio.currentTime+=.08;for(const [id,fn] of Array.from(audioCalls.timers)){audioCalls.timers.delete(id);fn();}");
assert.ok(Math.abs(run(`audioCalls.oscillators[${resumedNotes}].frequency.value`)-440*Math.pow(2,(67-69)/12))<.001,'upgrade resumes at musical position, not intro');
console.log('PASS: upgrade freezes playhead and resumes after 17 seconds without restarting intro');
