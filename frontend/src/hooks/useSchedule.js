import { useState, useEffect, useRef, useMemo } from 'react'
import api from '../api/axios'

function computeLocalPhase(schedule) {
  if (!schedule) return null
  const now = new Date()
  const examStart = schedule.exam_start ? new Date(schedule.exam_start) : null
  const examEnd = schedule.exam_end ? new Date(schedule.exam_end) : null
  const pretestStart = schedule.pretest_start ? new Date(schedule.pretest_start) : null
  const pretestEnd = schedule.pretest_end ? new Date(schedule.pretest_end) : null

  if (examStart && examEnd && now >= examStart && now <= examEnd) return 'exam'
  if (pretestStart && pretestEnd && now >= pretestStart && now <= pretestEnd) return 'pretest'
  if (pretestStart && now < pretestStart) return 'upcoming'
  if (examEnd && now > examEnd) return 'closed'
  return 'learning'
}

export function useSchedule() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeoutPassed, setTimeoutPassed] = useState(false)
  const intervalRef = useRef(null)

  const fetch = () => {
    api.get('/my-status')
      .then(res => setStatus(res.data))
      .catch(() => setStatus({ phase: 'none' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch()
    intervalRef.current = setInterval(fetch, 60000)
    const timeoutRef = setTimeout(() => setTimeoutPassed(true), 10000)
    return () => { clearInterval(intervalRef.current); clearTimeout(timeoutRef) }
  }, [])

  const localPhase = useMemo(() => computeLocalPhase(status?.schedule), [status?.schedule, status])

  return {
    status,
    loading,
    phase: (localPhase || status?.phase) ?? (timeoutPassed ? 'none' : null),
    pretestDone: status?.pretest_done ?? false,
    pretestActivated: status?.pretest_activated ?? false,
    lulus: !!status?.lulus,
    asesmenStatus: status?.asesmen_status ?? null,
    asesmenLulus: status?.asesmen_lulus === null || status?.asesmen_lulus === undefined ? null : !!status.asesmen_lulus,
    asesmenNilai: status?.asesmen_nilai ?? null,
    asesmenSelesai: status?.asesmen_selesai ?? 0,
    asesmenTotal: status?.asesmen_total ?? 0,
    allAsesmenDone: status?.all_asesmen_done ?? false,
    wawancaraPending: !!status?.wawancara_pending,
    wawancara: status?.wawancara ?? null,
    menungguDinilai: !!status?.menunggu_dinilai,
    schedule: status?.schedule ?? null,
    resetRequested: !!status?.reset_requested,
  }
}
