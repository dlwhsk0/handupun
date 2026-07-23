/** 로컬 기준 'YYYY-MM-DD' */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** 두 'YYYY-MM-DD' 사이 일수 (b - a) */
export function daysDiff(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00')
  const db = new Date(b + 'T00:00:00')
  return Math.round((db.getTime() - da.getTime()) / 86_400_000)
}

/**
 * monthStartDay(1~28)를 기준으로 today가 속한 예산 기간의
 * 시작일(포함)과 종료일(포함, 다음 기간 시작 전날)을 ISO 문자열로 반환.
 */
export function periodBounds(
  today: Date,
  startDay: number
): { start: string; end: string } {
  const y = today.getFullYear()
  const m = today.getMonth()
  const d = today.getDate()
  const startMonthOffset = d >= startDay ? 0 : -1
  const start = new Date(y, m + startMonthOffset, startDay)
  const nextStart = new Date(y, m + startMonthOffset + 1, startDay)
  const end = new Date(nextStart.getTime() - 86_400_000)
  return { start: toISODate(start), end: toISODate(end) }
}
