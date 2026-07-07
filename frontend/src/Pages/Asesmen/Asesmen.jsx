import GenericMasterPage from '../Master/GenericMasterPage'

const fields = [
  { name: 'judul', label: 'Judul', required: true },
  { name: 'kompetensi_id', label: 'Kompetensi ID', type: 'number', required: true },
  { name: 'level_id', label: 'Level ID', type: 'number', required: true },
  { name: 'jumlah_soal', label: 'Jumlah Soal', type: 'number', required: true },
  { name: 'durasi', label: 'Durasi', type: 'number', required: true },
  { name: 'nilai_lulus', label: 'Nilai Lulus', type: 'number', required: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: ['draft', 'published', 'ongoing', 'finished'] },
  { name: 'tanggal_mulai', label: 'Tanggal Mulai', type: 'datetime-local' },
  { name: 'tanggal_selesai', label: 'Tanggal Selesai', type: 'datetime-local' },
]

function Asesmen() {
  return <GenericMasterPage endpoint="/asesmens" fields={fields} title="Asesmen" />
}

export default Asesmen
