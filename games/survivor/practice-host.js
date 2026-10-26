// 練習場與 Maker 共用 draft；每次輸入直接以目前已驗證的作品重播，不經儲存。
globalThis.SurvivorPractice = (()=>{
  let frame=null,host=null;
  function refresh(data) {
    if(!frame) return;
    const result=SurvivorData.validate(data);
    if(!result.valid) return;
    frame._practicePayload={data:SurvivorData.copy(result.data)};
    if(frame.contentWindow && frame.contentWindow.updatePracticeData) frame.contentWindow.updatePracticeData(frame._practicePayload.data);
  }
  function close() {
    if(host) host.remove();host=null;frame=null;
  }
  function open(data, container, onClose) {
    close();
    host=document.createElement('section');host.className='practice-dock';host.setAttribute('aria-label','招式練習場');
    const heading=document.createElement('header');
    const title=document.createElement('strong');title.textContent='招式練習場';
    const closeButton=document.createElement('button');closeButton.type='button';closeButton.className='practice-close';closeButton.innerHTML=SurvivorIcons.html('close');closeButton.setAttribute('aria-label','關閉練習場');closeButton.title='關閉練習場';closeButton.addEventListener('click',()=>{close();if(onClose)onClose();});
    frame=document.createElement('iframe');frame.title='招式練習場';refresh(data);
    frame.src=new URL('practice.html?v=20261026u',SurvivorPreview.base).href;
    heading.append(title,closeButton);host.append(heading,frame);container.appendChild(host);
  }
  return {open,close,refresh};
})();
