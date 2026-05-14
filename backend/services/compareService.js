const { checkPrize } = require('./prizeRules');

function compareNumbers(userNumbers, periods) {
  const results = [];

  for (const numberGroup of userNumbers) {
    const groupResult = {
      red: numberGroup.red,
      blue: numberGroup.blue,
      periods: [],
    };

    for (const period of periods) {
      const prize = checkPrize(
        numberGroup.red,
        numberGroup.blue,
        period.red,
        period.blue
      );

      groupResult.periods.push({
        period: period.period,
        drawDate: period.date,
        drawRed: period.red,
        drawBlue: period.blue,
        ...prize,
      });
    }

    results.push(groupResult);
  }

  return results;
}

module.exports = { compareNumbers };
