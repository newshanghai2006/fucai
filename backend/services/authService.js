const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getConnection } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'ssb-lottery-checker-secret-2026';
const TOKEN_EXPIRY_DAYS = 30;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Iv1.2f8a9b3c4d5e6f7g';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'dummy_secret_for_dev';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback';

const loginSessions = new Map();

function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

function getGitHubOAuthURL() {
  const state = generateState();
  loginSessions.set(state, {
    status: 'pending',
    createdAt: Date.now(),
  });

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.append('client_id', GITHUB_CLIENT_ID);
  url.searchParams.append('redirect_uri', GITHUB_CALLBACK_URL);
  url.searchParams.append('scope', 'user:email');
  url.searchParams.append('state', state);

  return {
    authorizeUrl: url.toString(),
    state,
  };
}

async function exchangeCodeForToken(code) {
  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL,
      },
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (response.data.access_token) {
      return response.data.access_token;
    }
  } catch (err) {
    console.error('GitHub token 交换失败:', err.message);
  }
  return null;
}

async function getGitHubUser(accessToken) {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    return {
      githubId: response.data.id.toString(),
      login: response.data.login,
      name: response.data.name || response.data.login,
      avatar: response.data.avatar_url,
      email: response.data.email,
    };
  } catch (err) {
    console.error('获取 GitHub 用户信息失败:', err.message);
  }
  return null;
}

function generateToken(user) {
  return jwt.sign(
    {
      githubId: user.githubId,
      login: user.login,
      name: user.name,
      avatar: user.avatar,
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

function saveOrUpdateUser(githubUser, token) {
  const db = getConnection();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);

  const existing = db.prepare('SELECT id FROM User WHERE githubId = ?').get(githubUser.githubId);
  
  if (existing) {
    db.prepare(`
      UPDATE User 
      SET token = ?, tokenExpiry = ?, login = ?, name = ?, avatar = ?, email = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE githubId = ?
    `).run(
      token, expiry.toISOString(), githubUser.login, githubUser.name, githubUser.avatar, githubUser.email, githubUser.githubId
    );
    return db.prepare('SELECT * FROM User WHERE githubId = ?').get(githubUser.githubId);
  } else {
    const result = db.prepare(`
      INSERT INTO User (githubId, login, name, avatar, email, token, tokenExpiry, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      githubUser.githubId, githubUser.login, githubUser.name, githubUser.avatar, githubUser.email, token, expiry.toISOString()
    );
    return { id: result.lastInsertRowid, ...githubUser };
  }
}

function getUserByToken(token) {
  const db = getConnection();
  return db.prepare(`
    SELECT id, githubId, login, name, avatar, email 
    FROM User 
    WHERE token = ? AND tokenExpiry > CURRENT_TIMESTAMP
  `).get(token);
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [state, session] of loginSessions.entries()) {
    if (now - session.createdAt > 10 * 60 * 1000) {
      loginSessions.delete(state);
    }
  }
}

setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

module.exports = {
  getGitHubOAuthURL,
  exchangeCodeForToken,
  getGitHubUser,
  generateToken,
  verifyToken,
  saveOrUpdateUser,
  getUserByToken,
};
