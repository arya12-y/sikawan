import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle, AlertTriangle, Search, Plus, X, FileDown, Download, AlertCircle, PlayCircle, FileText, Presentation, Play, Eye, Pencil, Trash2, Upload, ChevronLeft, ArrowLeft } from 'lucide-react'
import api from '../../api/axios'
import { can } from '../../utils/can'
import { useAuth } from '../../hooks/useAuth'
import { confirmDelete } from '../../utils/confirm'

const jenisConfig = {
  video: { title: 'Video Pembelajaran', icon: PlayCircle, gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)', accept: 'video/*', viewLabel: 'Tonton', viewIcon: Play },
  pdf: { title: 'Modul PDF', icon: FileText, gradient: 'linear-gradient(135deg, #dc2626, #f43f5e)', accept: '.pdf', viewLabel: 'Baca', viewIcon: Eye },
  presentasi: { title: 'Presentasi', icon: Presentation, gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', accept: '.ppt,.pptx,.odp', viewLabel: 'Lihat', viewIcon: Eye },
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const FILE_URL = API_BASE.replace(/\/api$/, '')

function getYoutubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&/]+)/)
  return match ? match[1] : null
}

function NotifBanner({ notif, onClose }) {
  if (!notif) return null
  const isSuccess = notif.type === 'success'
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${isSuccess ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400'}`} role="alert">
      {isSuccess ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
      <span>{notif.text}</span>
      <button type="button" className="ml-auto text-slate-400 hover:text-slate-200" onClick={onClose}><X className="h-4 w-4" /></button>
    </div>
  )
}

function ViewModal({ viewing, jenis, config, onClose, onDownload }) {
  if (!viewing) return null
  const Icon = config.icon
  return (
    <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] shadow-xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-[#1E1E2E] px-5 py-4">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-indigo-400" />
          <h5 className="font-bold text-slate-100">{viewing.judul}</h5>
        </div>
        <button className="inline-flex items-center justify-center rounded-xl border border-[#262636] p-1.5 text-sm text-slate-400 hover:bg-[#1A1A26] hover:text-slate-200" onClick={onClose}><X className="h-4 w-4" /></button>
      </div>
      <div className="p-5">
        <ViewerContent viewing={viewing} jenis={jenis} config={config} onDownload={onDownload} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {viewing.deskripsi && <p className="text-sm leading-6 text-slate-400">{viewing.deskripsi}</p>}
          {viewing.kompetensi?.nama && <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">{viewing.kompetensi.nama}</span>}
          {viewing.durasi && <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">{viewing.durasi} menit</span>}
          {viewing.level?.nama && <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">{viewing.level.nama}</span>}
        </div>
      </div>
    </div>
  )
}

function ViewerContent({ viewing, jenis, config, onDownload }) {
  const youtubeId = getYoutubeId(viewing.url_video)
  if (jenis === 'video' && youtubeId) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl shadow-lg shadow-black/20">
        <iframe src={`https://www.youtube.com/embed/${youtubeId}`} allowFullScreen title={viewing.judul} className="h-full w-full" />
      </div>
    )
  }
  if (jenis === 'video' && viewing.url_video) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl shadow-lg shadow-black/20">
        <video controls src={viewing.url_video} className="h-full w-full" />
      </div>
    )
  }
  if (jenis === 'video' && viewing.file_path) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl shadow-lg shadow-black/20">
        <video controls src={FILE_URL + '/api/materi/' + viewing.id + '/file'} className="h-full w-full" />
      </div>
    )
  }
  if (jenis === 'pdf' && viewing.file_path) {
    return (
      <div className="overflow-hidden rounded-xl shadow-lg shadow-black/20">
        <iframe src={FILE_URL + '/api/materi/' + viewing.id + '/file'} title={viewing.judul} className="h-[600px] w-full" />
      </div>
    )
  }
  if (viewing.file_path) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-[#1E1E2E] bg-[#0D0D15] py-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg"><FileDown className="h-7 w-7 text-white" /></div>
        <h6 className="mt-4 font-bold text-slate-100">{viewing.judul}</h6>
        <p className="mb-4 mt-1 text-sm text-slate-400">File tidak dapat ditampilkan langsung di browser.</p>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-violet-500" onClick={() => onDownload(viewing)}><Download className="h-4 w-4" />Download File</button>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center py-6 text-slate-400">
      <AlertCircle className="mb-2 h-8 w-8" />
      <span>File belum tersedia.</span>
      {viewing.file_path && <button className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25" onClick={() => onDownload(viewing)}>Download File</button>}
    </div>
  )
}

function MateriCard({ row, config, onView, onDownload, onEdit, onRemove, canEdit, canDelete }) {
  const Icon = config.icon
  const ViewIcon = config.viewIcon
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#14141E]/95 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10">
      <div className="relative overflow-hidden">
        {row.thumbnail ? (
          <img
            src={FILE_URL + '/api/materi/' + row.id + '/thumbnail'}
            alt={row.judul}
            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden') }}
          />
        ) : null}
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${jenisConfig[row.jenis?.toLowerCase()]?.gradient || 'from-indigo-500 to-violet-500'}`} />
        <div className={`flex h-40 w-full items-center justify-center text-white transition-transform duration-300 group-hover:scale-105 ${row.thumbnail ? 'hidden' : ''}`} style={{ background: config.gradient }}>
          <Icon className="h-12 w-12" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 pb-0">
        <span className="mb-2 inline-block w-fit rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">{row.kompetensi?.nama || '-'}</span>
        <h3 className="line-clamp-2 text-base font-bold text-slate-100">{row.judul}</h3>
        {row.deskripsi && <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">{row.deskripsi}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {row.level?.nama && <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">{row.level.nama}</span>}
          {row.durasi && <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">{row.durasi} menit</span>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 border-t border-[#1E1E2E] p-3">
        <button onClick={() => onView(row)} className="group/btn flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-violet-500"><ViewIcon className="h-4 w-4" />{config.viewLabel}</button>
        {row.file_path && (
          <button onClick={() => onDownload(row)} className="group/btn inline-flex items-center justify-center rounded-xl border border-[#262636] p-2 text-sm text-slate-400 transition-colors hover:bg-[#1A1A26] hover:text-indigo-400" title="Download"><Download className="h-4 w-4" /></button>
        )}
        {canEdit && (
            <button onClick={() => onEdit(row)} className="group/btn inline-flex items-center justify-center rounded-xl border border-[#262636] p-2 text-sm text-slate-400 transition-colors hover:bg-[#1A1A26] hover:text-slate-200" title="Edit"><Pencil className="h-4 w-4" /></button>
        )}
        {canDelete && (
            <button onClick={() => onRemove(row)} className="group/btn inline-flex items-center justify-center rounded-xl border border-rose-600/20 p-2 text-sm text-rose-400 transition-colors hover:bg-rose-500/10" title="Hapus"><Trash2 className="h-4 w-4" /></button>
        )}
      </div>
    </article>
  )
}

function FormUpload({ config, jenis, editing, kompetensis, levels, kategoris, saving, thumbnailPreview, errors, register, handleSubmit, onSubmit, setShowForm, setThumbnailPreview, onBack }) {
  const Icon = config.icon
  return (
    <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] shadow-xl shadow-black/10">
      <div className="border-b border-[#1E1E2E] px-5 py-4">
        <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1.5 text-sm text-indigo-400 transition-colors hover:text-indigo-300"><ArrowLeft className="h-4 w-4" />Kembali</button>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: config.gradient }}><Icon className="h-5 w-5 text-white" /></div>
          <h5 className="font-bold text-slate-100">{editing ? 'Edit' : 'Tambah'} {config.title}</h5>
        </div>
      </div>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
          <div className="md:col-span-6">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Judul <span className="text-rose-400">*</span></label>
            <input className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" placeholder="Masukkan judul materi" {...register('judul', { required: true })} />
            {errors.judul && <p className="mt-1 text-xs text-rose-400">Judul harus diisi</p>}
          </div>
          <div className="md:col-span-6">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Deskripsi</label>
            <textarea className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" rows={3} placeholder="Deskripsi materi..." {...register('deskripsi')} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Kompetensi <span className="text-rose-400">*</span></label>
            <select className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" {...register('kompetensi_id', { required: true })}>
              <option value="">Pilih Kompetensi</option>
              {kompetensis.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
            {errors.kompetensi_id && <p className="mt-1 text-xs text-rose-400">Kompetensi harus dipilih</p>}
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Level</label>
            <select className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" {...register('level_id')}>
              <option value="">Pilih Level</option>
              {levels.map((l) => <option key={l.id} value={l.id}>{l.nama}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Kategori</label>
            <select className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" {...register('kategori_id')}>
              <option value="">Pilih Kategori</option>
              {kategoris.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
          </div>
          {jenis === 'video' && (
            <>
              <div className="md:col-span-4">
                <label className="mb-1.5 block text-xs font-medium text-indigo-400">URL Video</label>
                <input className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" placeholder="https://youtube.com/..." {...register('url_video')} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-indigo-400">Durasi (menit)</label>
                <input className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" type="number" placeholder="0" {...register('durasi')} />
              </div>
            </>
          )}
          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Upload File</label>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#262636] bg-[#1A1A26] px-4 py-5 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/5">
              <Upload className="h-6 w-6 text-slate-500" />
              <span className="text-sm text-slate-400">Klik untuk upload file</span>
              <input className="hidden" type="file" accept={config.accept} {...register('file')} />
            </label>
          </div>
          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Thumbnail</label>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#262636] bg-[#1A1A26] px-4 py-5 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/5">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} className="h-20 w-36 rounded-lg object-cover" alt="preview" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-slate-500" />
                  <span className="text-sm text-slate-400">Upload gambar thumbnail</span>
                </>
              )}
              <input className="hidden" type="file" accept="image/*" {...register('thumbnail_file')} onChange={(e) => {
                if (e.target.files?.[0]) setThumbnailPreview(URL.createObjectURL(e.target.files[0]))
              }} />
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Status</label>
            <select className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" {...register('is_published')}>
              <option value={0}>Draft</option>
              <option value={1}>Published</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#1E1E2E] pt-5">
          <button type="button" className="rounded-xl border border-[#262636] px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-[#1A1A26]" onClick={() => setShowForm(false)}>Batal</button>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50" disabled={saving}>
            {saving ? <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" role="status"></span>Menyimpan...</> : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}

function MateriList({ jenis }) {
  const config = jenisConfig[jenis]
  const { user } = useAuth()
  const canCreate = can(user, 'materi.create')
  const canUpdate = can(user, 'materi.update')
  const canDelete = can(user, 'materi.delete')

  const [rows, setRows] = useState([])
  const [kompetensis, setKompetensis] = useState([])
  const [levels, setLevels] = useState([])
  const [kategoris, setKategoris] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notif, setNotif] = useState(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitted } } = useForm()

  useEffect(() => {
    if (!notif) return
    const t = setTimeout(() => setNotif(null), 4000)
    return () => clearTimeout(t)
  }, [notif])

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
      setKompetensis([]); setLevels([]); setKategoris([])
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => { load(); loadRefs() })
  }, [load, loadRefs])

  const openCreate = () => { setEditing(null); setShowForm(true) }
  const openEdit = (row) => { setEditing(row); setShowForm(true) }

  useEffect(() => {
    if (showForm) return
    queueMicrotask(() => setThumbnailPreview(null))
  }, [showForm])

  useEffect(() => {
    if (!showForm) return
    if (editing) {
      reset({ kompetensi_id: editing.kompetensi_id || '', level_id: editing.level_id || '', kategori_id: editing.kategori_id || '', judul: editing.judul || '', deskripsi: editing.deskripsi || '', url_video: editing.url_video || '', durasi: editing.durasi || '', is_published: editing.is_published ? 1 : 0 })
    } else {
      reset({ kompetensi_id: '', level_id: '', kategori_id: '', judul: '', deskripsi: '', url_video: '', durasi: '', is_published: 0 })
    }
  }, [showForm, editing, reset])

  const onSubmit = async (data) => {
    setSaving(true)
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
      setSaving(false); setShowForm(false)
      setNotif({ type: 'success', text: `Berhasil menyimpan ${config.title}` })
      load()
    } catch (e) {
      setSaving(false)
      const message = e.response?.data?.message || e.response?.data?.errors?.[Object.keys(e.response?.data?.errors || {})[0]]?.[0] || e.message || 'Gagal menyimpan'
      setNotif({ type: 'danger', text: 'Gagal: ' + message })
    }
  }

  const remove = async (row) => {
    if (!await confirmDelete(row.judul)) return
    try {
      await api.delete(`/materis/${row.id}`)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menghapus')
    }
  }

  const downloadFile = (row) => {
    if (!row.file_path) return
    const link = document.createElement('a')
    link.href = FILE_URL + '/api/materi/' + row.id + '/download'
    link.download = ''
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const trackView = async (row) => {
    setViewing(row)
    try {
      await api.post(`/materi/${row.id}/progress`, { progress: 100 })
    } catch { /* silently fail */ }
  }

  const Icon = config.icon

  return (
    <div className="space-y-5">
      <NotifBanner notif={notif} onClose={() => setNotif(null)} />

      {!showForm && !viewing && (
        <header className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-indigo-500/40 bg-[#14141E] p-6 shadow-lg shadow-black/10">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg" style={{ background: config.gradient }}>
                <Icon className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-indigo-400">Materi</span>
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">{rows.length} item</span>
                </div>
                <h1 className="text-xl font-bold text-slate-100">{config.title}</h1>
                <p className="mt-1 text-sm leading-6 text-slate-400">Jelajahi materi pembelajaran untuk Walidata.</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  className="h-10 w-44 rounded-full border border-[#262636] bg-[#1A1A26] pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Cari materi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && load()}
                />
              </div>
              {canCreate && (
                <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500">
                  <Plus className="h-4 w-4" />Tambah
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {viewing && (
        <ViewModal viewing={viewing} jenis={jenis} config={config} onClose={() => setViewing(null)} onDownload={downloadFile} />
      )}

      {!showForm && !viewing && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <span className="mr-3 inline-block h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"></span>Memuat...
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-[#1E1E2E] bg-[#14141E] py-16">
              <Icon className="mb-4 h-14 w-14 text-slate-500" />
              <h6 className="font-bold text-slate-400">Belum ada data {config.title.toLowerCase()}</h6>
              {canCreate && (
                <button onClick={openCreate} className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"><Plus className="h-4 w-4" />Tambah Materi</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((row) => (
                <MateriCard key={row.id} row={row} config={config} onView={trackView} onDownload={downloadFile} onEdit={openEdit} onRemove={remove} canEdit={canUpdate} canDelete={canDelete} />
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (canCreate || canUpdate) && (
        <FormUpload
          config={config} jenis={jenis} editing={editing}
          kompetensis={kompetensis} levels={levels} kategoris={kategoris}
          saving={saving} thumbnailPreview={thumbnailPreview}
          errors={errors} register={register} handleSubmit={handleSubmit}
          onSubmit={onSubmit} setShowForm={setShowForm}
          setThumbnailPreview={setThumbnailPreview}
          onBack={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
export default MateriList
