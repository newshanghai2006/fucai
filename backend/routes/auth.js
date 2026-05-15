const express = require('express');
const router = express.Router();
const { login, getUserByToken } = require('../services/authService');

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: '请输入邮箱和密码' });
    }
    
    const result = login(email.toLowerCase().trim(), password);
    
    if (result.success) {
      res.json({
        token: result.token,
        user: result.user,
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('登录失败:', err);
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
    const user = getUserByToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'token 无效或已过期' });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
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
