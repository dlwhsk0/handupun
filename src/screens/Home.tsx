import { useMemo } from 'react'
import { useStore } from '../store'
import { computeStatus } from '../lib/budget'
import { CategoryCard } from '../components/CategoryCard'
import { ExpenseList } from '../components/ExpenseList'
import { formatWon, formatWonSigned, formatDateKo } from '../lib/format'
import { periodBounds, todayISO } from '../lib/date'

const RECENT_DAYS = 3

export function Home({
  onAddCategory,
  onQuickAdd,
  onSeeAll,
}: {
  onAddCategory: () => void
  onQuickAdd: (categoryId?: string) => void
  onSeeAll: () => void
}) {
  const { activeCategories, expenses, settings } = useStore()

  const today = new Date()
  const todayStr = todayISO()
  const { start, end } = periodBounds(today, settings.monthStartDay)

  const statuses = useMemo(
    () => activeCategories.map((c) => computeStatus(c, expenses, today, settings.monthStartDay)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategories, expenses, settings.monthStartDay, todayStr]
  )

  const totalTodayRemaining = statuses.reduce((s, x) => s + x.todayRemaining, 0)
  const totalTodaySpent = statuses.reduce((s, x) => s + x.spentToday, 0)

  const periodExpenses = useMemo(
    () => expenses.filter((e) => e.date >= start && e.date <= end),
    [expenses, start, end]
  )
  const distinctDays = useMemo(
    () => new Set(periodExpenses.map((e) => e.date)).size,
    [periodExpenses]
  )

  if (activeCategories.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 text-5xl">🐷</div>
        <h2 className="mb-2 text-xl font-bold text-slate-100">카테고리를 먼저 만들어요</h2>
        <p className="mb-6 text-sm text-slate-400">
          점심, 카페처럼 관리할 지출 항목과 월 예산을 정하면
          <br />
          오늘 쓸 수 있는 금액을 계산해드려요.
        </p>
        <button
          onClick={onAddCategory}
          className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white active:scale-95"
        >
          + 카테고리 만들기
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4">
      {/* 요약 */}
      <div className="mb-4 mt-2 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5">
        <div className="text-sm text-emerald-100">{formatDateKo(todayStr)} · 오늘 쓸 수 있는 돈</div>
        <div className="mt-1 text-3xl font-extrabold text-white">
          {formatWonSigned(totalTodayRemaining)}
        </div>
        <div className="mt-1 text-sm text-emerald-100">오늘 사용 {formatWon(totalTodaySpent)}</div>
      </div>

      {/* 카테고리 카드 */}
      <div className="space-y-3">
        {statuses.map((s) => (
          <CategoryCard key={s.category.id} status={s} onClick={() => onQuickAdd(s.category.id)} />
        ))}
      </div>

      {/* 최근 기록 */}
      {periodExpenses.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-slate-400">최근 기록</h3>
            {distinctDays > RECENT_DAYS && (
              <button onClick={onSeeAll} className="text-sm font-medium text-emerald-400">
                전체 보기 →
              </button>
            )}
          </div>
          <ExpenseList expenses={periodExpenses} maxGroups={RECENT_DAYS} />
        </div>
      )}
    </div>
  )
}
