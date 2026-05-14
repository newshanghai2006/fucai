const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getConnection();
    const numbers = db.prepare(
      'SELECT id, redBalls, blueBall, createdAt FROM UserNumber WHERE userId = ? ORDER BY createdAt DESC'
    ).all(req.user.id);

    const formatted = numbers.map(n => ({
      id: n.id,
      red: n.redBalls.split(',').map(Number),
      blue: n.blueBall,
      createdAt: n.createdAt,
    }));

    res.json({ numbers: formatted });
  } catch (err) {
    console.error('获取号码组失败:', err);
    res.status(500).json({ error: '获取号码组失败' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { numbers } = req.body;
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ error: '号码组不能为空' });
    }

    const db = getConnection();
    const stmt = db.prepare(
      'INSERT INTO UserNumber (userId, redBalls, blueBall) VALUES (?, ?, ?)'
    );

    const insertMany = db.transaction((nums) => {
      for (const n of nums) {
        stmt.run(req.user.id, n.red.join(','), n.blue);
      }
    });

    insertMany(numbers);
    res.json({ success: true });
  } catch (err) {
    console.error('保存号码组失败:', err);
    res.status(500).json({ error: '保存号码组失败' });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getConnection();
    const result = db.prepare(
      'DELETE FROM UserNumber WHERE id = ? AND userId = ?'
    ).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '号码组不存在' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('删除号码组失败:', err);
    res.status(500).json({ error: '删除号码组失败' });
  }
});

module.exports = router;
