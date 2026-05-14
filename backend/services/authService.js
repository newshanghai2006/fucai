const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getConnection } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'ssb-lottery-checker-secret-2026';
const TOKEN_EXPIRY_DAYS = 7;

const loginSessions = new Map();

function generateSceneStr() {
  return crypto.randomBytes(16).toString('hex');
}

function createQRCode(sceneStr) {
  return `https://mock-wechat-qrcode.example.com?scene=${sceneStr}`;
}

function requestQRCode() {
  const sceneStr = generateSceneStr();

  loginSessions.set(sceneStr, {
    status: 'pending',
    createdAt: Date.now(),
    user: null,
    token: null,
  });

  setTimeout(() => {
    const session = loginSessions.get(sceneStr);
    if (session && session.status === 'pending') {
      session.status = 'scanned';

      setTimeout(() => {
        const s = loginSessions.get(sceneStr);
        if (s && s.status === 'scanned') {
          s.status = 'success';
          s.user = {
            openId: 'mock_openid_' + crypto.randomBytes(8).toString('hex'),
            nickname: '微信用户' + Math.floor(Math.random() * 10000),
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + sceneStr.substring(0, 8),
          };
          s.token = generateToken(s.user);
        }
      }, 3000);
    }
  }, 2000);

  return {
    qrcodeUrl: createQRCode(sceneStr),
    sceneStr,
  };
}

function checkLoginStatus(sceneStr) {
  const session = loginSessions.get(sceneStr);
  if (!session) {
    return { status: 'expired' };
  }

  const elapsed = Date.now() - session.createdAt;
  if (elapsed > 5 * 60 * 1000) {
    loginSessions.delete(sceneStr);
    return { status: 'expired' };
  }

  if (session.status === 'success') {
    return {
      status: 'success',
      token: session.token,
      user: session.user,
    };
  }

  return { status: session.status };
}

function generateToken(user) {
  const payload = {
    openId: user.openId,
    nickname: user.nickname,
    avatar: user.avatar,
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${TOKEN_EXPIRY_DAYS}d`,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function saveUserToDB(user, token) {
  const db = getConnection();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);

  const existing = db.prepare('SELECT id FROM User WHERE openId = ?').get(user.openId);
  if (existing) {
    db.prepare('UPDATE User SET token = ?, tokenExpiry = ?, nickname = ?, avatar = ?, updatedAt = CURRENT_TIMESTAMP WHERE openId = ?').run(
      token, expiry.toISOString(), user.nickname, user.avatar, user.openId
    );
    return db.prepare('SELECT id FROM User WHERE openId = ?').get(user.openId);
  }

  return db.prepare('INSERT INTO User (openId, nickname, avatar, token, tokenExpiry) VALUES (?, ?, ?, ?, ?)').run(
    user.openId, user.nickname, user.avatar, token, expiry.toISOString()
  );
}

function getUserByToken(token) {
  const db = getConnection();
  return db.prepare('SELECT * FROM User WHERE token = ? AND tokenExpiry > CURRENT_TIMESTAMP').get(token);
}

module.exports = {
  requestQRCode,
  checkLoginStatus,
  verifyToken,
  generateToken,
  saveUserToDB,
  getUserByToken,
};
