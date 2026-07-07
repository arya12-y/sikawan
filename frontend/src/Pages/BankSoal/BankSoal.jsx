import GenericMasterPage from '../Master/GenericMasterPage'

const fields = [
  { name: 'kompetensi_id', label: 'Kompetensi ID', type: 'number', required: true },
  { name: 'level_id', label: 'Level ID', type: 'number', required: true },
  { name: 'jenis', label: 'Jenis', type: 'select', required: true, options: ['pilihan_ganda', 'essay'] },
  { name: 'pertanyaan', label: 'Pertanyaan', required: true },
  { name: 'jawaban_benar', label: 'Jawaban Benar' },
  { name: 'bobot', label: 'Bobot', type: 'number', required: true },
]

function BankSoal() {
  return <GenericMasterPage endpoint="/bank-soals" fields={fields} title="Bank Soal" />
}

export default BankSoal
