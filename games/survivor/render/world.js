function drawBossMoves() {
  for (const move of state.bossMoves) {
    ctx.save(); ctx.strokeStyle = "#c8354b"; ctx.fillStyle = move.active ? "rgba(220,65,83,.38)" : "rgba(220,65,83,.15)"; ctx.lineWidth = 3;
    if (bossKind(move) === "dash") {
      ctx.lineWidth = state.boss.r * 2; ctx.strokeStyle = "rgba(220,65,83,.18)";
      ctx.beginPath(); ctx.moveTo(move.x, move.y); ctx.lineTo(move.endX, move.endY); ctx.stroke();
      ctx.lineWidth = 4; ctx.strokeStyle = "#c8354b"; ctx.beginPath(); ctx.moveTo(move.x, move.y); ctx.lineTo(move.endX, move.endY); ctx.stroke();
    } else if (bossKind(move) === "rain" || bossKind(move) === "call") {
      for (const point of move.points) {
        ctx.beginPath(); ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (bossKind(move) === "rain") {
          const height = move.active ? 0 : move.warning / bossDefinition(move).warning * 70;
          ctx.fillStyle = "#fff8dd"; ctx.fillRect(point.x - 12, point.y - height - 16, 24, 30); ctx.strokeRect(point.x - 12, point.y - height - 16, 24, 30);
          ctx.fillStyle = "#713809"; ctx.font = "bold 16px system-ui"; ctx.textAlign = "center"; ctx.fillText("考", point.x, point.y - height + 5);
          ctx.fillStyle = move.active ? "rgba(220,65,83,.38)" : "rgba(220,65,83,.15)";
        }
      }
    } else if (bossKind(move) === "ring") {
      for (const point of ringPoints(move.active ? move : { ...move, life: bossDefinition(move).duration })) {
        ctx.font = "bold 20px system-ui"; ctx.textAlign = "center"; ctx.fillStyle = move.active ? "#b42f54" : "#78626b"; ctx.fillText("字", point.x, point.y + 7);
      }
      {
        const radius = move.active ? Math.hypot(ringPoints(move)[0].x - move.x, ringPoints(move)[0].y - move.y) : move.radius;
        ctx.strokeStyle = "#16804b"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(move.x, move.y, radius, move.angle - bossDefinition(move).gap / 2, move.angle + bossDefinition(move).gap / 2); ctx.stroke();
      }
    } else if (bossKind(move) === "words" || bossKind(move) === "chalk") {
      const spread = bossDefinition(move).spread;
      for (let n = 0; n < move.count; n++) {
        const angle = move.angle + (n - (move.count - 1) / 2) * spread;
        ctx.beginPath(); ctx.moveTo(move.x, move.y); ctx.lineTo(move.x + Math.cos(angle) * 170, move.y + Math.sin(angle) * 170); ctx.stroke();
      }
    } else { ctx.beginPath(); ctx.arc(move.x, move.y, 50, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    const name = BOSS_MOVES.find(row => row.id === move.id).name;
    ctx.font = "bold 17px system-ui"; ctx.textAlign = "center"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 4;
    ctx.strokeText(name + (move.active ? "！" : "…"), move.x, move.y - 44); ctx.fillStyle = "#9e253c"; ctx.fillText(name + (move.active ? "！" : "…"), move.x, move.y - 44);
    ctx.restore();
  }
}


const BACKGROUND_TILES = {};
function backgroundTile(kind) {
  if (BACKGROUND_TILES[kind]) return BACKGROUND_TILES[kind];
  const tile = document.createElement("canvas"); tile.width = 336; tile.height = 252;
  const g = tile.getContext("2d"); g.imageSmoothingEnabled = false;
  if (kind === "classroom") {
    g.fillStyle = "#d8cba8"; g.fillRect(0,0,336,252);
    for (let y=0;y<252;y+=42) for(let x=0;x<336;x+=42) {
      g.fillStyle = (x+y)%84 ? "#ddcfaf" : "#d3c49f"; g.fillRect(x+1,y+1,40,40);
    }
    // 課桌與椅子是地板裝飾，不影響碰撞或走路。
    for (const x of [72,240]) {
      g.fillStyle="#88734e";g.fillRect(x-25,82,54,34);
      g.fillStyle="#b58852";g.fillRect(x-28,76,56,30);
      g.fillStyle="#edc787";g.fillRect(x-24,80,48,8);
      g.fillStyle="#8f714f";g.fillRect(x-16,124,32,14);
    }
  } else {
    g.fillStyle="#8bb978";g.fillRect(0,0,336,252);
    g.fillStyle="#7eaa6d";
    for(let y=12;y<252;y+=28) for(let x=8;x<336;x+=42) g.fillRect(x,y,8,4);
    g.fillStyle="#bf7961";g.fillRect(0,140,336,100);
    g.fillStyle="#f7dfb6";for(let y=150;y<240;y+=28)g.fillRect(0,y,336,3);
    g.fillStyle="#ad925f";g.fillRect(100,30,120,70);
    g.fillStyle="#e6ce91";g.fillRect(104,34,112,62);
    g.fillStyle="#c6ad77";for(let x=112;x<204;x+=20)g.fillRect(x,46,8,3);
  }
  BACKGROUND_TILES[kind] = tile; return tile;
}
function drawClassroom() {
  const kind = currentStage().background, tile = backgroundTile(kind);
  const left = Math.max(0, Math.floor(state.cameraX/336)*336);
  const top = Math.max(0, Math.floor(state.cameraY/252)*252);
  ctx.save(); ctx.beginPath(); ctx.rect(0,0,state.worldWidth,state.worldHeight); ctx.clip();
  for(let y=top;y<Math.min(state.worldHeight,state.cameraY+state.height);y+=252)
    for(let x=left;x<Math.min(state.worldWidth,state.cameraX+state.width);x+=336) ctx.drawImage(tile,x,y);
  ctx.restore();
  ctx.strokeStyle = kind === "classroom" ? "#82795e" : "#52734e"; ctx.lineWidth = 16;
  ctx.strokeRect(0,0,state.worldWidth,state.worldHeight);
  if(kind === "classroom") {
    ctx.fillStyle="#b59c72";ctx.fillRect(40,12,state.worldWidth-80,18);
    ctx.fillStyle="#385e53";ctx.fillRect(state.worldWidth/2-100,12,200,48);
    ctx.fillStyle="#dae6c8";ctx.fillRect(state.worldWidth/2-80,28,54,4);ctx.fillRect(state.worldWidth/2-80,40,110,4);
  }
}

function drawHero() {
  const p = state.player;
  // 遊戲時間暫停時，彈跳與受傷閃爍也一起停下來。
  const hurt = p.invincible > 0;
  const hop = p.moving ? Math.abs(Math.sin(p.walkPhase)) * 2 : 0;
  const sway = p.moving ? Math.sin(p.walkPhase) * 0.055 : 0;
  ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y));
  ctx.fillStyle = "rgba(36,57,67,.22)";
  ctx.beginPath(); ctx.ellipse(0, p.r * .85, p.r * .9 - hop, p.r * .25, 0, 0, Math.PI * 2); ctx.fill();
  if (hurt && p.hitFlash <= 0 && Math.floor(state.elapsed / 0.09) % 2 === 0) ctx.globalAlpha = 0.45;
  ctx.translate(0, -Math.round(hop)); ctx.rotate(sway); ctx.scale(p.facing, 1);
  const sprite = SPRITES.player;
  if (sprite) ctx.drawImage(sprite, -p.r, -p.r, p.r * 2, p.r * 2);
  else {
    // 原生 20×24、放大兩倍：尖葉在上，身體仍以碰撞圓為中心。
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hurt ? HERO_PICTURES.hurt : HERO_PICTURES.happy, -20, -30, 40, 48);
  }
  ctx.restore();
}

