const { getConnection } = require('./connection');

function initDatabase() {
  const db = getConnection();

  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId VARCHAR(64) UNIQUE NOT NULL,
      nickname VARCHAR(128) DEFAULT '',
      avatar VARCHAR(512) DEFAULT '',
      token VARCHAR(256) DEFAULT '',
      tokenExpiry DATETIME DEFAULT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS UserNumber (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      redBalls VARCHAR(32) NOT NULL,
      blueBall INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS LotteryPeriod (
      period VARCHAR(16) PRIMARY KEY,
      redBalls VARCHAR(32) NOT NULL,
      blueBall INTEGER NOT NULL,
      drawDate DATETIME NOT NULL,
      fetchedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_user_openId ON User(openId);
    CREATE INDEX IF NOT EXISTS idx_userNumber_userId ON UserNumber(userId);
    CREATE INDEX IF NOT EXISTS idx_lotteryPeriod_drawDate ON LotteryPeriod(drawDate);
  `);
}

module.exports = { initDatabase };
