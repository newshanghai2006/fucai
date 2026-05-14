const { getConnection } = require('../db/connection');

const CACHE_EXPIRY_HOURS = 24;

const MOCK_DATA = [
  { period: '2026054', date: '2026-05-12', red: [3, 8, 15, 22, 28, 31], blue: 6 },
  { period: '2026053', date: '2026-05-10', red: [1, 5, 12, 19, 25, 33], blue: 10 },
  { period: '2026052', date: '2026-05-08', red: [7, 11, 16, 20, 27, 30], blue: 3 },
  { period: '2026051', date: '2026-05-06', red: [2, 9, 14, 21, 26, 32], blue: 12 },
  { period: '2026050', date: '2026-05-04', red: [4, 10, 17, 23, 29, 31], blue: 8 },
  { period: '2026049', date: '2026-05-02', red: [6, 13, 18, 24, 28, 33], blue: 5 },
  { period: '2026048', date: '2026-04-30', red: [1, 8, 15, 22, 27, 30], blue: 14 },
  { period: '2026047', date: '2026-04-28', red: [5, 11, 16, 20, 25, 32], blue: 9 },
  { period: '2026046', date: '2026-04-26', red: [3, 9, 14, 21, 26, 31], blue: 2 },
  { period: '2026045', date: '2026-04-24', red: [7, 12, 17, 23, 29, 33], blue: 11 },
  { period: '2026044', date: '2026-04-22', red: [2, 10, 18, 24, 28, 30], blue: 7 },
  { period: '2026043', date: '2026-04-20', red: [4, 8, 15, 19, 25, 32], blue: 16 },
  { period: '2026042', date: '2026-04-18', red: [6, 13, 20, 22, 27, 31], blue: 4 },
  { period: '2026041', date: '2026-04-16', red: [1, 11, 16, 21, 26, 33], blue: 13 },
  { period: '2026040', date: '2026-04-14', red: [5, 9, 14, 23, 29, 30], blue: 1 },
  { period: '2026039', date: '2026-04-12', red: [3, 12, 17, 24, 28, 32], blue: 15 },
  { period: '2026038', date: '2026-04-10', red: [7, 10, 18, 20, 25, 31], blue: 6 },
  { period: '2026037', date: '2026-04-08', red: [2, 8, 15, 22, 27, 33], blue: 10 },
  { period: '2026036', date: '2026-04-06', red: [4, 13, 16, 21, 26, 30], blue: 3 },
  { period: '2026035', date: '2026-04-04', red: [6, 11, 19, 23, 29, 32], blue: 12 },
];

function getRecentPeriods(count = 20) {
  const db = getConnection();

  const cached = db.prepare(`
    SELECT period, redBalls, blueBall, drawDate
    FROM LotteryPeriod
    ORDER BY drawDate DESC
    LIMIT ?
  `).all(count);

  if (cached.length >= count) {
    const latest = cached[0];
    const hoursSinceFetch = (Date.now() - new Date(latest.fetchedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceFetch < CACHE_EXPIRY_HOURS) {
      return cached.map(row => ({
        period: row.period,
        date: row.drawDate,
        red: row.redBalls.split(',').map(Number),
        blue: row.blueBall,
      }));
    }
  }

  saveMockData(db);

  const fresh = db.prepare(`
    SELECT period, redBalls, blueBall, drawDate
    FROM LotteryPeriod
    ORDER BY drawDate DESC
    LIMIT ?
  `).all(count);

  return fresh.map(row => ({
    period: row.period,
    date: row.drawDate,
    red: row.redBalls.split(',').map(Number),
    blue: row.blueBall,
  }));
}

function saveMockData(db) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO LotteryPeriod (period, redBalls, blueBall, drawDate, fetchedAt)
    VALUES (@period, @redBalls, @blueBall, @drawDate, CURRENT_TIMESTAMP)
  `);

  const insertMany = db.transaction((data) => {
    for (const item of data) {
      stmt.run({
        period: item.period,
        redBalls: item.red.join(','),
        blueBall: item.blue,
        drawDate: item.date,
      });
    }
  });

  insertMany(MOCK_DATA);
}

module.exports = { getRecentPeriods };
