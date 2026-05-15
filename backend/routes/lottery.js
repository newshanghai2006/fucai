const express = require('express');
const router = express.Router();
const { getRecentPeriods } = require('../services/lotteryService');

router.get('/recent', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 20;
    const periods = await getRecentPeriods(count);
    res.json({ periods, count: periods.length });
  } catch (err) {
    console.error('获取开奖数据失败:', err);
    res.status(500).json({ error: '开奖数据获取失败，请稍后重试' });
  }
});

module.exports = router;
