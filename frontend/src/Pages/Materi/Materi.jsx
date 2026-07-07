import GenericMasterPage from '../Master/GenericMasterPage'

const fields = [
  { name: 'kompetensi_id', label: 'Kompetensi ID', type: 'number', required: true },
  { name: 'level_id', label: 'Level ID', type: 'number', required: true },
  { name: 'kategori_id', label: 'Kategori ID', type: 'number' },
  { name: 'judul', label: 'Judul', required: true },
  { name: 'jenis', label: 'Jenis', type: 'select', required: true, options: ['video', 'pdf', 'presentasi', 'dokumen'] },
  { name: 'is_published', label: 'Published', type: 'select', options: [{ value: 1, label: 'Published' }, { value: 0, label: 'Draft' }] },
]

function Materi() {
  return <GenericMasterPage endpoint="/materis" fields={fields} title="Materi" />
}

export default Materi
