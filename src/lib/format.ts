/** 정수 원화 포맷: 12345 -> "12,345원" */
export function formatWon(n: number): string {
  const rounded = Math.round(n)
  return `${rounded.toLocaleString('ko-KR')}원`
}

/** 부호 포함: -3000 -> "-3,000원", 3000 -> "+3,000원" */
export function formatWonSigned(n: number): string {
  const rounded = Math.round(n)
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded.toLocaleString('ko-KR')}원`
}

/** 'YYYY-MM-DD' -> "7월 23일 (수)" */
export function formatDateKo(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
}
