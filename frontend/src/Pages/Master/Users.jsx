import GenericMasterPage from './GenericMasterPage'

const fields = [
  { name: 'name', label: 'Nama', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'role', label: 'Role', type: 'select', options: ['admin', 'opd', 'walidata', 'peserta'] },
  { name: 'status', label: 'Status', type: 'select', options: ['aktif', 'nonaktif'] },
]

function Users() {
  return <GenericMasterPage endpoint="/users" fields={fields} title="Users" filters={[{ label: 'Aktif', value: 'aktif' }, { label: 'Nonaktif', value: 'nonaktif' }]} />
}

export default Users