function drawBlob(x, y, r, color, bounce, flash, enemyId = "jaben", drawingContext = ctx) {
  drawingContext.save(); drawingContext.translate(x, y + Math.sin(bounce) * 2);
  const sprite = SPRITES[enemyId];
  if (sprite) {
    if (flash) drawingContext.globalAlpha = 0.55 + Math.abs(Math.sin(performance.now() / 25)) * 0.45;
    drawingContext.drawImage(sprite, -r, -r, r * 2, r * 2); drawingContext.restore(); return;
  }
  drawingContext.fillStyle = "rgba(36,57,67,.22)"; drawingContext.beginPath(); drawingContext.ellipse(1, r * .82, r * .9, r * .27, 0, 0, Math.PI * 2); drawingContext.fill();
  if (flash) drawingContext.globalAlpha = 0.55 + Math.abs(Math.sin(performance.now() / 25)) * 0.45;
  drawingContext.fillStyle = flash ? "#fff" : color; drawingContext.strokeStyle = "#87522f"; drawingContext.lineWidth = 3;
  drawingContext.beginPath();
  drawingContext.rect(-r * .82, -r * .8, r * 1.64, r * 1.6); drawingContext.fill(); drawingContext.stroke();
  drawingContext.fillStyle = "#f0bb80"; drawingContext.fillRect(-r * .5, -r * .55, r, r * .28);
  drawingContext.globalAlpha = 1;
  drawingContext.fillStyle = "#fff"; drawingContext.beginPath(); drawingContext.arc(-r * .3, -r * .12, r * .23, 0, Math.PI * 2); drawingContext.arc(r * .3, -r * .12, r * .23, 0, Math.PI * 2); drawingContext.fill();
  drawingContext.fillStyle = "#243746"; drawingContext.beginPath(); drawingContext.arc(-r * .27, -r * .1, r * .1, 0, Math.PI * 2); drawingContext.arc(r * .33, -r * .1, r * .1, 0, Math.PI * 2); drawingContext.fill();
  drawingContext.strokeStyle = "#243746"; drawingContext.lineWidth = 1.7; drawingContext.beginPath(); drawingContext.arc(0, r * .17, r * .16, .15, Math.PI - .15); drawingContext.stroke();
  drawingContext.restore();
}

