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

/** 평일(월~금) 여부 */
export function isWeekday(iso: string): boolean {
  const dow = new Date(iso + 'T00:00:00').getDay()
  return dow >= 1 && dow <= 5
}

/**
 * fromISO ~ toISO(양끝 포함) 사이의 일수.
 * weekdaysOnly면 주말(토·일)을 제외하고 평일만 센다.
 */
export function countDaysInclusive(
  fromISO: string,
  toISO: string,
  weekdaysOnly: boolean
): number {
  const end = new Date(toISO + 'T00:00:00').getTime()
  const d = new Date(fromISO + 'T00:00:00')
  let count = 0
  while (d.getTime() <= end) {
    const dow = d.getDay()
    if (!weekdaysOnly || (dow >= 1 && dow <= 5)) count++
    d.setDate(d.getDate() + 1)
  }
  return count
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

/**
 * 현재 기간에서 offset만큼(월 단위) 이동한 예산 기간의 경계.
 * offset 0 = 이번 기간, -1 = 지난 기간, +1 = 다음 기간.
 */
export function periodBoundsOffset(
  today: Date,
  startDay: number,
  offset: number
): { start: string; end: string } {
  const { start } = periodBounds(today, startDay)
  const s = new Date(start + 'T00:00:00')
  const shifted = new Date(s.getFullYear(), s.getMonth() + offset, startDay)
  const nextStart = new Date(shifted.getFullYear(), shifted.getMonth() + 1, startDay)
  const end = new Date(nextStart.getTime() - 86_400_000)
  return { start: toISODate(shifted), end: toISODate(end) }
}
