import { useCallback, useEffect, useState } from 'react'
import api from '../../api/axios'

const emptyData = {
  walidata: null,
  asesmens: [],
  pesertas: [],
  materis: [],
  sertifikats: [],
  recommendations: [],
}

function StatusBadge({ done, label }) {
  return <span className={`badge ${done ? 'text-bg-success' : 'text-bg-secondary'}`}>{done ? 'Selesai' : label}</span>
}

function AlurWalidata() {
  const [data, setData] = useState(emptyData)
  const [activePeserta, setActivePeserta] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/walidata-flow')
      setData({ ...emptyData, ...res.data })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [load])

  const startAsesmen = async (asesmen) => {
    const res = await api.post(`/asesmens/${asesmen.id}/start`)
    setActivePeserta(res.data)
    setResult(null)
    setAnswers({})
  }

  const saveAnswer = async (soal, jawaban) => {
    setAnswers((current) => ({ ...current, [soal.id]: jawaban }))
    await api.post(`/peserta-asesmens/${activePeserta.id}/save-answer`, { bank_soal_id: soal.id, jawaban })
  }

  const submitAsesmen = async () => {
    const submitted = await api.post(`/peserta-asesmens/${activePeserta.id}/submit`)
    const res = await api.get(`/walidata-flow/result/${submitted.data.id}`)
    setResult(res.data)
    setActivePeserta(null)
    await load()
  }

  const completeMateri = async (materi) => {
    await api.post(`/walidata-flow/materi/${materi.id}/complete`)
    await load()
  }

  if (loading) return <div className="card shadow-sm"><div className="card-body">Memuat alur Walidata...</div></div>

  const lastPeserta = result?.peserta ?? data.pesertas?.[0]
  const recommendations = result?.recommendations ?? data.recommendations ?? []

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="mb-3">Alur Kerja Walidata</h4>
            <div className="row g-3">
              <div className="col-md-3"><StatusBadge done={Boolean(data.walidata)} label="Menunggu" /> <div>1. Registrasi Walidata</div></div>
              <div className="col-md-3"><StatusBadge done={Boolean(data.walidata?.opd_id)} label="Lengkapi" /> <div>2. Melengkapi Profil</div></div>
              <div className="col-md-3"><StatusBadge done={Boolean(lastPeserta)} label="Mulai" /> <div>3. Pre-test / Asesmen</div></div>
              <div className="col-md-3"><StatusBadge done={Boolean(data.walidata?.level_id)} label="Belum" /> <div>4. Level Awal</div></div>
              <div className="col-md-3"><StatusBadge done={data.materis.length > 0} label="Belajar" /> <div>5. Belajar Materi</div></div>
              <div className="col-md-3"><StatusBadge done={lastPeserta?.status === 'selesai'} label="Kerjakan" /> <div>6. Mengikuti Asesmen</div></div>
              <div className="col-md-3"><StatusBadge done={Boolean(data.sertifikats?.length || result?.sertifikat)} label="Menunggu" /> <div>7. Sertifikat / Rekomendasi</div></div>
              <div className="col-md-3"><StatusBadge done={Boolean(data.pesertas?.length)} label="Dipantau" /> <div>8. Monitoring Berkala</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5>Profil & Level</h5>
            <p className="mb-1">OPD: {data.walidata?.opd?.nama ?? '-'}</p>
            <p className="mb-1">Bidang: {data.walidata?.bidang?.nama ?? '-'}</p>
            <p className="mb-1">Jabatan: {data.walidata?.jabatan?.nama ?? '-'}</p>
            <p className="mb-1">Level: {data.walidata?.level?.nama ?? result?.level?.nama ?? 'Belum ditentukan'}</p>
            <p className="mb-0">Nilai Kompetensi: {data.walidata?.nilai_kompetensi ?? '-'}</p>
          </div>
        </div>
      </div>

      <div className="col-lg-8">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5>Pre-test / Asesmen Tersedia</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead><tr><th>Judul</th><th>Kompetensi</th><th>Level</th><th>Nilai Lulus</th><th></th></tr></thead>
                <tbody>{data.asesmens.map((asesmen) => <tr key={asesmen.id}><td>{asesmen.judul}</td><td>{asesmen.kompetensi?.nama ?? '-'}</td><td>{asesmen.level?.nama ?? '-'}</td><td>{asesmen.nilai_lulus}</td><td className="text-end"><button className="btn btn-sm btn-primary" onClick={() => startAsesmen(asesmen)}>Mulai</button></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {activePeserta && <div className="col-12"><div className="card shadow-sm"><div className="card-body"><h5>{activePeserta.asesmen?.judul}</h5>{activePeserta.asesmen?.bank_soals?.map((soal, index) => <div className="border rounded p-3 mb-3" key={soal.id}><div className="fw-semibold mb-2">{index + 1}. {soal.pertanyaan}</div>{Array.isArray(soal.pilihan) ? soal.pilihan.map((pilihan) => <label className="d-block" key={pilihan}><input className="form-check-input me-2" type="radio" name={`soal-${soal.id}`} value={pilihan} checked={answers[soal.id] === pilihan} onChange={(e) => saveAnswer(soal, e.target.value)} />{pilihan}</label>) : <textarea className="form-control" rows="3" value={answers[soal.id] ?? ''} onChange={(e) => saveAnswer(soal, e.target.value)} />}</div>)}<button className="btn btn-success" onClick={submitAsesmen}>Submit Asesmen</button></div></div></div>}

      {lastPeserta && <div className="col-lg-6"><div className="card shadow-sm h-100"><div className="card-body"><h5>Hasil Asesmen</h5><p>Nilai: <strong>{lastPeserta.nilai ?? '-'}</strong></p><p>Status: <span className={`badge ${lastPeserta.lulus ? 'text-bg-success' : 'text-bg-danger'}`}>{lastPeserta.lulus ? 'Lulus' : 'Tidak Lulus'}</span></p>{result?.sertifikat && <p>Sertifikat: {result.sertifikat.nomor_sertifikat}</p>}</div></div></div>}

      <div className="col-lg-6"><div className="card shadow-sm h-100"><div className="card-body"><h5>Rekomendasi Belajar</h5>{recommendations.length === 0 ? <p className="text-muted mb-0">Belum ada rekomendasi.</p> : recommendations.map((materi) => <div className="border rounded p-2 mb-2" key={materi.id}><div className="fw-semibold">{materi.judul}</div><div className="small text-muted">{materi.kompetensi?.nama ?? '-'} · {materi.level?.nama ?? 'Semua level'}</div></div>)}</div></div></div>

      <div className="col-lg-6"><div className="card shadow-sm h-100"><div className="card-body"><h5>Belajar Materi</h5>{data.materis.map((materi) => <div className="d-flex justify-content-between align-items-center border-bottom py-2" key={materi.id}><div><div className="fw-semibold">{materi.judul}</div><div className="small text-muted">{materi.jenis} · {materi.level?.nama ?? 'Semua level'}</div></div><button className="btn btn-sm btn-outline-success" onClick={() => completeMateri(materi)}>Tandai Selesai</button></div>)}</div></div></div>

      <div className="col-lg-6"><div className="card shadow-sm h-100"><div className="card-body"><h5>Sertifikat</h5>{data.sertifikats.length === 0 ? <p className="text-muted mb-0">Belum ada sertifikat.</p> : data.sertifikats.map((sertifikat) => <div className="border rounded p-2 mb-2" key={sertifikat.id}><div className="fw-semibold">{sertifikat.nomor_sertifikat}</div><div className="small text-muted">{sertifikat.kompetensi?.nama ?? '-'} · Nilai {sertifikat.nilai_akhir}</div></div>)}</div></div></div>

      <div className="col-12"><div className="card shadow-sm"><div className="card-body"><h5>Monitoring Berkala</h5><div className="table-responsive"><table className="table"><thead><tr><th>Asesmen</th><th>Nilai</th><th>Status</th><th>Waktu</th></tr></thead><tbody>{data.pesertas.map((peserta) => <tr key={peserta.id}><td>{peserta.asesmen?.judul ?? '-'}</td><td>{peserta.nilai ?? '-'}</td><td>{peserta.lulus ? 'Lulus' : peserta.status}</td><td>{peserta.waktu_selesai ?? peserta.waktu_mulai ?? '-'}</td></tr>)}</tbody></table></div></div></div></div>
    </div>
  )
}

export default AlurWalidata
