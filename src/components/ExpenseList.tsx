import { useMemo } from 'react'
import { useStore } from '../store'
import { formatWon, formatDateKo } from '../lib/format'
import type { Expense } from '../types'

/** 지출 목록을 날짜별(최신순)로 그룹핑해 렌더. 비어 있으면 아무것도 그리지 않음. */
export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const { categories, removeExpense } = useStore()

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const e of expenses) {
      const arr = map.get(e.date) ?? []
      arr.push(e)
      map.set(e.date, arr)
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => b.createdAt - a.createdAt),
        total: items.reduce((s, e) => s + e.amount, 0),
      }))
  }, [expenses])

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? '삭제됨'
  const catColor = (id: string) => categories.find((c) => c.id === id)?.color ?? '#64748b'

  if (groups.length === 0) return null

  return (
    <div className="space-y-3.5">
      {groups.map((g) => (
        <div key={g.date}>
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-500">{formatDateKo(g.date)}</span>
            <span className="text-xs text-slate-600">{formatWon(g.total)}</span>
          </div>
          <div className="space-y-1">
            {g.items.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: catColor(e.categoryId) }} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">
                      {e.memo || catName(e.categoryId)}
                    </div>
                    {e.memo && (
                      <div className="truncate text-xs text-slate-500">{catName(e.categoryId)}</div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
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
      ))}
    </div>
  )
}
