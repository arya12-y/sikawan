import GenericMasterPage from '../Master/GenericMasterPage'

const fields = [
  { name: 'judul', label: 'Judul', required: true },
  { name: 'pesan', label: 'Pesan' },
  { name: 'tipe', label: 'Tipe', type: 'select', options: ['info', 'warning', 'success', 'danger'] },
  { name: 'status', label: 'Status', type: 'select', options: ['unread', 'read'] },
]

function Notifikasi() {
  return <GenericMasterPage endpoint="/notifikasis" fields={fields} title="Notifikasi" />
}

export default Notifikasi
