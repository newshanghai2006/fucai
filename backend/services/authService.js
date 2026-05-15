const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'ssb-lottery-checker-secret-2026';
const TOKEN_EXPIRY_DAYS = 30;
const CODE_EXPIRY_MINUTES = 10;

const verificationCodes = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(user) {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
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

function requestVerificationCode(email) {
  const code = generateCode();
  const expiry = Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000;
  
  verificationCodes.set(email, {
    code,
    expiry,
    attempts: 0,
  });
  
  console.log(`【验证码】${email} 的验证码是：${code}（有效期${CODE_EXPIRY_MINUTES}分钟）`);
  
  return {
    success: true,
    message: `验证码已发送，有效期${CODE_EXPIRY_MINUTES}分钟`,
  };
}

function verifyCode(email, inputCode) {
  const record = verificationCodes.get(email);
  
  if (!record) {
    return {
      success: false,
      error: '验证码不存在或已过期，请重新获取',
    };
  }
  
  if (Date.now() > record.expiry) {
    verificationCodes.delete(email);
    return {
      success: false,
      error: '验证码已过期，请重新获取',
    };
  }
  
  record.attempts++;
  if (record.attempts > 5) {
    verificationCodes.delete(email);
    return {
      success: false,
      error: '验证失败次数过多，请重新获取验证码',
    };
  }
  
  if (inputCode !== record.code) {
    return {
      success: false,
      error: `验证码错误，还剩${5 - record.attempts}次机会`,
    };
  }
  
  verificationCodes.delete(email);
  
  const db = getConnection();
  let user = db.prepare('SELECT * FROM User WHERE email = ?').get(email);
  
  if (!user) {
    const token = generateToken({ email, name: email.split('@')[0] });
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
    const token = generateToken({ email, name: user.name || email.split('@')[0] });
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);
    
    db.prepare(`
      UPDATE User 
      SET token = ?, tokenExpiry = ?, name = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE email = ?
    `).run(token, expiry.toISOString(), user.name || email.split('@')[0], email);
  }
  
  const token = generateToken({ email, name: user.name || email.split('@')[0] });
  
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

function cleanupExpiredCodes() {
  const now = Date.now();
  for (const [email, record] of verificationCodes.entries()) {
    if (now > record.expiry) {
      verificationCodes.delete(email);
    }
  }
}

setInterval(cleanupExpiredCodes, 5 * 60 * 1000);

module.exports = {
  requestVerificationCode,
  verifyCode,
  generateToken,
  verifyToken,
  getUserByToken,
};
