import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import ToastContainer from '../components/ToastContainer.jsx'
import { pushToast } from './toastStore'

let Swal = null
let toastRoot
let nextId = 0

const ensureToastContainer = () => {
  if (typeof document === 'undefined' || toastRoot) return
  const element = document.createElement('div')
  element.id = 'sikawan-toast-root'
  document.body.appendChild(element)
  toastRoot = createRoot(element)
  toastRoot.render(createElement(ToastContainer))
}

export function toast(type, message) {
  ensureToastContainer()
  pushToast({ id: ++nextId, type, message: String(message ?? '') })
}

export async function confirmAlert(title, text, icon = 'warning', confirmText = 'OK') {
  if (!Swal) Swal = (await import('sweetalert2')).default
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  await Swal.fire({
    icon, title, text, confirmButtonText: confirmText,
    background: isDark ? '#14141E' : '#FFFFFF',
    color: isDark ? '#F1F5F9' : '#0F172A',
    confirmButtonColor: '#6366f1',
    customClass: { popup: 'swal-premium', confirmButton: 'swal-confirm-btn' },
  })
}
