const { verifyToken, getUserByToken } = require('../services/authService');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: '认证令牌无效或已过期' });
  }

  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: '用户不存在或登录已过期' });
  }

  req.user = {
    id: user.id,
    openId: user.openId,
    nickname: user.nickname,
    avatar: user.avatar,
  };

  next();
}

module.exports = { authMiddleware };
