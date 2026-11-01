#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '../../..');
const cardIndex = process.argv.indexOf('--card');
const CARD = cardIndex >= 0 ? process.argv[cardIndex + 1] : 'a0';
if (!/^[a-z0-9-]+$/.test(CARD)) throw new Error('請用 --card 指定小寫卡號，例如 d1。');
const OUT = path.join(os.homedir(), '.local/share/erin/art-review', CARD);
const sizeIndex=process.argv.indexOf('--size');
const sizeMap={'1024x461':[1024,461],'740x360':[740,360],'1180x820':[1180,820]};
const SIZES=sizeIndex<0?[[1024,461],[740,360],[1180,820]]:[sizeMap[process.argv[sizeIndex+1]]||(()=>{throw new Error('未知尺寸，請用 1024x461、740x360 或 1180x820。')})()];
const STATES = ['opening','battle','levelup'];
const D6_BOSSES=[['巨斧守門人','gatekeeper'],['雙子霜火','frostfire'],['羽翼古神','winged'],['雙刃刺客','assassin']];
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function chromePath() {
  const candidates = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  for (const candidate of candidates) if (candidate && fs.existsSync(candidate)) return candidate;
  for (const command of ['google-chrome','chromium','chromium-browser']) {
    const found = spawnSync('which',[command],{encoding:'utf8'}).stdout.trim();
    if (found) return found;
  }
  throw new Error('找不到 Chrome；可用 CHROME_PATH 指定既有 Chrome 執行檔。');
}
function serve() {
  const server = http.createServer((req,res) => {
    let file;
    try { file = path.resolve(ROOT, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname)); }
    catch { res.writeHead(400).end(); return; }
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
    fs.readFile(file,(error,data) => {
      if (error) { res.writeHead(404).end('not found'); return; }
      res.writeHead(200,{'Content-Type':MIME[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
      res.end(data);
    });
  });
  return new Promise(resolve => server.listen(0,'127.0.0.1',() => resolve(server)));
}
function cdpClient(socket) {
  let seq = 0;
  const pending = new Map();
  socket.addEventListener('message',event => {
    const message = JSON.parse(String(event.data));
    if (!message.id || !pending.has(message.id)) return;
    const {resolve,reject,timer} = pending.get(message.id);
    clearTimeout(timer); pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result || {});
  });
  return {
    send(method,params={}) {
      const id = ++seq;
      return new Promise((resolve,reject) => {
        const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome timeout: ${method}`)); },15000);
        pending.set(id,{resolve,reject,timer}); socket.send(JSON.stringify({id,method,params}));
      });
    }
  };
}
async function evaluate(cdp,expression) {
  const reply = await cdp.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});
  if (reply.exceptionDetails) throw new Error(JSON.stringify(reply.exceptionDetails));
  return reply.result && reply.result.value;
}
async function waitFor(cdp,expression,label,timeout=12000) {
  const end = Date.now()+timeout;
  while (Date.now()<end) { if (await evaluate(cdp,expression)) return; await sleep(100); }
  throw new Error(`等待逾時：${label}`);
}
async function screenshot(cdp,file) {
  const shot = await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
  fs.writeFileSync(file,Buffer.from(shot.data,'base64'));
}
async function captureRun(cdp,baseUrl,width,height) {
  await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await cdp.send('Page.bringToFront');
  await cdp.send('Page.navigate',{url:'about:blank'}); await sleep(100);
  await cdp.send('Page.navigate',{url:baseUrl});
  await cdp.send('Page.bringToFront');
  await waitFor(cdp,'document.readyState==="complete" && !!document.querySelector("#startButton")','開始畫面');
  await evaluate(cdp,'localStorage.clear()');
  await cdp.send('Page.reload',{ignoreCache:true});
  await waitFor(cdp,'document.readyState==="complete" && !!document.querySelector("#startButton")','重設後開始畫面');
  await sleep(500);
  const prefix = `${width}x${height}`;
  const opening = path.join(OUT,`${prefix}-opening.png`);
  await screenshot(cdp,opening);

  await evaluate(cdp,`document.querySelector('#settingsButton').click();`);
  await waitFor(cdp,'!document.querySelector("#settingsPanel").hidden','設定面板');
  await evaluate(cdp,`document.querySelector('#pauseAttackMode').click(); document.querySelector('#closeSettingsButton').click();`);
  if (await evaluate(cdp,'GAME_DATA.attackMode !== "auto"')) throw new Error(`${prefix}: 無法透過設定選單啟用自動攻擊`);
  await evaluate(cdp,`document.querySelector('#startButton').click();`);
  await waitFor(cdp,'state.mode==="levelup" && state.pickingWeapon && document.querySelectorAll("#upgradeCards button").length>=3','初始武器選擇');
  await evaluate(cdp,`document.querySelector('#upgradeCards button').click(); document.querySelector('#upgradeCards button').click();`);
  await waitFor(cdp,'state.mode==="playing"','戰鬥開始');
  await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await sleep(360);
  const battle = path.join(OUT,`${prefix}-battle.png`);
  await screenshot(cdp,battle);
  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});

  const keyCodes = {ArrowUp:38,ArrowRight:39,ArrowDown:40,ArrowLeft:37};
  let tick = 0, last = null;
  const deadline = Date.now()+120000;
  while (Date.now()<deadline) {
    const mode = await evaluate(cdp,'state.mode');
    if (mode === 'levelup' && await evaluate(cdp,'!state.pickingWeapon')) break;
    if (mode !== 'playing') {
      const details = await evaluate(cdp,'({mode:state.mode,level:state.level,xp:state.xp,kills:state.neutral.kills,hidden:document.hidden,visibility:document.visibilityState,focus:document.hasFocus()})');
      throw new Error(`${prefix}: 戰鬥未到升級畫面：${JSON.stringify(details)}`);
    }
    const keys = Object.keys(keyCodes);
    const key = keys[(tick++ + Math.floor(tick/3)) % keys.length];
    if (last) await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:last,code:last,windowsVirtualKeyCode:keyCodes[last]});
    await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:keyCodes[key]});
    await sleep(260); last=key;
  }
  if (last) await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:last,code:last,windowsVirtualKeyCode:keyCodes[last]});
  if (!(await evaluate(cdp,'state.mode==="levelup" && !state.pickingWeapon'))) {
    const details = await evaluate(cdp,'({mode:state.mode,level:state.level,xp:state.xp,kills:state.neutral.kills})');
    throw new Error(`${prefix}: 120 秒內未進入自然升級畫面：${JSON.stringify(details)}`);
  }
  await sleep(350);
  const levelup = path.join(OUT,`${prefix}-levelup.png`);
  await screenshot(cdp,levelup);
  if(CARD==='d6'){
    for(const [title,slug] of D6_BOSSES){
      await cdp.send('Page.navigate',{url:'about:blank'});await sleep(100);await cdp.send('Page.navigate',{url:baseUrl});
      await waitFor(cdp,'document.readyState==="complete" && !!document.querySelector("#trialEntry")','Boss 測試入口');
      await evaluate(cdp,`document.querySelector('#trialEntry').click()`);
      await waitFor(cdp,'!document.querySelector("#trialPanel").hidden','王的試煉選單');
      await evaluate(cdp,`[...document.querySelectorAll('#trialChoices .trial-choice')].find(button=>button.title===${JSON.stringify(title)}).click()`);
      await waitFor(cdp,'state.trial && (state.boss || state.trial.actors)','Boss 試煉開場');
      await evaluate(cdp,`state.player.damageDisabled=true`);
      await waitFor(cdp,'state.trial.entry<=0','Boss 登場動畫');
      if(slug==='gatekeeper'){
        await evaluate(cdp,`state.mode='paused'; triggerBossWeakpoint(state.boss,'wall-stun',1); updateBossWeakpoints(.16); state.boss.impactFlash=.12; state.boss.feedbackNumberScale=1.7; render()`);
        await waitFor(cdp,'state.boss.weakpoints && state.boss.weakpoints.core && state.boss.weakpoints.core.phase==="open"','Boss 弱點開啟',12000);
      }
      await sleep(100);
      const boss=path.join(OUT,`${prefix}-boss-${slug}.png`);
      await screenshot(cdp,boss);
      console.log(`PASS ${prefix}: boss-${slug}=${boss}`);
    }
  }
  console.log(`PASS ${prefix}: opening=${opening} battle=${battle} levelup=${levelup}`);
}
async function main() {
  fs.mkdirSync(OUT,{recursive:true});
  for (const [w,h] of SIZES) for (const state of [...STATES,...(CARD==='d6'?D6_BOSSES.map(([,slug])=>`boss-${slug}`):[])]) {
    const file = path.join(OUT,`${w}x${h}-${state}.png`);
    if (fs.existsSync(file)) throw new Error(`拒絕覆寫既有截圖：${file}`);
  }
  const chrome = chromePath(), server = await serve();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(),`erin-${CARD}-chrome-`));
  const browser = spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
  let stderr=''; browser.stderr.on('data',chunk => { stderr += chunk.toString(); });
  let socket;
  try {
    const portFile = path.join(profile,'DevToolsActivePort');
    for (let i=0;i<100 && !fs.existsSync(portFile);i++) { if (browser.exitCode !== null) throw new Error(stderr || 'Chrome 無法啟動'); await sleep(100); }
    if (!fs.existsSync(portFile)) throw new Error(`Chrome DevTools 未啟動：${stderr}`);
    const port = Number(fs.readFileSync(portFile,'utf8').split('\n')[0]);
    const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'}).then(r => r.json());
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve,reject) => { socket.addEventListener('open',resolve,{once:true}); socket.addEventListener('error',reject,{once:true}); });
    const cdp = cdpClient(socket);
    await cdp.send('Page.enable'); await cdp.send('Runtime.enable'); await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled',{cacheDisabled:true}); await cdp.send('Network.setBypassServiceWorker',{bypass:true});
    await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:'(()=>{let seed=16807;Math.random=()=>((seed=seed*16807%2147483647)-1)/2147483646;})();'});
    const baseUrl = `http://127.0.0.1:${server.address().port}/games/survivor/`;
    for (const [width,height] of SIZES) await captureRun(cdp,baseUrl,width,height);
    const files = fs.readdirSync(OUT).filter(name => name.endsWith('.png'));
    const expected=SIZES.length*(CARD==='d6'?3+D6_BOSSES.length:3);
    if (files.length !== expected) throw new Error(`預期 ${expected} 張截圖，實際找到 ${files.length} 張`);
    console.log(`完成：${files.length} 張截圖，固定隨機種子 16807，輸出 ${OUT}`);
  } finally {
    if (socket) socket.close();
    browser.kill('SIGTERM');
    await new Promise(resolve => { if (browser.exitCode !== null) return resolve(); browser.once('exit',resolve); setTimeout(resolve,3000); });
    server.close(); fs.rmSync(profile,{recursive:true,force:true});
  }
}
main().catch(error => { console.error(error.stack || error); process.exitCode=1; });
