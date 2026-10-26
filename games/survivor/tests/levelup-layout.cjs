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
  const panel=document.querySelector('#upgradePanel'),preview=document.querySelector('#upgradePreview'),f=preview.querySelector('iframe'),details=document.querySelector('#upgradeDetails'),workspace=document.querySelector('.upgrade-workspace'),row=document.querySelector('#upgradeCards'),actions=document.querySelector('.upgrade-actions');
  for(const selector of ['#upgradeDetails','#rerollUpgrade']){const n=document.querySelector(selector),r=n.getBoundingClientRect(),hit=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);if(r.width<=0||r.height<=0||r.left<0||r.right>innerWidth+1||r.top<0||r.bottom>innerHeight+1||!n.contains(hit))throw Error(selector+' 不完整或遮住');}
  const cards=[...row.querySelectorAll('button')];
  if(cards.some(c=>Math.abs(c.offsetTop-cards[0].offsetTop)>1||Math.abs(c.offsetHeight-cards[0].offsetHeight)>1||c.offsetWidth<64||c.offsetHeight<56))throw Error('三圖示未平均並排或太小');
  if(row.offsetTop+row.offsetHeight>workspace.offsetTop+1||workspace.offsetTop+workspace.offsetHeight>actions.offsetTop+1)throw Error('上方圖示、中間展示、下方動作順序錯誤');
  if(panel.scrollHeight>panel.clientHeight+1)throw Error('面板需要捲動');
  if(!document.querySelector('#upgradeName').textContent||!document.querySelector('#upgradeDescription').textContent||!document.querySelector('#upgradeLevel').textContent||!document.querySelector('#upgradeRequirements').textContent)throw Error('選中卡資訊缺漏');
  if(details.scrollHeight>details.clientHeight+1)throw Error('預設卡片說明需要捲動');
  for(const selector of ['#confirmUpgrade','#rerollUpgrade']){const n=document.querySelector(selector);if(n.textContent.trim().replace(/[0-9]/g,'')||!n.querySelector('.pixel-icon')||getComputedStyle(n).borderRadius!=='50%')throw Error('底部必須是圓形純像素圖示');}
  const area=n=>n.offsetWidth*n.offsetHeight;
  const used=[row,details,preview,actions,panel.querySelector('h2'),panel.querySelector(':scope > p')].reduce((sum,n)=>sum+area(n),0);
  const blank=1-used/area(panel),share=area(preview)/area(panel);
  if(blank>.18)throw Error('面板空白超過18%: '+(blank*100).toFixed(1)+'%');
  if(f.offsetWidth<preview.clientWidth-16 || f.offsetHeight<40 || f.offsetHeight<preview.clientHeight-44)throw Error('展示未填滿框或太矮');
  if(devicePixelRatio!==3||!matchMedia('(pointer: coarse)').matches)throw Error('缺少DPR3或觸控模擬');
  return {blank,share};
 })()`;
 for(const [width,height] of [[412,915],[384,832],[915,412],[800,360],[732,310],[1024,768],[1024,461],[740,360],[461,1024]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:3,mobile:true});
  await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:'globalThis.SURVIVOR_AUDIO_MUTED=true;'});
  const loaded=new Promise(resolve=>{loadedPage=resolve;});
  await call('Page.navigate',{url:`file://${path.resolve(__dirname,'../index.html')}`});
  await loaded;
  // 等新頁確實載入遊戲，而非沿用上一頁 execution context。
  for(let i=0;i<100;i++){try{if(await evaluate("typeof showUpgradeChoices==='function' && document.readyState==='complete'"))break;}catch{}await new Promise(resolve=>setTimeout(resolve,20));}
  assert.equal(await evaluate("window.Survivor.engine.loop.resetGame === resetGame && window.Survivor.ui.levelup.showUpgradeChoices === showUpgradeChoices"),true,'共用清單與命名空間確實載入');
  await evaluate("startGame();true");
  assert.equal(await evaluate(`(()=>{
    if(!state.pickingWeapon||state.pendingChoices.length!==2)throw Error('缺少武器選擇');
    for(const selector of ['#upgradePanel','#upgradeDetails','#confirmUpgrade','#upgradeCards button:first-child','#upgradeCards button:last-child']) {
      const n=document.querySelector(selector),r=n.getBoundingClientRect();
      if(r.width<=0||r.height<=0||r.left<0||r.top<0||r.right>innerWidth+1||r.bottom>innerHeight+1)throw Error('武器選擇不完整 '+selector);
      if(selector.includes('button') || selector==='#confirmUpgrade') {
        if(Math.min(r.width,r.height)<64 || Math.abs(r.width-r.height)>1)throw Error('武器按鈕需為至少64px圓形');
        if(!n.querySelector('.pixel-icon')||getComputedStyle(n).borderRadius!=='50%'||n.textContent.trim())throw Error('武器要用圓形純點陣圖示');
        if(!n.contains(document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2)))throw Error('武器按鈕被遮住');
      }
    }
    const details=document.querySelector('#upgradeDetails');if(details.scrollHeight>details.clientHeight+1)throw Error('武器說明需完整顯示');
    return document.querySelector('#rerollUpgrade').hidden;
  })()`),true);
  await touch('#upgradeCards button:nth-child(2)');await touch('#confirmUpgrade');
  assert.equal(await evaluate("state.mode==='playing'&&state.weaponId==='candy-hammer'&&state.schoolRun.starter===null&&Object.keys(state.upgrades).length===0"),true);
  await evaluate("resetGame();state.pendingChoices=UPGRADES.filter(c=>c.tier==='fusion');showUpgradeChoices();true");
  const layout=await evaluate(geometry);
  await evaluate("state.pendingChoices=UPGRADES.slice(0,3);showUpgradeChoices();true");
  await touch('#upgradeCards button:nth-child(2)');assert.equal(await evaluate("state.mode==='levelup'&&upgradeLevel('rapid-water')===0"),true);
  assert.equal(await evaluate("document.querySelector('#upgradeName').textContent==='連發水球'"),true);
  await touch('#confirmUpgrade');assert.equal(await evaluate("state.mode==='playing'&&upgradeLevel('rapid-water')===1"),true);
  await evaluate("state.pendingChoices=UPGRADES.slice(0,3);showUpgradeChoices();true");
  await touch('#upgradeCards button');await touch('#upgradeCards button');assert.equal(await evaluate("state.mode==='playing'&&upgradeLevel('big-water')===1"),true);
  await evaluate("state.pendingChoices=UPGRADES.slice(0,3);showUpgradeChoices();true");
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'3',code:'Digit3',windowsVirtualKeyCode:51});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'3',code:'Digit3',windowsVirtualKeyCode:51});assert.equal(await evaluate("state.mode==='playing'"),true);
  await evaluate("resetGame();chooseUpgradeCards();globalThis.beforeReroll=state.pendingChoices.map(c=>c.id);true");
  await touch('#rerollUpgrade');assert.equal(await evaluate("state.mode==='levelup'&&state.rerollsRemaining===1&&state.pendingChoices.every(c=>!beforeReroll.includes(c.id))&&document.querySelector('#rerollCount').textContent==='1'&&document.querySelector('#upgradeCards button').getAttribute('aria-pressed')==='true'&&document.querySelector('#upgradeName').textContent===state.pendingChoices[0].name"),true);
  await touch('#rerollUpgrade');assert.equal(await evaluate("state.rerollsRemaining===0&&document.querySelector('#rerollUpgrade').disabled"),true);
  await touch('#rerollUpgrade');assert.equal(await evaluate("state.rerollsRemaining===0"),true);
  await touch('#confirmUpgrade');assert.equal(await evaluate("state.mode==='playing'&&Object.values(state.upgrades).reduce((a,b)=>a+b,0)===1"),true);
  // 窄螢幕的設定面板可捲動，先把已持有技能捲入畫面再模擬觸碰。
  await evaluate("openSettings();document.querySelector('#buildSlots button').scrollIntoView({block:'center'});true");await touch('#buildSlots button');assert.equal(await evaluate("!!document.querySelector('#ownedPreview iframe')"),true);
  await evaluate("showOverlay('paused');openSurvivorMaker();true");await touch('[data-tab="cards"]');
  assert.equal(await evaluate(`(()=>{for(const selector of ['.maker-tree','#makerCardEdit','.maker-footer','#play']){const n=document.querySelector(selector),r=n.getBoundingClientRect();if(r.width<40||r.height<40||r.left<0||r.top<0||r.right>innerWidth+1||r.bottom>innerHeight+1)throw Error('Maker '+selector+' 不完整');}const list=document.querySelector('.maker-tree'),edit=document.querySelector('#makerCardEdit');const a=list.getBoundingClientRect(),b=edit.getBoundingClientRect(),rotated=innerHeight>innerWidth;const listEnd=rotated?a.bottom:a.right,editStart=rotated?b.top:b.left;if(listEnd>editStart+1)throw Error('Maker 兩欄重疊或未依 shell 橫向排列');return true;})()`),true);
  await touch('.maker-tree button');assert.equal(await evaluate("document.querySelector('.maker-tree button').getAttribute('aria-pressed')==='true' && !!document.querySelector('#makerCardEdit input')"),true);
  // 每個分頁與技能樹的兩個內層捲動區都要能到達最後一項。
  for (const tab of ['schools','cards','enemies','boss','numbers']) {
    await evaluate(`document.querySelector('[data-tab="${tab}"]').scrollIntoView({block:'nearest'});true`);
    await touch(`[data-tab="${tab}"]`);
    assert.equal(await evaluate(`(async()=>{
      const editor=document.querySelector('#editor');
      if(editor.clientHeight<80||editor.scrollWidth>editor.clientWidth+2)throw Error('內容區太小或橫向溢出');
      if(getComputedStyle(editor).touchAction==='none')throw Error('內容區禁止觸控捲動');
      const scrollAreas=document.querySelector('.maker-card-workspace') ? [...editor.querySelectorAll('.maker-tree,.maker-card-edit')] : [editor];
      for(const area of scrollAreas) {
        if(!['auto','scroll'].includes(getComputedStyle(area).overflowY))throw Error('內容沒有開放手動捲動');
        area.scrollTop=area.scrollHeight;
        await new Promise(resolve=>requestAnimationFrame(resolve));
        if(area.scrollTop+area.clientHeight<area.scrollHeight-2)throw Error('內容末端無法到達');
        const controls=[...area.querySelectorAll('input,button,summary')].filter(n=>n.getClientRects().length);
        const last=controls[controls.length-1];
        if(!last)throw Error('缺少內容控制項');
        last.scrollIntoView({block:'nearest',inline:'nearest'});
        const r=last.getBoundingClientRect(),a=area.getBoundingClientRect();
        if(r.left<a.left-1||r.right>a.right+1||r.top<a.top-1||r.bottom>a.bottom+1||!last.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)))throw Error('最後控制項被裁切或遮擋');
      }
      for(const input of editor.querySelectorAll('input[type="text"]')) {
        input.scrollIntoView({block:'nearest',inline:'nearest'});
        const r=input.getBoundingClientRect();
        if(!input.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)))throw Error('名稱列無法到達或被遮住');
        if(input.offsetWidth>input.parentElement.clientWidth+1||input.offsetWidth>450)throw Error('名稱欄位過寬');
      }
      return true;
    })()`),true,`Maker ${tab} 可捲到底`);
  }
  await evaluate("document.querySelector('#practiceOpen').scrollIntoView({block:'nearest'});true");
  // 真實練習 iframe：敵人 canvas 必須留在按鈕內，不能遮住其他招式或說明。
  await touch('#practiceOpen');
  assert.equal(await evaluate("document.querySelector('#practiceOpen').textContent.includes('練習場') && document.querySelector('#practiceOpen .pixel-icon')!==null && document.querySelector('#practiceOpen').getAttribute('aria-pressed')==='true'"),true);
  assert.equal(await evaluate(`(async()=>{
    const frame=document.querySelector('.practice-dock iframe');
    for(let i=0;i<150;i++) {
      if(frame.contentDocument && frame.contentDocument.querySelectorAll('#practiceMoves button').length===8)break;
      await new Promise(resolve=>setTimeout(resolve,20));
    }
    const d=frame.contentDocument,buttons=[...d.querySelectorAll('#practiceMoves button')];
    if(buttons.length!==8)throw Error('練習招式未載入');
    for(let index=0;index<buttons.length;index++) {
      const button=d.querySelectorAll('#practiceMoves button')[index];
      button.scrollIntoView({block:'nearest'});
      const r=button.getBoundingClientRect();
      for(const child of button.querySelectorAll('*')) {
        const c=child.getBoundingClientRect();
        if(c.left<r.left-.5||c.right>r.right+.5||c.top<r.top-.5||c.bottom>r.bottom+.5)throw Error('招式圖示超出按鈕 '+button.title);
      }
      const hit=d.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
      if(!button.contains(hit))throw Error('招式按鈕被遮住 '+button.title);
      button.click();
      if(d.querySelectorAll('#practiceMoves button')[index].getAttribute('aria-pressed')!=='true')throw Error('無法選取招式 '+button.title);
      for(const selector of ['#practiceDescription','#practiceLegend']) {
        const n=d.querySelector(selector);n.scrollIntoView({block:'nearest'});const r=n.getBoundingClientRect();
        if(!n.textContent.trim()||r.width<=0||r.height<=0||r.left<0||r.right>frame.contentWindow.innerWidth+1||r.top<0||r.bottom>frame.contentWindow.innerHeight+1)throw Error(selector+' 不完整');
        for(const fraction of [.1,.5,.9]) {
          if(!n.contains(d.elementFromPoint(r.left+r.width*fraction,r.top+r.height/2)))throw Error(selector+' 被遮住');
        }
      }
    }
    const main=d.querySelector('main');main.scrollTop=main.scrollHeight;
    if(main.scrollTop+main.clientHeight<main.scrollHeight-2||main.scrollWidth>main.clientWidth+2)throw Error('練習內容無法捲到底或橫向裁切');
    return true;
  })()`),true);
  await touch('.practice-close');
  assert.equal(await evaluate("!document.querySelector('.practice-dock') && document.querySelector('[data-tab=numbers]').getAttribute('aria-pressed')==='true'"),true);
  console.log(`PASS: ${width}×${height} DPR3 展示 ${(layout.share*100).toFixed(1)}%／空白 ${(layout.blank*100).toFixed(1)}%／觸控／三卡／64px確認／雙點／鍵盤／重抽次數與新選項／暫停展示／Maker全分頁末端與名稱欄／練習場分頁與末端／練習圖示範圍與說明遮擋`);
 }
 await send('Browser.close');
})().catch(error=>{console.error('FAIL:',error.message);process.exitCode=1;}).finally(async()=>{clearTimeout(timeout);if(child.exitCode===null&&child.signalCode===null)child.kill();await exited;fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});});
