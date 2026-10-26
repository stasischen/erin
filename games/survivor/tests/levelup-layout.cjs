// 真實 Chrome/CDP：DPR 3、行動裝置、實際觸控事件；不使用 DOM stub。
const {spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const chrome=process.env.CHROME_BIN || (process.platform==='darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'chromium');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'erin-layout-'));
const child=spawn(chrome,['--headless','--disable-gpu','--no-first-run','--allow-file-access-from-files',`--user-data-dir=${profile}`,'--remote-debugging-pipe'],{stdio:['ignore','ignore','pipe','pipe','pipe']});
const exited=new Promise(resolve=>child.once('exit',resolve));
let nextId=0,buffer='',errorText='',loadedPage;const pending=new Map();
child.stderr.on('data',b=>{errorText+=b;});
child.stdio[4].on('data',b=>{buffer+=b;let end;while((end=buffer.indexOf('\0'))>=0){const raw=buffer.slice(0,end);buffer=buffer.slice(end+1);if(!raw)continue;const message=JSON.parse(raw),request=pending.get(message.id);if(message.method==='Page.loadEventFired'&&loadedPage&&message.sessionId===loadedPage.sessionId){loadedPage.resolve();loadedPage=null;}if(request){pending.delete(message.id);message.error?request.reject(Error(JSON.stringify(message.error))):request.resolve(message.result);}}});
child.on('exit',(code,signal)=>{for(const request of pending.values())request.reject(Error(`Chrome 未完成測試：${signal||code} ${errorText}`));pending.clear();});
function send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});child.stdio[3].write(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})})+'\0');});}
const timeout=setTimeout(()=>{console.error('FAIL: Chrome 測試逾時');child.kill();process.exitCode=1;},45000);
(async()=>{
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
  // Page.enable 只在全新 session 呼叫一次。前一尺寸留下的動態 iframe、
  // 輸入焦點與 Page domain 狀態不應帶進下一個尺寸（Grok 已重現第二輪卡住）。
  const {targetId}=await send('Target.createTarget',{url:'about:blank'});
  try {
   const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
   const call=(method,params)=>send(method,params,sessionId);
   async function evaluate(expression){const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.text+' '+JSON.stringify(result.exceptionDetails.exception));return result.result.value;}
   async function touch(selector){const point=await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)}),r=n.getBoundingClientRect();return {x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};})()`);await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:3,mobile:true});
  await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:'globalThis.SURVIVOR_AUDIO_MUTED=true;'});
  const loaded=new Promise(resolve=>{loadedPage={sessionId,resolve};});
  await call('Page.navigate',{url:`file://${path.resolve(__dirname,'../index.html')}`});
  await loaded;
  // 等新頁確實載入遊戲，而非沿用上一頁 execution context。
  for(let i=0;i<100;i++){try{if(await evaluate("typeof showUpgradeChoices==='function' && document.readyState==='complete'"))break;}catch{}await new Promise(resolve=>setTimeout(resolve,20));}
  assert.equal(await evaluate("window.Survivor.engine.loop.resetGame === resetGame && window.Survivor.ui.levelup.showUpgradeChoices === showUpgradeChoices"),true,'共用清單與命名空間確實載入');
  await evaluate("startGame();true");
  assert.equal(await evaluate(`(()=>{
    if(!state.pickingWeapon||state.pendingChoices.length!==3)throw Error('缺少武器選擇');
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
  // 已持有技能位於暫停卡；窄螢幕先捲入畫面再模擬觸碰。
  await evaluate("togglePause();document.querySelector('#buildSlots button').scrollIntoView({block:'center'});true");await touch('#buildSlots button');assert.equal(await evaluate("!!document.querySelector('#ownedPreview iframe')"),true);
  await evaluate("showOverlay('paused');openSurvivorMaker();true");await touch('[data-tab="cards"]');
  // 六個分類在頂端，左列選項目，中間只建立一份編輯面板。
  for (const tab of ['weapons','cards','enemies','boss','stages','rules']) {
    await touch(`[data-tab="${tab}"]`);
    assert.equal(await evaluate(`(async()=>{
      const editor=document.querySelector('#editor'),nav=document.querySelector('.maker-tabs'),content=document.querySelector('.maker-content'),list=document.querySelector('.maker-items');
      if(nav.getBoundingClientRect().bottom>editor.getBoundingClientRect().top+1)throw Error('分類未放在上方');
      if(content.clientHeight<80||editor.scrollWidth>editor.clientWidth+2)throw Error('內容區太小或橫向溢出');
      if(list.getBoundingClientRect().right>content.getBoundingClientRect().left+1)throw Error('左列重疊編輯區');
      const ids=[...list.querySelectorAll('[data-item]')].map(b=>b.dataset.item);
      for(const id of ids) {
        document.querySelector('[data-item="'+id+'"]').click();
        const area=document.querySelector('.maker-content');
        for(const details of area.querySelectorAll('details')) details.open=true;
        if(document.querySelectorAll('.maker-item-heading').length!==1)throw Error('同時編輯多個項目');
        const controls=[...area.querySelectorAll('input,button,summary')].filter(n=>n.getClientRects().length);
        const last=controls[controls.length-1];if(!last)throw Error('缺少控制項');
        last.scrollIntoView({block:'nearest',inline:'nearest'});
        await new Promise(resolve=>requestAnimationFrame(resolve));
        const r=last.getBoundingClientRect(),a=area.getBoundingClientRect();
        if(r.left<a.left-1||r.right>a.right+1||r.top<a.top-1||r.bottom>a.bottom+1||!last.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)))throw Error(id+' 最後控制項被遮住');
      }
      return true;
    })()`),true,`Maker ${tab} 每個項目可到達末端`);
  }
  await evaluate(`document.querySelector('[data-tab="rules"]').click();document.querySelector('[data-item="defaults"]').click();document.querySelector('.maker-content details').open=true;[...document.querySelectorAll('.maker-content button')].find(b=>b.textContent.startsWith('搖桿跟隨')).click();true`);
  assert.equal(await evaluate("document.querySelector('.maker-content details').open"),true);
  // 個人設定末端滑桿與固定按鈕列分開，不能互相遮擋。
  await evaluate("document.querySelector('#makerClose').click();openSettings();true");
  assert.equal(await evaluate(`(()=>{const controls=document.querySelector('#settingsControls'),last=controls.lastElementChild;last.scrollIntoView({block:'end'});const r=controls.getBoundingClientRect(),a=document.querySelector('#settingsPanel .settings-actions').getBoundingClientRect();return r.bottom<=a.top+1;})()`),true);
  await evaluate("closeSettings();openSurvivorMaker();true");
  // 怪物滑桿旁即時預覽，拉桿輸入後同一 iframe 更新；「試這隻」帶目前 draft。
  await evaluate(`document.querySelector('[data-tab="enemies"]').click();document.querySelector('.maker-items [data-item]').click();if(document.querySelector('.maker-preview').hidden)document.querySelector('.maker-item-heading button:last-child').click();document.querySelector('.enemy-preview-toggle').open=true;true`);
  assert.equal(await evaluate(`(async()=>{
    const details=document.querySelector('.enemy-preview-toggle');
    for(let n=0;n<100;n++){if(details.querySelector('iframe')?.contentWindow.updatePracticeData)break;await new Promise(r=>setTimeout(r,20));}
    const f=details.querySelector('iframe');if(!f||!f.contentWindow.updatePracticeData)throw Error('即時預覽未載入');
    const slider=document.querySelector('.maker-content input[aria-label="移動速度"]');
    slider.value=65;slider.dispatchEvent(new Event('input',{bubbles:true}));
    if(details.querySelector('iframe')!==f||f.contentWindow.eval('practiceEnemy.speed')!==65)throw Error('拉桿未即時更新同一場景');
    details.scrollIntoView({block:'nearest'});
    if(f.getBoundingClientRect().width>document.querySelector('#editor').clientWidth+1)throw Error('小預覽橫向溢出');
    const trial=[...document.querySelector('.maker-content').querySelectorAll('button')].find(b=>b.textContent==='試這隻');
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
    document.querySelector('[data-tab="boss"]').click();document.querySelector('[data-item="'+SurvivorData.defaults().boss.moves[0].id+'"]').click();
    const box=document.querySelector('.maker-move'),slider=box.querySelector('input[aria-label="預警秒數"]');
    if(!slider)throw Error('缺少老師預警拉桿');slider.value=1.2;slider.dispatchEvent(new Event('input',{bubbles:true}));
    await new Promise(r=>setTimeout(r,180));
    const f=document.querySelector('.maker-preview .skill-preview-host iframe');if(!f||f._previewPayload.data.boss.moves.find(m=>m.id===f._previewPayload.spec.id).warning!==1.2)throw Error('老師預覽沒有跟著拉桿更新');
    document.querySelector('[data-tab="enemies"]').click();return true;
  })()`),true);
  await evaluate(`document.querySelector('.maker-item-heading button').click();true`);
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
    const moves=w.eval('SurvivorPracticeRules.moves(GAME_DATA)');
    const buttons=[...d.querySelectorAll('#practiceMoves button')];
    if(!moves.length||buttons.length!==moves.length)throw Error('練習招式數量與清單不符');
    for(let index=0;index<moves.length;index++){
      d.querySelector('#practiceMenu').click();const b=d.querySelectorAll('#practiceMoves button')[index];b.scrollIntoView({block:'nearest'});
      const r=b.getBoundingClientRect();if(!b.contains(d.elementFromPoint(r.x+r.width/2,r.y+r.height/2)))throw Error('招式按鈕被遮住');
      b.click();if(d.querySelectorAll('#practiceMoves button')[index].getAttribute('aria-pressed')!=='true'||w.eval('practiceId')!==moves[index].id)throw Error('選取失敗：'+moves[index].id);
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
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'e',code:'KeyE'});
  await evaluate(`(()=>{const d=document.querySelector('.practice-dock iframe').contentDocument;d.querySelector('#practicePause').click();d.querySelector('#practiceExit').click();return true;})()`);
  assert.equal(await evaluate("!document.querySelector('.practice-dock') && document.querySelector('[data-tab=enemies]').getAttribute('aria-pressed')==='true'"),true);
  console.log(`PASS: ${width}×${height} DPR3 展示 ${(layout.share*100).toFixed(1)}%／空白 ${(layout.blank*100).toFixed(1)}%／觸控／三卡／64px確認／雙點／鍵盤／重抽次數與新選項／暫停展示／Maker全分頁末端與名稱欄／練習場全螢幕／選單捲動／真實多指衝刺與鍵盤／怪物拉桿即時預覽與試這隻`);
  } finally {
   loadedPage=null;
   // 關閉 target 同時釋放其 session、子 iframe、排程及按鍵／觸控狀態。
   await send('Target.closeTarget',{targetId});
  }
 }
 await send('Browser.close');
})().catch(error=>{console.error('FAIL:',error.message);process.exitCode=1;}).finally(async()=>{clearTimeout(timeout);if(child.exitCode===null&&child.signalCode===null)child.kill();await exited;fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});});
