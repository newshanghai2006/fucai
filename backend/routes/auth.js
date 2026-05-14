const express = require('express');
const router = express.Router();
const { requestQRCode, checkLoginStatus, saveUserToDB } = require('../services/authService');

router.post('/qrcode', (req, res) => {
  try {
    const result = requestQRCode();
    res.json(result);
  } catch (err) {
    console.error('生成二维码失败:', err);
    res.status(500).json({ error: '生成二维码失败' });
  }
});

router.get('/status', (req, res) => {
  try {
    const { sceneStr } = req.query;
    if (!sceneStr) {
      return res.status(400).json({ error: '缺少sceneStr参数' });
    }

    const result = checkLoginStatus(sceneStr);

    if (result.status === 'success' && result.token && result.user) {
      saveUserToDB(result.user, result.token);
    }

    res.json(result);
  } catch (err) {
    console.error('检查登录状态失败:', err);
    res.status(500).json({ error: '检查登录状态失败' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
