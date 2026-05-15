const { getConnection } = require('./connection');

function initDatabase() {
  const db = getConnection();

  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(256) UNIQUE NOT NULL,
      name VARCHAR(128) DEFAULT '',
      avatar VARCHAR(512) DEFAULT '',
      token VARCHAR(512) DEFAULT '',
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

    CREATE INDEX IF NOT EXISTS idx_user_email ON User(email);
    CREATE INDEX IF NOT EXISTS idx_userNumber_userId ON UserNumber(userId);
    CREATE INDEX IF NOT EXISTS idx_lotteryPeriod_drawDate ON LotteryPeriod(drawDate);
  `);

  console.log('数据库初始化完成');
}

module.exports = { initDatabase };
