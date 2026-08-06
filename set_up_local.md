# SIKAWAN — Sistem Kompetensi Walidata

Platform pembelajaran & asesmen kompetensi Walidata Satu Data Indonesia. Alur: **Pretest → Materi/Quiz → Asesmen → Penilaian → Sertifikat**.

- **Backend**: Laravel (PHP 8.2+) + MySQL + Sanctum
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Alur**: `pretest → pembelajaran → asesmen → penilaian (penguji) → sertifikat`

---

## 1. Prasyarat

| Tools | Versi | Catatan |
|-------|-------|---------|
| PHP | 8.2+ | Termasuk php.ini `extension=pdo_mysql`, `extension=fileinfo` |
| Composer | 2.x | — |
| Node.js | 18+ / 20+ | Termasuk npm |
| MySQL | 5.7+ / 8.x | Bisa pakai **Laragon** (MySQL) |

> **Rekomendasi**: pakai **Laragon** hanya untuk **MySQL**, dan **`php artisan serve`** untuk aplikasi (stabil, tanpa diskonek nginx/PHP-FPM).

---

## 2. Setup Backend

```bash
cd backend
composer install

# Salin .env dan sesuaikan konfigurasi DB
copy .env.example .env

# Generate APP_KEY
php artisan key:generate
```

Buka `.env`, sesuaikan koneksi database (default Laragon: user `root`, tanpa password):

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sikawan
DB_USERNAME=root
DB_PASSWORD=
```

Buat database lalu jalankan migrasi + seeder:

```bash
# Buat database 'sikawan' lewat Laragon/phpMyAdmin/CLI MySQL
mysql -u root -e "CREATE DATABASE sikawan"

php artisan migrate --seed
php artisan storage:link
```

> `--seed` membuat role & permission + akun default + data referensi (kompetensi, level, materi, bank soal).

---

## 3. Setup Frontend

```bash
cd frontend
npm install

# Salin .env (VITE_API_BASE_URL=/api → frontend & API satu server)
copy .env.example .env

# Build frontend → hasil di folder dist
npm run build
```

Salin hasil build ke `backend/public` (agar disajikan satu server bersama Laravel):

```bash
# Dari folder root project (atau jalankan build-copy.bat)
xcopy /y /s /q frontend\dist\* backend\public\
```

> Ada file **`build-copy.bat`** di root project — double-click untuk otomatis: `npm run build` + copy ke `backend/public`.

---

## 4. Menjalankan Aplikasi

### Setiap hari (3 langkah)

1. **Start MySQL** — buka Laragon → **Start All** (database `sikawan` aktif di port 3306).
2. **Update frontend** (hanya jika baru ubah kode frontend) — jalankan **`build-copy.bat`**.
3. **Jalankan server**:

```bash
cd backend
php artisan serve
```

Buka **http://127.0.0.1:8000** di browser.

> Jangan buka website Laragon (port 80) — yang dipakai hanya MySQL-nya.

---

## 5. Akun Default (password: `password`)

| Role | Email |
|------|-------|
| Super Admin | `admin@sikawan.test` |
| Admin Diskominfo | `diskominfo@sikawan.test` |
| Penguji | `penguji@sikawan.test` |
| Walidata | `walidata@sikawan.test` |
| Pimpinan | `pimpinan@sikawan.test` |
| Walidata | `budi.santoso@sikawan.test` |
| Walidata | `siti.nurhaliza@sikawan.test` |
| Walidata | `agus.prasetyo@sikawan.test` |
| Walidata | `dewi.anggraeni@sikawan.test` |
| Walidata | `ririn.safitri@sikawan.test` |

---

## 6. Struktur & Catatan Teknis

```
D:\sikawan
├── backend/          # Laravel API + serve frontend hasil build
│   └── public/       # index.php + index.html (SPA hasil build, di-.gitignore)
├── frontend/         # React (Vite)
│   ├── dist/         # hasil build (di-.gitignore)
│   └── src/
├── build-copy.bat    # build frontend + copy ke backend/public
└── docs/             # dokumentasi (spesifikasi desain)
```

- **Permission**: RBAC Spatie (guard `sanctum`). Role default di-seed; non-admin diatur manual lewat menu **Role & Hak Akses**.
- **Materi video**: YouTube embed (ganti URL di menu Materi bila video tidak tersedia). PDF/presentasi = file di `storage/app/public/materi`.
- **Database export** (untuk berbagi data): `mysqldump -u root sikawan > sikawan.sql`
