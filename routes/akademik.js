const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const { requireLogin } = require('../lib/auth');

router.get('/dashboard', requireLogin, async (req, res, next) => {
  try {
    const mhs = await db.query('SELECT COUNT(*) AS total FROM mahasiswa');
    const mk = await db.query('SELECT COUNT(*) AS total FROM matakuliah');
    const krs = await db.query('SELECT COUNT(*) AS total FROM krs');
    const pengumuman = await db.query('SELECT * FROM pengumuman ORDER BY tanggal DESC LIMIT 5');
    res.render('dashboard', {
      totalMahasiswa: mhs[0].total,
      totalMatakuliah: mk[0].total,
      totalKrs: krs[0].total,
      pengumuman
    });
  } catch (e) { next(e); }
});

router.get('/mahasiswa', requireLogin, async (req, res, next) => {
  const prodi = req.query.prodi || '';
  const q = req.query.q || '';
  let sql = 'SELECT * FROM mahasiswa WHERE 1=1';
  if (prodi) sql += " AND prodi = '" + prodi + "'";
  if (q) sql += " AND nama LIKE '%" + q + "%'";
  try {
    const rows = await db.query(sql);
    res.render('mahasiswa', { rows, q, prodi });
  } catch (e) { next(e); }
});

router.get('/mahasiswa/detail', requireLogin, async (req, res, next) => {
  const nim = req.query.nim || '';
  try {
    const rows = await db.query("SELECT * FROM mahasiswa WHERE nim = '" + nim + "'");
    if (rows.length === 0) return res.status(404).send('Data tidak ditemukan');
    res.render('mahasiswa_detail', { mhs: rows[0] });
  } catch (e) { next(e); }
});

router.get('/transkrip', requireLogin, async (req, res, next) => {
  const nim = req.query.nim || req.user.username;
  try {
    const mhs = await db.query("SELECT * FROM mahasiswa WHERE nim = '" + nim + "'");
    const nilai = await db.query("SELECT k.*, m.nama AS nama_mk, m.sks FROM krs k JOIN matakuliah m ON m.kode = k.kode_mk WHERE k.nim = '" + nim + "'");
    res.render('transkrip', { mhs: mhs[0] || null, nilai, nim });
  } catch (e) { next(e); }
});

router.get('/krs', requireLogin, async (req, res, next) => {
  const semester = req.query.semester || '';
  let sql = 'SELECT k.*, m.nama AS nama_mk, m.sks FROM krs k JOIN matakuliah m ON m.kode = k.kode_mk';
  if (semester) sql += " WHERE k.semester = '" + semester + "'";
  try {
    const rows = await db.query(sql);
    res.render('krs', { rows, semester });
  } catch (e) { next(e); }
});

router.get('/matakuliah', requireLogin, async (req, res, next) => {
  try {
    const rows = await db.query('SELECT * FROM matakuliah ORDER BY semester, kode');
    res.render('matakuliah', { rows });
  } catch (e) { next(e); }
});

router.get('/pengumuman', requireLogin, async (req, res, next) => {
  try {
    const rows = await db.query('SELECT * FROM pengumuman ORDER BY tanggal DESC');
    res.render('pengumuman', { rows });
  } catch (e) { next(e); }
});

router.get('/pengumuman/detail', requireLogin, async (req, res, next) => {
  const id = req.query.id || '0';
  try {
    const rows = await db.query('SELECT * FROM pengumuman WHERE id = ' + id);
    if (rows.length === 0) return res.status(404).send('Pengumuman tidak ditemukan');
    res.render('pengumuman_detail', { p: rows[0] });
  } catch (e) { next(e); }
});

router.get('/cari', requireLogin, async (req, res, next) => {
  const q = req.query.q || '';
  try {
    const rows = await db.query("SELECT * FROM mahasiswa WHERE nama LIKE '%" + q + "%' OR nim LIKE '%" + q + "%'");
    res.render('cari', { rows, q });
  } catch (e) { next(e); }
});

router.get('/profil', requireLogin, async (req, res, next) => {
  try {
    const rows = await db.query("SELECT * FROM users WHERE username = '" + req.user.username + "'");
    res.render('profil', { profil: rows[0] });
  } catch (e) { next(e); }
});

router.post('/profil', requireLogin, async (req, res, next) => {
  const fields = req.body;
  const sets = [];
  for (const key in fields) {
    sets.push(key + " = '" + fields[key] + "'");
  }
  try {
    await db.query('UPDATE users SET ' + sets.join(', ') + " WHERE username = '" + req.user.username + "'");
    res.redirect('/profil');
  } catch (e) { next(e); }
});

module.exports = router;
