import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { periodBoundsOffset } from '../lib/date'
import { formatWon } from '../lib/format'
import { ExpenseList } from '../components/ExpenseList'

export function Records() {
  const { expenses, settings } = useStore()
  const [offset, setOffset] = useState(0)
  const today = new Date()

  const { start, end } = periodBoundsOffset(today, settings.monthStartDay, offset)

  const inPeriod = useMemo(
    () => expenses.filter((e) => e.date >= start && e.date <= end),
    [expenses, start, end]
  )

  const total = inPeriod.reduce((s, e) => s + e.amount, 0)

  // 기간 라벨: 시작일이 1일이면 "YYYY년 M월", 아니면 "M/D ~ M/D"
  const label = useMemo(() => {
    const s = new Date(start + 'T00:00:00')
    if (settings.monthStartDay === 1) {
      return `${s.getFullYear()}년 ${s.getMonth() + 1}월`
    }
    const e = new Date(end + 'T00:00:00')
    return `${s.getMonth() + 1}/${s.getDate()} ~ ${e.getMonth() + 1}/${e.getDate()}`
  }, [start, end, settings.monthStartDay])

  return (
    <div className="px-4 py-3">
      {/* 기간 네비게이션 */}
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-slate-800 px-2 py-2">
        <button
          onClick={() => setOffset((o) => o - 1)}
          className="rounded-xl p-2 text-slate-300 hover:bg-slate-700"
          aria-label="이전 달"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="text-center">
          <div className="font-bold text-slate-100">{label}</div>
          <div className="text-xs text-slate-400">합계 {formatWon(total)}</div>
        </div>
        <button
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          disabled={offset >= 0}
          className="rounded-xl p-2 text-slate-300 hover:bg-slate-700 disabled:opacity-30"
          aria-label="다음 달"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* 날짜별 기록 */}
      {inPeriod.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 text-4xl">🧾</div>
          <p className="text-sm text-slate-500">이 기간엔 기록이 없어요.</p>
        </div>
      ) : (
        <ExpenseList expenses={inPeriod} />
      )}
    </div>
  )
}
