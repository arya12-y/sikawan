let Swal = null

export async function toast(type, message) {
  if (!Swal) Swal = (await import('sweetalert2')).default
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  Swal.fire({
    icon: type,
    title: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: isDark ? '#14141E' : '#FFFFFF',
    color: isDark ? '#F1F5F9' : '#0F172A',
  })
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
