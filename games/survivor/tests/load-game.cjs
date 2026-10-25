// Use the browser manifest, evaluating each classic script separately as Safari does.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'manifest.js'), 'utf8'), context);
const files = Array.from(context.SurvivorManifest);
function source(override) {
  return override ? fs.readFileSync(override, 'utf8') : files.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
}
function load(context, override) {
  for (const file of override ? [override] : files.map(file => path.join(root, file))) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, {filename: file});
  }
}
module.exports = {files, source, load};
