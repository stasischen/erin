// 無額外套件；用真實 Chrome 無頭排版，不以 DOM stub 假裝版面通過。
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const chrome=process.env.CHROME_BIN || (process.platform==='darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'chromium');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'erin-layout-'));
try {
  const run=spawnSync(chrome,['--headless','--disable-gpu','--no-first-run','--allow-file-access-from-files',`--user-data-dir=${profile}`,'--virtual-time-budget=20000','--dump-dom',`file://${__dirname}/levelup-layout.html`],{encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024});
  const result=(run.stdout||'').match(/<pre id="results">([\s\S]*?)<\/pre>/);
  if (run.status!==0 || !result || !result[1].startsWith('PASS: 0 failures')) {
    console.error(result ? result[1] : `Chrome 未能完成版面測試：${run.error || run.signal || run.stderr}`); process.exitCode=1;
  } else console.log(result[1]);
} finally {fs.rmSync(profile,{recursive:true,force:true});}
