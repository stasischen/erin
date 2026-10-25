// 純資料；Maker 預設作品。修改玩法請從 Maker 開始。
globalThis.SURVIVOR_DEFAULTS = {
  "schemaVersion": 1,
  // ✏️ Erin 可以改：false 關掉角色外面的一像素深色線。
  "visuals": { "spriteOutline": true },
  // ✏️ Erin 可以改：精英抽選間隔／機率；大熊在每關老師出場時間的一半來訪。
  "elites": {
    "enabled": true, "interval": 18, "chance": 0.35, "limit": 3,
    "sizeScale": 1.25, "healthScale": 5, "rewardXp": 5,
    "shieldHits": 3, "auraRadius": 150, "auraSpeed": 1.35,
    "syrupInterval": 0.7, "syrupSeconds": 4, "syrupRadius": 28, "syrupSlow": 0.65,
    "teleportInterval": 7, "teleportWarning": 1.2, "teleportDistance": 150,
    "abilities": ["shield", "split", "haste", "syrup", "teleport"]
  },
  "chocobear": {
    "enabled": true, "name": "巧克力大熊", "stageFraction": 0.5,
    "hp": 450, "armor": 180, "radius": 34, "speed": 48, "damage": 12,
    "slamInterval": 4, "slamWarning": 1.2, "slamRadius": 82, "slamDamage": 18
  },
  "tuning": {
    "maxUpgradeLevel": 5,
    "levelupRerolls": 2,
    "splashBaseRadius": 22,
    "splashPerLevel": 10,
    "invincibleSeconds": 1,
    "waterSizePerLevel": 0.2,
    "damagePerLevel": 0.25,
    "fireRateReduction": 0.15,
    "extraShotAngle": 0.18,
    "moveSpeedPerLevel": 0.12,
    "magnetPerLevel": 0.4,
    "playerSpeed": 190,
    "playerHealth": 90,
    "enemyLimit": 26,
    "enemySpeed": 75,
    "enemyRadius": 17,
    "enemyDamage": 15,
    "enemyHealth": 120,
    "secondEnemySpeed": 105,
    "secondEnemyDamage": 12,
    "enemyShootLevel": 8,
    "enemyShotInterval": 3,
    "secondEnemyShotInterval": 5,
    "enemyShotSpeed": 110,
    "enemyShotDamage": 6,
    "enemyShotGap": 0.65,
    "enemyShotLimit": 12,
    "enemySpeedGrowth": 0.05,
    "secondEnemyHealth": 70,
    "waveSeconds": 120,
    "teacherHealth": 2000,
    "teacherShotDamage": 12,
    "teacherShotCount": 3,
    "teacherShotSpread": 0.28,
    "teacherShotLimit": 36,
    "shotInterval": 0.72,
    "projectileDamage": 35,
    "projectileSpeed": 390,
    "projectileLimit": 24,
    "gemLimit": 24,
    "gemPullRadius": 105,
    "xpToLevel": 5,
    "xpGrowthPerLevel": 1,
    "dashCooldown": 1.2,
    "dashCharges": 2,
    "dashInvincible": 0.18,
    "perfectWindow": 0.18,
    "perfectHeal": 2,
    "perfectShield": 0.35,
    "perfectSlowSeconds": 0.3,
    "perfectSlowScale": 0.35,
    "dashAttackSeconds": 1,
    "dashAttackDamage": 1.8,
    "dashAttackSize": 1.5,
    "dashSeconds": 0.15,
    "dashMultiplier": 3,
    "bombCooldown": 8,
    "bombDelay": 0.6,
    "bombDamage": 100,
    "bombRadius": 110,
    "bombKnockback": 55,
    "actionButtonSize": 88,
    "autoHealSeconds": 10
  },
  "build": {
    "water": {
      "name": "水",
      "color": "#237bc2"
    },
    "wind": {
      "name": "風",
      "color": "#23815e"
    },
    "thunder": {
      "name": "雷",
      "color": "#9755bb"
    },
    "splashDamageBase": 0.2,
    "splashDamageGrowth": 0.1,
    "chainGrowth": 0.25,
    "fieldRadiusGrowth": 0.1,
    "supportSplashDamage": 0.35,
    "healIntervalMultiplier": 0.8,
    "shieldHealthDivisor": 5,
    "ultimateSeconds": 10,
    "cloudSeconds": 2,
    "ultimateDamage": 80,
    "ultimateGrowth": 0.3,
    "tornadoRadius": 80,
    "tornadoSpeed": 2.5,
    "tornadoTick": 0.4,
    "attackRadius": 720,
    "shotRange": 720,
    "windSpeed": 0.18,
    "movingRate": 0.12,
    "stunSeconds": 0.5,
    "counterRadius": 130,
    "counterDamage": 25,
    "supportChance": 0.25,
    "slowSeconds": 1.2,
    "slowMultiplier": 0.55,
    "pushDistance": 28,
    "pullDistance": 38,
    "chainRadius": 100,
    "chainDamage": 0.5,
    "fieldSeconds": 2,
    "fieldRadius": 36,
    "fieldInterval": 0.4,
    "fieldDamage": 12,
    "fieldLimit": 18,
    "trailSpacing": 24,
    "skillRadiusMultiplier": 1.25,
    "skillDamageMultiplier": 0.5
  },
  // ✏️ Erin 可以改：老師戰紫霧。傷害是每秒扣血；速度是每秒縮幾格。
  "bossZone": { "enabled": true, "steps": 3, "speed": 40, "damage": 2 },
  "bossTuning": {
    "warningSeconds": 0.9,
    "rests": [
      1.7,
      1.2,
      0.8
    ],
    "phasePause": 1,
    "damage": 12,
    "chalkSpeed": 170,
    "dashSpeed": 420,
    "dashDistance": 300,
    "rainRadius": 34,
    "callRadius": 48,
    "ringRadius": 145,
    "ringGap": 1.8,
    "ringSeconds": 1.6,
    "hazardLimit": 8,
    "shakeSeconds": 0.18,
    "shakePixels": 3
  },
  "cards": [
    {
      "id": "big-water",
      "slot": "attack",
      "icon": "big-water",
      "name": "水球加大",
      "description": "水球更大、傷害更高",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "projectile",
          "feature": "big-water",
          "power": 1
        }
      ]
    },
    {
      "id": "rapid-water",
      "slot": "attack",
      "icon": "rapid-water",
      "name": "連發水球",
      "description": "發射速度提升",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "projectile",
          "feature": "rapid-water",
          "power": 1
        }
      ]
    },
    {
      "id": "multi-water",
      "slot": "attack",
      "icon": "multi-water",
      "name": "多重水球",
      "description": "每次多發一顆",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "projectile",
          "feature": "multi-water",
          "power": 1
        }
      ]
    },
    {
      "id": "onion-dash",
      "slot": "passive",
      "icon": "onion-dash",
      "name": "洋蔥衝刺",
      "description": "移動速度提升",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "stat",
          "feature": "onion-dash",
          "power": 1
        }
      ]
    },
    {
      "id": "bubble-shield",
      "slot": "passive",
      "icon": "bubble-shield",
      "name": "泡泡護盾",
      "description": "血條變長一點，並回一點血",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "stat",
          "feature": "bubble-shield",
          "power": 1
        }
      ]
    },
    {
      "id": "gem-magnet",
      "slot": "passive",
      "icon": "gem-magnet",
      "name": "寶石磁鐵",
      "description": "撿取範圍提升",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "stat",
          "feature": "gem-magnet",
          "power": 1
        }
      ]
    },
    {
      "id": "piercing-water",
      "slot": "attack",
      "icon": "piercing-water",
      "name": "穿透水球",
      "description": "水球多穿透一隻敵人",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "projectile",
          "feature": "piercing-water",
          "power": 1
        }
      ]
    },
    {
      "id": "splash-water",
      "slot": "attack",
      "icon": "splash-water",
      "name": "水花四濺",
      "description": "命中時造成小範圍傷害",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "aoe",
          "feature": "splash-water",
          "power": 1
        }
      ]
    },
    {
      "id": "auto-heal",
      "slot": "passive",
      "icon": "auto-heal",
      "name": "自動補血",
      "description": "慢慢恢復血條",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "heal",
          "feature": "auto-heal",
          "power": 1
        }
      ]
    },
    {
      "id": "water-attack",
      "school": "water",
      "slot": "attack",
      "tier": "entry",
      "icon": "water-attack",
      "name": "濺水入門",
      "description": "水球命中濺水花，升級擴大水花",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "aoe",
          "feature": "water-attack",
          "power": 1
        }
      ]
    },
    {
      "id": "water-skill",
      "school": "water",
      "slot": "skill",
      "requires": [
        "water-attack"
      ],
      "icon": "water-skill",
      "name": "水窪 A",
      "description": "水球落點與泡泡留下緩速水窪",
      "maxLevel": 5,
      "effects": [
        {
          "type": "slow",
          "feature": "water-skill",
          "power": 1
        }
      ]
    },
    {
      "id": "water-dash",
      "school": "water",
      "slot": "dash",
      "requires": [
        "water-attack"
      ],
      "icon": "water-dash",
      "name": "水痕 B",
      "description": "衝刺沿路留下緩速水痕",
      "maxLevel": 5,
      "effects": [
        {
          "type": "dash-trail",
          "feature": "water-dash",
          "power": 1
        }
      ]
    },
    {
      "id": "water-ultimate",
      "school": "water",
      "slot": "passive",
      "tier": "ultimate",
      "requires": [
        "water-skill",
        "water-dash"
      ],
      "icon": "water-ultimate",
      "name": "大海嘯",
      "description": "每 10 秒一道巨浪掃過全場",
      "maxLevel": 5,
      "effects": [
        {
          "type": "aoe",
          "feature": "water-ultimate",
          "power": 1
        }
      ]
    },
    {
      "id": "wind-attack",
      "school": "wind",
      "slot": "dash",
      "tier": "entry",
      "icon": "wind-attack",
      "name": "疾風入門",
      "description": "水球飛得更快、更遠",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "projectile",
          "feature": "wind-attack",
          "power": 1
        }
      ]
    },
    {
      "id": "wind-dash",
      "school": "wind",
      "slot": "dash",
      "requires": [
        "wind-attack"
      ],
      "icon": "wind-dash",
      "name": "旋風 A",
      "description": "衝刺旋風傷敵並推開敵人",
      "maxLevel": 5,
      "effects": [
        {
          "type": "dash-trail",
          "feature": "wind-dash",
          "power": 1
        }
      ]
    },
    {
      "id": "wind-speed",
      "school": "wind",
      "slot": "passive",
      "requires": [
        "wind-attack"
      ],
      "icon": "wind-speed",
      "name": "疾行 B",
      "description": "移動越快，水球發射越快",
      "maxLevel": 5,
      "effects": [
        {
          "type": "stat",
          "feature": "wind-speed",
          "power": 1
        }
      ]
    },
    {
      "id": "wind-ultimate",
      "school": "wind",
      "slot": "passive",
      "tier": "ultimate",
      "requires": [
        "wind-dash",
        "wind-speed"
      ],
      "icon": "wind-ultimate",
      "name": "環繞龍捲風",
      "description": "龍捲風繞主角旋轉，碰到就傷害",
      "maxLevel": 5,
      "effects": [
        {
          "type": "aoe",
          "feature": "wind-ultimate",
          "power": 1
        }
      ]
    },
    {
      "id": "thunder-attack",
      "school": "thunder",
      "slot": "skill",
      "tier": "entry",
      "icon": "thunder-attack",
      "name": "跳電入門",
      "description": "水球跳電到附近另一隻，升級更痛",
      "maxLevel": 5,
      "requires": [],
      "effects": [
        {
          "type": "chain",
          "feature": "thunder-attack",
          "power": 1
        }
      ]
    },
    {
      "id": "thunder-skill",
      "school": "thunder",
      "slot": "skill",
      "requires": [
        "thunder-attack"
      ],
      "icon": "thunder-skill",
      "name": "電泡泡 A",
      "description": "泡泡帶電，炸中讓敵人暈眩",
      "maxLevel": 5,
      "effects": [
        {
          "type": "stun",
          "feature": "thunder-skill",
          "power": 1
        }
      ]
    },
    {
      "id": "thunder-counter",
      "school": "thunder",
      "slot": "passive",
      "requires": [
        "thunder-attack"
      ],
      "icon": "thunder-counter",
      "name": "放電反擊 B",
      "description": "每次受傷放電反擊附近敵人",
      "maxLevel": 5,
      "effects": [
        {
          "type": "chain",
          "feature": "thunder-counter",
          "power": 1
        }
      ]
    },
    {
      "id": "thunder-ultimate",
      "school": "thunder",
      "slot": "passive",
      "tier": "ultimate",
      "requires": [
        "thunder-skill",
        "thunder-counter"
      ],
      "icon": "thunder-ultimate",
      "name": "雷雲",
      "description": "雷雲定期隨機劈中一隻敵人",
      "maxLevel": 5,
      "effects": [
        {
          "type": "chain",
          "feature": "thunder-ultimate",
          "power": 1
        }
      ]
    },
    {
      "id": "fusion-puddle",
      "school": "water",
      "slot": "skill",
      "tier": "fusion",
      "requires": [
        "water-skill",
        "thunder-attack"
      ],
      "icon": "fusion-puddle",
      "name": "導電水窪",
      "description": "水窪額外放電，升級增加電傷害",
      "maxLevel": 5,
      "effects": [
        {
          "type": "chain",
          "feature": "fusion-puddle",
          "power": 1
        }
      ]
    },
    {
      "id": "fusion-storm",
      "school": "wind",
      "slot": "dash",
      "tier": "fusion",
      "requires": [
        "wind-dash",
        "water-attack"
      ],
      "icon": "fusion-storm",
      "name": "暴風雨",
      "description": "旋風衝刺同時灑下傷敵水窪",
      "maxLevel": 5,
      "effects": [
        {
          "type": "dash-trail",
          "feature": "fusion-storm",
          "power": 1
        }
      ]
    },
    {
      "id": "fusion-dash",
      "school": "thunder",
      "slot": "dash",
      "tier": "fusion",
      "requires": [
        "wind-speed",
        "thunder-attack"
      ],
      "icon": "fusion-dash",
      "name": "閃電衝刺",
      "description": "衝刺留下會跳電的電痕",
      "maxLevel": 5,
      "effects": [
        {
          "type": "dash-trail",
          "feature": "fusion-dash",
          "power": 1
        }
      ]
    }
  ],
  "enemies": [
    {
      "id": "jaben",
      "name": "小熊軟糖",
      "spriteId": "gummy-bear",
      "color": "#d58b55",
      "speed": 75,
      "shadowSize": 0.9,
      "radius": 17,
      "damage": 15,
      "hp": 120,
      "behavior": "chase",
      "attack": {
        "type": "projectile",
        "interval": 3,
        "speed": 110,
        "damage": 6,
        "radius": 12,
        "count": 1,
        "spread": 0.2,
        "level": 8
      }
    },
    {
      "id": "otsubon",
      "name": "蒲公英",
      "spriteId": "dandelion",
      "color": "#a879d8",
      "speed": 105,
      "shadowSize": 0.9,
      "radius": 15,
      "damage": 12,
      "hp": 70,
      "behavior": "chase",
      "attack": {
        "type": "projectile",
        "interval": 5,
        "speed": 110,
        "damage": 6,
        "radius": 12,
        "count": 1,
        "spread": 0.2,
        "level": 8
      }
    }
  ],
  "boss": {
    "name": "老師",
    "hp": 2000,
    "speed": 24,
    "radius": 32,
    "phases": [
      {
        "threshold": 1,
        "rest": 1.7,
        "combo": null
      },
      {
        "threshold": 0.66,
        "rest": 1.2,
        "combo": "words"
      },
      {
        "threshold": 0.33,
        "rest": 0.8,
        "combo": "chalk"
      }
    ],
    "moves": [
      {
        "id": "words",
        "name": "發射國字",
        "kind": "words",
        "warning": 0.9,
        "minPhase": 1,
        "damage": 12,
        "speed": 135,
        "count": 3,
        "phaseCount": 0,
        "spread": 0.28,
        "radius": 145,
        "duration": 0.3,
        "pulse": 0.24,
        "gap": 1.8,
        "distance": 300
      },
      {
        "id": "chalk",
        "name": "粉筆連射",
        "kind": "chalk",
        "warning": 0.9,
        "minPhase": 1,
        "damage": 12,
        "speed": 170,
        "count": 4,
        "phaseCount": 1,
        "spread": 0.24,
        "radius": 145,
        "duration": 0.7,
        "pulse": 0.24,
        "gap": 1.8,
        "distance": 300
      },
      {
        "id": "dash",
        "name": "黑板擦衝撞",
        "kind": "dash",
        "warning": 0.9,
        "minPhase": 1,
        "damage": 12,
        "speed": 420,
        "count": 1,
        "phaseCount": 0,
        "spread": 0.28,
        "radius": 145,
        "duration": 0.3,
        "pulse": 0.24,
        "gap": 1.8,
        "distance": 300
      },
      {
        "id": "rain",
        "name": "考卷雨",
        "kind": "rain",
        "warning": 0.9,
        "minPhase": 1,
        "damage": 12,
        "speed": 135,
        "count": 2,
        "phaseCount": 1,
        "spread": 0.28,
        "radius": 34,
        "duration": 0.3,
        "pulse": 0.24,
        "gap": 1.8,
        "distance": 300
      },
      {
        "id": "call",
        "name": "點名",
        "kind": "call",
        "warning": 0.9,
        "minPhase": 1,
        "damage": 12,
        "speed": 135,
        "count": 1,
        "phaseCount": 0,
        "spread": 0.28,
        "radius": 48,
        "duration": 0.3,
        "pulse": 0.24,
        "gap": 1.8,
        "distance": 300
      },
      {
        "id": "summon",
        "name": "叫小怪",
        "kind": "summon",
        "warning": 0.9,
        "minPhase": 1,
        "damage": 12,
        "speed": 135,
        "count": 1,
        "phaseCount": 1,
        "spread": 0.28,
        "radius": 145,
        "duration": 0.3,
        "pulse": 0.24,
        "gap": 1.8,
        "distance": 300
      },
      {
        "id": "ring",
        "name": "寫黑板罰站",
        "kind": "ring",
        "warning": 0.9,
        "minPhase": 1,
        "damage": 12,
        "speed": 135,
        "count": 1,
        "phaseCount": 0,
        "spread": 0.28,
        "radius": 145,
        "duration": 1.6,
        "pulse": 0.24,
        "gap": 1.8,
        "distance": 300
      },
{
        "id": "chalk-wall",
        "name": "粉筆牆",
        "kind": "wall",
        "warning": 1.2,
        "minPhase": 1,
        "damage": 12,
        "speed": 240,
        "count": 1,
        "phaseCount": 0,
        "spread": 0.28,
        "radius": 10,
        "duration": 3,
        "pulse": 0.24,
        "gap": 1.8,
        "distance": 300
},
{
        "id": "shrinking-ring",
        "name": "衝刺縮圈",
        "kind": "cage",
        "warning": 1.2,
        "minPhase": 2,
        "damage": 12,
        "speed": 135,
        "count": 1,
        "phaseCount": 0,
        "spread": 0.28,
        "radius": 145,
        "duration": 1.6,
        "pulse": 0.24,
        "gap": 1.8,
        "distance": 300
}
    ]
  },
  "waves": [
    {
      "start": 0,
      "jaben": 1,
      "otsubon": 0,
      "every": 1.84
    },
    {
      "start": 20,
      "jaben": 0.8,
      "otsubon": 0.2,
      "every": 1.495
    },
    {
      "start": 35,
      "jaben": 0.58,
      "otsubon": 0.42,
      "every": 1.15
    },
    {
      "start": 60,
      "jaben": 0.45,
      "otsubon": 0.55,
      "every": 0.8625
    },
    {
      "start": 90,
      "jaben": 0.35,
      "otsubon": 0.65,
      "every": 0.6325
    },
    {
      "start": 105,
      "jaben": 0.35,
      "otsubon": 0.65,
      "every": 0.5175
    }
  ],
  "stages": [
    {
      "id": "classroom",
      "name": "糖果森林",
      "background": "candy-forest",
      // ✏️ 裝飾密度：0 沒有、1 最多；只影響地面。
      "decorationDensity": 0.25,
      "enemyHealthScale": 1,
      "enemySpeedScale": 1,
      "bossHealthScale": 1,
      "waves": [
        {
          "start": 0,
          "jaben": 1,
          "otsubon": 0,
          "every": 1.84
        },
        {
          "start": 20,
          "jaben": 0.8,
          "otsubon": 0.2,
          "every": 1.495
        },
        {
          "start": 35,
          "jaben": 0.58,
          "otsubon": 0.42,
          "every": 1.15
        },
        {
          "start": 60,
          "jaben": 0.45,
          "otsubon": 0.55,
          "every": 0.8625
        },
        {
          "start": 90,
          "jaben": 0.35,
          "otsubon": 0.65,
          "every": 0.6325
        },
        {
          "start": 105,
          "jaben": 0.35,
          "otsubon": 0.65,
          "every": 0.5175
        }
      ]
    },
    {
      "id": "playground",
      "name": "餅乾森林",
      "background": "cookie-forest",
      "decorationDensity": 0.25,
      "enemyHealthScale": 1.12,
      "enemySpeedScale": 1.06,
      "bossHealthScale": 1.12,
      "waves": [
        {
          "start": 0,
          "jaben": 1,
          "otsubon": 0,
          "every": 1.6928
        },
        {
          "start": 20,
          "jaben": 0.8,
          "otsubon": 0.2,
          "every": 1.3754
        },
        {
          "start": 35,
          "jaben": 0.58,
          "otsubon": 0.42,
          "every": 1.058
        },
        {
          "start": 60,
          "jaben": 0.45,
          "otsubon": 0.55,
          "every": 0.7935
        },
        {
          "start": 90,
          "jaben": 0.35,
          "otsubon": 0.65,
          "every": 0.5819
        },
        {
          "start": 105,
          "jaben": 0.35,
          "otsubon": 0.65,
          "every": 0.4761
        }
      ]
    }
  ]
};
