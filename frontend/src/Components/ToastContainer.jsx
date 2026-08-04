import { useEffect, useState } from 'react'
import { removeToast, subscribeToasts } from '../utils/toastStore'

const variants = {
  success: ['text-fg-success-strong', 'bg-success-soft', 'hover:bg-success-medium', 'focus:ring-success-medium'],
  error: ['text-fg-danger-strong', 'bg-danger-soft', 'hover:bg-danger-medium', 'focus:ring-danger-medium'],
  danger: ['text-fg-danger-strong', 'bg-danger-soft', 'hover:bg-danger-medium', 'focus:ring-danger-medium'],
  warning: ['text-fg-warning', 'bg-warning-soft', 'hover:bg-warning-medium', 'focus:ring-warning-medium'],
  info: ['text-fg-brand-strong', 'bg-brand-softer', 'hover:bg-brand-soft', 'focus:ring-brand-medium'],
  brand: ['text-fg-brand-strong', 'bg-brand-softer', 'hover:bg-brand-soft', 'focus:ring-brand-medium'],
  neutral: ['text-heading', 'bg-neutral-secondary-medium', 'hover:bg-neutral-tertiary-medium', 'focus:ring-neutral-tertiary'],
}

function InfoIcon() {
  return <svg className="w-4 h-4 shrink-0 mt-0.5 md:mt-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 11v5m0-8h.01" /></svg>
}

function CloseIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /></svg>
}

function Toast({ item }) {
  const [closing, setClosing] = useState(false)
  const close = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => removeToast(item.id), 160)
  }

  useEffect(() => {
    const timer = window.setTimeout(close, item.duration || 3000)
    return () => window.clearTimeout(timer)
  }, [item.duration])

  const [foreground, background, hover, focus] = variants[item.type] || variants.info
  return (
    <div
      className={`flex sm:items-center p-4 mb-4 text-sm ${foreground} ${background} rounded-base shadow-lg max-w-sm w-[calc(100vw-2rem)] transition-all duration-150 ${closing ? 'opacity-0 translate-x-3' : 'opacity-100'}`}
      role="alert"
    >
      <InfoIcon />
      <span className="sr-only">Info</span>
      <div className="ms-2 text-sm break-words">{item.message}</div>
      <button type="button" onClick={close} className={`ms-auto -mx-1.5 -my-1.5 rounded focus:ring-2 ${focus} p-1.5 ${hover} inline-flex items-center justify-center h-8 w-8 shrink-0`} aria-label="Close">
        <span className="sr-only">Close</span>
        <CloseIcon />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const [items, setItems] = useState([])
  useEffect(() => subscribeToasts(setItems), [])
  return <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none [&>*]:pointer-events-auto" aria-live="polite" aria-atomic="false">{items.map((item) => <Toast key={item.id} item={item} />)}</div>
}
