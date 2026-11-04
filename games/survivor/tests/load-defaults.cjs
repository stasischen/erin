// Browser and VM consume the same ordered default-data manifest.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),manifest=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'data/manifest.js'),'utf8'),manifest);
const files=Array.from(manifest.SurvivorDataManifest);
function load(context) {
  for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
module.exports={files,load};
