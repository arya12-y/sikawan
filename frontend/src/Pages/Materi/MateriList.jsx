import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

const jenisConfig = {
  video: { title: 'Video Pembelajaran', icon: 'bi-play-circle-fill', gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)', accept: 'video/*', viewLabel: 'Tonton', viewIcon: 'bi-play-btn' },
  pdf: { title: 'Modul PDF', icon: 'bi-file-earmark-pdf-fill', gradient: 'linear-gradient(135deg, #dc2626, #f43f5e)', accept: '.pdf', viewLabel: 'Baca', viewIcon: 'bi-eye' },
  presentasi: { title: 'Presentasi', icon: 'bi-easel-fill', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', accept: '.ppt,.pptx,.odp', viewLabel: 'Lihat', viewIcon: 'bi-eye' },
}

const STORAGE_URL = (import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage') + '/'

function getYoutubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&/]+)/)
  return match ? match[1] : null
}

function MateriList({ jenis }) {
  const config = jenisConfig[jenis]
  const navigate = useNavigate()
  const { user } = useAuth()
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const canManage = roles.includes('Super Admin') || roles.includes('Admin Diskominfo')

  const [rows, setRows] = useState([])
  const [kompetensis, setKompetensis] = useState([])
  const [levels, setLevels] = useState([])
  const [kategoris, setKategoris] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { jenis }
      if (search) params.search = search
      const res = await api.get('/materis', { params })
      const data = res.data?.data ?? res.data
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [jenis, search])

  const loadRefs = useCallback(async () => {
    try {
      const [k, l, c] = await Promise.all([api.get('/kompetensis'), api.get('/levels'), api.get('/kategoris')])
      setKompetensis(Array.isArray(k.data?.data ?? k.data) ? (k.data?.data ?? k.data) : [])
      setLevels(Array.isArray(l.data?.data ?? l.data) ? (l.data?.data ?? l.data) : [])
      setKategoris(Array.isArray(c.data?.data ?? c.data) ? (c.data?.data ?? c.data) : [])
    } catch {
      setKompetensis([])
      setLevels([])
      setKategoris([])
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      load()
      loadRefs()
    })
  }, [load, loadRefs])

  const openCreate = () => {
    setEditing(null)
    reset({ kompetensi_id: '', level_id: '', kategori_id: '', judul: '', deskripsi: '', url_video: '', durasi: '', is_published: 0 })
    setShowForm(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    reset({
      kompetensi_id: row.kompetensi_id || '',
      level_id: row.level_id || '',
      kategori_id: row.kategori_id || '',
      judul: row.judul || '',
      deskripsi: row.deskripsi || '',
      url_video: row.url_video || '',
      durasi: row.durasi || '',
      is_published: row.is_published ? 1 : 0,
    })
    setShowForm(true)
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('jenis', jenis)
      formData.append('kompetensi_id', data.kompetensi_id)
      if (data.level_id) formData.append('level_id', data.level_id)
      if (data.kategori_id) formData.append('kategori_id', data.kategori_id)
      formData.append('judul', data.judul)
      if (data.deskripsi) formData.append('deskripsi', data.deskripsi)
      if (data.url_video) formData.append('url_video', data.url_video)
      if (data.durasi) formData.append('durasi', data.durasi)
      formData.append('is_published', data.is_published ? 1 : 0)
      if (data.file?.[0]) formData.append('file', data.file[0])
      if (data.thumbnail_file?.[0]) formData.append('thumbnail_file', data.thumbnail_file[0])

      if (editing) {
        formData.append('_method', 'PUT')
        await api.post(`/materis/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/materis', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setShowForm(false)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan data')
    }
  }

  const remove = async (row) => {
    if (!confirm(`Hapus "${row.judul}"?`)) return
    try {
      await api.delete(`/materis/${row.id}`)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menghapus')
    }
  }

  const openFile = (row) => {
    if (row.file_path) {
      window.open(STORAGE_URL + row.file_path, '_blank')
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-outline-secondary btn-sm me-3" onClick={() => navigate('/pembelajaran')}>
          <i className="bi bi-arrow-left me-1"></i>Kembali
        </button>
        <div className="pembelajaran-icon-sm me-3" style={{ background: config.gradient }}>
          <i className={`bi ${config.icon}`}></i>
        </div>
        <h4 className="mb-0 fw-bold">{config.title}</h4>
      </div>

      {viewing && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header d-flex justify-content-between align-items-center bg-white">
            <h5 className="fw-bold mb-0">{viewing.judul}</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setViewing(null)}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="card-body">
            {jenis === 'video' && viewing.url_video && getYoutubeId(viewing.url_video) ? (
              <div className="ratio ratio-16x9 mb-3">
                <iframe src={`https://www.youtube.com/embed/${getYoutubeId(viewing.url_video)}`} allowFullScreen title={viewing.judul}></iframe>
              </div>
            ) : jenis === 'video' && viewing.url_video ? (
              <div className="ratio ratio-16x9 mb-3">
                <video controls src={viewing.url_video}></video>
              </div>
            ) : jenis === 'video' && viewing.file_path ? (
              <div className="ratio ratio-16x9 mb-3">
                <video controls src={STORAGE_URL + viewing.file_path}></video>
              </div>
            ) : jenis === 'pdf' && viewing.file_path ? (
              <div className="ratio" style={{ minHeight: 600, '--bs-aspect-ratio': 'auto' }}>
                <iframe src={STORAGE_URL + viewing.file_path} title={viewing.judul} style={{ width: '100%', height: 600, border: 'none' }}></iframe>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-exclamation-circle d-block mb-2" style={{ fontSize: '2rem' }}></i>
                File belum tersedia.
                {viewing.file_path && <div className="mt-2"><button className="btn btn-sm btn-primary" onClick={() => openFile(viewing)}>Download File</button></div>}
              </div>
            )}
            {viewing.deskripsi && <p className="text-muted mt-3 mb-0">{viewing.deskripsi}</p>}
            {viewing.durasi && <small className="text-muted">Durasi: {viewing.durasi} menit</small>}
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
            <div className="d-flex gap-2 align-items-center">
              <input className="form-control" style={{ maxWidth: 300 }} placeholder="Cari materi..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
              <button className="btn btn-outline-primary" onClick={load}>
                <i className="bi bi-search"></i>
              </button>
            </div>
            {canManage && (
              <button className="btn btn-primary" onClick={openCreate}>
                <i className="bi bi-plus-lg me-1"></i>Tambah
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border spinner-border-sm me-2"></div>Memuat...
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className={`bi ${config.icon} d-block mb-2`} style={{ fontSize: '2.5rem' }}></i>
              Belum ada data {config.title.toLowerCase()}
            </div>
          ) : (
            <div className="row g-3">
              {rows.map((row) => (
                <div className="col-md-6 col-xl-4" key={row.id}>
                  <div className="card border h-100">
                    {row.thumbnail && <img src={STORAGE_URL + row.thumbnail} alt={row.judul} className="card-img-top" style={{ height: 160, objectFit: 'cover' }} />}
                    {!row.thumbnail && (
                      <div className="card-img-top d-grid place-items-center text-white" style={{ height: 120, background: config.gradient }}>
                        <i className={`bi ${config.icon}`} style={{ fontSize: '2.5rem' }}></i>
                      </div>
                    )}
                    <div className="card-body">
                      <h6 className="fw-bold mb-1">{row.judul}</h6>
                      {row.deskripsi && <p className="text-muted small mb-2">{row.deskripsi.substring(0, 100)}{row.deskripsi.length > 100 ? '...' : ''}</p>}
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        <span className="badge bg-light text-dark">{row.kompetensi?.nama || '-'}</span>
                        {row.level?.nama && <span className="badge bg-primary">{row.level.nama}</span>}
                        {row.durasi && <span className="badge bg-secondary">{row.durasi} menit</span>}
                      </div>
                    </div>
                    <div className="card-footer bg-white d-flex gap-2">
                      <button className="btn btn-sm btn-success flex-fill" onClick={() => setViewing(row)}>
                        <i className={`bi ${config.viewIcon} me-1`}></i>{config.viewLabel}
                      </button>
                      {row.file_path && (
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openFile(row)}>
                          <i className="bi bi-download"></i>
                        </button>
                      )}
                      {canManage && (
                        <>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(row)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => remove(row)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && canManage && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-header">
                  <h5 className="modal-title">{editing ? 'Edit' : 'Tambah'} {config.title}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Judul <span className="text-danger">*</span></label>
                      <input className="form-control" {...register('judul', { required: true })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Deskripsi</label>
                      <textarea className="form-control" rows={3} {...register('deskripsi')} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Kompetensi <span className="text-danger">*</span></label>
                      <select className="form-select" {...register('kompetensi_id', { required: true })}>
                        <option value="">Pilih Kompetensi</option>
                        {kompetensis.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Level</label>
                      <select className="form-select" {...register('level_id')}>
                        <option value="">Pilih Level</option>
                        {levels.map((l) => <option key={l.id} value={l.id}>{l.nama}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Kategori</label>
                      <select className="form-select" {...register('kategori_id')}>
                        <option value="">Pilih Kategori</option>
                        {kategoris.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                      </select>
                    </div>
                    {jenis === 'video' && (
                      <>
                        <div className="col-md-8">
                          <label className="form-label fw-semibold">URL Video</label>
                          <input className="form-control" placeholder="https://youtube.com/..." {...register('url_video')} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Durasi (menit)</label>
                          <input className="form-control" type="number" {...register('durasi')} />
                        </div>
                      </>
                    )}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Upload File</label>
                      <input className="form-control" type="file" accept={config.accept} {...register('file')} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Thumbnail</label>
                      <input className="form-control" type="file" accept="image/*" {...register('thumbnail_file')} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Status</label>
                      <select className="form-select" {...register('is_published')}>
                        <option value={0}>Draft</option>
                        <option value={1}>Published</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button className="btn btn-primary">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MateriList
