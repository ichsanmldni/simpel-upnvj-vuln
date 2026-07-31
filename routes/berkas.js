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
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, Date.now() + '-' + safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.txt'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Ekstensi file tidak diizinkan'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/berkas', requireLogin, async (req, res, next) => {
  const file = req.query.file;
  if (!file) {
    try {
      const rows = await db.query('SELECT * FROM dokumen ORDER BY id DESC');
      return res.render('berkas', { rows });
    } catch (e) { return next(e); }
  }
  const target = path.normalize(path.join(STORAGE, file));
  if (!target.startsWith(path.normalize(STORAGE))) {
    return res.status(403).send('Akses ditolak: Invalid path');
  }
  
  fs.readFile(target, (err, data) => {
    if (err) return res.status(404).send('Berkas tidak ditemukan: ' + file);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(data);
  });
});

router.get('/unggah', requireLogin, (req, res) => {
  res.render('unggah', { pesan: null });
});

router.post('/unggah', requireLogin, (req, res, next) => {
  upload.single('berkas')(req, res, async (err) => {
    if (err) return res.render('unggah', { pesan: err.message });
    if (!req.file) return res.render('unggah', { pesan: 'Tidak ada berkas' });
    try {
      await db.query("INSERT INTO dokumen (nama_file, path_file, pemilik, tanggal) VALUES (?, ?, ?, CURDATE())", 
        [req.file.originalname, 'upload/' + req.file.filename, req.user.username]);
      res.render('unggah', { pesan: 'Berkas tersimpan: /uploads/' + req.file.filename });
    } catch (e) { next(e); }
  });
});

module.exports = router;
