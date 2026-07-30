const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../lib/db');
const { requireLogin } = require('../lib/auth');

const STORAGE = path.join(__dirname, '..', 'storage');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(STORAGE, 'upload'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get('/berkas', requireLogin, async (req, res, next) => {
  const file = req.query.file;
  if (!file) {
    try {
      const rows = await db.query('SELECT * FROM dokumen ORDER BY id DESC');
      return res.render('berkas', { rows });
    } catch (e) { return next(e); }
  }
  const target = path.join(STORAGE, file);
  fs.readFile(target, (err, data) => {
    if (err) return res.status(404).send('Berkas tidak ditemukan: ' + file);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(data);
  });
});

router.get('/unggah', requireLogin, (req, res) => {
  res.render('unggah', { pesan: null });
});

router.post('/unggah', requireLogin, upload.single('berkas'), async (req, res, next) => {
  if (!req.file) return res.render('unggah', { pesan: 'Tidak ada berkas' });
  try {
    await db.query("INSERT INTO dokumen (nama_file, path_file, pemilik, tanggal) VALUES ('" + req.file.originalname + "', 'upload/" + req.file.originalname + "', '" + req.user.username + "', CURDATE())");
    res.render('unggah', { pesan: 'Berkas tersimpan: /uploads/' + req.file.originalname });
  } catch (e) { next(e); }
});

module.exports = router;
