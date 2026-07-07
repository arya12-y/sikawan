import GenericMasterPage from '../Master/GenericMasterPage'

const fields = [
  { name: 'nomor', label: 'Nomor', required: true },
  { name: 'nama', label: 'Nama' },
  { name: 'tanggal_terbit', label: 'Tanggal Terbit', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', options: ['valid', 'expired'] },
]

function Sertifikat() {
  return <GenericMasterPage endpoint="/sertifikats" fields={fields} title="Sertifikat" />
}

export default Sertifikat
