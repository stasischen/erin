// 可移植案例：舊偏好 → 獨立偏好；明確選擇優先；偏好不改玩法、作品、血量。
const assert=require('node:assert/strict'),createRun=require('./maker-support.cjs');
const key='erin-survivor-player-settings-v1',old='erin-survivor-settings-v3',work='erin-survivor-maker-v1';
const seed=createRun(),data=JSON.parse(seed('JSON.stringify(SurvivorData.defaults())'));
const legacy={...data,attackMode:'auto',attackModeChosen:true,joystick:{follow:false,radius:55,deadZone:8},hitJuice:{enabled:false,intensity:1.5}};
delete legacy.playerDefaults;
let run=createRun({saved:{[work]:JSON.stringify(legacy),[old]:JSON.stringify({sound:false,vibration:false})}});
assert.equal(run('GAME_DATA.attackMode'),'auto');
assert.equal(run('GAME_DATA.joystick.radius'),55);assert.equal(run('GAME_DATA.joystick.follow'),false);
assert.equal(run('GAME_DATA.hitJuice.enabled'),false);assert.equal(run('gameSettings.sound'),false);
assert.equal(run('gameSettings.vibration'),false);
const migrated=JSON.parse(run.storage[key]);assert.equal(migrated.playerHealth,undefined);assert.equal(migrated.bombDamage,undefined);
assert.equal(run.storage[work],JSON.stringify(legacy));
// A historical unmarked auto cannot inherit a Maker's explicit choice flag.
run=createRun({saved:{[work]:JSON.stringify(legacy),[old]:'{"attackMode":"auto"}'}});
assert.equal(run('GAME_DATA.attackMode'),'manual');
// Personal preferences survive edits of work defaults, reset, and Maker test-play.
const custom={...data.playerDefaults,attackMode:'auto',attackModeChosen:true,joystickRadius:60,joystickFollow:false,feedbackIntensity:1.7,soundVolume:.25,musicVolume:0,lowEffects:true};
const saved={[key]:JSON.stringify(custom),[work]:JSON.stringify(data)};
run=createRun({maker:true,saved});
assert.equal(run('GAME_DATA.attackMode'),'auto');assert.equal(run('GAME_DATA.joystick.radius'),60);
run("updateSettingValue('joystickDeadZone',7);resetGame();state.weaponId='candy-sword';state.mode='playing';state.player.health=23;openSettings()");
assert.equal(run('state.mode'),'paused');assert.equal(run('state.player.health'),23);
assert.ok(run.elements.buildSlots.innerHTML.includes(run('activeWeapon().name')));
assert.equal(run('gameSettings.lowEffects'),true);
run("state.effects=[];burst(10,20,'#fff',20)");assert.equal(run('state.effects.length'),2);
run("resetSettingsButton.listeners.click()");
assert.equal(run('state.player.health'),23);assert.equal(run('GAME_DATA.attackMode'),'manual');
assert.equal(run('GAME_DATA.joystick.radius'),35);
assert.equal(run.storage[work],JSON.stringify(data));
run('closeSettings();togglePause()');assert.equal(run('state.mode'),'playing');
assert.equal(createRun({saved:run.storage})('GAME_DATA.attackMode'),'manual');
// Bad local storage is recoverable; valid false/zero and numeric boundaries are retained.
for(const bad of ['null','{bad','[]']) {
 const fallback=createRun({saved:{[key]:bad}});assert.equal(fallback('GAME_DATA.attackMode'),'manual');
}
run=createRun({saved:{[key]:JSON.stringify({...custom,joystickRadius:999,joystickDeadZone:-3,soundVolume:0,musicVolume:4,feedbackIntensity:0})}});
assert.equal(run('GAME_DATA.joystick.radius'),70);assert.equal(run('GAME_DATA.joystick.deadZone'),0);
assert.equal(run('gameSettings.soundVolume'),0);assert.equal(run('gameSettings.musicVolume'),1);
assert.equal(run('GAME_DATA.hitJuice.intensity'),0);
run=createRun({storageFails:true,saved:{[old]:'{"sound":false,"attackMode":"auto","attackModeChosen":true}'}});
assert.equal(run('GAME_DATA.attackMode'),'auto');assert.equal(run('gameSettings.sound'),false);
run("updateSettingValue('musicVolume',.5)");assert.equal(run('gameSettings.musicVolume'),.5);
// Preview uses work defaults and cannot save personal preferences.
const preview=createRun({preview:{data,spec:{kind:'card',id:'big-water'}},saved});
assert.equal(preview('GAME_DATA.attackMode'),'manual');preview("setAttackMode('auto');saveSettings()");
assert.equal(preview.storage[key],saved[key]);
console.log('PASS: independent player prefs, old work/v3 migration and choice provenance, Maker override isolation, reset/no heal, paused weapon, low sparks, bounds/zero/corrupt/storage failure, silent preview isolation');
