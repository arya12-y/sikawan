import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, Search, Pencil, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import { can } from '../../utils/can'
import { useAuth } from '../../hooks/useAuth'
import { confirmDelete } from '../../utils/confirm'

const inputClass = 'w-full rounded-xl border border-[#1E1E2E] bg-[#14141E] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
const buttonClass = 'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60'
const normalizeRows = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])
const normalizeValue = (field, value) => field.type === 'checkbox' ? (field.valueType === 'number' ? (value ? 1 : 0) : Boolean(value)) : (field.type === 'number' && value !== '' ? Number(value) : value)

function FormModal({ title, fields, current, onSubmit, onCancel, saving }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitted } } = useForm()
  useEffect(() => reset(current || {}), [current, reset])
  const submit = (data) => onSubmit(fields.reduce((result, field) => ({ ...result, [field.name]: normalizeValue(field, data[field.name]) }), {}))

  return <section className="mt-6 rounded-2xl border border-[#1E1E2E] bg-[#14141E] shadow-sm"><div className="p-6"><form noValidate onSubmit={handleSubmit(submit)}><div className="mb-6 flex items-center justify-between border-b border-[#1E1E2E] pb-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Master data</p><h2 className="mt-1 text-xl font-bold text-slate-100">{title}</h2></div></div>{isSubmitted && Object.keys(errors).length > 0 && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 mb-4"><AlertCircle className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />Harap isi semua field yang wajib diisi (tanda bintang merah).</div>}<div className="grid grid-cols-2 gap-5">{fields.map((f) => <div key={f.name}><label className="mb-2 block text-sm font-semibold text-slate-300">{f.label}{f.required && <span className="ml-1 text-rose-600">*</span>}</label>{f.type === 'select' ? <select className={inputClass} {...register(f.name, { required: f.required })}>{(f.options || []).map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select> : f.type === 'checkbox' ? <label className="flex items-center gap-2 rounded-xl border border-[#1E1E2E] px-3 py-2.5 text-sm text-slate-300"><input className="size-4 rounded border-[#262636] text-indigo-400 focus:ring-indigo-500/30" type="checkbox" {...register(f.name)} />Ya</label> : <input className={inputClass} type={f.type || 'text'} maxLength={f.maxLength} placeholder={`Masukkan ${f.label.toLowerCase()}`} {...register(f.name, { required: f.required, maxLength: f.maxLength })} />}{errors[f.name] && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors[f.name].type === 'maxLength' ? `Maksimal ${f.maxLength} karakter` : `${f.label} wajib diisi`}</p>}</div>)}</div><div className="mt-6 flex justify-end gap-3 border-t border-[#1E1E2E] pt-5"><button type="button" className={`${buttonClass} border border-[#1E1E2E] text-slate-400 hover:bg-[#14141E]/[0.03]`} onClick={onCancel}>Batal</button><button className={`${buttonClass} bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-200`} disabled={saving}>{saving ? <><span className="mr-2 size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" role="status"></span>Menyimpan...</> : 'Simpan'}</button></div></form></div></section>
}

function DataTable({ fields, rows, onEdit, onDelete, canEdit, canDelete }) {
  return <div className="overflow-hidden rounded-xl border border-[#1E1E2E]"><table className="w-full text-left text-sm"><thead className="bg-[#09090E] text-xs uppercase tracking-wider text-slate-400"><tr>{fields.map((f) => <th className="px-5 py-3.5 font-semibold" key={f.name}>{f.label}</th>)}<th className="px-5 py-3.5 text-right font-semibold">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100 bg-[#14141E]">{rows.map((row) => <tr className="transition hover:bg-[#14141E]/[0.03]/80" key={row.id}>{fields.map((f) => <td className="px-5 py-4 text-slate-300" key={f.name}>{String(row[f.name] ?? '')}</td>)}<td className="whitespace-nowrap px-5 py-4 text-right">{canEdit && <button onClick={() => onEdit(row)} className="mr-2 inline-flex items-center justify-center rounded-xl border border-[#262636] p-2 text-sm text-slate-400 transition-colors hover:bg-[#1A1A26] hover:text-slate-200" title="Edit"><Pencil className="h-4 w-4" /></button>}{canDelete && <button onClick={() => onDelete(row)} className="inline-flex items-center justify-center rounded-xl border border-rose-600/20 p-2 text-sm text-rose-400 transition-colors hover:bg-rose-500/10" title="Hapus"><Trash2 className="h-4 w-4" /></button>}</td></tr>)}</tbody></table></div>
}

function GenericMasterPage({ endpoint, fields, title, filters = [] }) {
  const { user } = useAuth()
  const module = endpoint.replace(/^\//, '').replace(/s$/, '')
  const [rows, setRows] = useState([]); const [search, setSearch] = useState(''); const [filter, setFilter] = useState(''); const [current, setCurrent] = useState(null); const [showForm, setShowForm] = useState(false); const [saving, setSaving] = useState(false)
  const modalTitle = useMemo(() => `${current?.id ? 'Edit' : 'Tambah'} ${title}`, [current, title])
  const openCreate = () => { setCurrent(null); setShowForm(true) }; const openEdit = (row) => { setCurrent(row); setShowForm(true) }
  const load = useCallback(async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (filter) params.filter = filter
      const res = await api.get(endpoint, { params })
      setRows(normalizeRows(res.data))
    } catch (error) {
      alert(error.response?.data?.message || `Gagal memuat ${title}`)
    }
  }, [endpoint, search, filter, title])

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      let ignore = false
      api.get(endpoint).then((res) => { if (!ignore) setRows(normalizeRows(res.data)) }).catch((error) => alert(error.response?.data?.message || `Gagal memuat ${title}`))
      return () => { ignore = true }
    }
    const timer = setTimeout(() => {
      load()
    }, 300)
    return () => clearTimeout(timer)
  }, [load, endpoint, title])
  const save = async (data) => { setSaving(true); try { if (current?.id) await api.put(`${endpoint}/${current.id}`, data); else await api.post(endpoint, data); setCurrent(null); setShowForm(false); load() } catch (error) { const validationErrors = error.response?.data?.errors; alert(validationErrors ? Object.values(validationErrors).flat().join('\n') : error.response?.data?.message || `Gagal menyimpan ${title}`) } finally { setSaving(false) } }
  const remove = async (row) => { if (!await confirmDelete(row.nama || row.kode || title)) return; try { await api.delete(`${endpoint}/${row.id}`); load() } catch (error) { alert(error.response?.data?.message || `Gagal menghapus ${title}`) } }
  return <div>{!showForm && <section className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] shadow-sm"><div className="p-6"><div className="mb-6 flex items-center justify-between"><div className="flex items-center gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Master data</p><h1 className="mt-1 text-2xl font-bold text-slate-100">{title}</h1></div></div>{can(user, `${module}.create`) && <button className={`${buttonClass} bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-200`} onClick={openCreate}>+ Tambah</button>}</div><div className="mb-6 grid grid-cols-12 gap-3"><div className="relative col-span-4"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><input className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" placeholder={`Cari ${title}...`} value={search} onChange={(e) => setSearch(e.target.value)} /></div>{filters.length > 0 && <div className="col-span-4"><select className={inputClass} value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">Semua filter</option>{filters.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></div>}</div><DataTable fields={fields} rows={rows} onEdit={openEdit} onDelete={remove} canEdit={can(user, `${module}.update`)} canDelete={can(user, `${module}.delete`)} /></div></section>}{showForm && <FormModal title={modalTitle} fields={fields} current={current} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving} />}</div>
}

export default GenericMasterPage
