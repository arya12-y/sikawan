# SIKAWAN — Alur Penggunaan Aplikasi

Panduan alur penggunaan sistem dari sudut pandang **Walidata** (peserta) dan **Penguji/Admin** (penyelenggara).

---

## 1. Alur Utama Peserta (Walidata)

```
Daftar/Login
    ↓
① PRETEST ──────────── menentukan LEVEL awal (Pemula/Dasar/Terampil/Mahir/Ahli)
    ↓
② PEMBELAJARAN ─────── materi video/PDF/presentasi + quiz per kompetensi
    ↓  (selesaikan semua materi di level → level naik)
③ ASESMEN ──────────── ujian PG + essay (1 asesmen bisa berisi beberapa kompetensi)
    ↓  (tanpa essay → auto-grade; ada essay → dinilai penguji)
④ MENUNGGU DINILAI ─── menunggu penguji menilai essay
    ↓
⑤ HASIL ────────────── Lulus (sertifikat) / Tidak Lulus (reset & pelajari lagi)
                        / Wawancara (dijadwalkan penguji)
```

### Detail per Tahap

**① Pretest**
- Muncul setelah admin mengaktifkan pretest untuk akunmu
- 5 soal PG per kompetensi → nilai rata-rata menentukan **level awal**
- Level tampil di Master Data → Walidata

**② Pembelajaran**
- Materi dikelompokkan per **level** — hanya levelmu (dan satu level berikutnya) yang terbuka
- Wajib menonton/membaca materi untuk membuka quiz
- Selesaikan **semua materi di level saat ini** → otomatis **naik level**

**③ Asesmen**
- Ujian terdiri dari **PG + essay** sesuai kompetensi asesmen
- PG dinilai otomatis, essay dinilai penguji
- Timer berjalan sesuai durasi; jawaban tersimpan otomatis

**④ Menunggu Dinilai**
- Layar menampilkan nilai sementara PG; nilai naik saat essay dinilai penguji

**⑤ Hasil**
- **Lulus** → sertifikat tersedia di menu Sertifikat
- **Tidak lulus** → layar menampilkan skor per kompetensi + tombol **Pelajari Lagi** & **Minta Reset**
- **Wawancara** → penguji menjadwalkan; walidata melihat jadwal + catatan penguji

---

## 2. Alur Penyelenggara (Penguji / Admin)

### Penguji (menilai & memverifikasi)
```
Menu Penilaian
  ├── Belum Dinilai  → nilai essay per jawaban (0-100 + catatan)
  ├── Sudah Dinilai  → rekap nilai
  ├── Verifikasi     → untuk peserta yang semua essay-nya sudah dinilai:
  │                     ● Approve (lulus) → sertifikat dibuat
  │                     ● Tolak (tidak lulus)
  │                     ● Wawancara → jadwalkan, nilai, rekomendasi
  └── Wawancara      → kelola jadwal & hasil wawancara
```

### Admin (Super Admin / Admin Diskominfo)
- **Master Data**: OPD, Bidang, Jabatan, Kompetensi, Level, Badge, Kategori, Walidata, Penguji, Pengguna, Role & Hak Akses
- **Bank Soal**: kelola soal (PG/essay) per kompetensi & level, tipe quiz/pretest/asesmen; import via **CSV + template**
- **Asesmen**: buat ujian (judul, kompetensi, level, jumlah soal, durasi, nilai lulus, status draft/published)
- **Materi**: video YouTube / PDF / presentasi per level
- **Monitoring**: pantau progres walidata + pretest, reset ujian
- **Jadwal**: atur periode pretest & ujian, lihat statistik per jadwal
- **Laporan**: laporan asesmen & sertifikat (PDF/Excel)

---

## 3. Alur Keputusan Asesmen (Penguji)

```
Semua essay dinilai?
   ├── YA → masuk tab Verifikasi
   │        ├── Approve        → status selesai, LULUS, sertifikat dibuat
   │        ├── Tolak          → status selesai, TIDAK LULUS
   │        └── Wawancara      → status wawancara, jadwalkan → nilai → rekomendasi
   │                              (rekomendasi lulus/tidak_lulus → hasil akhir)
   └── TIDAK → masih di tab Belum/Sudah Dinilai
```

---

## 4. Catatan Penting

| Hal | Penjelasan |
|-----|-----------|
| **Nilai ujian vs nilai kompetensi** | Nilai ujian (`peserta.nilai`) = skor berbobot semua soal; nilai kompetensi = per kompetensi (dipakai grafik & peringkat) |
| **Reset asesmen** | Walidata bisa "Minta Reset" (sekali saja, persisten) → admin reset di Monitoring → walidata ujian ulang |
| **Level** | Ditentukan pretest, naik saat menyelesaikan materi di level; disimpan snapshot di sertifikat |
| **Auto-grade** | Asesmen **tanpa essay** langsung lulus/gagal otomatis memakai `nilai_lulus` asesmen |
| **Video materi** | YouTube embed — ganti URL bila video "tidak tersedia" (keputusan YouTube) |

---

## 5. Quick Reference (Perintah)

```bash
# Jalankan aplikasi
cd backend && php artisan serve          # → http://127.0.0.1:8000

# Update frontend (setelah ubah kode)
build-copy.bat                           # build + copy ke backend/public
