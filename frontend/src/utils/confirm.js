import { showConfirm } from './alert'

export async function confirmAction({ title, text, confirmButtonText = 'Ya, lanjutkan', icon = 'warning' }) {
  return showConfirm(title, text, confirmButtonText, 'Batal', icon)
}

export const confirmDelete = (name) => confirmAction({
  title: 'Hapus data ini?',
  text: `"${name}" akan dihapus dan tindakan ini tidak dapat dibatalkan.`,
  confirmButtonText: 'Ya, hapus',
})
