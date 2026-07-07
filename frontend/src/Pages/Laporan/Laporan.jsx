import GenericMasterPage from '../Master/GenericMasterPage'

const fields = [
  { name: 'judul', label: 'Judul', required: true },
  { name: 'periode', label: 'Periode' },
  { name: 'jenis', label: 'Jenis', type: 'select', options: ['kompetensi', 'asesmen', 'sertifikat'] },
  { name: 'status', label: 'Status', type: 'select', options: ['draft', 'final'] },
]

function Laporan() {
  return <GenericMasterPage endpoint="/laporan" fields={fields} title="Laporan" />
}

export default Laporan
