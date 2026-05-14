const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'lottery.db');

let db;

function getConnection() {
  if (!db) {
    const fs = require('fs');
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function closeConnection() {
  if (db) {
    db.close();
    db = null;
  }
}

function transaction(fn) {
  const connection = getConnection();
  return connection.transaction(fn)();
}

module.exports = {
  getConnection,
  closeConnection,
  transaction,
};
