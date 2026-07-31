const permissionModulePaths = [
  { module: 'dashboard', paths: ['/'] },
  { module: 'opd', paths: ['/master-data', '/opd'] },
  { module: 'bidang', paths: ['/master-data', '/bidang'] },
  { module: 'jabatan', paths: ['/master-data', '/jabatan'] },
  { module: 'kompetensi', paths: ['/master-data', '/kompetensi'] },
  { module: 'level', paths: ['/master-data', '/level'] },
  { module: 'badge', paths: ['/master-data', '/badge'] },
  { module: 'kategori', paths: ['/master-data', '/kategori'] },
  { module: 'walidata', paths: ['/master-data', '/walidata'] },
  { module: 'penguji', paths: ['/master-data', '/penguji'] },
  { module: 'pengguna', paths: ['/master-data', '/users'] },
  { module: 'materi', paths: ['/pembelajaran', '/pembelajaran/video', '/pembelajaran/pdf', '/pembelajaran/presentasi'] },
  { module: 'bank-soal', paths: ['/bank-soal'] },
  { module: 'quiz', paths: ['/pembelajaran/quiz'] },
  { module: 'asesmen', paths: ['/asesmen'] },
  { module: 'pretest', paths: ['/pretest'] },
  { module: 'penilaian', paths: ['/penilaian'] },
  { module: 'sertifikat', paths: ['/sertifikat'] },
  { module: 'monitoring', paths: ['/monitoring'] },
  { module: 'laporan', paths: ['/laporan'] },
  { module: 'audit-log', paths: ['/audit-log'] },
  { module: 'exam-schedules', paths: ['/exam-schedules'] },
  { module: 'notifikasi', paths: ['/notifikasi'] },
  { module: 'profile', paths: ['/profile'] },
]

function getUserPermModules(user) {
  const perms = Array.isArray(user?.permissions) ? user.permissions : []
  const modules = new Set()
  for (const perm of perms) {
    const [module] = perm.split('.')
    if (module) modules.add(module)
  }
  return modules
}

export const canAccessPath = (user, path) => {
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const perms = Array.isArray(user?.permissions) ? user.permissions : []
  
  // Admin Diskominfo cannot access audit-log unless explicitly granted
  if (roles.includes('Admin Diskominfo') && path.startsWith('/audit-log')) {
    return perms.includes('audit-log.view')
  }
  
  if (roles.includes('Super Admin')) return true

  const modules = getUserPermModules(user)
  for (const entry of permissionModulePaths) {
    if (modules.has(entry.module) && entry.paths.includes(path)) return true
  }

  return false
}

export function isWalidataRole(user) {
  return Array.isArray(user?.roles) && user.roles.includes('Walidata')
}

export function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function countdownLabel(dateStr) {
  if (!dateStr) return ''
  const target = new Date(dateStr)
  const now = new Date()
  const diffMs = target - now
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMs <= 0) return ''
  if (diffDays >= 2) return `H-${diffDays} (${formatDate(dateStr)})`
  if (diffDays >= 1) return `Besok (${formatDate(dateStr)})`
  if (diffHours >= 6) return `Tersedia dalam ${diffHours} jam`
  if (diffHours >= 1) return `Tersedia dalam ${diffHours} jam ${diffMinutes % 60} mnt`
  return `Tersedia dalam ${diffMinutes} menit`
}

export function getMenuLock(path, phase, pretestDone, schedule, user, lulus = false, asesmenStatus = null, allAsesmenDone = false, asesmenLulus = null) {
  if (!isWalidataRole(user)) return { locked: false, message: '' }
  if (!phase) return { locked: true, message: '' }
  if (phase === 'none') return { locked: true, message: 'Belum ada jadwal' }

  if (path === '/pretest') {
    if (!phase || phase === 'none' || phase === 'upcoming') return { locked: true, message: countdownLabel(schedule?.pretest_start) }
    if (phase === 'pretest' && !pretestDone) return { locked: false, message: '' }
    if (pretestDone) return { locked: true, message: 'Sudah dikerjakan' }
    return { locked: true, message: 'Pretest telah berakhir' }
  }

  if (path.startsWith('/pembelajaran') || path === '/bank-soal') {
    if (allAsesmenDone && lulus) return { locked: true, message: 'Semua asesmen telah selesai' }
    if (asesmenStatus === 'selesai' && asesmenLulus === null) return { locked: true, message: 'Menunggu penilaian penguji' }
    if (asesmenLulus === false) return { locked: false, message: '' }
    if (phase === 'exam' && asesmenStatus !== 'selesai') return { locked: true, message: 'Fokus ujian asesmen' }
    if (phase === 'closed') return { locked: true, message: 'Jadwal selesai' }
    if (pretestDone) return { locked: false, message: '' }
    if (phase === 'upcoming') return { locked: true, message: countdownLabel(schedule?.pretest_start) }
    return { locked: true, message: 'Selesaikan pretest terlebih dahulu' }
  }

  if (path === '/asesmen') {
    if (allAsesmenDone && lulus) return { locked: true, message: 'Semua asesmen selesai' }
    if (asesmenStatus === 'selesai' && asesmenLulus === null) return { locked: true, message: 'Menunggu penilaian' }
    if (asesmenLulus === false) return { locked: false, message: '' }
    if (allAsesmenDone && !lulus) return { locked: true, message: 'Hubungi admin untuk reset' }
    if (phase === 'exam') return { locked: false, message: '' }
    if (phase === 'closed') return { locked: true, message: 'Jadwal selesai' }
    return { locked: true, message: countdownLabel(schedule?.exam_start) }
  }

  if (path === '/sertifikat') {
    if (lulus) return { locked: false, message: '' }
    if (asesmenLulus === false) return { locked: true, message: 'Belum lulus asesmen' }
    if (phase === 'closed') return { locked: true, message: 'Jadwal selesai' }
    return { locked: true, message: 'Selesaikan ujian asesmen dengan lulus terlebih dahulu' }
  }

  return { locked: false, message: '' }
}

export const firstAllowedPath = (user, phase, pretestDone) => {
  const roles = Array.isArray(user?.roles) ? user.roles : []
  if (roles.some((role) => ['Super Admin', 'Admin Diskominfo'].includes(role))) return '/'

  if (isWalidataRole(user)) {
    if (!phase) return '/profile'
    if (phase === 'pretest' && !pretestDone) return '/pretest'
    if (phase === 'pretest' && pretestDone) return '/pembelajaran'
    if (phase === 'learning') return '/pembelajaran'
    if (phase === 'exam') return '/asesmen'
    return '/profile'
  }

  const modules = getUserPermModules(user)
  if (modules.has('dashboard')) return '/'

  for (const entry of permissionModulePaths) {
    if (modules.has(entry.module)) {
      const nonProfile = entry.paths.find((p) => p !== '/profile')
      if (nonProfile) return nonProfile
    }
  }
  return '/profile'
}
