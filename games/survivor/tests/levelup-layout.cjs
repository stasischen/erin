// 真實 Chrome/CDP：DPR 3、行動裝置、實際觸控事件；不使用 DOM stub。
const {spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const chrome=process.env.CHROME_BIN || (process.platform==='darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'chromium');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'erin-layout-'));
const child=spawn(chrome,['--headless','--disable-gpu','--no-first-run','--allow-file-access-from-files',`--user-data-dir=${profile}`,'--remote-debugging-pipe'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
const exited=new Promise(resolve=>child.once('exit',resolve));
let nextId=0,buffer='',errorText='',loadedPage;const pending=new Map();
child.stderr.on('data',b=>{errorText+=b;});
child.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const message=JSON.parse(raw),request=pending.get(message.id);if(message.method==='Page.loadEventFired'&&loadedPage){loadedPage();loadedPage=null;}if(request){pending.delete(message.id);message.error?request.reject(Error(JSON.stringify(message.error))):request.resolve(message.result);}}});
child.on('exit',(code,signal)=>{for(const request of pending.values())request.reject(Error(`Chrome 未完成測試：${signal||code} ${errorText}`));pending.clear();});
function send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});child.stdio[3].write(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})})+'\0');});}
const timeout=setTimeout(()=>{console.error('FAIL: Chrome 測試逾時');child.kill();process.exitCode=1;},45000);
(async()=>{
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
 const call=(method,params)=>send(method,params,sessionId);
 async function evaluate(expression){const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.text+' '+JSON.stringify(result.exceptionDetails.exception));return result.result.value;}
 async function touch(selector){const point=await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)}),r=n.getBoundingClientRect();return {x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};})()`);await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 const geometry=`(()=>{
  const selectors=['#upgradePanel',...Array.from({length:3},(_,i)=>'#upgradeCards button:nth-child('+(i+1)+')'),'#upgradePreview','#upgradePreview iframe','#confirmUpgrade'];
  for(const selector of selectors){const n=document.querySelector(selector),r=n.getBoundingClientRect();if(getComputedStyle(n).display==='none'||r.width<=0||r.height<=0||r.left<-.5||r.top<-.5||r.right>innerWidth+.5||r.bottom>innerHeight+.5)throw Error(selector+' 不完整 '+JSON.stringify(r));}
  const b=document.querySelector('#confirmUpgrade'),r=b.getBoundingClientRect(),hit=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);if(Math.min(r.width,r.height)<64||!b.contains(hit))throw Error('確認鈕不夠大或被遮住');
  for(const n of document.querySelectorAll('#upgradeCards button')){if(n.scrollHeight>n.clientHeight+1)throw Error('卡片文字裁切');const r=n.getBoundingClientRect(),workspace=document.querySelector('.upgrade-workspace').getBoundingClientRect(),hit=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);if(r.left<workspace.left-1||r.right>workspace.right+1||r.top<workspace.top-1||r.bottom>workspace.bottom+1||!n.contains(hit))throw Error('卡片超出工作區或被遮住');}
  const panel=document.querySelector('#upgradePanel'),preview=document.querySelector('#upgradePreview'),f=preview.querySelector('iframe');
  const area=n=>n.offsetWidth*n.offsetHeight;
  if(Math.min(innerWidth,innerHeight)>=360 && (area(preview)/area(panel)<.28 || area(preview)/area(panel)>.38))throw Error('展示不在面板28～38%');
  const cards=[...document.querySelectorAll('#upgradeCards button')];
  if(cards.some(c=>Math.abs(c.offsetTop-cards[0].offsetTop)>1 || Math.abs(c.offsetHeight-cards[0].offsetHeight)>1))throw Error('三卡未平均並排');
  const used=[...cards,preview,document.querySelector('.upgrade-actions'),panel.querySelector('h2'),panel.querySelector(':scope > p')].reduce((sum,n)=>sum+area(n),0);
  const blank=1-used/area(panel),share=area(preview)/area(panel);
  if(blank>.18)throw Error('面板空白超過18%: '+(blank*100).toFixed(1)+'%');
  if(f.offsetWidth<preview.clientWidth-16 || f.offsetHeight<preview.clientHeight-52)throw Error('展示未填滿框');
  if(devicePixelRatio!==3||!matchMedia('(pointer: coarse)').matches)throw Error('缺少DPR3或觸控模擬');
  return {blank,share};
 })()`;
 for(const [width,height] of [[412,915],[384,832],[915,412],[800,360],[732,310]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:3,mobile:true});
  await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await call('Page.enable');
  const loaded=new Promise(resolve=>{loadedPage=resolve;});
  await call('Page.navigate',{url:`file://${path.resolve(__dirname,'../index.html')}`});
  await loaded;
  // 等新頁確實載入遊戲，而非沿用上一頁 execution context。
  for(let i=0;i<100;i++){try{if(await evaluate("typeof showUpgradeChoices==='function' && document.readyState==='complete'"))break;}catch{}await new Promise(resolve=>setTimeout(resolve,20));}
  await evaluate("resetGame();state.pendingChoices=UPGRADES.filter(c=>c.requires&&c.requires.length).slice(-3);showUpgradeChoices();true");
  const layout=await evaluate(geometry);
  await evaluate("state.pendingChoices=UPGRADES.slice(0,3);showUpgradeChoices();true");
  await touch('#upgradeCards button:nth-child(2)');assert.equal(await evaluate("state.mode==='levelup'&&upgradeLevel('rapid-water')===0"),true);
  await touch('#confirmUpgrade');assert.equal(await evaluate("state.mode==='playing'&&upgradeLevel('rapid-water')===1"),true);
  await evaluate("state.pendingChoices=UPGRADES.slice(0,3);showUpgradeChoices();true");
  await touch('#upgradeCards button');await touch('#upgradeCards button');assert.equal(await evaluate("state.mode==='playing'&&upgradeLevel('big-water')===1"),true);
  await evaluate("state.pendingChoices=UPGRADES.slice(0,3);showUpgradeChoices();true");
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'3',code:'Digit3',windowsVirtualKeyCode:51});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'3',code:'Digit3',windowsVirtualKeyCode:51});assert.equal(await evaluate("state.mode==='playing'"),true);
  await evaluate("showOverlay('paused');openSurvivorMaker();true");await touch('[data-tab="cards"]');
  assert.equal(await evaluate(`(()=>{for(const selector of ['.maker-tree','#makerCardEdit','.maker-footer','#play']){const n=document.querySelector(selector),r=n.getBoundingClientRect();if(r.width<40||r.height<40||r.left<0||r.top<0||r.right>innerWidth+1||r.bottom>innerHeight+1)throw Error('Maker '+selector+' 不完整');}const list=document.querySelector('.maker-tree'),edit=document.querySelector('#makerCardEdit');const a=list.getBoundingClientRect(),b=edit.getBoundingClientRect(),rotated=innerHeight>innerWidth;const listEnd=rotated?a.bottom:a.right,editStart=rotated?b.top:b.left;if(listEnd>editStart+1)throw Error('Maker 兩欄重疊或未依 shell 橫向排列');return true;})()`),true);
  await touch('.maker-tree button');assert.equal(await evaluate("document.querySelector('.maker-tree button').getAttribute('aria-pressed')==='true' && !!document.querySelector('#makerCardEdit input')"),true);
  console.log(`PASS: ${width}×${height} DPR3 展示 ${(layout.share*100).toFixed(1)}%／空白 ${(layout.blank*100).toFixed(1)}%／觸控／三卡／64px確認／雙點／鍵盤／Maker清單與編輯`);
 }
 await send('Browser.close');
})().catch(error=>{console.error('FAIL:',error.message);process.exitCode=1;}).finally(async()=>{clearTimeout(timeout);if(child.exitCode===null&&child.signalCode===null)child.kill();await exited;fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});});
