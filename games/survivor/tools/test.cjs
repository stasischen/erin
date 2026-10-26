// node games/survivor/tools/test.cjs [--layout]
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const helpers=new Set(['load-game.cjs','maker-support.cjs','maker-traces.cjs','slide-legacy.cjs']);
const tests=fs.readdirSync(path.join(root,'tests')).filter(file=>file.endsWith('.cjs')&&!helpers.has(file)&&(file!=='levelup-layout.cjs'||process.argv.includes('--layout'))).sort();
let failed=false;
for(const file of [path.join(__dirname,'version.cjs'),...tests.map(file=>path.join(root,'tests',file))]) {
 console.log('\n'+path.basename(file));
 const result=spawnSync(process.execPath,[file],{stdio:'inherit'});
 if(result.error)console.error(result.error.message);
 if(result.status!==0)failed=true;
}
if(!process.argv.includes('--layout'))console.log('\n版面尚未執行；完整驗證請加 --layout（需要 Chrome）。');
process.exitCode=failed?1:0;
