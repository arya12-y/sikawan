import Swal from 'sweetalert2'
import { toast } from './toast'

/**
 * Get current theme mode
 */
const isDarkMode = () => {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

/**
 * Base SweetAlert2 configuration with dark/light mode support
 */
const getBaseConfig = () => {
  const isDark = isDarkMode()
  return {
    background: isDark ? '#14141E' : '#FFFFFF',
    color: isDark ? '#F1F5F9' : '#0F172A',
    confirmButtonColor: '#6366f1',
    customClass: {
      popup: 'swal-premium',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn',
    },
  }
}

/**
 * Show success alert
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 * @param {string} confirmButtonText - Confirm button text (default: 'OK')
 */
export const showSuccess = (title, text, confirmButtonText = 'OK') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText,
    ...getBaseConfig(),
  })
}

/**
 * Show error alert
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 * @param {string} confirmButtonText - Confirm button text (default: 'Tutup')
 */
export const showError = (title, text, confirmButtonText = 'Tutup') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText,
    ...getBaseConfig(),
  })
}

/**
 * Show warning alert
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 * @param {string} confirmButtonText - Confirm button text (default: 'Mengerti')
 */
export const showWarning = (title, text, confirmButtonText = 'Mengerti') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText,
    ...getBaseConfig(),
  })
}

/**
 * Show info alert
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 * @param {string} confirmButtonText - Confirm button text (default: 'OK')
 */
export const showInfo = (title, text, confirmButtonText = 'OK') => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText,
    ...getBaseConfig(),
  })
}

/**
 * Show success alert with auto-close timer
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 * @param {number} timer - Auto-close timer in milliseconds (default: 3000)
 */
export const showSuccessToast = (title, text, timer = 3000) => {
  toast('success', text || title)
  return Promise.resolve({ isDismissed: true, timer })
}

/**
 * Show confirmation dialog
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 * @param {string} confirmButtonText - Confirm button text (default: 'Ya, lanjutkan')
 * @param {string} cancelButtonText - Cancel button text (default: 'Batal')
 * @param {string} icon - Icon type (default: 'warning')
 */
export const showConfirm = async (
  title,
  text,
  confirmButtonText = 'Ya, lanjutkan',
  cancelButtonText = 'Batal',
  icon = 'warning'
) => {
  const isDark = isDarkMode()
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: false,
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

/**
 * Show delete confirmation dialog
 * @param {string} name - Name of item to delete
 */
export const showDeleteConfirm = (name) => {
  return showConfirm(
    'Hapus data ini?',
    `"${name}" akan dihapus dan tindakan ini tidak dapat dibatalkan.`,
    'Ya, hapus',
    'Batal',
    'warning'
  )
}

/**
 * Show confirmation dialog with input field
 * @param {string} title - Alert title
 * @param {string} text - Alert message (optional)
 * @param {string} inputPlaceholder - Input placeholder
 * @param {string} confirmButtonText - Confirm button text
 * @param {boolean} inputRequired - Is input required? (default: false)
 */
export const showConfirmWithInput = async (
  title,
  text = '',
  inputPlaceholder = '',
  confirmButtonText = 'Simpan',
  inputRequired = false
) => {
  const result = await Swal.fire({
    title,
    text,
    input: 'textarea',
    inputPlaceholder,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Batal',
    reverseButtons: true,
    focusCancel: false,
    buttonsStyling: false,
    inputValidator: inputRequired
      ? (value) => {
          if (!value) {
            return 'Field ini wajib diisi'
          }
        }
      : undefined,
    ...getBaseConfig(),
  })

  return {
    isConfirmed: result.isConfirmed,
    value: result.value,
  }
}

/**
 * Show loading alert
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 */
export const showLoading = (title = 'Memproses...', text = 'Mohon tunggu sebentar') => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    },
    ...getBaseConfig(),
  })
}

/**
 * Close current SweetAlert2 dialog
 */
export const closeAlert = () => {
  Swal.close()
}
