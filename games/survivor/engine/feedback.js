// 可序列化回饋設定 → 表現；不改命中、傷害或時機。
globalThis.SurvivorFeedback = {
  scale(config,intensity,heavy=false) {
    return {stop:.05*intensity*(heavy?1.5:1)*config.hitStop,
      shake:.12*intensity*config.shake,pixels:2*intensity*(heavy?1.5:1)*config.shake};
  }
};
function moveFeedback(owner,id='primary') {
  const f=owner && (owner.blocks && owner.blocks.moves.find(m=>m.id===id) || {}).feedback || owner && owner.feedback && owner.feedback[id] || {};
  return {warningStyle:'original',slash:true,hitStop:['phase','legacy','move'].includes(id)?0:1,shake:['phase','legacy'].includes(id)?0:1,hint:true,...f};
}
function feedbackSound(config,fallback) {const sound=config.sound===undefined?fallback:config.sound;if(sound!=='none')playSound(sound);}
function enemyFeedback(enemy,id='phase') {return moveFeedback(ENEMY_TYPES.find(t=>t.id===enemy.typeId),id);}
function weaponFeedback(event={}) {
  const w=activeWeapon(),id=event.feedbackId || (event.charged?'charge':event.dash?'dash':event.heavy?'combo':'primary');
  const f=moveFeedback(w,id),impact=w.kind==='melee' && (id!=='special'||w.specialKind==='leap');
  if(!w.blocks && !w.feedback) {f.hitStop=impact?1:0;f.shake=impact?1:0;}
  return f;
}
function warningFeedback(config,clock) {
  if(config.warningStyle==='outline') ctx.fillStyle='rgba(0,0,0,0)';
  if(config.warningStyle==='pulse') ctx.globalAlpha*=.55+.45*Math.abs(Math.sin(clock*10));
}

function feedbackImpact(config,shake=true) {
  if(!config)return;
  const h=GAME_DATA.hitJuice,strength=h.enabled?h.intensity:0;
  const scaled=SurvivorFeedback.scale(shake?config:{...config,shake:0},strength);
  state.hitStop=Math.max(state.hitStop||0,scaled.stop);
  state.hitShake=Math.max(state.hitShake||0,scaled.shake);
  state.hitShakePixels=Math.max(state.hitShakePixels||0,scaled.pixels);
}
function feedbackPayload(f) {
  return f.hitStop || f.shake || f.warningStyle!=='original' || !f.slash || !f.hint ? f : undefined;
}
Survivor.engine.feedback={rules:SurvivorFeedback,moveFeedback,feedbackSound,feedbackImpact};

function bossFeedbackShake(move) {
  const f=moveFeedback(bossDefinition(move),'move'),h=GAME_DATA.hitJuice;
  const strength=h.enabled?h.intensity:0;
  if(!f.shake || !strength)return;
  const seconds=BOSS_TUNING.shakeSeconds*strength;
  if(seconds>=(state.hitShake||0))state.hitShakePixels=BOSS_TUNING.shakePixels*f.shake*strength;
  state.hitShake=Math.max(state.hitShake||0,seconds);
}
