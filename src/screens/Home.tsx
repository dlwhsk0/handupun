import { useMemo } from 'react'
import { useStore } from '../store'
import { computeStatus } from '../lib/budget'
import { CategoryCard } from '../components/CategoryCard'
import { formatWon, formatWonSigned, formatDateKo } from '../lib/format'
import { todayISO } from '../lib/date'

export function Home({
  onAddCategory,
  onQuickAdd,
}: {
  onAddCategory: () => void
  onQuickAdd: (categoryId?: string) => void
}) {
  const { activeCategories, expenses, settings, removeExpense } = useStore()

  const today = new Date()
  const todayStr = todayISO()

  const statuses = useMemo(
    () => activeCategories.map((c) => computeStatus(c, expenses, today, settings.monthStartDay)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategories, expenses, settings.monthStartDay, todayStr]
  )

  const totalTodayRemaining = statuses.reduce((s, x) => s + x.todayRemaining, 0)
  const totalTodaySpent = statuses.reduce((s, x) => s + x.spentToday, 0)

  const todayExpenses = expenses.filter((e) => e.date === todayStr)
  const catName = (id: string) => activeCategories.find((c) => c.id === id)?.name ?? '삭제됨'
  const catColor = (id: string) => activeCategories.find((c) => c.id === id)?.color ?? '#64748b'

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

      {/* 오늘 기록 */}
      {todayExpenses.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 px-1 text-sm font-semibold text-slate-400">오늘 기록</h3>
          <div className="space-y-1.5">
            {todayExpenses.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: catColor(e.categoryId) }} />
                  <div>
                    <div className="text-sm font-medium text-slate-200">{catName(e.categoryId)}</div>
                    {e.memo && <div className="text-xs text-slate-500">{e.memo}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-200">{formatWon(e.amount)}</span>
                  <button
                    onClick={() => removeExpense(e.id)}
                    className="text-slate-500 hover:text-red-400"
                    aria-label="삭제"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
