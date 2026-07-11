export const roleAccess = {
  'Super Admin': ['*'],
  'Admin Diskominfo': ['*'],
  Penguji: ['/asesmen', '/monitoring', '/laporan', '/profile'],
  Walidata: ['/pembelajaran', '/pembelajaran/video', '/pembelajaran/pdf', '/pembelajaran/presentasi', '/pembelajaran/quiz', '/asesmen', '/sertifikat', '/profile'],
  Pimpinan: ['/', '/monitoring', '/laporan', '/profile'],
}

export const canAccessPath = (user, path) => {
  const roles = Array.isArray(user?.roles) ? user.roles : []
  if (roles.some((role) => roleAccess[role]?.includes('*'))) return true
  return roles.some((role) => (roleAccess[role] || []).some((allowed) => path === allowed || (allowed !== '/' && path.startsWith(`${allowed}/`))))
}

export const firstAllowedPath = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : []
  if (roles.some((role) => roleAccess[role]?.includes('*'))) return '/'
  return roles.flatMap((role) => roleAccess[role] || []).find((path) => path !== '/profile' && path !== '/notifikasi') || '/profile'
}
