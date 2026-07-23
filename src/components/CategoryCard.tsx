import type { CategoryStatus } from '../lib/budget'
import { statusLevel } from '../lib/budget'
import { formatWon, formatWonSigned } from '../lib/format'

const LEVEL_COLOR: Record<string, string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  over: 'bg-red-500',
}

export function CategoryCard({
  status,
  onClick,
}: {
  status: CategoryStatus
  onClick: () => void
}) {
  const { category, dailyAllowance, spentToday, todayRemaining, budgetRemaining, todayRatio, offToday } = status
  const level = statusLevel(todayRatio)
  const barWidth = Math.min(100, todayRatio * 100)
  const over = todayRemaining < 0

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl bg-slate-800 p-4 text-left transition active:scale-[0.98]"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: category.color }} />
          <span className="font-semibold text-slate-100">{category.name}</span>
          {category.weekdaysOnly && (
            <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              주중
            </span>
          )}
        </div>
        <span className={`text-sm font-medium ${over ? 'text-red-400' : 'text-slate-400'}`}>
          {offToday ? '오늘은 쉬는 날' : `오늘 ${over ? '초과' : '남음'}`}
        </span>
      </div>

      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className={`text-2xl font-bold ${over ? 'text-red-400' : 'text-emerald-400'}`}>
            {formatWonSigned(todayRemaining)}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {offToday ? '평일 ' : '일 '}한도 {formatWon(dailyAllowance)} · 오늘 씀 {formatWon(spentToday)}
          </div>
        </div>
      </div>

      <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all ${LEVEL_COLOR[level]}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="text-xs text-slate-500">
        이번 달 남은 예산 {formatWon(budgetRemaining)}
      </div>
    </button>
  )
}
