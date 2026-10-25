// Deterministic fake Web Audio: no speakers, wall-clock timers or browser policy bypass.
const assert = require('node:assert/strict'), createRun = require('./maker-support.cjs');
const run = createRun();
const mock = `
const audioCalls={contexts:0,sources:[],oscillators:[],buffers:0,timers:new Map(),next:0};
globalThis.setTimeout=fn=>{audioCalls.timers.set(++audioCalls.next,fn);return audioCalls.next;};
globalThis.clearTimeout=id=>audioCalls.timers.delete(id);
class FakeNode {
 constructor(){this.gain={value:0,setValueAtTime(){},linearRampToValueAtTime(){}};this.frequency={value:0};this.stopped=false;}
 connect(){} disconnect(){this.disconnected=true;} start(time){this.started=time||0;}
 stop(){this.stopped=true;if(this.onended)this.onended();}
}
window.AudioContext=class {
 constructor(){audioCalls.contexts++;this.currentTime=0;this.state='running';this.destination={};}
 createGain(){return new FakeNode();}
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
assert.ok(run('audioCalls.oscillators.at(-2).frequency.value<440'),'boss opening differs from calm');
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
