kind: request
lane: none
ref: survivor-levelup-20mtd
---
上次修正因 429 Too Many Requests 中斷，請照 review 回饋繼續修正：
- games/survivor/tests/levelup-layout.cjs 第 67 行：展示要在點了已擁有的卡片格之後才會出現，請修正這個測試。
- （可選）如果只出現「回血」備用卡，重抽時不要扣次數。
