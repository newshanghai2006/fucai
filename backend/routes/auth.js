const express = require('express');
const router = express.Router();
const {
  getGitHubOAuthURL,
  exchangeCodeForToken,
  getGitHubUser,
  generateToken,
  saveOrUpdateUser,
  getUserByToken,
} = require('../services/authService');

router.get('/github', (req, res) => {
  try {
    const { authorizeUrl, state } = getGitHubOAuthURL();
    res.json({ authorizeUrl, state });
  } catch (err) {
    console.error('生成 GitHub 授权 URL 失败:', err);
    res.status(500).json({ error: '生成授权 URL 失败' });
  }
});

router.get('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: '缺少 code 参数' });
    }

    const accessToken = await exchangeCodeForToken(code);
    if (!accessToken) {
      return res.status(500).json({ error: '获取 access token 失败' });
    }

    const githubUser = await getGitHubUser(accessToken);
    if (!githubUser) {
      return res.status(500).json({ error: '获取用户信息失败' });
    }

    const token = generateToken(githubUser);
    const user = saveOrUpdateUser(githubUser, token);

    res.redirect(`/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      name: user.name,
      login: user.login,
      avatar: user.avatar,
    }))}`);
  } catch (err) {
    console.error('GitHub 登录回调失败:', err);
    res.status(500).json({ error: '登录失败' });
  }
});

router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权' });
    }

    const token = authHeader.substring(7);
    const decoded = getUserByToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'token 无效或已过期' });
    }

    res.json({
      user: {
        id: decoded.id,
        name: decoded.name,
        login: decoded.login,
        avatar: decoded.avatar,
      },
    });
  } catch (err) {
    console.error('获取用户信息失败:', err);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
