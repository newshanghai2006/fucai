const PRIZE_RULES = [
  { level: 1, name: '一等奖', redMatch: 6, blueMatch: 1, prize: 5000000, note: '浮动' },
  { level: 2, name: '二等奖', redMatch: 6, blueMatch: 0, prize: 200000, note: '浮动' },
  { level: 3, name: '三等奖', redMatch: 5, blueMatch: 1, prize: 3000, note: '' },
  { level: 4, name: '四等奖', redMatch: 5, blueMatch: 0, prize: 200, note: '' },
  { level: 4, name: '四等奖', redMatch: 4, blueMatch: 1, prize: 200, note: '' },
  { level: 5, name: '五等奖', redMatch: 4, blueMatch: 0, prize: 10, note: '' },
  { level: 5, name: '五等奖', redMatch: 3, blueMatch: 1, prize: 10, note: '' },
  { level: 6, name: '六等奖', redMatch: 2, blueMatch: 1, prize: 5, note: '' },
  { level: 6, name: '六等奖', redMatch: 1, blueMatch: 1, prize: 5, note: '' },
  { level: 6, name: '六等奖', redMatch: 0, blueMatch: 1, prize: 5, note: '' },
  { level: 7, name: '福运奖', redMatch: 3, blueMatch: 0, prize: 5, note: '' },
];

function checkPrize(userRed, userBlue, drawRed, drawBlue) {
  const redMatch = userRed.filter(n => drawRed.includes(n)).length;
  const blueMatch = userBlue === drawBlue ? 1 : 0;

  for (const rule of PRIZE_RULES) {
    if (rule.redMatch === redMatch && rule.blueMatch === blueMatch) {
      return {
        won: true,
        level: rule.level,
        name: rule.name,
        prize: rule.prize,
        note: rule.note,
        redMatch,
        blueMatch,
      };
    }
  }

  return {
    won: false,
    level: 0,
    name: '未中奖',
    prize: 0,
    note: '',
    redMatch,
    blueMatch,
  };
}

module.exports = { checkPrize };
