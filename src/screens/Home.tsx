import { useMemo } from 'react'
import { useStore } from '../store'
import { computeStatus, statusLevel } from '../lib/budget'
import { ExpenseList } from '../components/ExpenseList'
import { formatWon, formatWonSigned } from '../lib/format'
import { periodBounds, todayISO } from '../lib/date'

export function Home({
  onAddCategory,
  onQuickAdd,
  onSeeAll,
}: {
  onAddCategory: () => void
  onQuickAdd: (categoryId?: string) => void
  onSeeAll: () => void
}) {
  const { activeCategories, expenses, settings, updateSettings } = useStore()

  const today = new Date()
  const todayStr = todayISO()
  const { start, end } = periodBounds(today, settings.monthStartDay)

  const statuses = useMemo(
    () => activeCategories.map((c) => computeStatus(c, expenses, today, settings.monthStartDay)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategories, expenses, settings.monthStartDay, todayStr]
  )

  // 대표 그룹 (없거나 삭제됐으면 첫 그룹)
  const focused =
    statuses.find((s) => s.category.id === settings.primaryCategoryId) ?? statuses[0]
  const others = statuses.filter((s) => s.category.id !== focused?.category.id)

  // 대표 그룹의 이번 기간 기록 (최근순)
  const focusedRecords = useMemo(
    () =>
      focused
        ? expenses.filter(
            (e) => e.categoryId === focused.category.id && e.date >= start && e.date <= end
          )
        : [],
    [expenses, focused, start, end]
  )
  if (activeCategories.length === 0 || !focused) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 text-5xl">🪙</div>
        <h2 className="mb-2 text-xl font-bold text-slate-100">그룹을 먼저 만들어요</h2>
        <p className="mb-6 text-sm text-slate-400">
          점심, 카페처럼 관리할 지출 그룹과 월 예산을 정하면
          <br />
          오늘 쓸 수 있는 금액을 계산해드려요.
        </p>
        <button
          onClick={onAddCategory}
          className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white active:scale-95"
        >
          + 그룹 만들기
        </button>
      </div>
    )
  }

  const over = focused.todayRemaining < 0
  const heroBg = focused.offToday
    ? 'from-slate-600 to-slate-700'
    : over
      ? 'from-rose-600 to-red-700'
      : 'from-emerald-600 to-teal-700'
  const barWidth = Math.min(100, focused.todayRatio * 100)

  return (
    <div className="px-4 pb-4">
      {/* 대표 그룹 전환 칩 */}
      {activeCategories.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {activeCategories.map((c) => {
            const active = c.id === focused.category.id
            return (
              <button
                key={c.id}
                onClick={() => updateSettings({ primaryCategoryId: c.id })}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active ? 'text-white' : 'bg-slate-800 text-slate-300'
                }`}
                style={active ? { background: c.color } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: active ? 'rgba(255,255,255,0.9)' : c.color }}
                />
                {c.name}
              </button>
            )
          })}
        </div>
      )}

      {/* 대표 그룹 히어로 */}
      <div className={`mt-2 rounded-2xl bg-gradient-to-br ${heroBg} p-5`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white/90">{focused.category.name}</span>
          {focused.category.weekdaysOnly && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
              주중
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-white/80">
          {focused.offToday ? '오늘은 쉬는 날' : '오늘 쓸 수 있는 돈'}
        </div>
        <div className="mt-0.5 text-4xl font-extrabold text-white">
          {formatWonSigned(focused.todayRemaining)}
        </div>
        <div className="mt-1 text-xs text-white/60">
          이번 달 소비 {formatWon(focused.spentPeriod)}
        </div>
        <div className="mt-1 text-sm text-white/80">
          {focused.offToday ? '평일 ' : '일 '}한도 {formatWon(focused.dailyAllowance)} · 오늘 씀{' '}
          {formatWon(focused.spentToday)}
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${barWidth}%` }} />
        </div>
        <button
          onClick={() => onQuickAdd(focused.category.id)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 py-3 font-bold text-white backdrop-blur active:scale-[0.98]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          기록하기
        </button>
      </div>

      {/* 다른 그룹 한 줄 요약 */}
      {others.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {others.map((s) => {
            const level = statusLevel(s.todayRatio)
            const amtColor =
              s.todayRemaining < 0 ? 'text-red-400' : level === 'warn' ? 'text-amber-400' : 'text-slate-300'
            return (
              <button
                key={s.category.id}
                onClick={() => updateSettings({ primaryCategoryId: s.category.id })}
                className="flex w-full items-center justify-between rounded-xl bg-slate-800 px-4 py-3 text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.category.color }} />
                  <span className="text-sm font-medium text-slate-200">{s.category.name}</span>
                  {s.category.weekdaysOnly && (
                    <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">주중</span>
                  )}
                </div>
                <span className={`text-sm font-semibold ${amtColor}`}>
                  {s.offToday ? '쉬는 날' : `오늘 ${formatWonSigned(s.todayRemaining)}`}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* 대표 그룹 최근 기록 (약 5개 보이고, 그 안에서 스크롤) */}
      {focusedRecords.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-slate-400">{focused.category.name} · 최근 기록</h3>
            {focusedRecords.length > 5 && (
              <button onClick={onSeeAll} className="text-sm font-medium text-emerald-400">
                전체 보기 →
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto overscroll-contain pr-0.5">
            <ExpenseList expenses={focusedRecords} />
          </div>
        </div>
      )}
    </div>
  )
}
