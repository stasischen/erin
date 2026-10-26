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
  // 怪物滑桿旁即時預覽，拉桿輸入後同一 iframe 更新；「試這隻」帶目前 draft。
  await evaluate(`document.querySelector('[data-tab="enemies"]').click();document.querySelector('.enemy-preview-toggle').open=true;true`);
  assert.equal(await evaluate(`(async()=>{
    const details=document.querySelector('.enemy-preview-toggle');
    for(let n=0;n<100;n++){if(details.querySelector('iframe')?.contentWindow.updatePracticeData)break;await new Promise(r=>setTimeout(r,20));}
    const f=details.querySelector('iframe');if(!f||!f.contentWindow.updatePracticeData)throw Error('即時預覽未載入');
    const slider=details.parentElement.querySelector('input[aria-label="移動速度"]');
    slider.value=65;slider.dispatchEvent(new Event('input',{bubbles:true}));
    if(details.querySelector('iframe')!==f||f.contentWindow.eval('practiceEnemy.speed')!==65)throw Error('拉桿未即時更新同一場景');
    details.scrollIntoView({block:'nearest'});
    if(f.getBoundingClientRect().width>document.querySelector('#editor').clientWidth+1)throw Error('小預覽橫向溢出');
    const trial=[...details.parentElement.querySelectorAll('button')].find(b=>b.textContent==='試這隻');
    trial.scrollIntoView({block:'nearest'});const r=trial.getBoundingClientRect();
    if(!trial.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)))throw Error('試這隻被遮住');
    trial.click();return true;
  })()`),true);
  assert.equal(await evaluate(`(async()=>{
    const frame=document.querySelector('.practice-dock iframe');
    for(let n=0;n<100;n++){if(frame.contentWindow.updatePracticeData)break;await new Promise(r=>setTimeout(r,20));}
    if(frame.contentWindow.eval('practiceEnemy.speed')!==65)throw Error('試這隻沒有使用剛調的數值');
    frame.contentDocument.querySelector('#practicePause').click();frame.contentDocument.querySelector('#practiceExit').click();
    return !document.querySelector('.practice-dock');
  })()`),true);
  // 老師招式沿用真實引擎小場景；改預警滑桿後不用重開 Maker。
  assert.equal(await evaluate(`(async()=>{
    document.querySelector('[data-tab="boss"]').click();
    const box=document.querySelector('.maker-move'),slider=box.querySelector('input[aria-label="預警秒數"]');
    if(!slider)throw Error('缺少老師預警拉桿');slider.value=1.2;slider.dispatchEvent(new Event('input',{bubbles:true}));
    await new Promise(r=>setTimeout(r,180));
    const f=box.querySelector('.skill-preview-host iframe');if(!f||f._previewPayload.data.boss.moves.find(m=>m.id===f._previewPayload.spec.id).warning!==1.2)throw Error('老師預覽沒有跟著拉桿更新');
    document.querySelector('[data-tab="enemies"]').click();return true;
  })()`),true);
  await evaluate(`document.querySelector('[data-tab="practice"]').click();true`);
  assert.equal(await evaluate(`(async()=>{
    const frame=document.querySelector('.practice-dock iframe');
    for(let i=0;i<100;i++){if(frame.contentWindow.updatePracticeData)break;await new Promise(resolve=>setTimeout(resolve,20));}
    const w=frame.contentWindow,d=frame.contentDocument;
    const shell=document.querySelector('.game-shell'),r=frame.getBoundingClientRect(),s=shell.getBoundingClientRect();
    if(Math.abs(r.width-s.width)>1||Math.abs(r.height-s.height)>1)throw Error('練習場沒有填滿全螢幕');
    const canvas=d.querySelector('#gameCanvas'),cr=canvas.getBoundingClientRect();
    if(cr.width<w.innerWidth-1||cr.height<w.innerHeight-1)throw Error('舞台沒有填滿畫面');
    for(const selector of ['#practiceMenu','#practicePause','#dashButton','#skillButton']){
      const n=d.querySelector(selector),r=n.getBoundingClientRect();
      if(r.x<0||r.y<0||r.right>w.innerWidth+1||r.bottom>w.innerHeight+1||!n.contains(d.elementFromPoint(r.x+r.width/2,r.y+r.height/2)))throw Error(selector+' 被遮住或超出畫面');
      const h=d.querySelector('#practiceStats').getBoundingClientRect();
      if(Math.min(r.right,h.right)>Math.max(r.left,h.left)&&Math.min(r.bottom,h.bottom)>Math.max(r.top,h.top))throw Error(selector+' 與統計重疊');
    }
    d.querySelector('#practiceMenu').click();
    if(w.eval('state.mode')!=='paused')throw Error('招式選單沒有暫停');
    const buttons=[...d.querySelectorAll('#practiceMoves button')];if(buttons.length!==8)throw Error('缺少八招');
    for(let index=0;index<8;index++){
      d.querySelector('#practiceMenu').click();const b=d.querySelectorAll('#practiceMoves button')[index];b.scrollIntoView({block:'nearest'});
      const r=b.getBoundingClientRect();if(!b.contains(d.elementFromPoint(r.x+r.width/2,r.y+r.height/2)))throw Error('招式按鈕被遮住');
      b.click();if(d.querySelectorAll('#practiceMoves button')[index].getAttribute('aria-pressed')!=='true')throw Error('選取失敗');
    }
    d.querySelector('#practiceMenu').click();
    const card=d.querySelector('.practice-card');card.scrollTop=card.scrollHeight;
    if(card.scrollTop+card.clientHeight<card.scrollHeight-2||card.scrollWidth>card.clientWidth+1)throw Error('暫停內容不能完整捲動');
    for(const selector of ['#practiceDescription','#practiceLegend','#practiceFast','#practiceExit']){
      const n=d.querySelector(selector);n.scrollIntoView({block:'nearest'});const r=n.getBoundingClientRect();
      if(!n.contains(d.elementFromPoint(r.x+r.width/2,r.y+r.height/2)))throw Error(selector+' 被裁切');
    }
    d.querySelector('#practiceMoves button').click();return true;
  })()`),true);
  // 真實 CDP 多點觸控；第一指持續移動，第二指衝刺，再以鍵盤移動與施放技能。
  const points=await evaluate(`(()=>{
    const f=document.querySelector('.practice-dock iframe'),w=f.contentWindow,d=f.contentDocument,r=f.getBoundingClientRect();
    function screen(x,y){return innerHeight>innerWidth?{x:r.right-y*r.width/w.innerHeight,y:r.top+x*r.height/w.innerWidth}:{x:r.left+x*r.width/w.innerWidth,y:r.top+y*r.height/w.innerHeight};}
    const b=d.querySelector('#dashButton').getBoundingClientRect();
    w.eval('globalThis.layoutStartX=state.player.x');
    return {start:screen(w.innerWidth*.18,w.innerHeight*.7),move:screen(w.innerWidth*.32,w.innerHeight*.7),dash:screen(b.x+b.width/2,b.y+b.height/2)};
  })()`);
  await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...points.start,id:1}]});
  await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...points.move,id:1}]});
  await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...points.move,id:1},{...points.dash,id:2}]});
  assert.equal(await evaluate(`document.querySelector('.practice-dock iframe').contentWindow.eval('!!state.joy && state.pointerId!==null && state.dashTimer>0')`),true,'邊移動邊衝刺');
  await new Promise(r=>setTimeout(r,100));
  await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await evaluate(`document.querySelector('.practice-dock iframe').contentWindow.eval('state.player.x>layoutStartX')`),true,'觸控實際移動');
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'e',code:'KeyE'});
  await new Promise(r=>setTimeout(r,80));
  assert.equal(await evaluate(`document.querySelector('.practice-dock iframe').contentWindow.eval('state.keys.has("ArrowRight") && state.skillCooldown>0')`),true,'鍵盤移動及技能');
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight'});
  await evaluate(`(()=>{const d=document.querySelector('.practice-dock iframe').contentDocument;d.querySelector('#practicePause').click();d.querySelector('#practiceExit').click();return true;})()`);
  assert.equal(await evaluate("!document.querySelector('.practice-dock') && document.querySelector('[data-tab=enemies]').getAttribute('aria-pressed')==='true'"),true);
  console.log(`PASS: ${width}×${height} DPR3 展示 ${(layout.share*100).toFixed(1)}%／空白 ${(layout.blank*100).toFixed(1)}%／觸控／三卡／64px確認／雙點／鍵盤／重抽次數與新選項／暫停展示／Maker全分頁末端與名稱欄／練習場全螢幕／選單捲動／真實多指衝刺與鍵盤／怪物拉桿即時預覽與試這隻`);
 }
 await send('Browser.close');
})().catch(error=>{console.error('FAIL:',error.message);process.exitCode=1;}).finally(async()=>{clearTimeout(timeout);if(child.exitCode===null&&child.signalCode===null)child.kill();await exited;fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});});
