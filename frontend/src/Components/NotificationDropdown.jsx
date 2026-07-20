import { useCallback, useEffect, useState } from 'react'
import { Bell, ArrowRight, CheckCircle } from 'lucide-react'
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
    <div className="relative">
      <button 
        className="relative flex h-9 w-9 items-center justify-center text-slate-400 transition hover:text-indigo-400 focus:outline-none" 
        type="button" 
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-[#1E1E2E] bg-[#14141E] py-2 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1E1E2E] px-4 pb-3 pt-2">
            <h6 className="text-sm font-bold text-slate-100">Notifikasi</h6>
            {unreadCount > 0 && (
              <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-800" onClick={markAllRead}>
                Tandai Semua Dibaca
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {rows.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">Tidak ada notifikasi</div>
            ) : (
              rows.map((row) => (
                <div key={row.id} className={`group border-b border-slate-50 px-4 py-3 last:border-0 transition hover:bg-[#14141E]/[0.03] ${row.is_read ? '' : 'bg-indigo-500/10/30'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <strong className={`text-sm ${row.is_read ? 'text-slate-400 font-medium' : 'text-indigo-900 font-semibold'}`}>{row.judul}</strong>
                    <span className="shrink-0 text-[10px] text-slate-400">{new Date(row.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{row.pesan}</p>
                  <div className="mt-2 flex items-center justify-between">
                    {row.link ? (
                      <a href={row.link} className="text-xs font-medium text-indigo-400 hover:text-indigo-700 inline-flex items-center">Lihat Detail <ArrowRight className="h-3 w-3 ml-1" /></a>
                    ) : <div></div>}
                    {!row.is_read && (
                      <button className="flex h-6 w-6 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-100 transition" onClick={(e) => markRead(row.id, e)} title="Tandai sudah dibaca">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
