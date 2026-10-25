const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const {files, source} = require('./load-game.cjs');
const root = path.resolve(__dirname, '..'), run = require('./maker-support.cjs')();
assert.equal(run('window.Survivor === globalThis.Survivor'), true);
for (const file of files) {
  const api = 'Survivor.' + file.replace(/\.js$/, '').replaceAll('/', '.');
  assert.ok(run(`Object.keys(${api}).length > 0`), file);
}
assert.equal(run('Survivor.engine.state.state === state'), true);
assert.equal(run('Survivor.engine.combat.activateDash === activateDash'), true);
run('updateSettingValue("playerSpeed", 280)');
assert.equal(run('Survivor.engine.state.PLAYER_SPEED'), 280, 'namespace uses live values');
assert.equal(run('Survivor.engine.state.gameSettings === gameSettings'), true);
// The parser-time browser entry point must request exactly the VM manifest, in order.
const written = [], context = vm.createContext({URL, document: {currentScript: {src: 'http://localhost/erin/games/survivor/game.js?v=test-version'}, write: value => written.push(value)}});
vm.runInContext(fs.readFileSync(path.join(root, 'manifest.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'game.js'), 'utf8'), context);
assert.deepEqual(written, files.map(file => `<script src="${file}?v=test-version"></script>`));
// Same coordinate policy for portrait rotation, landscape and visualViewport changes.
for (const [width, height] of [[412,915],[384,832],[915,412],[800,360],[732,310],[1024,768],[600,700],[660,700]]) {
  run(`window.innerWidth=${width};window.innerHeight=${height};fitVisibleViewport()`);
  assert.equal(run('gameShell.dataset.short'), [Math.min(width,height)<=520?'compact':'',Math.max(width,height)<=660?'small':'',Math.max(width,height)<=600?'narrow':''].filter(Boolean).join(' '));
}
run('window.visualViewport={width:600,height:350,offsetLeft:20,offsetTop:10};fitVisibleViewport()');
assert.equal(run('gameShell.dataset.short'), '', 'visualViewport does not change former CSS media thresholds');
for (const file of ['style.css','maker/style.css']) {
  const css = fs.readFileSync(path.join(root,file),'utf8');
  assert.ok(!/@media[^{}]*max-(width|height)/.test(css), file+' has a duplicate viewport policy');
}
assert.equal((fs.readFileSync(path.join(root,'style.css'),'utf8').match(/^\.upgrade-panel \{/gm)||[]).length, 1);
// Cache checker must fail on missing precache entries and stale versions, without writing files.
const tool = fs.readFileSync(path.join(root,'tools/version.cjs'),'utf8');
function checkCache(transform) {
  const quiet = {log() {}};
  const fakeFs = {...fs, readFileSync(file,...args) {
    const result=fs.readFileSync(file,...args);
    return String(file).endsWith('/sw.js') ? transform(result) : result;
  }};
  vm.runInNewContext(tool, {__dirname:path.join(root,'tools'),process:{argv:[]},console:quiet,require:name=>name==='node:fs'?fakeFs:require(name)});
}
checkCache(s=>s);
for (const file of ['manifest.js', ...files]) {
  assert.throws(()=>checkCache(s=>s.replace(`'games/survivor/${file}',`,'')), /not precached/, file);
}
assert.throws(()=>checkCache(s=>s.replace(/const CACHE_NAME = '[^']+';/,"const CACHE_NAME = 'stale';")), /CACHE_NAME/);
assert.ok(source().includes('function tick(dt)'));
console.log('PASS: classic browser/VM manifest order; namespace live compatibility; five required sizes / viewport changes; consolidated styles; missing cache entries and stale version rejection');
