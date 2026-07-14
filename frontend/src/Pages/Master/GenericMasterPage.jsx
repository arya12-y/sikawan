import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

function FormModal({ title, fields, current, onSubmit, onCancel }) {
  const { register, handleSubmit, reset } = useForm()
  useEffect(() => reset(current || {}), [current, reset])

  const submit = (data) => {
    const normalized = fields.reduce((result, field) => ({ ...result, [field.name]: normalizeValue(field, data[field.name]) }), {})
    return onSubmit(normalized)
  }

  return <div className="card shadow-sm border-0 mt-4"><div className="card-body p-4"><form onSubmit={handleSubmit(submit)}><div className="d-flex justify-content-between align-items-center mb-4"><h5 className="fw-bold mb-0">{title}</h5><button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}><i className="bi bi-arrow-left me-1"></i>Kembali</button></div><div className="row g-3">{fields.map((f) => <div className="col-md-6" key={f.name}><label className="form-label">{f.label}</label>{f.type === 'select' ? <select className="form-select" {...register(f.name, { required: f.required })}>{(f.options || []).map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select> : f.type === 'checkbox' ? <div className="form-check"><input className="form-check-input" type="checkbox" {...register(f.name)} /><label className="form-check-label">Ya</label></div> : <input className="form-control" type={f.type || 'text'} {...register(f.name, { required: f.required })} />}</div>)}</div><div className="d-flex justify-content-end gap-2 mt-4"><button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Batal</button><button className="btn btn-primary">Simpan</button></div></form></div></div>
}

function DataTable({ fields, rows, onEdit, onDelete }) {
  return <div className="table-responsive"><table className="table table-hover align-middle"><thead className="table-light"><tr>{fields.map((f) => <th key={f.name}>{f.label}</th>)}<th className="text-end">Aksi</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{fields.map((f) => <td key={f.name}>{String(row[f.name] ?? '')}</td>)}<td className="text-end text-nowrap"><button className="btn btn-sm btn-outline-primary me-1" onClick={() => onEdit(row)} title="Edit"><i className="bi bi-pencil"></i></button><button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(row)} title="Hapus"><i className="bi bi-trash"></i></button></td></tr>)}</tbody></table></div>
}

function GenericMasterPage({ endpoint, fields, title, filters = [] }) {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [current, setCurrent] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const modalTitle = useMemo(() => `${current?.id ? 'Edit' : 'Tambah'} ${title}`, [current, title])

  const openCreate = () => {
    setCurrent(null)
    setShowForm(true)
  }

  const openEdit = (row) => {
    setCurrent(row)
    setShowForm(true)
  }

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
      setShowForm(false)
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

  return (
    <div>
      {!showForm && (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3">
                <Link className="btn btn-outline-secondary btn-sm" to="/master-data"><i className="bi bi-arrow-left me-1"></i>Kembali</Link>
                <h4 className="mb-0 fw-bold">{title}</h4>
              </div>
              <button className="btn btn-primary" onClick={openCreate}>
                <i className="bi bi-plus-lg me-1"></i>Tambah
              </button>
            </div>
            <div className="row g-2 mb-4">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
                  <input className="form-control border-start-0 ps-0" placeholder={`Cari ${title}...`} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              {filters.length > 0 && (
                <div className="col-md-4">
                  <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="">Semua filter</option>
                    {filters.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                  </select>
                </div>
              )}
              <div className="col-md-3">
                <button className="btn btn-outline-secondary w-100" onClick={load}><i className="bi bi-arrow-clockwise me-1"></i>Refresh</button>
              </div>
            </div>
            <DataTable fields={fields} rows={rows} onEdit={openEdit} onDelete={remove} />
          </div>
        </div>
      )}
      {showForm && <FormModal title={modalTitle} fields={fields} current={current} onSubmit={save} onCancel={() => setShowForm(false)} />}
    </div>
  )
}

export default GenericMasterPage
