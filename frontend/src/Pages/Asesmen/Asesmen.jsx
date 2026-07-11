import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

function Asesmen() {
  const [asesmens, setAsesmens] = useState([])
  const [kompetensis, setKompetensis] = useState([])
  const [levels, setLevels] = useState([])
  const [activeTab, setActiveTab] = useState('list')
  const [current, setCurrent] = useState(null)
  const [peserta, setPeserta] = useState(null)
  const [answers, setAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { register, handleSubmit, reset } = useForm()
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const canManage = roles.includes('Super Admin') || roles.includes('Admin Diskominfo')

  const questions = useMemo(() => peserta?.asesmen?.bank_soals || peserta?.asesmen?.bankSoals || [], [peserta])
  const answeredCount = Object.values(answers).filter((value) => String(value || '').trim() !== '').length

  const load = useCallback(async () => {
    const [a, k, l] = await Promise.all([api.get('/asesmens'), api.get('/kompetensis'), api.get('/levels')])
    setAsesmens(normalize(a.data))
    setKompetensis(normalize(k.data))
    setLevels(normalize(l.data))
  }, [])

  useEffect(() => {
    queueMicrotask(() => load())
  }, [load])

  const submitExam = useCallback(async (auto = false) => {
    if (!auto && !confirm('Submit asesmen sekarang?')) return
    try {
      const res = await api.post(`/peserta-asesmens/${peserta.id}/submit`)
      const review = await api.get(`/peserta-asesmens/${res.data.id}/review`)
      setPeserta(review.data)
      setActiveTab('result')
      await load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal submit asesmen')
    }
  }, [load, peserta])

  useEffect(() => {
    if (!secondsLeft || !peserta || peserta.status === 'selesai') return
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(timer)
          submitExam(true)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft, peserta, submitExam])

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60)
    const seconds = value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const getName = (items, id) => items.find((item) => item.id === id)?.nama || '-'

  const openCreate = () => {
    setCurrent(null)
    reset({ judul: '', deskripsi: '', kompetensi_id: '', level_id: '', jumlah_soal: 10, durasi: 30, nilai_lulus: 60, acak_soal: 1, acak_jawaban: 1, status: 'published' })
    setActiveTab('form')
  }

  const openEdit = (row) => {
    setCurrent(row)
    reset({ ...row, acak_soal: row.acak_soal ? 1 : 0, acak_jawaban: row.acak_jawaban ? 1 : 0 })
    setActiveTab('form')
  }

  const save = async (data) => {
    const payload = {
      ...data,
      jumlah_soal: Number(data.jumlah_soal || 0),
      durasi: Number(data.durasi || 0),
      nilai_lulus: Number(data.nilai_lulus || 0),
      level_id: data.level_id || null,
      acak_soal: Number(data.acak_soal) === 1,
      acak_jawaban: Number(data.acak_jawaban) === 1,
    }
    try {
      if (current?.id) await api.put(`/asesmens/${current.id}`, payload)
      else await api.post('/asesmens', payload)
      await load()
      setActiveTab('list')
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan asesmen')
    }
  }

  const remove = async (row) => {
    if (!confirm(`Hapus asesmen "${row.judul}"?`)) return
    await api.delete(`/asesmens/${row.id}`)
    load()
  }

  const startExam = async (row) => {
    try {
      setLoading(true)
      const res = await api.post(`/asesmens/${row.id}/start`)
      setPeserta(res.data)
      const saved = {}
      ;(res.data.jawaban_pesertas || res.data.jawabanPesertas || []).forEach((item) => { saved[item.bank_soal_id] = item.jawaban })
      setAnswers(saved)
      setSecondsLeft(Number(res.data.asesmen?.durasi || row.durasi || 0) * 60)
      setActiveTab('exam')
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memulai asesmen. Pastikan bank soal tersedia.')
    } finally {
      setLoading(false)
    }
  }

  const saveAnswer = async (soalId, value) => {
    setAnswers((state) => ({ ...state, [soalId]: value }))
    if (!peserta?.id) return
    try {
      await api.post(`/peserta-asesmens/${peserta.id}/save-answer`, { bank_soal_id: soalId, jawaban: value })
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan jawaban')
    }
  }


  const publishBadge = (status) => {
    const color = status === 'published' || status === 'ongoing' ? 'success' : status === 'finished' ? 'dark' : 'secondary'
    return <span className={`badge bg-${color}`}>{status}</span>
  }

  const isWalidata = roles.includes('Walidata')

  return (
    <div>
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
            <div className="d-flex align-items-start gap-3">
              <div className="pembelajaran-icon-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}><i className="bi bi-clipboard-check"></i></div>
              <div>
                <h4 className="fw-bold mb-1">Asesmen</h4>
                <p className="text-muted mb-0">Modul ini adalah tempat ujian. Admin membuat asesmen dari Bank Soal, sedangkan Walidata cukup klik Mulai Ujian untuk mengerjakan soal.</p>
              </div>
            </div>
            <div className="d-flex gap-2">
              {activeTab === 'list' && canManage && <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Buat Asesmen</button>}
              {activeTab !== 'list' && <button className="btn btn-outline-secondary" onClick={() => setActiveTab('list')}><i className="bi bi-arrow-left me-1"></i>Kembali</button>}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="card shadow-sm border-0"><div className="card-body">
          <div className="table-responsive"><table className="table table-hover align-middle">
            <thead className="table-light"><tr><th>Judul</th><th>Kompetensi</th><th>Level</th><th>Soal</th><th>Timer</th><th>Status</th><th>Fitur</th><th className="text-end">Aksi</th></tr></thead>
            <tbody>{asesmens.map((row) => <tr key={row.id}>
              <td><div className="fw-semibold">{row.judul}</div><small className="text-muted">Nilai lulus {row.nilai_lulus}</small></td>
              <td>{row.kompetensi?.nama || getName(kompetensis, row.kompetensi_id)}</td>
              <td>{row.level?.nama || getName(levels, row.level_id)}</td>
              <td>{row.jumlah_soal}</td>
              <td>{row.durasi} menit</td>
              <td>{publishBadge(row.status)}</td>
              <td><span className="badge bg-info me-1">Random: {row.acak_soal ? 'Ya' : 'Tidak'}</span><span className="badge bg-primary">Auto Score</span></td>
              <td className="text-end text-nowrap">
                {isWalidata && <button className="btn btn-sm btn-success me-1" disabled={loading || !['published', 'ongoing'].includes(row.status)} onClick={() => startExam(row)}><i className="bi bi-play-circle me-1"></i>Mulai Ujian</button>}
                {canManage && <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(row)} title="Edit"><i className="bi bi-pencil"></i></button>}
                {canManage && <button className="btn btn-sm btn-outline-danger" onClick={() => remove(row)} title="Hapus"><i className="bi bi-trash"></i></button>}
              </td>
            </tr>)}</tbody>
          </table></div>
        </div></div>
      )}

      {activeTab === 'form' && (
        <div className="card shadow-sm border-0"><div className="card-body"><form onSubmit={handleSubmit(save)} className="row g-3">
          <div className="col-md-8"><label className="form-label">Judul</label><input className="form-control" {...register('judul', { required: true })} /></div>
          <div className="col-md-4"><label className="form-label">Status</label><select className="form-select" {...register('status')}><option value="draft">Draft</option><option value="published">Published</option><option value="ongoing">Ongoing</option><option value="finished">Finished</option></select></div>
          <div className="col-12"><label className="form-label">Deskripsi</label><textarea className="form-control" rows="3" {...register('deskripsi')} /></div>
          <div className="col-md-6"><label className="form-label">Kompetensi</label><select className="form-select" {...register('kompetensi_id', { required: true })}><option value="">Pilih</option>{kompetensis.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label">Level</label><select className="form-select" {...register('level_id')}><option value="">Semua Level</option>{levels.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></div>
          <div className="col-md-4"><label className="form-label">Jumlah Soal</label><input type="number" className="form-control" {...register('jumlah_soal', { required: true })} /></div>
          <div className="col-md-4"><label className="form-label">Durasi (menit)</label><input type="number" className="form-control" {...register('durasi', { required: true })} /></div>
          <div className="col-md-4"><label className="form-label">Nilai Lulus</label><input type="number" className="form-control" {...register('nilai_lulus', { required: true })} /></div>
          <div className="col-md-6"><label className="form-label">Random Soal</label><select className="form-select" {...register('acak_soal')}><option value={1}>Ya</option><option value={0}>Tidak</option></select></div>
          <div className="col-md-6"><label className="form-label">Random Jawaban</label><select className="form-select" {...register('acak_jawaban')}><option value={1}>Ya</option><option value={0}>Tidak</option></select></div>
          <div className="col-12 text-end"><button className="btn btn-primary">Simpan</button></div>
        </form></div></div>
      )}

      {activeTab === 'exam' && peserta && (
        <div className="row g-4">
          <div className="col-lg-8"><div className="card shadow-sm border-0"><div className="card-body">
            <h5 className="fw-bold mb-3">{peserta.asesmen?.judul}</h5>
            {questions.map((soal, index) => <div className="border rounded-4 p-3 mb-3" key={soal.id}>
              <div className="fw-semibold mb-2">{index + 1}. {soal.pertanyaan}</div>
              {soal.jenis === 'pilihan_ganda' && Array.isArray(soal.pilihan) ? soal.pilihan.map((choice, i) => <label className="d-block mb-2" key={i}><input className="form-check-input me-2" type="radio" name={`soal-${soal.id}`} checked={answers[soal.id] === choice} onChange={() => saveAnswer(soal.id, choice)} />{choice}</label>) : <textarea className="form-control" rows="4" value={answers[soal.id] || ''} onChange={(e) => saveAnswer(soal.id, e.target.value)} />}
            </div>)}
          </div></div></div>
          <div className="col-lg-4"><div className="card shadow-sm border-0 sticky-top" style={{ top: 90 }}><div className="card-body">
            <div className="text-center mb-3"><div className="fs-2 fw-bold text-danger">{formatTime(secondsLeft)}</div><small className="text-muted">Sisa waktu</small></div>
            <div className="mb-3"><div className="d-flex justify-content-between"><span>Terjawab</span><strong>{answeredCount}/{questions.length}</strong></div><div className="progress mt-2"><div className="progress-bar" style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}></div></div></div>
            <button className="btn btn-success w-100" onClick={() => submitExam(false)}>Submit Asesmen</button>
          </div></div></div>
        </div>
      )}

      {activeTab === 'result' && peserta && (
        <div className="card shadow-sm border-0"><div className="card-body text-center py-5">
          <div className={`display-6 fw-bold ${peserta.lulus ? 'text-success' : 'text-danger'}`}>{Math.round(Number(peserta.nilai || 0))}</div>
          <h4 className="fw-bold mt-2">{peserta.lulus ? 'Lulus' : 'Belum Lulus'}</h4>
          <p className="text-muted">Auto summary: {peserta.jawaban_pesertas?.length || peserta.jawabanPesertas?.length || answeredCount} jawaban tersimpan dari {questions.length} soal.</p>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {peserta.lulus ? <Link className="btn btn-success" to="/sertifikat">Lihat / Download Sertifikat</Link> : <Link className="btn btn-warning" to="/pembelajaran">Lihat Rekomendasi Belajar</Link>}
            <button className="btn btn-outline-primary" onClick={() => setActiveTab('list')}>Kembali ke Daftar Asesmen</button>
          </div>
        </div></div>
      )}
    </div>
  )
}

export default Asesmen
