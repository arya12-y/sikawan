<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sertifikat Kompetensi</title>
    <style>
        @page { margin: 0; }
        body {
            font-family: 'Times New Roman', Times, serif;
            background: #f8f6f0;
            margin: 0;
            padding: 0;
        }
        .sertifikat {
            width: 100%;
            height: 100%;
            position: relative;
            background: #fff;
            border: 20px solid #1a3a5c;
            box-sizing: border-box;
        }
        .content {
            padding: 40px 60px;
            text-align: center;
            border: 2px solid #c9a84c;
            margin: 15px;
            height: calc(100% - 30px);
            box-sizing: border-box;
            background: linear-gradient(180deg, #fdfcf7 0%, #f8f4e8 100%);
        }
        .header {
            border-bottom: 3px double #c9a84c;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #1a3a5c;
            font-size: 28px;
            margin: 0;
            letter-spacing: 2px;
        }
        .header p {
            color: #666;
            font-size: 14px;
            margin: 5px 0 0;
        }
        .title {
            color: #c9a84c;
            font-size: 22px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin: 15px 0 5px;
        }
        .subtitle {
            color: #1a3a5c;
            font-size: 16px;
            margin: 5px 0;
        }
        .nama {
            font-size: 36px;
            font-weight: bold;
            color: #1a3a5c;
            margin: 20px 0;
            padding: 10px 0;
            border-bottom: 2px solid #c9a84c;
            display: inline-block;
        }
        .body-text {
            font-size: 14px;
            color: #444;
            line-height: 1.8;
            margin: 15px 0;
        }
        .info {
            margin: 20px 0;
        }
        .info table {
            margin: 0 auto;
            font-size: 14px;
        }
        .info td {
            padding: 4px 15px;
            color: #444;
        }
        .info td:first-child {
            text-align: right;
            font-weight: bold;
            color: #1a3a5c;
        }
        .info td:last-child {
            text-align: left;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #c9a84c;
        }
        .footer td {
            width: 50%;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .ttd {
            margin-top: 40px;
            font-size: 12px;
            color: #333;
        }
        .ttd .line {
            margin-top: 50px;
            width: 200px;
            border-top: 1px solid #333;
            display: inline-block;
            padding-top: 5px;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 80px;
            color: rgba(201, 168, 76, 0.08);
            font-weight: bold;
            letter-spacing: 10px;
            z-index: 0;
        }
    </style>
</head>
<body>
    <div class="sertifikat">
        <div class="watermark">SIKAWAN</div>
        <div class="content">
            <div class="header">
                <h1>SIKAWAN</h1>
                <p>Sistem Kompetensi Walidata</p>
            </div>

            <div class="title">Sertifikat Kompetensi</div>
            <div class="subtitle">Diberikan kepada:</div>

            <div class="nama">{{ strtoupper($sertifikat->user?->name ?? 'Peserta') }}</div>

            <div class="body-text">
                Telah menyelesaikan asesmen kompetensi dan dinyatakan <strong>LULUS</strong>
                dengan nilai <strong>{{ $sertifikat->nilai_akhir }}</strong>
                pada kompetensi <strong>{{ $sertifikat->kompetensi?->nama ?? '-' }}</strong>
                level <strong>{{ $sertifikat->level?->nama ?? $sertifikat->kategori_kompetensi ?? '-' }}</strong>.
            </div>

            <div class="info">
                <table>
                    <tr><td>Nomor</td><td>: {{ $sertifikat->nomor_sertifikat }}</td></tr>
                    <tr><td>Asesmen</td><td>: {{ $sertifikat->asesmen?->judul ?? '-' }}</td></tr>
                    <tr><td>Kategori</td><td>: {{ $sertifikat->kategori_kompetensi ?? '-' }}</td></tr>
                    <tr><td>Tanggal Terbit</td><td>: {{ is_object($sertifikat->tanggal_terbit) ? $sertifikat->tanggal_terbit->format('d F Y') : date('d F Y', strtotime($sertifikat->tanggal_terbit)) }}</td></tr>
                    <tr><td>Masa Berlaku</td><td>: {{ is_object($sertifikat->tanggal_expired) ? $sertifikat->tanggal_expired->format('d F Y') : date('d F Y', strtotime($sertifikat->tanggal_expired)) }}</td></tr>
                </table>
            </div>

            <div class="ttd">
                <div class="line">Kepala Dinas</div>
            </div>
        </div>
    </div>
</body>
</html>
