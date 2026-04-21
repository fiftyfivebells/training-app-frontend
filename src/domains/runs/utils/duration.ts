export function toInt(value: string): number {
  const n = parseInt(value, 10)
  return isNaN(n) ? 0 : n
}

export function durationToTotalSeconds(
  hours: string,
  minutes: string,
  seconds: string,
): number {
  const h = toInt(hours)
  const m = toInt(minutes)
  const s = toInt(seconds)
  return h * 3600 + m * 60 + s
}

export function normalizeDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  return {
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
    formatted: `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
  }
}

export function redistributeTime(hh: string, mm: string, ss: string) {
  const h = toInt(hh)
  const m = toInt(mm)
  const s = toInt(ss)

  const totalSeconds = h * 3600 + m * 60 + s
  if (totalSeconds === 0) return { hh: '', mm: '', ss: '' }

  const finalH = Math.floor(totalSeconds / 3600)
  const finalM = Math.floor((totalSeconds % 3600) / 60)
  const finalS = totalSeconds % 60

  return {
    hh: finalH > 0 ? String(finalH) : '',
    mm:
      finalH > 0
        ? String(finalM).padStart(2, '0')
        : finalM > 0
          ? String(finalM)
          : '',
    ss:
      finalH > 0 || finalM > 0
        ? finalS > 0
          ? String(finalS).padStart(2, '0')
          : ''
        : finalS > 0
          ? String(finalS)
          : '',
  }
}

export function formatDurationDisplay(seconds: number): string {
  const { hours, minutes, seconds: secs } = normalizeDuration(seconds)
  const h = parseInt(hours, 10)
  return h > 0 ? `${h}:${minutes}:${secs}` : `${minutes}:${secs}`
}
