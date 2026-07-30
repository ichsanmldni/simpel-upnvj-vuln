CREATE DATABASE IF NOT EXISTS simpel;
USE simpel;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  password VARCHAR(64) NOT NULL,
  nama VARCHAR(128) NOT NULL,
  role VARCHAR(32) NOT NULL,
  nip_nim VARCHAR(32),
  email VARCHAR(128),
  reset_token VARCHAR(64)
);

CREATE TABLE mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(32) NOT NULL,
  nama VARCHAR(128) NOT NULL,
  prodi VARCHAR(64) NOT NULL,
  angkatan VARCHAR(8),
  nik VARCHAR(32),
  no_hp VARCHAR(24),
  alamat VARCHAR(255),
  ipk DECIMAL(3,2)
);

CREATE TABLE matakuliah (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(16) NOT NULL,
  nama VARCHAR(128) NOT NULL,
  sks INT NOT NULL,
  semester INT NOT NULL,
  prodi VARCHAR(64)
);

CREATE TABLE krs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(32) NOT NULL,
  kode_mk VARCHAR(16) NOT NULL,
  nilai_angka DECIMAL(5,2),
  nilai_huruf VARCHAR(2),
  semester VARCHAR(16),
  status_ukt VARCHAR(16)
);

CREATE TABLE pengumuman (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  isi TEXT NOT NULL,
  penulis VARCHAR(128),
  tanggal DATE
);

CREATE TABLE dokumen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_file VARCHAR(255) NOT NULL,
  path_file VARCHAR(255) NOT NULL,
  pemilik VARCHAR(64),
  tanggal DATE
);

CREATE TABLE log_aktivitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64),
  aksi VARCHAR(255),
  ip VARCHAR(64),
  waktu DATETIME
);

INSERT INTO users (username, password, nama, role, nip_nim, email) VALUES
('admin','0192023a7bbd73250516f069df18b500','Administrator SIMPEL','admin','198001012005011001','admin@upnvj.ac.id'),
('rudi.hartono','d5bbfb47ac3160c31fa8c247827115aa','Dr. Rudi Hartono, M.Kom','dosen','197505102008121002','rudi.hartono@upnvj.ac.id'),
('siti.aminah','d5bbfb47ac3160c31fa8c247827115aa','Siti Aminah, S.Kom., M.T','dosen','198203152010012003','siti.aminah@upnvj.ac.id'),
('2110511001','b398b8a18ef4f69811a32cf169946bac','Andi Pratama','mahasiswa','2110511001','andi.pratama@mahasiswa.upnvj.ac.id'),
('2110511002','b398b8a18ef4f69811a32cf169946bac','Budi Santoso','mahasiswa','2110511002','budi.santoso@mahasiswa.upnvj.ac.id'),
('2110511003','b398b8a18ef4f69811a32cf169946bac','Citra Dewi','mahasiswa','2110511003','citra.dewi@mahasiswa.upnvj.ac.id');

INSERT INTO mahasiswa (nim, nama, prodi, angkatan, nik, no_hp, alamat, ipk) VALUES
('2110511001','Andi Pratama','Informatika','2021','3175012509030001','081234567801','Jl. Fatmawati No. 12, Jakarta Selatan',3.45),
('2110511002','Budi Santoso','Informatika','2021','3175011203030002','081234567802','Jl. RS Fatmawati No. 45, Jakarta Selatan',3.12),
('2110511003','Citra Dewi','Informatika','2021','3175014508030003','081234567803','Jl. Lenteng Agung No. 7, Jakarta Selatan',3.78),
('2110512004','Dian Permata','Sistem Informasi','2021','3175015509030004','081234567804','Jl. Margonda Raya No. 88, Depok',3.55),
('2210511005','Eko Wijaya','Informatika','2022','3175011807040005','081234567805','Jl. Pondok Labu No. 21, Jakarta Selatan',3.21);

INSERT INTO matakuliah (kode, nama, sks, semester, prodi) VALUES
('IF2101','Pemrograman Web',3,3,'Informatika'),
('IF2102','Basis Data',3,3,'Informatika'),
('IF3101','Keamanan Siber',3,5,'Informatika'),
('IF3102','Rekayasa Perangkat Lunak',3,5,'Informatika'),
('SI2101','Analisis Proses Bisnis',3,3,'Sistem Informasi');

INSERT INTO krs (nim, kode_mk, nilai_angka, nilai_huruf, semester, status_ukt) VALUES
('2110511001','IF2101',85.00,'A','2023/2024 Ganjil','Lunas'),
('2110511001','IF2102',78.50,'B','2023/2024 Ganjil','Lunas'),
('2110511001','IF3101',90.00,'A','2023/2024 Genap','Lunas'),
('2110511002','IF2101',72.00,'B','2023/2024 Ganjil','Belum Lunas'),
('2110511002','IF2102',68.00,'C','2023/2024 Ganjil','Belum Lunas'),
('2110511003','IF2101',92.00,'A','2023/2024 Ganjil','Lunas'),
('2110511003','IF3101',88.00,'A','2023/2024 Genap','Lunas');

INSERT INTO pengumuman (judul, isi, penulis, tanggal) VALUES
('Jadwal Pengisian KRS Semester Ganjil','Pengisian KRS dibuka mulai 1 Agustus 2026 sampai 14 Agustus 2026 melalui SIMPEL.','Administrator SIMPEL','2026-07-20'),
('Batas Akhir Pembayaran UKT','Pembayaran UKT semester ganjil paling lambat 25 Agustus 2026 di bank yang ditunjuk.','Administrator SIMPEL','2026-07-22'),
('Sosialisasi Capaian Pembelajaran Lulusan','Sosialisasi CPL kurikulum baru akan dilaksanakan di Auditorium FIK.','Dr. Rudi Hartono, M.Kom','2026-07-25');

INSERT INTO dokumen (nama_file, path_file, pemilik, tanggal) VALUES
('Panduan-SIMPEL.pdf','dokumen/panduan-simpel.txt','admin','2026-07-01'),
('Kalender-Akademik.pdf','dokumen/kalender-akademik.txt','admin','2026-07-01');
