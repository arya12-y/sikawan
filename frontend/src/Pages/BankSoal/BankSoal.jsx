import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, Search, Plus, Download, Upload, FileText, HelpCircle, ChevronDown, Filter, Pencil, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import { can } from '../../utils/can'
import { useAuth } from '../../hooks/useAuth'
import { confirmDelete } from '../../utils/confirm'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])
const inputClass = 'w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'
const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5'

function BankSoal() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [kompetensis, setKompetensis] = useState([])
  const [levels, setLevels] = useState([])
  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [filterKompetensi, setFilterKompetensi] = useState('')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitted } } = useForm()
  const jenis = watch('jenis')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (filterJenis) params.jenis = filterJenis
      if (filterKompetensi) params.kompetensi_id = filterKompetensi
      const res = await api.get('/bank-soals', { params })
      setRows(normalize(res.data))
    } catch (e) { alert(e.response?.data?.message || 'Gagal memuat bank soal') } finally { setLoading(false) }
  }, [search, filterJenis, filterKompetensi])

  const loadRefs = useCallback(async () => {
    const [k, l] = await Promise.all([api.get('/kompetensis'), api.get('/levels')])
    setKompetensis(normalize(k.data))
    setLevels(normalize(l.data))
  }, [])

  useEffect(() => { queueMicrotask(() => { load(); loadRefs() }) }, [load, loadRefs])

  useEffect(() => {
    const t = setTimeout(() => { if (search !== undefined) load() }, 300)
    return () => clearTimeout(t)
  }, [search, filterJenis, filterKompetensi, load])

  const formKey = useMemo(() => editing?.id || 'create', [editing?.id])

  useEffect(() => {
    if (!showForm) return
    if (editing) {
      const rawPilihan = editing.pilihan
      const choices = Array.isArray(rawPilihan) ? rawPilihan : (typeof rawPilihan === 'string' ? (() => { try { return JSON.parse(rawPilihan) } catch { return [] } })() : [])
      const letterIndex = choices.findIndex((c) => c === editing.jawaban_benar)
      reset({ kompetensi_id: editing.kompetensi_id || '', level_id: editing.level_id || '', jenis: editing.jenis || 'pilihan_ganda', pertanyaan: editing.pertanyaan || '', pilihan_a: choices[0] || '', pilihan_b: choices[1] || '', pilihan_c: choices[2] || '', pilihan_d: choices[3] || '', jawaban_benar_letter: letterIndex >= 0 ? ['A', 'B', 'C', 'D'][letterIndex] : editing.jawaban_benar || '', pembahasan: editing.pembahasan || '', bobot: editing.bobot || 1, is_active: editing.is_active ? 1 : 0 })
    } else {
      reset({ kompetensi_id: '', level_id: '', jenis: 'pilihan_ganda', pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar_letter: '', pembahasan: '', bobot: 1, is_active: 1 })
    }
  }, [showForm, editing, reset])

  const openCreate = () => { setEditing(null); setShowForm(true) }
  const openEdit = (row) => { setEditing(row); setShowForm(true) }

  const save = async (data) => {
    setSaving(true)
    const pilihan = [data.pilihan_a, data.pilihan_b, data.pilihan_c, data.pilihan_d].filter(Boolean)
    const letterMap = { A: 0, B: 1, C: 2, D: 3 }
    const jawabanBenar = data.jenis === 'pilihan_ganda' && data.jawaban_benar_letter ? (pilihan[letterMap[data.jawaban_benar_letter]] || data.jawaban_benar_letter) : data.jawaban_benar_letter
    const payload = { kompetensi_id: data.kompetensi_id, level_id: data.level_id || null, jenis: data.jenis, pertanyaan: data.pertanyaan, pilihan: data.jenis === 'pilihan_ganda' ? pilihan : null, jawaban_benar: jawabanBenar || null, pembahasan: data.pembahasan || null, bobot: Number(data.bobot || 1), is_active: Number(data.is_active) === 1 }
    try { if (editing?.id) await api.put(`/bank-soals/${editing.id}`, payload); else await api.post('/bank-soals', payload); setShowForm(false); load() } catch (e) { alert(e.response?.data?.message || 'Gagal menyimpan soal') } finally { setSaving(false) }
  }

  const remove = async (row) => { if (await confirmDelete(row.pertanyaan || 'Soal ini')) { await api.delete(`/bank-soals/${row.id}`); load() } }

  const exportCsv = async () => {
    try { const res = await api.get('/bank-soals/export?format=csv', { responseType: 'blob' }); const url = URL.createObjectURL(new Blob([res.data])); const link = document.createElement('a'); link.href = url; link.download = 'bank-soal.csv'; link.click(); URL.revokeObjectURL(url) } catch (e) { alert(e.response?.data?.message || 'Gagal export bank soal') }
  }

  const handleImport = async () => {
    if (!importText.trim()) return
    setImporting(true)
    try {
      const lines = importText.trim().split('\n').filter(Boolean)
      const items = []
      for (const line of lines) {
        const parts = line.split('|').map((s) => s.trim())
        if (parts.length < 3) continue
        const [kompetensiName, pertanyaan, jawaban, ...rest] = parts
        const pembahasan = rest[0] || ''
        const jenis = rest[1] === 'essay' ? 'essay' : 'pilihan_ganda'
        const bobot = rest.length > 2 ? Number(rest[2]) || 1 : 1
        const kompetensi = kompetensis.find((k) => k.nama.toLowerCase() === kompetensiName.toLowerCase()) || kompetensis[0]
        let pilihan = null
        let jawabanBenar = jawaban
        if (jenis === 'pilihan_ganda' && rest.length >= 7) {
          const choices = rest.slice(3, 7).filter(Boolean)
          if (choices.length > 0) {
            pilihan = choices
            const letterIndex = ['A', 'B', 'C', 'D'].indexOf(jawaban.toUpperCase())
            jawabanBenar = letterIndex >= 0 && choices[letterIndex] ? choices[letterIndex] : jawaban
          }
        }
        items.push({ pertanyaan, jawaban_benar: jawabanBenar, pembahasan, jenis, bobot, pilihan, kompetensi_id: kompetensi?.id || kompetensis[0]?.id || '', is_active: true })
      }
      if (items.length === 0) { alert('Format tidak valid'); setImporting(false); return }
      await api.post('/bank-soals/import', { items })
      alert(`${items.length} soal berhasil diimport`)
      setShowImport(false)
      setImportText('')
      load()
    } catch (e) { alert(e.response?.data?.message || 'Gagal import soal') } finally { setImporting(false) }
  }

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setImportText(text)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-indigo-950/20 p-7 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTI0IDI0di0ySDI0djJ6TTI0IDE2di0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"><HelpCircle className="h-3 w-3" /> Bank Soal</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-100">Bank Soal</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Siapkan soal pilihan ganda dan essay untuk digunakan dalam berbagai asesmen berdasarkan kompetensi.</p>
        </div>
      </div>

      {!showForm && !showImport && (
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#262636] px-6 py-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input className="h-10 w-44 rounded-full border border-[#262636] bg-[#1A1A26] pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" placeholder="Cari pertanyaan..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select className="h-10 appearance-none rounded-full border border-[#262636] bg-[#1A1A26] pl-9 pr-8 text-sm text-slate-100 outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
                  <option value="">Semua Jenis</option><option value="pilihan_ganda">Pilihan Ganda</option><option value="essay">Essay</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              </div>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select className="h-10 appearance-none rounded-full border border-[#262636] bg-[#1A1A26] pl-9 pr-8 text-sm text-slate-100 outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" value={filterKompetensi} onChange={(e) => setFilterKompetensi(e.target.value)}>
                  <option value="">Semua Kompetensi</option>
                  {kompetensis.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {can(user, 'bank-soal.import') && <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-1.5 rounded-full border border-[#262636] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400"><Upload className="h-3.5 w-3.5" />Import</button>}
              {can(user, 'bank-soal.export') && <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-full border border-[#262636] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400"><Download className="h-3.5 w-3.5" />Export</button>}
              {can(user, 'bank-soal.create') && <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"><Plus className="h-3.5 w-3.5" />Tambah</button>}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-slate-500">
                <FileText className="mb-3 h-12 w-12 opacity-30" />
                <p className="text-sm font-medium">Belum ada bank soal</p>
                <p className="mt-1 text-xs text-slate-500">Silakan tambah data baru atau import soal</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-[#262636] bg-[#09090E]">
                    <th className="px-4 py-3 font-semibold">Soal</th><th className="px-4 py-3 font-semibold">Kompetensi</th><th className="px-4 py-3 font-semibold hidden md:table-cell">Level</th><th className="px-4 py-3 font-semibold hidden md:table-cell">Jenis</th><th className="px-4 py-3 font-semibold hidden lg:table-cell">Jawaban</th><th className="px-4 py-3 font-semibold text-center w-16">Bobot</th><th className="px-4 py-3 font-semibold w-20">Status</th><th className="px-4 py-3 text-right font-semibold w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262636]">
                  {rows.map((row) => (
                    <tr className="transition hover:bg-white/[0.02]" key={row.id}>
                      <td className="px-4 py-3 max-w-xs"><p className="truncate font-medium text-slate-100" title={row.pertanyaan}>{row.pertanyaan}</p></td>
                      <td className="px-4 py-3 text-slate-400 w-32 truncate">{row.kompetensi?.nama || '-'}</td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell w-24">{row.level?.nama || '-'}</td>
                      <td className="px-4 py-3 hidden md:table-cell"><span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400">{row.jenis === 'pilihan_ganda' ? 'PG' : 'Essay'}</span></td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-300 hidden lg:table-cell max-w-[120px] truncate">{row.jawaban_benar || '-'}</td>
                      <td className="px-4 py-3 text-center text-slate-300">{row.bobot}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${row.is_active ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20' : 'bg-slate-500/10 text-slate-400 ring-slate-400/20'}`}>{row.is_active ? 'Aktif' : '-'}</span></td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {can(user, 'bank-soal.update') && <button onClick={() => openEdit(row)} className="mr-2 inline-flex items-center justify-center rounded-xl border border-[#262636] p-2 text-sm text-slate-400 transition-colors hover:bg-[#1A1A26] hover:text-slate-200" title="Edit"><Pencil className="h-4 w-4" /></button>}
                        {can(user, 'bank-soal.delete') && <button onClick={() => remove(row)} className="inline-flex items-center justify-center rounded-xl border border-rose-600/20 p-2 text-sm text-rose-400 transition-colors hover:bg-rose-500/10" title="Hapus"><Trash2 className="h-4 w-4" /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showImport && (
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Import Soal</h2>
              <p className="mt-0.5 text-sm text-slate-400">Upload file CSV atau tempel teks</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-[#262636] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400"><Upload className="h-4 w-4" />Pilih File</button>
              <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileImport} />
              <span className="text-xs text-slate-500">atau tempel teks</span>
            </div>
            <textarea className="h-40 w-full rounded-xl border border-[#262636] bg-[#1A1A26] p-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" placeholder={'Format: Nama Kompetensi | Pertanyaan | Jawaban | Pembahasan | jenis | bobot | OpsiA | OpsiB | OpsiC | OpsiD\n\nContoh:\nSatu Data Indonesia | Apa itu SDI? | Kebijakan tata kelola data | Perpres 39/2019 | pilihan_ganda | 1 | Definisi A | Definisi B | Definisi C | Definisi D\nStatistik Sektoral | Sebutkan jenis statistik! | - | - | essay | 2'} value={importText} onChange={(e) => setImportText(e.target.value)} />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowImport(false); setImportText('') }} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400">Batal</button>
              <button onClick={handleImport} disabled={importing || !importText.trim()} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50">{importing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Mengimport...</> : 'Import Soal'}</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm" key={formKey}>
          <div className="mb-6 flex items-center justify-between border-b border-[#262636] pb-5">
            <h2 className="text-lg font-bold text-slate-100">{editing ? 'Edit' : 'Tambah'} Soal</h2>
          </div>
          <form className="grid grid-cols-12 gap-5" onSubmit={handleSubmit(save)}>
            {isSubmitted && Object.keys(errors).length > 0 && <div className="col-span-12 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"><AlertCircle className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />Harap isi semua field yang wajib diisi (tanda bintang merah).</div>}
            <div className="col-span-6"><label className={labelClass}>Kompetensi <span className="text-rose-400">*</span></label><select className={inputClass} {...register('kompetensi_id', { required: true })}><option value="">Pilih Kompetensi</option>{kompetensis.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></div>
            <div className="col-span-3"><label className={labelClass}>Level</label><select className={inputClass} {...register('level_id')}><option value="">Semua Level</option>{levels.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></div>
            <div className="col-span-3"><label className={labelClass}>Bobot <span className="text-rose-400">*</span></label><input className={inputClass} type="number" step="0.1" placeholder="Masukkan bobot" {...register('bobot', { required: true })} /></div>
            <div className="col-span-6"><label className={labelClass}>Jenis Soal</label><select className={inputClass} {...register('jenis')}><option value="pilihan_ganda">Pilihan Ganda</option><option value="essay">Essay</option></select></div>
            <div className="col-span-6"><label className={labelClass}>Status</label><select className={inputClass} {...register('is_active')}><option value={1}>Aktif</option><option value={0}>Nonaktif</option></select></div>
            <div className="col-span-12"><label className={labelClass}>Pertanyaan <span className="text-rose-400">*</span></label><textarea className={inputClass} rows="3" placeholder="Tulis pertanyaan" {...register('pertanyaan', { required: true })} /></div>
            {jenis === 'pilihan_ganda' ? <>
              <div className="col-span-6"><label className={labelClass}>Pilihan A</label><input className={inputClass} placeholder="Tulis pilihan A" {...register('pilihan_a')} /></div>
              <div className="col-span-6"><label className={labelClass}>Pilihan B</label><input className={inputClass} placeholder="Tulis pilihan B" {...register('pilihan_b')} /></div>
              <div className="col-span-6"><label className={labelClass}>Pilihan C</label><input className={inputClass} placeholder="Tulis pilihan C" {...register('pilihan_c')} /></div>
              <div className="col-span-6"><label className={labelClass}>Pilihan D</label><input className={inputClass} placeholder="Tulis pilihan D" {...register('pilihan_d')} /></div>
              <div className="col-span-12"><label className={labelClass}>Jawaban Benar <span className="text-rose-400">*</span></label><select className={inputClass} {...register('jawaban_benar_letter', { required: true })}><option value="">Pilih jawaban benar</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></div>
            </> : <div className="col-span-12"><label className={labelClass}>Jawaban Benar</label><input className={inputClass} placeholder="Tulis jawaban benar" {...register('jawaban_benar_letter')} /></div>}
            <div className="col-span-12"><label className={labelClass}>Pembahasan</label><textarea className={inputClass} rows="2" placeholder="Tulis pembahasan" {...register('pembahasan')} /></div>
            <div className="col-span-12 flex justify-end gap-3 border-t border-[#262636] pt-5">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400">Batal</button>
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50" disabled={saving}>{saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Menyimpan...</> : 'Simpan Soal'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default BankSoal
