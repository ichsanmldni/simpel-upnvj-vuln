# SIMPEL UPNVJ — Vulnerable Clone (source only)

Clone **sengaja rentan** dari `simpel.upnvj.ac.id`, ditulis ulang dengan **Node.js/Express + EJS + MySQL** (aslinya CodeIgniter/PHP). Tampilan dipertahankan memakai aset tema asli `themes/flat`, halaman login dibuat **pixel-identical** dengan situs asli.

> ⚠️ **Aplikasi ini sengaja penuh kerentanan. JANGAN pernah diekspos ke internet.** Kredensial & secret di-hardcode dengan sengaja (bahan latihan Secure Coding & DevSecOps FIK UPNVJ). Repo ini hanya berisi **source code** — versi dengan pipeline CI/CD ada di repo `simpel-upnvj-devsecops`.

## Menjalankan

```bash
docker compose up -d --build
# app        -> http://localhost:8080
# phpMyAdmin -> http://localhost:8081
```

Login: `admin` / `admin123` (atau bypass SQLi: username `admin'-- -`, password apa saja).

## Membuktikan kerentanan

```bash
./verify.sh            # menjalankan 18+ exploit ke http://localhost:8080
```

## Kerentanan (20, memetakan OWASP Top 10 2025)

| # | Kerentanan | Lokasi |
|---|---|---|
| 1 | SQLi auth bypass | `routes/auth.js` |
| 2 | SQLi filter/detail (UNION dump) | `routes/akademik.js`, `routes/admin.js` |
| 3 | Stored XSS pengumuman | `views/pengumuman*.ejs` |
| 4 | Reflected XSS pencarian | `views/cari.ejs` |
| 5 | IDOR transkrip | `routes/akademik.js` |
| 6 | Broken access control admin | `routes/admin.js` |
| 7 | Path traversal unduh berkas | `routes/berkas.js` |
| 8 | Command injection backup | `routes/admin.js` |
| 9 | SSTI → RCE (`new Function`) | `routes/admin.js` |
| 10 | Hashing MD5 | `lib/auth.js` |
| 11 | Secret hardcoded (JWT, DB) | `lib/auth.js`, `lib/db.js`, `.env` |
| 12 | Cookie tanpa HttpOnly/Secure | `routes/auth.js` |
| 13 | Reset token `Math.random()` | `lib/auth.js` |
| 14 | Unrestricted file upload | `routes/berkas.js`, `server.js` |
| 15 | Stack trace bocor | `server.js` |
| 16 | Header keamanan hilang | `server.js` |
| 17 | Mass assignment (naik peran) | `routes/akademik.js` |
| 18 | Dependency ber-CVE | `package.json` |
| 19 | Misconfig (root DB, phpMyAdmin) | `docker-compose.yml`, `.env` |
| 20 | Tanpa rate limit/lockout login | `routes/auth.js` |

## Stack

Express 4 · EJS · mysql2 · Docker Compose (app + MySQL 8 + phpMyAdmin). Aset tema `themes/flat` di-serve dari `public/` (offline, tanpa CDN).
