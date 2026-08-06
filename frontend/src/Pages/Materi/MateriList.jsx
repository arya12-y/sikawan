import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { CheckCircle, AlertTriangle, Search, Plus, X, FileDown, Download, AlertCircle, PlayCircle, FileText, Presentation, Play, Eye, Pencil, Trash2, Upload, ArrowLeft, GraduationCap, HelpCircle, Lock, Filter, ChevronDown } from 'lucide-react'
import api from '../../api/axios'
import { can } from '../../utils/can'
import { useAuth } from '../../hooks/useAuth'
import { useSchedule } from '../../hooks/useSchedule'
import { confirmDelete } from '../../utils/confirm'
import { toast } from '../../utils/toast'

const normalizeRows = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])
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

function ViewModal({ viewing, jenis, config, onClose, onDownload, onVideoProgress }) {
  if (!viewing || !config) return null
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
        <ViewerContent viewing={viewing} jenis={jenis} config={config} onDownload={onDownload} onVideoProgress={onVideoProgress} />
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

function ViewerContent({ viewing, jenis, config, onDownload, onVideoProgress }) {
  const youtubeId = getYoutubeId(viewing.url_video)
  const videoRef = useRef(null)
  const progressSent = useRef(new Set())
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (jenis !== 'video' || !onVideoProgress) return
    progressSent.current = new Set()
    startTimeRef.current = Date.now()
    onVideoProgress(10)

    const sendProgress = (pct) => {
      const bucket = Math.floor(Math.min(pct, 100) / 10) * 10
      if (bucket >= 10 && !progressSent.current.has(bucket)) {
        progressSent.current.add(bucket)
        onVideoProgress(Math.min(bucket + 10, 100))
      }
    }

    let timer
    const sendTimeBased = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const pct = Math.min(Math.round(elapsed / 15) * 10 + 10, 100)
      const bucket = Math.floor(pct / 10) * 10
      if (bucket >= 10 && !progressSent.current.has(bucket)) {
        progressSent.current.add(bucket)
        onVideoProgress(Math.min(bucket + 10, 100))
      }
      if (pct >= 100) clearInterval(timer)
    }

    if (youtubeId) {
      timer = setInterval(sendTimeBased, 3000)
    }

    const el = videoRef.current
    const handler = () => {
      if (!el?.duration || el.duration === Infinity) return
      const ratio = el.currentTime / el.duration
      const pct = Math.round(ratio * 90) + 10
      const bucket = Math.floor(pct / 10) * 10
      if (bucket >= 10 && !progressSent.current.has(bucket)) {
        progressSent.current.add(bucket)
        onVideoProgress(Math.min(bucket + 10, 100))
      }
    }
    if (el) el.addEventListener('timeupdate', handler)

    return () => {
      if (timer) clearInterval(timer)
      if (el) el.removeEventListener('timeupdate', handler)
    }
  }, [jenis, onVideoProgress, youtubeId, viewing.durasi])

  if (jenis === 'video' && youtubeId) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl shadow-lg shadow-black/20">
        <iframe ref={videoRef} src={`https://www.youtube.com/embed/${youtubeId}`} allowFullScreen title={viewing.judul} className="h-full w-full" />
      </div>
    )
  }
  if (jenis === 'video' && (viewing.url_video || viewing.file_path)) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl shadow-lg shadow-black/20">
        <video ref={videoRef} controls src={viewing.file_path ? FILE_URL + '/api/materi/' + viewing.id + '/file' : viewing.url_video} className="h-full w-full" />
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
  if (jenis === 'presentasi' && viewing.file_path) {
    const ext = viewing.file_path?.split('.').pop()?.toUpperCase() || 'FILE'
    return (
      <div className="flex flex-col items-center rounded-xl border border-[#1E1E2E] bg-[#0D0D15] py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 mb-5">
          <Presentation className="h-10 w-10 text-white" />
        </div>
        <h4 className="text-lg font-bold text-slate-100">{viewing.judul}</h4>
        <p className="mt-1 text-sm text-slate-400">File {ext} — {viewing.durasi ? `${viewing.durasi} menit` : ''}</p>
        <p className="mt-4 text-sm text-slate-500">File presentasi tidak dapat ditampilkan langsung di browser.</p>
        <div className="mt-6 flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-violet-500" onClick={() => onDownload(viewing)}><Download className="h-4 w-4" />Download {ext}</button>
        </div>
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

function MateriCard({ row, config, onView, onDownload, onEdit, onRemove, onQuiz, canEdit, canDelete, isCompleted, progressValue }) {
  const Icon = config.icon
  const ViewIcon = config.viewIcon
  const quizUnlocked = progressValue > 0 || isCompleted
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#14141E]/95 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10">
      {isCompleted && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">✅ Selesai</span>
      )}
      <div className="relative overflow-hidden h-32 shrink-0">
        {row.thumbnail ? (
          <img
            src={FILE_URL + '/api/materi/' + row.id + '/thumbnail'}
            alt={row.judul}
            className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden') }}
          />
        ) : row.jenis === 'video' && getYoutubeId(row.url_video) ? (
          <img
            src={`https://img.youtube.com/vi/${getYoutubeId(row.url_video)}/hqdefault.jpg`}
            alt={row.judul}
            className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white transition-transform duration-300 group-hover:scale-105" style={{ background: config.gradient }}>
            <Icon className="h-10 w-10" />
          </div>
        )}
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${jenisConfig[row.jenis?.toLowerCase()]?.gradient || 'from-indigo-500 to-violet-500'}`} />
      </div>
      <div className="flex flex-1 flex-col p-3 pb-0">
        <span className="mb-1.5 inline-block w-fit rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400">{row.kompetensi?.nama || '-'}</span>
        <h3 className="line-clamp-2 text-sm font-bold text-slate-100">{row.judul}</h3>
        {row.deskripsi && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{row.deskripsi}</p>}
        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          {row.level?.nama && <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400">{row.level.nama}</span>}
          {row.durasi && <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400">{row.durasi} menit</span>}
          {!isCompleted && progressValue > 0 && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">{progressValue}%</span>}
        </div>
        {!isCompleted && progressValue > 0 && (
          <div className="mt-2 h-1.5 rounded-full bg-[#1E1E2E] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${progressValue}%` }} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 border-t border-[#1E1E2E] p-3">
        <button onClick={() => onView(row)} className="group/btn flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-violet-500"><ViewIcon className="h-4 w-4" />{config.viewLabel}</button>
        <button onClick={() => onQuiz(row)} disabled={!quizUnlocked} className="group/btn inline-flex items-center justify-center rounded-xl border border-[#262636] p-2 text-sm text-slate-400 transition-colors hover:bg-[#1A1A26] hover:text-indigo-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400" title={quizUnlocked ? 'Quiz' : 'Tonton materi terlebih dahulu untuk membuka quiz'}>{quizUnlocked ? <HelpCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</button>
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

function FormUpload({ config, jenis, editing, kompetensis, levels, kategoris, bankSoals, selectedSoalIds, setSelectedSoalIds, manualSoalText, setManualSoalText, saving, thumbnailPreview, errors, register, handleSubmit, setValue, onSubmit, setShowForm, setThumbnailPreview, onBack }) {
  const Icon = config.icon
  const [selectedFileName, setSelectedFileName] = useState('')
  const [fileRemoved, setFileRemoved] = useState(false)
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false)
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
            <div className="relative">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#262636] bg-[#1A1A26] px-4 py-5 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/5">
                {selectedFileName ? (
                  <p className="text-xs text-emerald-400 font-medium truncate max-w-[200px]">✅ {selectedFileName}</p>
                ) : editing?.file_path && !fileRemoved ? (
                  <p className="text-xs text-indigo-400 font-medium truncate max-w-[200px]">📎 {editing.file_path.split('/').pop()}</p>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-slate-500" />
                    <span className="text-sm text-slate-400">Klik untuk upload file</span>
                  </>
                )}
                <input className="hidden" type="file" accept={config.accept} {...register('file')} onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setValue('file', f); setSelectedFileName(f.name); setFileRemoved(false); setValue('remove_file', false) }
                }} />
              </label>
              {!fileRemoved && (selectedFileName || editing?.file_path) && (
                <button type="button" onClick={() => { setValue('remove_file', true); setValue('file', null); setSelectedFileName(''); setFileRemoved(true) }} className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow transition hover:bg-rose-600" title="Hapus file"><X className="h-3 w-3" /></button>
              )}
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Thumbnail</label>
            <div className="relative">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#262636] bg-[#1A1A26] px-4 py-5 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/5">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} className="h-20 w-36 rounded-lg object-cover" alt="preview" />
                ) : editing?.thumbnail && !thumbnailRemoved ? (
                  <img src={FILE_URL + '/api/materi/' + editing.id + '/thumbnail'} className="h-20 w-36 rounded-lg object-cover" alt="current" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-slate-500" />
                    <span className="text-sm text-slate-400">Upload gambar thumbnail</span>
                  </>
                )}
                <input className="hidden" type="file" accept="image/*" {...register('thumbnail_file')} onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setValue('thumbnail_file', f); setValue('remove_thumbnail', false); setThumbnailPreview(URL.createObjectURL(f)) }
                }} />
              </label>
              {!thumbnailRemoved && (thumbnailPreview || editing?.thumbnail) && (
                <button type="button" onClick={() => { setValue('remove_thumbnail', true); setValue('thumbnail_file', null); setThumbnailPreview(null); setThumbnailRemoved(true) }} className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow transition hover:bg-rose-600" title="Hapus thumbnail"><X className="h-3 w-3" /></button>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Status</label>
            <select className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" {...register('is_published')}>
              <option value={0}>Draft</option>
              <option value={1}>Published</option>
            </select>
          </div>
          <div className="md:col-span-6">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Soal Quiz <span className="text-rose-400">*</span></label>
            {bankSoals.length === 0 ? <p className="text-xs text-slate-500">Belum ada soal quiz. Buat soal di menu Bank Soal dengan tipe Quiz.</p> : (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-[#262636] bg-[#1A1A26] max-h-40 overflow-y-auto">
                {bankSoals.map((soal) => (
                  <button key={soal.id} type="button" onClick={() => setSelectedSoalIds(prev => prev.includes(soal.id) ? prev.filter(id => id !== soal.id) : [...prev, soal.id])}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${selectedSoalIds.includes(soal.id) ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 hover:text-slate-300'}`}>
                    {soal.pertanyaan.length > 40 ? soal.pertanyaan.substring(0, 40) + '...' : soal.pertanyaan}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-6">
            <label className="mb-1.5 block text-xs font-medium text-indigo-400">Tambah Soal Manual</label>
            <textarea rows={4} className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3 py-2 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" placeholder={'Format: Pertanyaan | JawabanBenar | OpsiA | OpsiB | OpsiC | OpsiD\n\nContoh:\nApa ibu kota Indonesia? | Jakarta | Jakarta | Surabaya | Bandung | Medan\nSebutkan 3 warna primer! | Merah, Kuning, Biru'} value={manualSoalText} onChange={(e) => setManualSoalText(e.target.value)} />
            <p className="mt-1 text-[10px] text-slate-500">Pisahkan dengan tanda | (pipe). Minimal pertanyaan + jawaban benar. Opsi opsional untuk pilihan ganda.</p>
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
  const [searchParams, setSearchParams] = useSearchParams()
  const urlKompetensiId = searchParams.get('kompetensi_id')
  const canCreate = can(user, 'materi.create')
  const canUpdate = can(user, 'materi.update')
  const canDelete = can(user, 'materi.delete')
  const isAdmin = user?.roles?.some(r => ['Super Admin', 'Admin Diskominfo'].includes(r))

  const [rows, setRows] = useState([])
  const [allRows, setAllRows] = useState([])
  const [kompetensis, setKompetensis] = useState([])
  const [levels, setLevels] = useState([])
  const [kategoris, setKategoris] = useState([])
  const [bankSoals, setBankSoals] = useState([])
  const [selectedSoalIds, setSelectedSoalIds] = useState([])
  const [manualSoalText, setManualSoalText] = useState('')
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterKompetensi, setFilterKompetensi] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notif, setNotif] = useState(null)
  const { phase: schedulePhase, pretestDone: schedulePretestDone, asesmenLulus, asesmenStatus, loading: scheduleLoading, status: scheduleStatus } = useSchedule()
  const phase = schedulePhase
  const [userLevelUrutan, setUserLevelUrutan] = useState(null)
  const [userLevelName, setUserLevelName] = useState(null)
  const [completedIds, setCompletedIds] = useState(new Set())
  const [progressMap, setProgressMap] = useState({})
  const [quizMateri, setQuizMateri] = useState(null)
  const [quizSoals, setQuizSoals] = useState([])
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizResult, setQuizResult] = useState(null)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitted } } = useForm()

  const levelOptions = useMemo(() => {
    const byId = new Map()
    allRows.forEach(row => {
      const level = row.level
      if (level?.id != null && !byId.has(String(level.id))) byId.set(String(level.id), { id: level.id, nama: level.nama || 'Tanpa Nama', urutan: level.urutan })
    })
    return [...byId.values()].sort((a, b) => {
      if (a.urutan != null && b.urutan != null && a.urutan !== b.urutan) return a.urutan - b.urutan
      if (a.urutan != null) return -1
      if (b.urutan != null) return 1
      return a.nama.localeCompare(b.nama, 'id')
    })
  }, [allRows])

  const kompetensiOptions = useMemo(() => {
    const byId = new Map()
    allRows.forEach(row => {
      const kompetensi = row.kompetensi
      if (kompetensi?.id != null && !byId.has(String(kompetensi.id))) byId.set(String(kompetensi.id), { id: kompetensi.id, nama: kompetensi.nama || 'Tanpa Nama' })
    })
    return [...byId.values()].sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
  }, [allRows])

  useEffect(() => {
    if (!notif) return
    const t = setTimeout(() => setNotif(null), 4000)
    return () => clearTimeout(t)
  }, [notif])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { jenis, per_page: 50 }
      if (search) params.search = search
      if (filterLevel) params.level_id = filterLevel
      if (filterKompetensi || urlKompetensiId) params.kompetensi_id = filterKompetensi || urlKompetensiId
      const res = await api.get('/materis', { params })
      const data = res.data?.data ?? res.data
      const items = Array.isArray(data) ? data : []
      setRows(items)
      const done = new Set()
      const prog = {}
      items.forEach(r => {
        if (r.progress?.length > 0) {
          prog[r.id] = r.progress[0].progress || 0
          if (r.progress[0].is_completed) done.add(r.id)
        }
      })
      setCompletedIds(done)
      setProgressMap(prog)
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [jenis, search, filterLevel, filterKompetensi, urlKompetensiId])

  const loadOptions = useCallback(async () => {
    try {
      const res = await api.get('/materis', { params: { jenis, per_page: 200 } })
      const data = res.data?.data ?? res.data
      setAllRows(Array.isArray(data) ? data : [])
    } catch {
      setAllRows([])
    }
  }, [jenis])

  const loadRefs = useCallback(async () => {
    if (!can(user, 'materi.create')) {
      setKompetensis([]); setLevels([]); setKategoris([]); setBankSoals([])
      return
    }
    try {
      const [k, l, c, s] = await Promise.all([api.get('/kompetensis'), api.get('/levels'), api.get('/kategoris'), api.get('/bank-soals?tipe=quiz&per_page=200')])
      setKompetensis(Array.isArray(k.data?.data ?? k.data) ? (k.data?.data ?? k.data) : [])
      setLevels(Array.isArray(l.data?.data ?? l.data) ? (l.data?.data ?? l.data) : [])
      setKategoris(Array.isArray(c.data?.data ?? c.data) ? (c.data?.data ?? c.data) : [])
      setBankSoals(normalizeRows(s.data))
    } catch {
      setKompetensis([]); setLevels([]); setKategoris([]); setBankSoals([])
    }
  }, [user])

  useEffect(() => {
    queueMicrotask(() => { load(); loadRefs() })
  }, [load, loadRefs])

  useEffect(() => {
    queueMicrotask(loadOptions)
  }, [loadOptions])

  useEffect(() => {
    if (scheduleStatus?.level_id && scheduleStatus?.level_name) {
      setUserLevelName(scheduleStatus.level_name)
      const lvl = levels.find(l => l.id === scheduleStatus.level_id)
      setUserLevelUrutan(lvl?.urutan ?? scheduleStatus.level_urutan ?? null)
    }
  }, [scheduleStatus, levels])

  const openCreate = () => { setEditing(null); setSelectedSoalIds([]); setShowForm(true) }
  const openEdit = async (row) => {
    setEditing(row)
    setSelectedSoalIds(row.soals?.map(s => s.id) || [])
    setShowForm(true)
    try {
      const res = await api.get(`/materis/${row.id}`)
      if (res.data?.id) {
        setEditing(res.data)
        setSelectedSoalIds(res.data.soals?.map(s => s.id) || [])
      }
    } catch { /* pakai data awal */ }
  }

  useEffect(() => {
    if (showForm) return
    queueMicrotask(() => setThumbnailPreview(null))
  }, [showForm])

  useEffect(() => {
    if (!showForm) return
    if (editing) {
      reset({ kompetensi_id: editing.kompetensi_id || '', level_id: editing.level_id || '', kategori_id: editing.kategori_id || '', judul: editing.judul || '', deskripsi: editing.deskripsi || '', url_video: editing.url_video || '', durasi: editing.durasi || '', is_published: editing.is_published ? 1 : 0, file: null, thumbnail_file: null })
    } else {
      reset({ kompetensi_id: '', level_id: '', kategori_id: '', judul: '', deskripsi: '', url_video: '', durasi: '', is_published: 0, file: null, thumbnail_file: null })
    }
  }, [showForm, editing, reset])

  const onSubmit = async (data) => {
    if (selectedSoalIds.length === 0 && !manualSoalText.trim()) {
      toast('warning', 'Pilih minimal 1 soal quiz atau isi soal manual.')
      return
    }
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
      formData.append('soal_ids', JSON.stringify(selectedSoalIds))
      if (manualSoalText.trim()) formData.append('manual_soals', manualSoalText)
      const fileVal = data.file; if (fileVal && typeof fileVal !== 'string') formData.append('file', fileVal instanceof FileList ? fileVal[0] : fileVal)
      const thumbVal = data.thumbnail_file; if (thumbVal && typeof thumbVal !== 'string') formData.append('thumbnail_file', thumbVal instanceof FileList ? thumbVal[0] : thumbVal)
      if (data.remove_thumbnail) formData.append('remove_thumbnail', '1')
      if (data.remove_file) formData.append('remove_file', '1')
      if (editing) {
        formData.append('_method', 'PUT')
        await api.post(`/materis/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/materis', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setSaving(false); setShowForm(false); setManualSoalText('')
      toast('success', `Berhasil menyimpan ${config.title}`)
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
      toast('success', `Berhasil menghapus ${config.title}`)
      load()
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal menghapus')
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

  const trackView = (row) => {
    setViewing(row)
    if (row.jenis !== 'video') {
      const pct = 50
      api.post(`/materi/${row.id}/progress`, { progress: pct }).then(res => {
        setProgressMap(prev => ({ ...prev, [row.id]: Math.max(prev[row.id] || 0, pct) }))
        const data = res.data
        if (data?.level_up) {
          const isDark = document.documentElement.classList.contains('dark')
          import('sweetalert2').then(m => {
            const Swal = m.default
            Swal.fire({
              title: 'Naik Level!',
              html: `Selamat! Anda naik dari <strong>${data.level_up.old_level}</strong> ke <strong>${data.level_up.new_level}</strong>`,
              icon: 'success',
              confirmButtonText: 'Lanjut Belajar',
              background: isDark ? '#14141E' : '#FFFFFF',
              color: isDark ? '#F1F5F9' : '#0F172A',
              confirmButtonColor: '#6366f1',
              customClass: { popup: 'swal-premium', confirmButton: 'swal-confirm-btn' },
            })
            setUserLevelName(data?.level_up?.new_level ?? '')
            load()
          })
        }
      }).catch(() => {})
    }
  }

  const handleQuiz = async (row) => {
    setQuizMateri(row)
    setQuizSoals([])
    setQuizAnswers({})
    setQuizCurrentIndex(0)
    setQuizResult(null)
    setQuizLoading(true)
    try {
      const res = await api.get(`/materi/${row.id}/quiz`)
      setQuizSoals(res.data?.soals || [])
    } catch { setQuizSoals([]) } finally { setQuizLoading(false) }
  }

  const submitQuiz = async () => {
    if (quizSoals.length === 0) return
    const belumDijawab = quizSoals.filter(s => !String(quizAnswers[s.id] || '').trim())
    if (belumDijawab.length > 0) {
      toast('warning', `Masih ada ${belumDijawab.length} soal belum dijawab`)
      return
    }
    setSubmittingQuiz(true)
    try {
      const jawaban = quizSoals.map(s => ({ soal_id: s.id, jawaban: quizAnswers[s.id] || '' }))
      const res = await api.post(`/materi/${quizMateri.id}/quiz-submit`, { jawaban })
      setQuizResult(res.data)
      if (res.data?.materi_selesai) {
        setCompletedIds(prev => new Set([...prev, quizMateri.id]))
      } else if (res.data?.lulus === false && res.data?.nilai >= 0) {
        setCompletedIds(prev => { const s = new Set(prev); s.delete(quizMateri.id); return s })
      }
      if (res.data?.level_up) {
        setUserLevelName(res.data.level_up.new_level)
        const Swal = (await import('sweetalert2')).default
        const isDark = document.documentElement.classList.contains('dark')
        await Swal.fire({
          title: 'Naik Level!',
          html: `Selamat! Anda naik dari <strong>${res.data.level_up.old_level}</strong> ke <strong>${res.data.level_up.new_level}</strong>`,
          icon: 'success', confirmButtonText: 'Lanjut Belajar',
          background: isDark ? '#14141E' : '#FFFFFF', color: isDark ? '#F1F5F9' : '#0F172A',
          confirmButtonColor: '#6366f1',
        })
      }
    } catch { toast('error', 'Gagal mengirim jawaban') } finally { setSubmittingQuiz(false) }
  }

  const Icon = config.icon

  const pretestDone = schedulePretestDone
  const examDone = asesmenStatus === 'selesai'
  const phaseBlocked = !scheduleLoading && !can(user, 'jadwal.bebas') && phase && !examDone && (phase === 'exam' || (phase === 'pretest' && !pretestDone))
  const hasUserLevel = userLevelUrutan !== null

  const levelMap = {}
  levels.forEach(l => { levelMap[l.id] = l })

  const grouped = {}
  rows.forEach(row => {
    const key = row.level_id ?? 0
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(row)
  })

  const sortedGroupKeys = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => {
      const uA = levelMap[a]?.urutan ?? 999
      const uB = levelMap[b]?.urutan ?? 999
      return uA - uB
    })

  function getAccessLevel(row) {
    if (!hasUserLevel) return 'full'
    const rowUrutan = row.level?.urutan ?? 0
    if (rowUrutan <= userLevelUrutan) return 'full'
    if (rowUrutan === userLevelUrutan + 1) return 'partial'
    return 'locked'
  }

  return (
    <div className="space-y-5">
      <NotifBanner notif={notif} onClose={() => setNotif(null)} />

      {phaseBlocked && (
        <div className="flex flex-col items-center rounded-2xl border border-[#1E1E2E] bg-[#14141E] py-16">
          <Icon className="mb-4 h-14 w-14 text-slate-500" />
          <h6 className="font-bold text-slate-400">Materi belum tersedia</h6>
          <p className="mt-2 text-sm text-slate-500">{phase === 'exam' ? 'Fokus ujian asesmen. Materi ditutup selama ujian.' : 'Selesaikan pretest terlebih dahulu untuk mengakses materi.'}</p>
        </div>
      )}

      {!phaseBlocked && !showForm && !viewing && (
        <>
          {hasUserLevel && (
            <div className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-gradient-to-r from-indigo-600/20 via-violet-600/10 to-transparent p-5 shadow-lg shadow-black/10">
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-indigo-400">Level Anda</span>
                    <span className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-0.5 text-xs font-bold text-white shadow-sm">{userLevelName}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">Selesaikan 100% materi level ini untuk buka level berikutnya</p>
                </div>
              </div>
            </div>
          )}

          <header className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-indigo-500/40 bg-[#14141E] p-6 shadow-lg shadow-black/10">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <div className="flex items-start gap-4">
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
            </div>
          </header>
          <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input className="h-8 w-36 rounded-full border border-[#262636] bg-[#1A1A26] pl-8 pr-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" placeholder="Cari materi..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
                </div>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
                  <select className="h-8 appearance-none rounded-full border border-[#262636] bg-[#1A1A26] pl-8 pr-7 text-xs text-slate-100 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} aria-label="Filter Level">
                    <option value="">Semua Level</option>
                    {levelOptions.map(level => <option key={level.id} value={level.id}>{level.nama}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
                </div>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
                  <select className="h-8 appearance-none rounded-full border border-[#262636] bg-[#1A1A26] pl-8 pr-7 text-xs text-slate-100 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" value={filterKompetensi} onChange={(e) => { setFilterKompetensi(e.target.value); if (urlKompetensiId) setSearchParams({}) }} aria-label="Filter Kompetensi">
                    <option value="">Semua Kompetensi</option>
                    {kompetensiOptions.map(kompetensi => <option key={kompetensi.id} value={kompetensi.id}>{kompetensi.nama}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
                </div>
                {urlKompetensiId && <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400">
                  {kompetensiOptions.find(k => String(k.id) === urlKompetensiId)?.nama || kompetensis.find(k => String(k.id) === urlKompetensiId)?.nama || 'Kompetensi'}
                  <button onClick={() => setSearchParams({})} className="ml-1 hover:text-indigo-300">&times;</button>
                </span>}
              </div>
              {canCreate && <button onClick={openCreate} className="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 sm:self-auto"><Plus className="h-3.5 w-3.5" />Tambah</button>}
            </div>
          </div>
        </>
      )}

      {viewing && (
        <ViewModal viewing={viewing} jenis={jenis} config={config} onClose={() => { setViewing(null); load() }} onDownload={downloadFile} onVideoProgress={(pct) => {
          api.post(`/materi/${viewing.id}/progress`, { progress: pct }).catch(() => {})
          if (pct >= 100) setCompletedIds(prev => new Set([...prev, viewing.id]))
        }} />
      )}

      {!phaseBlocked && !showForm && !viewing && (
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
          ) : !hasUserLevel ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {rows.map((row) => (
                <MateriCard key={row.id} row={row} config={config} onView={trackView} onDownload={downloadFile} onEdit={openEdit} onRemove={remove}           onQuiz={handleQuiz} canEdit={canUpdate} canDelete={canDelete} isCompleted={completedIds.has(row.id)} progressValue={progressMap[row.id] || 0} />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {sortedGroupKeys.map((levelId) => {
                const items = grouped[levelId]
                const level = levelMap[levelId]
                const total = items.length
                const doneCount = items.filter(r => completedIds.has(r.id)).length

                return (
                  <section key={levelId}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400">{level?.nama || items[0]?.level?.nama || (levelId ? `Level ${levelId}` : 'Tanpa Level')}</span>
                        <span className="text-xs text-slate-500">{doneCount}/{total} selesai</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#1E1E2E]">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                      {items.map((row) => {
                        const access = getAccessLevel(row)
                        const isCompleted = completedIds.has(row.id)

                        if (access === 'locked') {
                          return (
                            <div key={row.id} className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#14141E]/50 p-4 opacity-40">
                              <div className="flex flex-col items-center py-8">
                                <span className="text-3xl">🔒</span>
                                <span className="mt-2 text-xs font-medium text-slate-500">{row.level?.nama || (row.level_id ? `Level ${row.level_id}` : 'Tanpa Level')}</span>
                                <span className="mt-4 text-sm text-slate-600">Selesaikan level sebelumnya terlebih dahulu</span>
                              </div>
                            </div>
                          )
                        }

                        if (access === 'partial') {
                          return (
                            <div key={row.id} className="group relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#14141E]/80 p-4 opacity-60">
                              <div className="flex flex-col items-center py-8">
                                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">{row.level?.nama}</span>
                                <h3 className="mt-3 text-base font-bold text-slate-400">{row.judul}</h3>
                                <span className="mt-3 text-xs text-slate-500">Selesaikan level sebelumnya</span>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div key={row.id} className="relative">
                            <MateriCard row={row} config={config} onView={trackView} onDownload={downloadFile} onEdit={openEdit} onRemove={remove} onQuiz={handleQuiz} canEdit={canUpdate} canDelete={canDelete} isCompleted={isCompleted} progressValue={progressMap[row.id] || 0} />
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </div>
      )}

      {showForm && (canCreate || canUpdate) && (
        <FormUpload
          config={config} jenis={jenis} editing={editing}
          kompetensis={kompetensis} levels={levels} kategoris={kategoris}
          bankSoals={bankSoals} selectedSoalIds={selectedSoalIds} setSelectedSoalIds={setSelectedSoalIds} manualSoalText={manualSoalText} setManualSoalText={setManualSoalText}
          saving={saving} thumbnailPreview={thumbnailPreview}
          errors={errors} register={register} handleSubmit={handleSubmit} setValue={setValue}
          onSubmit={onSubmit} setShowForm={setShowForm}
          setThumbnailPreview={setThumbnailPreview}
          onBack={() => setShowForm(false)}
        />
      )}

      {/* Quiz Modal */}
      {quizMateri && !quizResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setQuizMateri(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-[#262636] bg-[#14141E] shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#262636] px-6 py-4 shrink-0">
              <h2 className="text-lg font-bold text-slate-100">Quiz: {quizMateri.judul}</h2>
              <button onClick={() => setQuizMateri(null)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"><X className="h-5 w-5" /></button>
            </div>
            {quizLoading ? (
              <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
            ) : quizSoals.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-slate-500"><HelpCircle className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada soal untuk materi ini</p></div>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                  {quizSoals.map((soal, i) => {
                    const choices = Array.isArray(soal.pilihan) ? soal.pilihan : []
                    return (
                      <div key={soal.id} className="rounded-xl border border-[#262636] bg-[#1A1A26] p-4">
                        <p className="text-sm text-slate-100 mb-3"><span className="text-indigo-400 font-bold mr-2">{i + 1}.</span>{soal.pertanyaan}</p>
                        {choices.length > 0 ? choices.map((c, ci) => (
                          <label key={ci} className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${quizAnswers[soal.id] === c ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}>
                            <input type="radio" name={`quiz-${soal.id}`} className="h-3.5 w-3.5 accent-indigo-500" checked={quizAnswers[soal.id] === c} onChange={() => setQuizAnswers(prev => ({ ...prev, [soal.id]: c }))} />
                            {c}
                          </label>
                        )) : (
                          <textarea className="w-full rounded-lg border border-[#262636] bg-[#14141E] px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" rows={2} placeholder="Tulis jawaban..." value={quizAnswers[soal.id] || ''} onChange={(e) => setQuizAnswers(prev => ({ ...prev, [soal.id]: e.target.value }))} />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-end gap-3 border-t border-[#262636] px-6 py-4 shrink-0">
                  <button onClick={() => setQuizMateri(null)} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400">Tutup</button>
                  <button onClick={submitQuiz} disabled={submittingQuiz || Object.keys(quizAnswers).length === 0} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50">
                    {submittingQuiz ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Mengirim...</> : 'Kumpulkan Jawaban'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quiz Result */}
      {quizResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setQuizResult(null); setQuizMateri(null) }}>
          <div className="w-full max-w-md rounded-2xl border border-[#262636] bg-[#14141E] p-8 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-5 ${quizResult.nilai >= 70 ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30' : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30'}`}>
              {quizResult.nilai >= 70 ? <CheckCircle className="h-8 w-8 text-white" /> : <AlertTriangle className="h-8 w-8 text-white" />}
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-3 ${quizResult.nilai >= 70 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{quizResult.nilai >= 70 ? 'Lulus' : 'Belum Lulus'}</span>
            <h2 className="text-2xl font-bold text-slate-100">{quizResult.nilai}</h2>
            <p className="text-sm text-slate-400 mt-1">{quizResult.benar}/{quizResult.total} jawaban benar</p>
            {quizResult.materi_selesai && <p className="text-sm text-emerald-400 mt-3">✅ Materi selesai!</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => { setQuizResult(null); setQuizMateri(null) }} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400">Tutup</button>
              {quizResult.nilai < 70 && <button onClick={() => { setQuizResult(null); setQuizAnswers({}); setQuizCurrentIndex(0) }} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500">Ulangi</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default MateriList
