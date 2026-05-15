const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'ssb-lottery-checker-secret-2026';
const TOKEN_EXPIRY_DAYS = 30;
const CODE_EXPIRY_MINUTES = 10;

const verificationCodes = new Map();

const transporter = nodemailer.createTransport({
  host: 'smtp.163.com',
  port: 465,
  secure: true,
  auth: {
    user: 'tomida2026@163.com',
    pass: 'RLQHiBjAKCRSiz8U',
  },
});

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

async function sendEmail(email, code) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: '【双色球中奖检查器】验证码',
    text: `您好！\n\n您正在登录双色球中奖检查器，验证码是：${code}\n\n验证码有效期为 10 分钟，请尽快使用。\n\n如果这不是您本人的操作，请忽略此邮件。`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e53935;">双色球中奖检查器</h2>
        <p>您好！</p>
        <p>您正在登录双色球中奖检查器，验证码如下：</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e53935;">${code}</span>
        </div>
        <p>验证码有效期为 <strong>10 分钟</strong>，请尽快使用。</p>
        <p style="color: #666; font-size: 14px;">如果这不是您本人的操作，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `,
  };

  try {
    console.log(`正在发送邮件到 ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ 邮件发送成功：${info.messageId}`);
    return true;
  } catch (err) {
    console.error('✗ 邮件发送失败:', err.message);
    return false;
  }
}

async function requestVerificationCode(email) {
  const code = generateCode();
  const expiry = Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000;
  
  verificationCodes.set(email, {
    code,
    expiry,
    attempts: 0,
  });
  
  const emailSuccess = await sendEmail(email, code);
  console.log(`\n【验证码】${email} 的验证码是：${code}（有效期${CODE_EXPIRY_MINUTES}分钟）\n`);
  
  if (emailSuccess) {
    return {
      success: true,
      message: `验证码已发送到 ${email}，有效期${CODE_EXPIRY_MINUTES}分钟`,
    };
  } else {
    return {
      success: true,
      message: `请使用日志中的验证码（邮件发送失败）`,
    };
  }
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
