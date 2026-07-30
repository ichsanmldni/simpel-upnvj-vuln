const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const db = require('../lib/db');
const { requireLogin, hashPassword } = require('../lib/auth');

router.get('/admin', requireLogin, async (req, res, next) => {
  try {
    const users = await db.query('SELECT COUNT(*) AS total FROM users');
    const log = await db.query('SELECT * FROM log_aktivitas ORDER BY id DESC LIMIT 10');
    res.render('admin_index', { totalUsers: users[0].total, log });
  } catch (e) { next(e); }
});

router.get('/admin/users', requireLogin, async (req, res, next) => {
  try {
    const rows = await db.query('SELECT * FROM users ORDER BY id');
    res.render('admin_users', { rows });
  } catch (e) { next(e); }
});

router.get('/admin/users/tambah', requireLogin, (req, res) => {
  res.render('admin_users_form', { pesan: null });
});

router.post('/admin/users/tambah', requireLogin, async (req, res, next) => {
  const { username, password, nama, role, email } = req.body;
  try {
    await db.query("INSERT INTO users (username, password, nama, role, email) VALUES ('" + username + "', '" + hashPassword(password) + "', '" + nama + "', '" + role + "', '" + email + "')");
    res.redirect('/admin/users');
  } catch (e) { next(e); }
});

router.get('/admin/users/hapus', requireLogin, async (req, res, next) => {
  const id = req.query.id;
  try {
    await db.query('DELETE FROM users WHERE id = ' + id);
    res.redirect('/admin/users');
  } catch (e) { next(e); }
});

router.get('/admin/pengumuman/tambah', requireLogin, (req, res) => {
  res.render('admin_pengumuman_form', { pesan: null });
});

router.post('/admin/pengumuman/tambah', requireLogin, async (req, res, next) => {
  const { judul, isi } = req.body;
  try {
    await db.query("INSERT INTO pengumuman (judul, isi, penulis, tanggal) VALUES ('" + judul + "', '" + isi + "', '" + req.user.username + "', CURDATE())");
    res.redirect('/pengumuman');
  } catch (e) { next(e); }
});

router.get('/admin/laporan', requireLogin, async (req, res, next) => {
  const template = req.query.tpl || 'Total mahasiswa aktif: {{ total }}';
  try {
    const rows = await db.query('SELECT COUNT(*) AS total FROM mahasiswa');
    const vars = { total: rows[0].total, universitas: 'UPN Veteran Jakarta' };
    const rendered = template.replace(/\{\{(.+?)\}\}/g, (m, expr) => {
      const fn = new Function('vars', 'with (vars) { return (' + expr + '); }');
      return fn(vars);
    });
    res.render('admin_laporan', { template, rendered, error: null });
  } catch (e) {
    res.render('admin_laporan', { template: req.query.tpl || '', rendered: '', error: String(e) });
  }
});

router.get('/admin/backup', requireLogin, (req, res) => {
  const tabel = req.query.tabel || 'mahasiswa';
  const perintah = 'echo "backup tabel ' + tabel + '" && date';
  exec(perintah, (err, stdout, stderr) => {
    res.render('admin_backup', { tabel, hasil: stdout || '', gagal: stderr || (err ? String(err) : '') });
  });
});

router.get('/admin/log', requireLogin, async (req, res, next) => {
  const user = req.query.user || '';
  let sql = 'SELECT * FROM log_aktivitas WHERE 1=1';
  if (user) sql += " AND username = '" + user + "'";
  sql += ' ORDER BY id DESC LIMIT 100';
  try {
    const rows = await db.query(sql);
    res.render('admin_log', { rows, user });
  } catch (e) { next(e); }
});

module.exports = router;
