import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'

const normalizeRows = (payload) => {
  const rows = payload?.data ?? payload
  return Array.isArray(rows) ? rows : []
}

const normalizeValue = (field, value) => {
  if (field.type === 'checkbox') {
    if (field.valueType === 'number') return value ? 1 : 0
    return Boolean(value)
  }

  if (field.type === 'number' && value !== '') return Number(value)

  return value
}

function FormModal({ id, title, fields, current, onSubmit }) {
  const { register, handleSubmit, reset } = useForm()
  useEffect(() => reset(current || {}), [current, reset])

  const submit = (data) => {
    const normalized = fields.reduce((result, field) => ({ ...result, [field.name]: normalizeValue(field, data[field.name]) }), {})
    return onSubmit(normalized)
  }

  return <div className="modal fade" id={id} tabIndex="-1"><div className="modal-dialog modal-lg"><div className="modal-content"><form onSubmit={handleSubmit(submit)}><div className="modal-header"><h5 className="modal-title">{title}</h5><button type="button" className="btn-close" data-bs-dismiss="modal" /></div><div className="modal-body row g-3">{fields.map((f) => <div className="col-md-6" key={f.name}><label className="form-label">{f.label}</label>{f.type === 'select' ? <select className="form-select" {...register(f.name, { required: f.required })}>{(f.options || []).map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select> : f.type === 'checkbox' ? <div className="form-check"><input className="form-check-input" type="checkbox" {...register(f.name)} /><label className="form-check-label">Ya</label></div> : <input className="form-control" type={f.type || 'text'} {...register(f.name, { required: f.required })} />}</div>)}</div><div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Batal</button><button className="btn btn-primary">Simpan</button></div></form></div></div></div>
}

function DataTable({ fields, rows, onEdit, onDelete }) {
  return <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr>{fields.map((f) => <th key={f.name}>{f.label}</th>)}<th className="text-end">Aksi</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{fields.map((f) => <td key={f.name}>{String(row[f.name] ?? '')}</td>)}<td className="text-end"><button className="btn btn-sm btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#formModal" onClick={() => onEdit(row)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(row)}>Hapus</button></td></tr>)}</tbody></table></div>
}

function GenericMasterPage({ endpoint, fields, title, filters = [] }) {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [current, setCurrent] = useState(null)
  const modalTitle = useMemo(() => `${current?.id ? 'Edit' : 'Tambah'} ${title}`, [current, title])

  const load = async () => {
    try {
      const params = { search }
      if (filter) params.filter = filter
      const res = await api.get(endpoint, { params })
      setRows(normalizeRows(res.data))
    } catch (error) {
      alert(error.response?.data?.message || `Gagal memuat ${title}`)
    }
  }

  useEffect(() => {
    let ignore = false
    api.get(endpoint).then((res) => {
      if (!ignore) setRows(normalizeRows(res.data))
    }).catch((error) => alert(error.response?.data?.message || `Gagal memuat ${title}`))
    return () => { ignore = true }
  }, [endpoint, title])

  const save = async (data) => {
    try {
      if (current?.id) await api.put(`${endpoint}/${current.id}`, data)
      else await api.post(endpoint, data)
      setCurrent(null)
      load()
    } catch (error) {
      alert(error.response?.data?.message || `Gagal menyimpan ${title}`)
    }
  }

  const remove = async (row) => {
    if (confirm(`Hapus ${title}?`)) {
      try {
        await api.delete(`${endpoint}/${row.id}`)
        load()
      } catch (error) {
        alert(error.response?.data?.message || `Gagal menghapus ${title}`)
      }
    }
  }

  return <div className="card shadow-sm"><div className="card-body"><div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3"><h4 className="mb-0">{title}</h4><button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#formModal" onClick={() => setCurrent(null)}>Tambah</button></div><div className="row g-2 mb-3"><div className="col-md-5"><input className="form-control" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>{filters.length > 0 && <div className="col-md-4"><select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">Semua filter</option>{filters.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></div>}<div className="col-md-3 d-grid"><button className="btn btn-outline-primary" onClick={load}>Refresh</button></div></div><DataTable fields={fields} rows={rows} onEdit={setCurrent} onDelete={remove} /><FormModal id="formModal" title={modalTitle} fields={fields} current={current} onSubmit={save} /></div></div>
}

export default GenericMasterPage
