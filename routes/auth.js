const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const { hashPassword, makeToken, generateResetToken, currentUser } = require('../lib/auth');

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res, next) => {
  const username = req.body.username || '';
  const password = req.body.password || '';
  const hash = hashPassword(password);
  const sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + hash + "'";
  try {
    const rows = await db.query(sql);
    if (rows.length === 0) {
      return res.render('login', { error: 'Username atau password salah' });
    }
    const token = makeToken(rows[0]);
    res.cookie('simpel_session', token, { httpOnly: false, secure: false, sameSite: 'lax' });
    await db.query("INSERT INTO log_aktivitas (username, aksi, ip, waktu) VALUES ('" + rows[0].username + "', 'login', '" + req.ip + "', NOW())");
    res.redirect('/dashboard');
  } catch (e) {
    next(e);
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('simpel_session');
  res.redirect('/login');
});

router.get('/lupa-password', (req, res) => {
  res.render('lupa_password', { info: null });
});

router.post('/lupa-password', async (req, res, next) => {
  const email = req.body.email || '';
  const token = generateResetToken();
  try {
    await db.query("UPDATE users SET reset_token = '" + token + "' WHERE email = '" + email + "'");
    res.render('lupa_password', { info: 'Token reset telah dibuat: ' + token });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
