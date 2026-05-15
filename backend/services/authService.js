const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'ssb-lottery-checker-secret-2026';
const TOKEN_EXPIRY_DAYS = 30;
const DEFAULT_PASSWORD = '888888';

function generateToken(email) {
  return jwt.sign(
    {
      email: email,
      name: email.split('@')[0],
    },
    JWT_SECRET,
    { expiresIn: `${TOKEN_EXPIRY_DAYS}d` }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function login(email, password) {
  if (password !== DEFAULT_PASSWORD) {
    return {
      success: false,
      error: '密码错误',
    };
  }
  
  const db = getConnection();
  let user = db.prepare('SELECT * FROM User WHERE email = ?').get(email);
  
  if (!user) {
    const token = generateToken(email);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);
    
    const result = db.prepare(`
      INSERT INTO User (email, name, token, tokenExpiry, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(email, email.split('@')[0], token, expiry.toISOString());
    
    user = {
      id: result.lastInsertRowid,
      email,
      name: email.split('@')[0],
    };
  } else {
    const token = generateToken(email);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);
    
    db.prepare(`
      UPDATE User 
      SET token = ?, tokenExpiry = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE email = ?
    `).run(token, expiry.toISOString(), email);
  }
  
  const token = generateToken(email);
  
  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name || email.split('@')[0],
    },
  };
}

function getUserByToken(token) {
  const db = getConnection();
  return db.prepare(`
    SELECT id, email, name, avatar 
    FROM User 
    WHERE token = ? AND tokenExpiry > CURRENT_TIMESTAMP
  `).get(token);
}

module.exports = {
  login,
  generateToken,
  verifyToken,
  getUserByToken,
};
