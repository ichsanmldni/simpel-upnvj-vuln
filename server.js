const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/themes', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'storage', 'upload')));

app.use((req, res, next) => {
  const { currentUser } = require('./lib/auth');
  res.locals.user = currentUser(req);
  res.locals.appName = 'Sistem Informasi Capaian Pembelajaran';
  res.locals.appShort = 'SIMPEL';
  res.locals.univ = 'Universitas Pembangunan Nasional Veteran Jakarta';
  res.locals.path = req.path;
  next();
});

app.use('/', require('./routes/auth'));
app.use('/', require('./routes/akademik'));
app.use('/', require('./routes/berkas'));
app.use('/', require('./routes/admin'));

app.get('/', (req, res) => {
  const { currentUser } = require('./lib/auth');
  if (!currentUser(req)) return res.redirect('/login');
  res.redirect('/dashboard');
});

app.use((err, req, res, next) => {
  res.status(500).send('<h3>Application Error</h3><pre>' + err.stack + '</pre>');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('SIMPEL berjalan di http://localhost:' + PORT);
});
