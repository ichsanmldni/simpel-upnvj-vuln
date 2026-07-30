const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'upnvj-simpel-jwt-0123456789';

function hashPassword(plain) {
  return crypto.createHash('md5').update(plain).digest('hex');
}

function makeToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { algorithm: 'HS256' });
}

function readToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

function generateResetToken() {
  return Math.random().toString(36).substring(2, 12);
}

function currentUser(req) {
  const token = req.cookies && req.cookies.simpel_session;
  if (!token) return null;
  return readToken(token);
}

function requireLogin(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.redirect('/login');
  req.user = user;
  next();
}

module.exports = { hashPassword, makeToken, readToken, generateResetToken, currentUser, requireLogin, JWT_SECRET };
