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
  { module: 'penilaian', paths: ['/asesmen'] },
  { module: 'sertifikat', paths: ['/sertifikat'] },
  { module: 'monitoring', paths: ['/monitoring'] },
  { module: 'laporan', paths: ['/laporan'] },
  { module: 'audit-log', paths: ['/audit-log'] },
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
  
  if (roles.some((role) => ['Super Admin', 'Admin Diskominfo'].includes(role))) return true

  const modules = getUserPermModules(user)
  for (const entry of permissionModulePaths) {
    if (modules.has(entry.module) && entry.paths.includes(path)) return true
  }

  const roleAccessFallback = {
    Penguji: ['/asesmen', '/monitoring', '/laporan', '/profile'],
    Walidata: ['/pembelajaran', '/pembelajaran/video', '/pembelajaran/pdf', '/pembelajaran/presentasi', '/pembelajaran/quiz', '/asesmen', '/sertifikat', '/profile'],
    Pimpinan: ['/', '/monitoring', '/laporan', '/profile'],
  }
  return roles.some((role) => (roleAccessFallback[role] || []).includes(path))
}

export const firstAllowedPath = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : []
  if (roles.some((role) => ['Super Admin', 'Admin Diskominfo'].includes(role))) return '/'

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
