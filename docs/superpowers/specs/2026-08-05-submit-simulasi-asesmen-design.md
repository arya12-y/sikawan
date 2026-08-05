# Desain: Submit Simulasi via Permission `asesmen.simulasi`

Tanggal: 2026-08-05
Status: Disetujui user (Super Admin + Admin Diskominfo default, via permission per-role)

## Latar Belakang

Saat ini non-walidata (Super Admin, Admin Diskominfo, Penguji, Pimpinan) hanya mendapat
**trial mode** saat membuka asesmen — bisa lihat & jawab soal, tapi tombol kumpulkan
diblokir, hasil tidak pernah tampil. Tujuan: admin bisa menguji seluruh alur
(pretest → materi → quiz → asesmen → hasil) persis seperti walidata, **tanpa mencemari
statistik/monitoring/laporan**.

Kebocoran yang ditemukan: `PretestController::submit()` menyimpan `PretestResult` dan
membuat/update record `Walidata` untuk Super Admin — membuat admin muncul di monitoring
dan ikut terhitung statistik.

## Keputusan Desain

- Submit simulasi diaktifkan via **permission `asesmen.simulasi`** (per-role, diatur di
  menu Role & Permission, seperti `jadwal.bebas`).
- Default seeder: **Super Admin + Admin Diskominfo**.
- Penguji/Pimpinan tanpa permission → tetap trial preview (seperti sekarang).

## Perubahan

### Backend

1. **Seeder** (`RolePermissionSeeder.php`): tambah permission `asesmen.simulasi`;
   berikan ke Super Admin & Admin Diskominfo (via array `$permissions`).

2. **`AsesmenController::start()`**: jika non-walidata:
   - punya `asesmen.simulasi` → return `status: 'simulasi'` (tetap tanpa record peserta)
   - tanpa permission → trial mode seperti sekarang (`status: 'trial'`)

3. **Endpoint baru** `POST asesmen/{id}/submit-simulasi`
   (`AsesmenController::submitSimulasi`):
   - Guard: user non-walidata dengan permission `asesmen.simulasi`
   - Hitung skor & nilai akhir di memori (pakai `AssessmentService::calculateAnswerScore`)
   - Return: nilai akhir, benar/salah per soal, pembahasan
   - **TIDAK menulis apa pun ke DB** (tanpa record peserta, tanpa nilai kompetensi,
     tanpa sertifikat)

4. **`PretestController::submit()`** (fix kebocoran): jika user non-walidata:
   - punya `asesmen.simulasi` → hitung di memori, return hasil, **TANPA simpan**
     `PretestResult` / `Walidata::updateOrCreate`
   - tanpa permission → abort 403

5. **`Quiz`**: tidak diubah (hasil non-walidata memang tidak disimpan).

### Frontend

6. **`Asesmen.jsx`**: status `'simulasi'` → tombol kumpulkan aktif; submit ke
   `submit-simulasi`; tampilkan layar hasil dengan banner
   "MODE SIMULASI — hasil tidak disimpan".

7. **`Pretest.jsx`**: setelah submit sebagai non-walidata, tampilkan hasil + banner simulasi.

## Scope & Risiko

- File: 4 backend (AsesmenController, PretestController, Seeder, routes/api.php) +
  2 frontend (Asesmen.jsx, Pretest.jsx)
- Aman: jalur simulasi tidak menulis data untuk non-walidata
- Perubahan perilaku yang disengaja: pretest Super Admin tidak lagi tersimpan ke DB

## Verifikasi

- `php artisan db:seed --class=RolePermissionSeeder` → permission ada, role benar
- `php -l` backend files
- Runtime: panggil `start()` sebagai Super Admin → status `simulasi`; `submit-simulasi`
  → hasil hitung tanpa record baru di DB
- `npm run build` frontend
