export function can(user, permission) {
  if (!user) return false
  const roles = Array.isArray(user?.roles) ? user.roles : []
  // Admin Diskominfo must explicitly have audit-log.view
  if (roles.includes('Admin Diskominfo') && permission === 'audit-log.view') {
    const perms = Array.isArray(user?.permissions) ? user.permissions : []
    return perms.includes('audit-log.view')
  }
  if (roles.some((role) => ['Super Admin', 'Admin Diskominfo'].includes(role))) return true
  const perms = Array.isArray(user?.permissions) ? user.permissions : []
  return perms.includes(permission)
}
