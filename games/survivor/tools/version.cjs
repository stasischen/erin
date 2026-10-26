// Edit version.json, then run: node games/survivor/tools/version.cjs --write
// CI / review check (no writes): node games/survivor/tools/version.cjs
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'), repo = path.resolve(root, '../..');
const {version} = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));
assert.match(version, /^[a-zA-Z0-9-]+$/);
const manifestContext = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'manifest.js'), 'utf8'), manifestContext);
const files = Array.from(manifestContext.SurvivorManifest);
assert.equal(new Set(files).size, files.length, 'duplicate manifest entry');
for (const file of files) {
  assert.match(file, /^(?:engine\/|render\/|ui\/)?[a-z-]+\.js$/);
  assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
}
// 美術路徑也由同一份清單加入離線快取；換圖不必手改 sw.js。
const artContext = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'art-manifest.js'), 'utf8'), artContext);
const artFiles = [...new Set(Object.values(artContext.SurvivorArtManifest.assets).map(a=>a.sheet).filter(Boolean))];
for (const file of artFiles) {
  assert.match(file, /^art\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.png$/);
  assert.ok(fs.existsSync(path.join(root,file)), `art file missing: ${file}`);
}
const writing = process.argv.includes('--write');
for (const file of ['index.html', 'preview.html', 'preview.js', 'practice.html', 'practice-host.js']) {
  const target = path.join(root, file), before = fs.readFileSync(target, 'utf8');
  const after = before.replace(/\?v=[a-zA-Z0-9-]+/g, `?v=${version}`);
  if (writing) fs.writeFileSync(target, after);
  else assert.equal(before, after, `${file}: run version.cjs --write`);
}
const swPath = path.join(repo, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
if (writing) {
  sw = sw.replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = 'erin-games-${version}';`);
  const dependencies = ['manifest.js', 'practice.html', 'practice.css', 'practice-rules.js', 'practice-host.js', 'practice-engine.js', ...files, ...artFiles].map(file => `games/survivor/${file}`);
  for (const file of dependencies) if (!sw.includes(`'${file}'`)) {
    sw = sw.replace('const PRECACHE_URLS = [', `const PRECACHE_URLS = [\n  '${file}',`);
  }
  fs.writeFileSync(swPath, sw);
}
const cacheContext = vm.createContext({self: {addEventListener() {}}});
vm.runInContext(sw + '\nglobalThis.cacheName = CACHE_NAME; globalThis.urls = PRECACHE_URLS;', cacheContext);
assert.equal(cacheContext.cacheName, `erin-games-${version}`, 'CACHE_NAME differs from version.json');
for (const file of ['manifest.js', 'game.js', 'practice.html', 'practice.css', 'practice-rules.js', 'practice-host.js', 'practice-engine.js', ...files, ...artFiles]) {
  assert.ok(cacheContext.urls.includes(`/erin/games/survivor/${file}`), `not precached: ${file}`);
}
for (const url of cacheContext.urls) {
  const target = path.join(repo, url.replace(/^\/erin\//, ''));
  assert.ok(fs.existsSync(target), `precache file missing: ${url}`);
}
for (const page of ['index.html', 'preview.html', 'practice.html']) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const manifestIndex = html.indexOf(`manifest.js?v=${version}`), gameIndex = html.indexOf(`game.js?v=${version}`);
  assert.ok(manifestIndex >= 0 && gameIndex > manifestIndex, `${page}: manifest must load first`);
}
console.log(`PASS: version ${version}; both pages, preview URL, CACHE_NAME and ${files.length} manifest scripts / precache paths`);
