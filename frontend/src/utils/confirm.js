import Swal from 'sweetalert2'

export async function confirmAction({ title, text, confirmButtonText = 'Ya, lanjutkan', icon = 'warning' }) {
  const isDark = document.documentElement.classList.contains('dark')
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Batal',
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false,
    background: isDark ? '#14141E' : '#FFFFFF',
    color: isDark ? '#F1F5F9' : '#0F172A',
    iconColor: icon === 'warning' ? '#F59E0B' : icon === 'error' ? '#EF4444' : '#6366F1',
    customClass: {
      popup: 'swal-premium',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn',
    },
  })

  return result.isConfirmed
}

export const confirmDelete = (name) => confirmAction({
  title: 'Hapus data ini?',
  text: `"${name}" akan dihapus dan tindakan ini tidak dapat dibatalkan.`,
  confirmButtonText: 'Ya, hapus',
})
