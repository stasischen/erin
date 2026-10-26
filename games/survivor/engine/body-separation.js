// 可移植純規則：世界單位／秒；不改輸入，不讀 DOM、亂數或遊戲狀態。
(function(root) {
  const wrap=(v,s)=>s>0?((v%s)+s)%s:v;
  const delta=(a,b,s)=>s>0?wrap(a-b+s/2,s)-s/2:a-b;
  function solve(input) {
    const {config:c,world:w,dt}=input;
    const player={...input.player}, bodies=input.bodies.map(b=>({...b}));
    let checks=0;
    if(!c.enabled || dt<=0) return {player,bodies,checks};
    const alpha=Math.min(1,dt*60), radius=b=>b.r*c.radiusScale;
    const visible=b=>!input.view || Math.abs(delta(b.x,input.view.x,w.width))<input.view.width/2+b.r && Math.abs(delta(b.y,input.view.y,w.height))<input.view.height/2+b.r;
    // 每隻怪整幀最多移動不足半個半徑，不連鎖傳送、也不靠分離從畫面外生成。
    const origins=bodies.map(b=>({...b}));
    function move(i,dx,dy) {
      const b=bodies[i],o=origins[i];if(b.pinned)return;
      const limit=Math.min(b.r*.45,720*dt);
      let x=delta(b.x,o.x,w.width)+dx,y=delta(b.y,o.y,w.height)+dy;
      const d=Math.hypot(x,y); if(d>limit){x*=limit/d;y*=limit/d;}
      const next={r:b.r,x:wrap(o.x+x,w.width),y:wrap(o.y+y,w.height)};
      if(!visible(o)&&visible(next)) return;
      b.x=next.x;b.y=next.y;
    }
    // 有限空間格：只找相鄰九格，每隻最多檢查 32 個候選者。
    const cell=Math.max(1,...bodies.map(b=>radius(b)*2));
    const cols=Math.max(1,Math.floor(w.width/cell)),rows=Math.max(1,Math.floor(w.height/cell));
    const cw=w.width/cols,ch=w.height/rows,grid=new Map();
    const key=(x,y)=>wrap(x,cols)+','+wrap(y,rows);
    bodies.forEach((b,i)=>{const k=key(Math.floor(b.x/cw),Math.floor(b.y/ch));if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i);});
    bodies.forEach((a,i)=>{
      const cx=Math.floor(a.x/cw),cy=Math.floor(a.y/ch),seen=new Set();let count=0;
      for(let y=-1;y<=1;y++) for(let x=-1;x<=1;x++) {
        const k=key(cx+x,cy+y);if(seen.has(k))continue;seen.add(k);
        for(const j of grid.get(k)||[]) {
          if(j<=i)continue;
          if(count++>=32)return;
          checks++;
          const b=bodies[j],dx=delta(b.x,a.x,w.width),dy=delta(b.y,a.y,w.height),d=Math.hypot(dx,dy);
          const overlap=radius(a)+radius(b)-d;
          if(overlap<=0)continue;
          const nx=d?dx/d:1,ny=d?dy/d:0,amount=overlap*c.enemyForce*alpha;
          const share=b.mass/(a.mass+b.mass);
          move(i,-nx*amount*share,-ny*amount*share);move(j,nx*amount*(1-share),ny*amount*(1-share));
        }
      }
    });
    if(!input.passThrough) {
      // 大怪擋住主角自己走入的路線；回退自己的移動不算怪群推人。
      if(input.previous && c.playerForce>0) for(const b of bodies) if(b.mass>=8) {
        const sx=delta(input.previous.x,b.x,w.width),sy=delta(input.previous.y,b.y,w.height);
        const vx=delta(player.x,input.previous.x,w.width),vy=delta(player.y,input.previous.y,w.height);
        const r=radius(player)+radius(b),a=vx*vx+vy*vy,near=sx*vx+sy*vy;
        const disc=near*near-a*(sx*sx+sy*sy-r*r);
        if(a>0 && near<0 && sx*sx+sy*sy>=r*r-1e-6 && disc>=0) {
          const t=Math.max(0,(-near-Math.sqrt(disc))/a);
          if(t<=1){player.x=wrap(input.previous.x+vx*t,w.width);player.y=wrap(input.previous.y+vy*t,w.height);}
        }
      }
      // 整群共用主角推移預算（每秒最多 12 單位），數量增加不會加倍。
      let budget=12*dt;
      bodies.forEach((b,i)=>{
        const dx=delta(b.x,player.x,w.width),dy=delta(b.y,player.y,w.height),d=Math.hypot(dx,dy);
        const overlap=radius(player)+radius(b)-d;
        if(overlap<=0)return;
        const nx=d?dx/d:1,ny=d?dy/d:0,amount=overlap*c.playerForce*alpha;
        const push=Math.min(budget,amount*b.mass/(40+b.mass));budget-=push;
        player.x=wrap(player.x-nx*push,w.width);player.y=wrap(player.y-ny*push,w.height);
        move(i,nx*(amount-push),ny*(amount-push));
      });
    }
    return {player,bodies,checks};
  }
  // 純資料輸入；boss/miniboss 旗標優先於沿用的小怪 typeId。
  function mass(target,config) {
    return target.boss ? config.bossMass : target.miniboss ? config.minibossMass : target.mass ?? (target.behavior==='tank'?8:1);
  }
  // 有號世界距離（或速度）；multiplier 是未來精英霸體的 hook，0 表示免疫。
  function displacement(distance,mass,config,multiplier=1) {
    return distance * multiplier * (config.enabled ? 1/(1+(mass-1)*config.strength) : 1);
  }
  root.SurvivorBodies={solve,mass,displacement};
})(globalThis);

function separateEnemyBodies(dt,previous,passThrough) {
  if(state.bossIntro>0 || !GAME_DATA.bodySeparation.enabled)return;
  const refs=state.enemies.filter(e=>e.alive);
  if(state.boss && targetVisible(state.boss))refs.push(state.boss);
  const result=SurvivorBodies.solve({config:GAME_DATA.bodySeparation,dt,
    world:{width:state.worldWidth,height:state.worldHeight},
    view:{x:state.player.x,y:state.player.y,width:state.width,height:state.height},
    previous,passThrough,player:{x:state.player.x,y:state.player.y,r:state.player.r},
    bodies:refs.map(e=>({x:e.x,y:e.y,r:e.r,pinned:e===state.boss,mass:targetMass(e)}))});
  state.player.x=result.player.x;state.player.y=result.player.y;
  result.bodies.forEach((b,i)=>{refs[i].x=b.x;refs[i].y=b.y;});
  updateCamera();
}

Survivor.engine["body-separation"]={rules:SurvivorBodies,separateEnemyBodies};

function targetMass(target) {
  const type=ENEMY_TYPES.find(e=>e.id===target.typeId);
  return SurvivorBodies.mass({boss:target===state.boss,miniboss:target.miniboss,
    mass:target.mass ?? (type && type.mass),behavior:target.behavior},GAME_DATA.knockback);
}
function targetDisplacement(target,distance) {
  const c=GAME_DATA.knockback;
  const armor=target.displacementMultiplier ?? 1;
  return SurvivorBodies.displacement(distance,targetMass(target),c,
    armor*(c.enabled && target===state.boss ? c.bossMultiplier : 1));
}
