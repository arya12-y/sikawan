import GenericMasterPage from '../Master/GenericMasterPage'

const fields = [
  { name: 'user', label: 'User' },
  { name: 'action', label: 'Action' },
  { name: 'module', label: 'Module' },
  { name: 'created_at', label: 'Waktu', type: 'datetime-local' },
]

function AuditLog() {
  return <GenericMasterPage endpoint="/audit-logs" fields={fields} title="Audit Log" />
}

export default AuditLog
