import { useCallback, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import api from '../../api/axios'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

function BankSoal() {
  const [rows, setRows] = useState([])
  const [kompetensis, setKompetensis] = useState([])
  const [levels, setLevels] = useState([])
  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { control, register, handleSubmit, reset } = useForm()
  const jenis = useWatch({ control, name: 'jenis' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (filterJenis) params.jenis = filterJenis
      const res = await api.get('/bank-soals', { params })
      setRows(normalize(res.data))
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memuat bank soal')
    } finally {
      setLoading(false)
    }
  }, [search, filterJenis])

  const loadRefs = useCallback(async () => {
    const [k, l] = await Promise.all([api.get('/kompetensis'), api.get('/levels')])
    setKompetensis(normalize(k.data))
    setLevels(normalize(l.data))
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      load()
      loadRefs()
    })
  }, [load, loadRefs])

  const openCreate = () => {
    setEditing(null)
    reset({ kompetensi_id: '', level_id: '', jenis: 'pilihan_ganda', pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar: '', pembahasan: '', bobot: 1, is_active: 1 })
    setShowForm(true)
  }

  const openEdit = (row) => {
    const choices = Array.isArray(row.pilihan) ? row.pilihan : []
    setEditing(row)
    reset({
      kompetensi_id: row.kompetensi_id || '',
      level_id: row.level_id || '',
      jenis: row.jenis || 'pilihan_ganda',
      pertanyaan: row.pertanyaan || '',
      pilihan_a: choices[0] || '',
      pilihan_b: choices[1] || '',
      pilihan_c: choices[2] || '',
      pilihan_d: choices[3] || '',
      jawaban_benar: row.jawaban_benar || '',
      pembahasan: row.pembahasan || '',
      bobot: row.bobot || 1,
      is_active: row.is_active ? 1 : 0,
    })
    setShowForm(true)
  }

  const save = async (data) => {
    const pilihan = [data.pilihan_a, data.pilihan_b, data.pilihan_c, data.pilihan_d].filter(Boolean)
    const payload = {
      kompetensi_id: data.kompetensi_id,
      level_id: data.level_id || null,
      jenis: data.jenis,
      pertanyaan: data.pertanyaan,
      pilihan: data.jenis === 'pilihan_ganda' ? pilihan : null,
      jawaban_benar: data.jawaban_benar || null,
      pembahasan: data.pembahasan || null,
      bobot: Number(data.bobot || 1),
      is_active: Number(data.is_active) === 1,
    }

    try {
      if (editing?.id) await api.put(`/bank-soals/${editing.id}`, payload)
      else await api.post('/bank-soals', payload)
      setShowForm(false)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan soal')
    }
  }

  const remove = async (row) => {
    if (!confirm('Hapus soal ini?')) return
    await api.delete(`/bank-soals/${row.id}`)
    load()
  }

  const exportCsv = async () => {
    try {
      const res = await api.get('/bank-soals/export?format=csv', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = 'bank-soal.csv'
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal export bank soal')
    }
  }

  return (
    <div>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex align-items-start gap-3">
            <div className="pembelajaran-icon-sm" style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}><i className="bi bi-question-circle"></i></div>
            <div>
              <h4 className="fw-bold mb-1">Bank Soal</h4>
              <p className="text-muted mb-0">Modul ini dipakai admin/penguji untuk menyiapkan soal pilihan ganda dan essay. Soal dari sini akan ditarik oleh modul Asesmen sesuai kompetensi, level, jumlah soal, dan pengaturan random.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
            <div className="d-flex flex-wrap gap-2">
              <input className="form-control" style={{ maxWidth: 280 }} placeholder="Cari pertanyaan..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
              <select className="form-select" style={{ maxWidth: 190 }} value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
                <option value="">Semua Jenis</option>
                <option value="pilihan_ganda">Pilihan Ganda</option>
                <option value="essay">Essay</option>
              </select>
              <button className="btn btn-outline-primary" onClick={load}>Filter</button>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-success" onClick={exportCsv}><i className="bi bi-file-earmark-excel me-1"></i>Export</button>
              <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Tambah Soal</button>
            </div>
          </div>

          {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light"><tr><th>Soal</th><th>Kompetensi</th><th>Level</th><th>Jenis</th><th>Jawaban</th><th>Bobot</th><th>Status</th><th className="text-end">Aksi</th></tr></thead>
                <tbody>{rows.map((row) => <tr key={row.id}>
                  <td><div className="fw-semibold">{row.pertanyaan}</div>{row.pembahasan && <small className="text-muted">Pembahasan: {row.pembahasan}</small>}</td>
                  <td>{row.kompetensi?.nama || '-'}</td>
                  <td>{row.level?.nama || '-'}</td>
                  <td><span className="badge bg-info">{row.jenis === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'}</span></td>
                  <td>{row.jawaban_benar || '-'}</td>
                  <td>{row.bobot}</td>
                  <td>{row.is_active ? <span className="badge bg-success">Aktif</span> : <span className="badge bg-secondary">Nonaktif</span>}</td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(row)} title="Edit"><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(row)} title="Hapus"><i className="bi bi-trash"></i></button>
                  </td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
        <div className="modal-dialog modal-lg"><div className="modal-content"><form onSubmit={handleSubmit(save)}>
          <div className="modal-header"><h5 className="modal-title">{editing ? 'Edit' : 'Tambah'} Soal</h5><button type="button" className="btn-close" onClick={() => setShowForm(false)} /></div>
          <div className="modal-body"><div className="row g-3">
            <div className="col-md-6"><label className="form-label">Kompetensi</label><select className="form-select" {...register('kompetensi_id', { required: true })}><option value="">Pilih Kompetensi</option>{kompetensis.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label">Level</label><select className="form-select" {...register('level_id')}><option value="">Semua Level</option>{levels.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label">Jenis Soal</label><select className="form-select" {...register('jenis')}><option value="pilihan_ganda">Pilihan Ganda</option><option value="essay">Essay</option></select></div>
            <div className="col-md-3"><label className="form-label">Bobot</label><input className="form-control" type="number" step="0.1" {...register('bobot', { required: true })} /></div>
            <div className="col-md-3"><label className="form-label">Status</label><select className="form-select" {...register('is_active')}><option value={1}>Aktif</option><option value={0}>Nonaktif</option></select></div>
            <div className="col-12"><label className="form-label">Pertanyaan</label><textarea className="form-control" rows="3" {...register('pertanyaan', { required: true })} /></div>
            {jenis === 'pilihan_ganda' && <>
              <div className="col-md-6"><label className="form-label">Pilihan A</label><input className="form-control" {...register('pilihan_a')} /></div>
              <div className="col-md-6"><label className="form-label">Pilihan B</label><input className="form-control" {...register('pilihan_b')} /></div>
              <div className="col-md-6"><label className="form-label">Pilihan C</label><input className="form-control" {...register('pilihan_c')} /></div>
              <div className="col-md-6"><label className="form-label">Pilihan D</label><input className="form-control" {...register('pilihan_d')} /></div>
            </>}
            <div className="col-12"><label className="form-label">Jawaban Benar</label><input className="form-control" placeholder="Isi sama persis dengan pilihan benar untuk PG" {...register('jawaban_benar')} /></div>
            <div className="col-12"><label className="form-label">Pembahasan</label><textarea className="form-control" rows="2" {...register('pembahasan')} /></div>
          </div></div>
          <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button><button className="btn btn-primary">Simpan Soal</button></div>
        </form></div></div>
      </div>}
    </div>
  )
}

export default BankSoal