// 只用舊版 iPad 也支援的 Canvas API；線寬至少 3px，避免手機上看不見。
function strokeRing(x, y, radius, color, width = 3) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2); ctx.stroke();
}
function drawBolt(x, y, x2, y2) {
  const dx = x2 - x, dy = y2 - y, length = Math.max(1, Math.hypot(dx, dy));
  // 固定折線，不每幀亂跳；暫停時畫面也會完全停住。
  for (const [color, width] of [["#69309b", 7], ["#fff6a0", 3]]) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 1; i < 6; i++) { const offset = (i % 2 ? 1 : -1) * Math.min(12, length * .18); ctx.lineTo(x + dx * i / 6 - dy / length * offset, y + dy * i / 6 + dx / length * offset); }
    ctx.lineTo(x2, y2); ctx.stroke();
  }
}
function drawSwirl(x, y, radius, phase) {
  ctx.strokeStyle = "#23815e"; ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(x, y, radius * (1 - i * .23), phase + i, phase + i + Math.PI * 1.5); ctx.stroke();
  }
}
function drawFields() {
  for (const field of state.fields) {
    ctx.save();
    ctx.globalAlpha = Math.min(.3, field.life * .6); ctx.fillStyle = BUILD_TUNING[field.school].color;
    ctx.beginPath(); ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = Math.min(1, field.life * 3);
    if (field.school === "water") {
      strokeRing(field.x, field.y, field.radius, "#237bc2");
      for (let i = -1; i <= 1; i++) { ctx.strokeStyle = "#e5faff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(field.x, field.y + i * field.radius * .35, field.radius * .65, 4, 0, 0, Math.PI); ctx.stroke(); }
      if (effectLevel("fusion-puddle")) drawBolt(field.x - field.radius * .5, field.y, field.x + field.radius * .5, field.y);
    } else if (field.school === "wind") drawSwirl(field.x, field.y, field.radius, state.elapsed * 5);
    else {
      strokeRing(field.x, field.y, field.radius, "#23815e"); // 閃電衝刺：風＋雷。
      drawBolt(field.x - field.radius * .6, field.y + 8, field.x + field.radius * .6, field.y - 8);
    }
    ctx.restore();
  }
}
function drawTargetStatus(target) {
  ctx.save();
  if (target.slowTimer > 0) {
    ctx.fillStyle = "rgba(45,166,255,.32)"; ctx.beginPath(); ctx.arc(target.x, target.y, target.r + 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#126fc0";
    for (let i = -1; i <= 1; i++) {
      const y = target.y + target.r + 4 + ((state.elapsed * 18 + i * 4) % 9);
      ctx.beginPath(); ctx.moveTo(target.x + i * 10, y - 5); ctx.lineTo(target.x + i * 10 - 3, y); ctx.arc(target.x + i * 10, y, 3, 0, Math.PI); ctx.fill();
    }
  }
  if (target.stunTimer > 0) {
    ctx.font = "bold 19px system-ui"; ctx.textAlign = "center"; ctx.strokeStyle = "#765013"; ctx.lineWidth = 3; ctx.fillStyle = "#ffe84a";
    for (let i = 0; i < 3; i++) { const a = state.elapsed * 4 + i * Math.PI * 2 / 3, x = target.x + Math.cos(a) * 19, y = target.y - target.r - 17 + Math.sin(a) * 5; ctx.strokeText("★", x, y); ctx.fillText("★", x, y); }
  }
  ctx.restore();
}
function drawSupportVisuals() {
  const p = state.player;
  ctx.save();
  if (effectLevel("bubble-shield")) { ctx.globalAlpha = .65; strokeRing(p.x, p.y, p.r + 9, "#267dbe"); ctx.globalAlpha = 1; }
  if (effectLevel("gem-magnet")) {
    // 三段吸力弧標示真正的吸取半徑，不用整片光圈遮住敵人。
    const radius = GEM_PULL_RADIUS * (1 + effectLevel("gem-magnet") * UPGRADE_TUNING.magnetPerLevel);
    ctx.strokeStyle = "rgba(130,69,163,.5)"; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) { const a = state.elapsed + i * Math.PI * 2 / 3; ctx.beginPath(); ctx.arc(p.x, p.y, radius, a, a + .35); ctx.stroke(); }
  }
  if (p.moving && (effectLevel("onion-dash") || effectLevel("wind-speed"))) {
    ctx.strokeStyle = effectLevel("wind-speed") ? "#23815e" : "#8754ad"; ctx.lineWidth = 3;
    for (const offset of [-10, 0, 10]) { ctx.beginPath(); ctx.moveTo(p.x - state.faceX * 20 - state.faceY * offset, p.y - state.faceY * 20 + state.faceX * offset); ctx.lineTo(p.x - state.faceX * 42 - state.faceY * offset, p.y - state.faceY * 42 + state.faceX * offset); ctx.stroke(); }
  }
  ctx.restore();
}
function drawSkillVisuals() {
  for (const v of state.vfx) {
    ctx.save(); ctx.globalAlpha = Math.min(1, v.life / v.maxLife * 2);
    const progress = 1 - v.life / v.maxLife;
    if (v.kind === "maker-ring") {
      ctx.lineWidth=5; ctx.strokeStyle="#7b54be"; ctx.beginPath(); ctx.arc(v.x,v.y,v.radius,v.gap/2,Math.PI*2-v.gap/2); ctx.stroke();
      ctx.strokeStyle="#16804b";ctx.beginPath();ctx.arc(v.x,v.y,v.radius,-v.gap/2,v.gap/2);ctx.stroke();
    } else if (v.kind === "lightning") drawBolt(v.x, v.y, v.x2, v.y2);
    else if (v.kind === "gust") {
      const angle = Math.atan2(v.y2 - v.y, v.x2 - v.x);
      ctx.translate(v.x, v.y); ctx.rotate(angle); ctx.strokeStyle = v.color; ctx.lineWidth = 4;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-15 + progress * 20, i * 9); ctx.lineTo(20 + progress * 25, i * 12); ctx.lineTo(13 + progress * 25, i * 12 - 5); ctx.stroke(); }
    } else if (v.kind === "card") {
      strokeRing(v.x, v.y + 38, 22 + progress * 25, v.color);
      SurvivorIcons.draw(ctx, v.text, v.x - 12, v.y - 24 - progress * 20, 24);
    } else if (v.kind === "sparkle") {
      ctx.strokeStyle = "#7737b0"; ctx.lineWidth = 5;
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(v.x + Math.cos(a) * 5, v.y + Math.sin(a) * 5); ctx.lineTo(v.x + Math.cos(a) * v.radius, v.y + Math.sin(a) * v.radius); ctx.stroke(); }
      strokeRing(v.x, v.y, 5, v.color, 4);
    } else {
      strokeRing(v.x, v.y, v.radius * (.25 + progress * .75), v.color, 4);
      if (v.kind === "discharge") {
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; drawBolt(v.x + Math.cos(a) * v.radius * .5, v.y + Math.sin(a) * v.radius * .5, v.x + Math.cos(a) * v.radius, v.y + Math.sin(a) * v.radius); }
      } else {
        ctx.fillStyle = "#168cff";
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = v.radius * progress; ctx.beginPath(); ctx.arc(v.x + Math.cos(a) * r, v.y + Math.sin(a) * r, 4, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    ctx.restore();
  }
}
function drawUltimate() {
  const v = state.ultimateVisual; if (!v) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, v.life * 4);
  if (v.school === "water") {
    // 浪的位置依整張世界地圖前進；移動鏡頭不會把浪黏在螢幕上。
    const x = v.worldWidth * (1 - v.life / 1.2);
    ctx.fillStyle = "rgba(35,123,194,.38)"; ctx.fillRect(x - 130, 0, 150, v.worldHeight);
    ctx.strokeStyle = "#ecfdff"; ctx.lineWidth = 8; ctx.beginPath();
    for (let y = 0; y <= v.worldHeight; y += 14) { const edge = x + Math.sin(y / 24) * 17; if (!y) ctx.moveTo(edge, y); else ctx.lineTo(edge, y); } ctx.stroke();
  } else if (v.school === "wind") {
    // 倒錐形、四層旋轉風圈，和地上小旋風容易區分。
    ctx.fillStyle = "rgba(92,205,158,.35)"; ctx.beginPath(); ctx.moveTo(v.x, v.y + 18); ctx.lineTo(v.x - 45, v.y - 75); ctx.lineTo(v.x + 45, v.y - 75); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 4; i++) drawSwirl(v.x, v.y - i * 22, 14 + i * 10, state.elapsed * 7 + i);
  } else {
    ctx.fillStyle = "#64557e"; ctx.strokeStyle = "#e8dcff"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(v.x, v.y - 94, 46, 23, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(v.x + i * 23, v.y - 102, 18, 0, Math.PI * 2); ctx.fill(); }
    drawBolt(v.x, v.y - 80, v.x, v.y); strokeRing(v.x, v.y, 22, "#9755bb", 4);
  }
  ctx.restore();
}

