// 舊配方回歸共用新擊退接合層；此卡的滑動與碰撞由 knockback-slide / wave-ball-text 驗證。
module.exports=source=>source
 .replace(/    if \(enemy\.knockback > 0\).*\n/g,'')
 .replace('  updateSkillVisuals(dt);','  for(const target of [state.player,...state.enemies.filter(e=>e.alive),...(state.boss?[state.boss]:[])]) updateTargetSlide(target,dt);\n  if(state.mode!=="playing") return;\n  updateCamera();\n  updateSkillVisuals(dt);')
 .replace('damageEnemy(enemy, bomb.damage);\n    if (enemy.alive) { pushAway(enemy); enemy.knockback = 0; }','const previous=enemy.slide; damageEnemy(enemy,bomb.damage); enemy.slide=previous; if(enemy.alive)pushAway(enemy);');
