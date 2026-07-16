<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<style>
@page { margin: 0; }
body {
  margin: 0;
  padding: 0;
  width: 100%;
  font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif;
}
.certificate-wrapper {
  position: relative;
  width: 100%;
  min-height: 600px;
  padding: 50px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
  border: 12px solid #6366f1;
  border-image: linear-gradient(135deg, #6366f1, #a855f7) 1;
}
.certificate-border {
  border: 2px solid #c7d2fe;
  padding: 40px;
  background: #fff;
  position: relative;
  min-height: 460px;
  box-shadow: 0 4px 20px rgba(99,102,241,0.1);
}
.header {
  text-align: center;
  margin-bottom: 30px;
}
.header h1 {
  color: #6366f1;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0 0 5px;
  text-transform: uppercase;
}
.header h2 {
  color: #475569;
  font-size: 14px;
  font-weight: 400;
  margin: 0;
  letter-spacing: 1px;
}
.badge {
  text-align: center;
  margin: 20px 0;
}
.badge i {
  font-size: 48px;
  color: #f59e0b;
}
.title {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 5px;
  letter-spacing: 1px;
}
.name {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  margin: 5px 0 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e7ff;
}
.details {
  text-align: center;
  margin: 20px 0;
  font-size: 12px;
  color: #475569;
  line-height: 1.8;
}
.details table {
  margin: 0 auto;
}
.details td {
  padding: 3px 10px;
  text-align: left;
}
.details td:first-child {
  font-weight: 600;
  color: #334155;
  text-align: right;
  width: 120px;
}
.details td:last-child {
  color: #6366f1;
  font-weight: 600;
}
.footer {
  position: absolute;
  bottom: 30px;
  left: 40px;
  right: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.qr {
  text-align: right;
}
.qr img {
  width: 90px;
  height: 90px;
}
.signature-stamp {
  text-align: left;
}
.signature-stamp p {
  margin: 2px 0;
  font-size: 11px;
  color: #64748b;
}
.signature-line {
  width: 180px;
  border-top: 1px solid #94a3b8;
  margin-top: 35px;
  padding-top: 5px;
  font-size: 11px;
  color: #475569;
}
.verify-text {
  font-size: 9px;
  color: #94a3b8;
  margin-top: 8px;
}
.ribbon {
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #fff;
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 4px;
  letter-spacing: 1px;
}
.level-badge {
  display: inline-block;
  background: #6366f1;
  color: #fff;
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
}
</style>
</head>
<body>
<div class="certificate-wrapper">
  <div class="certificate-border">
    <div class="ribbon">{{ $sertifikat->kategori_kompetensi ?? 'TERAKREDITASI' }}</div>
    
    <div class="header">
      <h1>Sertifikat Kompetensi</h1>
      <h2>SIKAWAN — Sistem Informasi Kompetensi Walidata</h2>
    </div>

    <div class="title">Diberikan kepada</div>
    <div class="name">{{ $sertifikat->user?->name ?? '-' }}</div>

    <div class="details">
      <table>
        <tr><td>Nomor Sertifikat</td><td>{{ $sertifikat->nomor_sertifikat }}</td></tr>
        <tr><td>Kompetensi</td><td>{{ $sertifikat->kompetensi?->nama ?? '-' }}</td></tr>
        <tr><td>Level</td><td><span class="level-badge">{{ $sertifikat->level?->nama ?? $sertifikat->kategori_kompetensi ?? '-' }}</span></td></tr>
        <tr><td>Nilai Akhir</td><td>{{ $sertifikat->nilai_akhir }}</td></tr>
        <tr><td>Tanggal Terbit</td><td>{{ $sertifikat->tanggal_terbit?->format('d F Y') ?? '-' }}</td></tr>
        <tr><td>Masa Berlaku</td><td>{{ $sertifikat->tanggal_expired?->format('d F Y') ?? '3 Tahun' }}</td></tr>
      </table>
    </div>

    <div class="footer">
      <div class="signature-stamp">
        <div class="signature-line">Kepala Dinas / Pejabat Berwenang</div>
        <p class="verify-text">Diterbitkan secara elektronik oleh SIKAWAN</p>
      </div>
      <div class="qr">
        @php
          $baseUrl = \App\Models\Setting::where('key', 'cert_verify_url')->value('value') ?? url('/verify');
          $verifyUrl = rtrim($baseUrl, '/').'/'.$sertifikat->nomor_sertifikat;
        @endphp
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ urlencode($verifyUrl) }}" alt="QR Code"/>
        <p class="verify-text">Scan untuk verifikasi</p>
      </div>
    </div>
  </div>
</div>
</body>
</html>