function render() {
  updateCamera();
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();
  const shake = gameSettings.vibration && state.bossShake > 0 ? BOSS_TUNING.shakePixels : 0;
  ctx.translate(-state.cameraX + Math.sin(state.elapsed * 91) * shake, -state.cameraY + Math.cos(state.elapsed * 83) * shake);
  drawClassroom();
  drawBossMoves();
  drawFields();
  drawSupportVisuals();
  for (const shot of state.projectiles) {
    if (!shot.alive) continue;
    ctx.fillStyle = shot.schools && shot.schools.length ? BUILD_TUNING[shot.schools[0]].color : WATER_COLOR; ctx.strokeStyle = "#0759a8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (shot.schools && shot.schools.includes("wind")) {
      const speed = Math.max(1, Math.hypot(shot.vx, shot.vy));
      ctx.strokeStyle = "#23815e"; ctx.lineWidth = 3;
      for (const offset of [-6, 6]) { ctx.beginPath(); ctx.moveTo(shot.x, shot.y + offset); ctx.lineTo(shot.x - shot.vx / speed * 30, shot.y - shot.vy / speed * 30 + offset); ctx.stroke(); }
    }
    if (shot.schools && shot.schools.includes("thunder")) drawBolt(shot.x - 5, shot.y - 12, shot.x + 5, shot.y + 12);
    if (shot.piercing) {
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.r + 4, 0, Math.PI * 2); ctx.stroke();
      const speed = Math.max(1, Math.hypot(shot.vx, shot.vy));
      ctx.beginPath(); ctx.moveTo(shot.x - shot.vx / speed * (shot.r + 5), shot.y - shot.vy / speed * (shot.r + 5));
      ctx.lineTo(shot.x - shot.vx / speed * (shot.r + 15), shot.y - shot.vy / speed * (shot.r + 15)); ctx.stroke();
    }
  }
  for (const gem of state.gems) {
    ctx.save(); ctx.translate(gem.x, gem.y + Math.sin(gem.wobble) * 2); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = GEM_COLOR; ctx.strokeStyle = "#a65300"; ctx.lineWidth = 2; ctx.fillRect(-7, -7, 14, 14); ctx.strokeRect(-7, -7, 14, 14);
    ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.fillRect(-4, -4, 3, 3); ctx.restore();
  }
  for (const shot of state.enemyShots) {
    ctx.save(); ctx.textAlign = "center";
    if (shot.source === "book") {
      // 小兵是橘色方紙上的單字；老師仍是粉紅色詞句。
      ctx.fillStyle = "#fff3cc"; ctx.strokeStyle = "#a85c13"; ctx.lineWidth = 2;
      ctx.fillRect(shot.x - 12, shot.y - 12, 24, 24); ctx.strokeRect(shot.x - 12, shot.y - 12, 24, 24);
      ctx.font = "bold 20px system-ui"; ctx.textBaseline = "middle"; ctx.fillStyle = "#713809"; ctx.fillText(shot.text, shot.x, shot.y);
    } else if (shot.text === "粉筆") {
      ctx.translate(shot.x, shot.y); ctx.rotate(Math.atan2(shot.vy, shot.vx));
      ctx.fillStyle = "#fff"; ctx.strokeStyle = "#b42f54"; ctx.lineWidth = 2;
      ctx.fillRect(-10, -4, 20, 8); ctx.strokeRect(-10, -4, 20, 8);
    } else {
      ctx.font = "bold 16px system-ui"; ctx.fillStyle = "#b42f54"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.strokeText(shot.text, shot.x, shot.y); ctx.fillText(shot.text, shot.x, shot.y);
    }
    ctx.restore();
  }
  if (state.boss) {
    const b = state.boss, x = b.x, y = b.y + Math.sin(b.wobble) * 2;
    ctx.fillStyle = "#3e2e35"; ctx.fillRect(x - 20, y - 33, 40, 10); ctx.fillRect(x - 25, y - 23, 8, 19);
    ctx.fillStyle = (b.flash || state.bossShout > 0) ? "#fff" : "#ffd7ad"; ctx.fillRect(x - 19, y - 22, 38, 29);
    ctx.fillStyle = "#263c5b"; ctx.fillRect(x - 24, y + 7, 48, 25);
    ctx.fillRect(x - 17, y - 12, 13, 9); ctx.fillRect(x + 4, y - 12, 13, 9); ctx.fillRect(x - 4, y - 9, 8, 3);
    ctx.fillStyle = "#fff"; ctx.fillRect(x - 25, y + 14, 15, 11); ctx.fillRect(x + 10, y + 14, 15, 11);
    ctx.fillStyle = "#293d51"; ctx.font = "bold 13px system-ui"; ctx.textAlign = "center"; ctx.fillText(state.bossShout > 0 ? "安靜！" : `${GAME_DATA.boss.name} · ${state.bossPhase}階段`, x, y + 52);
  }
  for (const hazard of state.enemyHazards) {
    ctx.strokeStyle = "#c8354b"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2); ctx.stroke();
    ctx.font = "18px system-ui"; ctx.fillStyle = "#c8354b"; ctx.fillText("注意！", hazard.x - 24, hazard.y);
  }
  for (const field of state.makerFields) { ctx.strokeStyle = "#7b54be"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(field.x, field.y, field.effect.radius, 0, Math.PI * 2); ctx.stroke(); }
  for (const enemy of state.enemies) {
    drawBlob(enemy.x, enemy.y, enemy.r, enemy.color, enemy.wobble, enemy.flash > 0, enemy.typeId);
    if (enemy.hp < enemy.maxHp) { ctx.fillStyle = "#fff"; ctx.fillRect(enemy.x - 15, enemy.y - enemy.r - 10, 30, 4); ctx.fillStyle = "#f16b68"; ctx.fillRect(enemy.x - 15, enemy.y - enemy.r - 10, 30 * enemy.hp / enemy.maxHp, 4); }
  }
  for (const target of combatTargets()) drawTargetStatus(target);
  if (state.bomb || state.bombBlast) {
    const bubble = state.bomb || state.bombBlast;
    const radius = state.bomb ? 24 + (1 - bubble.timer / bubble.delay) * 12 : bubble.radius * (1 - bubble.life / 0.35);
    ctx.fillStyle = "rgba(110,225,255,.25)"; ctx.strokeStyle = "#43aee9"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (state.bomb) { ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2); ctx.stroke(); }
  }
  if (state.dashTimer > 0) { ctx.strokeStyle = "#83eaff"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(state.player.x, state.player.y); ctx.lineTo(state.player.x - state.dashX * 45, state.player.y - state.dashY * 45); ctx.stroke(); }
  if (state.bombBlast && state.bombBlast.schools) for (const [index, school] of state.bombBlast.schools.entries()) {
    ctx.strokeStyle = BUILD_TUNING[school].color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(state.bombBlast.x, state.bombBlast.y, state.bombBlast.radius * (1 - state.bombBlast.life / .35) + 8 + index * 9, 0, Math.PI * 2); ctx.stroke();
  }
  drawUltimate();
  drawSkillVisuals();
  drawHero();
  for (const effect of state.effects) {
    const alpha = Math.max(0, effect.life / effect.maxLife); ctx.globalAlpha = alpha; ctx.fillStyle = effect.color;
    if (effect.kind === "water-hit") {
      ctx.strokeStyle = effect.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(effect.x, effect.y, 5 + (1 - alpha) * 15, 0, Math.PI * 2); ctx.stroke();
      ctx.font = "bold 16px system-ui"; ctx.textAlign = "center"; ctx.strokeStyle = "#2458a4"; ctx.lineWidth = 3; ctx.strokeText(effect.text, effect.x, effect.y - 14); ctx.fillText(effect.text, effect.x, effect.y - 14);
    }
    else if (effect.kind === "number") { ctx.font = "bold 15px system-ui"; ctx.textAlign = "center"; ctx.strokeStyle = "#355066"; ctx.lineWidth = 3; ctx.strokeText(effect.text, effect.x, effect.y); ctx.fillText(effect.text, effect.x, effect.y); }
    else if (effect.kind === "heal") { ctx.font = "bold 13px system-ui"; ctx.textAlign = "center"; ctx.fillText(effect.text, effect.x, effect.y); }
    else if (effect.kind === "evaporate") { ctx.beginPath(); ctx.ellipse(effect.x, effect.y, 13 * (1.5 - alpha), 18 * alpha, 0, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillRect(effect.x - 2, effect.y - 2, 4, 4); }
    ctx.globalAlpha = 1;
  }
  ctx.restore(); // 搖桿是螢幕座標，不跟著鏡頭捲動。
  drawBossGuide();
  if (state.mode === "transition") {
    ctx.fillStyle = "rgba(20,35,49,.78)"; ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#fff3cc"; ctx.font = "bold 28px system-ui"; ctx.textAlign = "center";
    ctx.fillText(`第${state.stageIndex + 1}關：${currentStage().name}`, state.width/2, state.height/2);
  }
  if (state.joy) {
    ctx.globalAlpha = .42; ctx.strokeStyle = "#173f62"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(state.joy.baseX, state.joy.baseY, 46, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#4186be"; ctx.beginPath(); ctx.arc(state.joy.baseX + state.joy.x * 27, state.joy.baseY + state.joy.y * 27, 19, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  }
}

// 使用螢幕座標，跟著鏡頭及橫向畫面尺寸定位；現階段只有老師，未加入新菁英。
function bossGuide() {
  if (!state.boss || targetVisible(state.boss)) return null;
  const dx = state.boss.x - state.cameraX - state.width / 2;
  const dy = state.boss.y - state.cameraY - state.height / 2;
  const halfW = Math.max(1, state.width / 2 - 30), halfH = Math.max(1, state.height / 2 - 30);
  const scale = 1 / Math.max(Math.abs(dx) / halfW, Math.abs(dy) / halfH, 1);
  return { x: state.width / 2 + dx * scale, y: state.height / 2 + dy * scale, angle: Math.atan2(dy, dx) };
}
function drawBossGuide() {
  if (state.mode !== "playing" && state.mode !== "paused" && state.mode !== "levelup") return;
  const guide = bossGuide();
  if (guide) {
    ctx.save(); ctx.translate(guide.x, guide.y);
    ctx.fillStyle = "#fff3cc"; ctx.strokeStyle = "#713809"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    SurvivorIcons.draw(ctx, "boss", -16, -16, 32);
    ctx.rotate(guide.angle); ctx.fillStyle = "#713809";
    ctx.beginPath(); ctx.moveTo(29, 0); ctx.lineTo(20, -7); ctx.lineTo(20, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  if (state.boss && state.bossIntro > 0) {
    ctx.save(); ctx.font = "bold 24px system-ui"; ctx.textAlign = "center";
    ctx.strokeStyle = "#fff3cc"; ctx.lineWidth = 6; ctx.strokeText(GAME_DATA.boss.name + "來了！", state.width / 2, state.height / 2 - 50);
    ctx.fillStyle = "#713809"; ctx.fillText(GAME_DATA.boss.name + "來了！", state.width / 2, state.height / 2 - 50); ctx.restore();
  }
}


// Live accessors preserve shared state and the legacy globals used by preview/VM callers.
globalThis.Survivor.render = globalThis.Survivor.render || {};
globalThis.Survivor.render.world = globalThis.Survivor.render.world || {};
Object.defineProperties(globalThis.Survivor.render.world, {
  drawBossMoves: { enumerable: true, get: () => drawBossMoves },
  BACKGROUND_TILES: { enumerable: true, get: () => BACKGROUND_TILES },
  backgroundTile: { enumerable: true, get: () => backgroundTile },
  drawClassroom: { enumerable: true, get: () => drawClassroom },
  drawHero: { enumerable: true, get: () => drawHero },
  drawBlob: { enumerable: true, get: () => drawBlob },
  strokeRing: { enumerable: true, get: () => strokeRing },
  drawBolt: { enumerable: true, get: () => drawBolt },
  drawSwirl: { enumerable: true, get: () => drawSwirl },
  drawFields: { enumerable: true, get: () => drawFields },
  drawTargetStatus: { enumerable: true, get: () => drawTargetStatus },
  drawSupportVisuals: { enumerable: true, get: () => drawSupportVisuals },
  drawSkillVisuals: { enumerable: true, get: () => drawSkillVisuals },
  drawUltimate: { enumerable: true, get: () => drawUltimate },
  render: { enumerable: true, get: () => render },
  bossGuide: { enumerable: true, get: () => bossGuide },
  drawBossGuide: { enumerable: true, get: () => drawBossGuide }
});
