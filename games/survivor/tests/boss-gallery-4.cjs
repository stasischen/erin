// Migration-only increment. Synthetic future roster tests schema identity, not new Boss gameplay.
// Run on Mac with the existing complete test runner; this file does not install or publish anything.
const assert=require('node:assert/strict'),createRun=require('./maker-support.cjs');
const run=createRun(),json=code=>JSON.parse(run('JSON.stringify('+code+')'));
run('globalThis.originalRoster=SurvivorData.copy(SURVIVOR_DEFAULTS.gallery.bosses)');
const oldIds=['gatekeeper','frostfire','winged','assassin'];
assert.deepEqual(json('originalRoster.map(b=>b.id)'),oldIds);
// Isolate the migration contract against both the current four definitions and a future seven.
// The extra definitions are test-only clones, never production placeholders or gameplay coverage.
for(const future of [false,true]){
 run(`SURVIVOR_DEFAULTS.gallery.bosses=SurvivorData.copy(originalRoster);
  if(${future})for(const id of ['stone-hands','rolling-eye','mask-statue']){
   const fixture=SurvivorData.copy(originalRoster[0]);fixture.id=id;
   SURVIVOR_DEFAULTS.gallery.bosses.push(fixture);
  }
  globalThis.baseSnapshot=JSON.stringify(SURVIVOR_DEFAULTS);`);
 const count=future?7:4;
 for(const length of [1,3,4])for(const reverse of [false,true]){
  run(`globalThis.work=SurvivorData.defaults();work.gallery.bosses=SurvivorData.copy(originalRoster.slice(0,${length}));
   for(const [i,b] of work.gallery.bosses.entries()){
    b.name='自訂王'+i;b.hp=1900+i*100;b.speed=71+i;
    b.moves[0].weight=3+i;b.moves[0].blocks.moves[0].timing.windup=1.25;
   }
   if(${reverse})work.gallery.bosses.reverse();
   globalThis.inputSnapshot=JSON.stringify(work);
   globalThis.checked=SurvivorData.validate(work);`);
  assert.equal(run('checked.valid'),true,JSON.stringify(json('checked.errors')));
  assert.equal(run('JSON.stringify(work)'),run('inputSnapshot'),'validation mutated input');
  assert.equal(run('JSON.stringify(SURVIVOR_DEFAULTS)'),run('baseSnapshot'),'validation mutated defaults');
  assert.equal(run('checked.data.gallery.bosses.length'),count);
  assert.deepEqual(json('checked.data.gallery.bosses.map(b=>b.id)'),json('SURVIVOR_DEFAULTS.gallery.bosses.map(b=>b.id)'));
  // Compare all retained editable nested values, not merely the number of entries.
  for(let i=0;i<length;i++){
   const id=oldIds[i];
   assert.deepEqual(json(`checked.data.gallery.bosses.find(b=>b.id==='${id}')`),json(`work.gallery.bosses.find(b=>b.id==='${id}')`));
  }
  run('globalThis.saved=SurvivorData.save(work);globalThis.loaded=SurvivorData.load();globalThis.again=SurvivorData.validate(loaded.data)');
  assert.equal(run('saved.valid&&loaded.valid&&again.valid'),true);
  assert.deepEqual(json('loaded.data.gallery'),json('checked.data.gallery'));
  assert.deepEqual(json('again.data.gallery'),json('checked.data.gallery'),'repeat load appended duplicates');
  run('checked.data.gallery.bosses[0].hp=4999');
  assert.equal(run('JSON.stringify(SURVIVOR_DEFAULTS)'),run('baseSnapshot'),'output aliases defaults');
 }
 // Full current-version roster may be reordered; entries are matched by ID, including future edits.
 run("work=SurvivorData.defaults();work.gallery.bosses.forEach((b,i)=>b.hp=2000+i*100);work.gallery.bosses.reverse();checked=SurvivorData.validate(work)");
 assert.equal(run('checked.valid'),true);
 for(let i=0;i<count;i++)assert.equal(run(`checked.data.gallery.bosses[${i}].hp`),2000+i*100);
 for(const edit of [
  'work.gallery=null',
  'work.gallery=[]',
  'work.gallery.schemaVersion=99',
  'work.gallery.bosses=[]',
  'work.gallery.bosses=[null]',
  'work.gallery.bosses=[work.gallery.bosses[1]]',
  'work.gallery.bosses=work.gallery.bosses.slice(0,2)',
  'work.gallery.bosses[1]=work.gallery.bosses[0]',
  "work.gallery.bosses[0].id='unknown-boss'",
  "work.gallery.bosses[0].id='__proto__'",
  "work.gallery.bosses[0].artId='character/assassin'",
  'work.gallery.bosses[0].hp=NaN',
  'work.gallery.bosses[0].moves[0].blocks.moves[0].timing.windup=0'
 ]){
  run('work=SurvivorData.defaults();'+edit+';globalThis.storageBefore=localStorage.getItem(SurvivorData.KEY);checked=SurvivorData.save(work)');
  assert.equal(run('checked.valid'),false,edit);
  assert.equal(run('localStorage.getItem(SurvivorData.KEY)'),run('storageBefore'),'invalid input replaced saved work');
 }
 // An invalid partial future roster must not be mistaken for one of the historic ID sets.
 if(future){
  run("work=SurvivorData.defaults();work.gallery.bosses=[work.gallery.bosses[0],work.gallery.bosses[1],work.gallery.bosses[4]]");
  assert.equal(run('SurvivorData.validate(work).valid'),false);
 }
 // Retain schema-1 arena conversion and supplied edits while adding only absent defaults.
 run('work=SurvivorData.defaults();work.gallery.schemaVersion=1;work.gallery.arenaRadius=620;work.gallery.bosses=SurvivorData.copy(originalRoster.slice(0,1));work.gallery.bosses[0].hp=2100;checked=SurvivorData.validate(work)');
 assert.equal(run('checked.valid'),true);assert.equal(run('checked.data.gallery.arenaRadius'),200);
 assert.equal(run('checked.data.gallery.bosses[0].hp'),2100);assert.equal(run('checked.data.gallery.bosses.length'),count);
}
run('SURVIVOR_DEFAULTS.gallery.bosses=SurvivorData.copy(originalRoster)');
console.log('PASS: ID-based 1/3/4 migration and complete-roster reorder; edits preserved; save/load idempotence; invalid and duplicate identities rejected without replacing storage; no input/default alias mutation');
