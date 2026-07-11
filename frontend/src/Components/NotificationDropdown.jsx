import { useCallback, useEffect, useState } from 'react'
import api from '../api/axios'

function NotificationDropdown() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await api.get('/notifikasis?per_page=5')
      const data = res.data?.data ?? res.data
      setRows(Array.isArray(data) ? data : [])
    } catch {
      setRows([])
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => load())
    const timer = setInterval(() => load(), 30000)
    return () => clearInterval(timer)
  }, [load])

  const markRead = async (id, e) => {
    e.stopPropagation()
    try {
      await api.post(`/notifikasis/${id}/mark-read`)
      load()
    } catch {
      // ignore
    }
  }

  const markAllRead = async () => {
    try {
      await api.post('/notifikasis/mark-all-read')
      load()
    } catch {
      // ignore
    }
  }

  const unreadCount = rows.filter((r) => !r.is_read).length

  return (
    <div className="dropdown">
      <button className="btn btn-light position-relative" type="button" onClick={() => setOpen(!open)} data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && <span className="notification-dot"></span>}
      </button>
      <div className={`dropdown-menu dropdown-menu-end shadow border-0 p-0 ${open ? 'show' : ''}`} style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light sticky-top">
          <h6 className="mb-0 fw-bold">Notifikasi</h6>
          {unreadCount > 0 && (
            <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={markAllRead}>
              Tandai Semua Dibaca
            </button>
          )}
        </div>
        <div className="list-group list-group-flush">
          {rows.length === 0 ? (
            <div className="text-center p-4 text-muted small">Tidak ada notifikasi</div>
          ) : (
            rows.map((row) => (
              <div key={row.id} className={`list-group-item list-group-item-action ${row.is_read ? '' : 'bg-light'}`}>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <strong className={`small ${row.is_read ? 'text-muted' : 'text-primary'}`}>{row.judul}</strong>
                  <small className="text-muted ms-2" style={{ fontSize: '0.7rem' }}>{new Date(row.created_at).toLocaleDateString('id-ID')}</small>
                </div>
                <p className="mb-1 small text-secondary" style={{ lineHeight: 1.3 }}>{row.pesan}</p>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  {row.link ? (
                    <a href={row.link} className="small text-decoration-none">Lihat Detail <i className="bi bi-arrow-right"></i></a>
                  ) : <div></div>}
                  {!row.is_read && (
                    <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={(e) => markRead(row.id, e)}>
                      <i className="bi bi-circle text-primary"></i>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationDropdown
