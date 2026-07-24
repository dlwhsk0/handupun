import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { useStore } from '../store'
import { periodBounds, daysDiff, toISODate } from '../lib/date'
import { formatWon } from '../lib/format'

export function Stats() {
  const { activeCategories, categories, expenses, settings } = useStore()
  const today = new Date()
  const { start, end } = periodBounds(today, settings.monthStartDay)
  const todayStr = toISODate(today)

  const inPeriod = useMemo(
    () => expenses.filter((e) => e.date >= start && e.date <= end),
    [expenses, start, end]
  )

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? '삭제됨'
  const catColor = (id: string) => categories.find((c) => c.id === id)?.color ?? '#64748b'

  // 카테고리별 사용액
  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of inPeriod) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount)
    return [...map.entries()]
      .map(([id, value]) => ({ id, name: catName(id), value, color: catColor(id) }))
      .sort((a, b) => b.value - a.value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inPeriod, categories])

  const totalSpent = inPeriod.reduce((s, e) => s + e.amount, 0)
  const totalBudget = activeCategories.reduce((s, c) => s + c.monthlyBudget, 0)
  const remaining = totalBudget - totalSpent

  // 일별 사용액 (기간 시작 ~ 오늘)
  const daily = useMemo(() => {
    const nDays = daysDiff(start, todayStr) + 1
    const arr: { label: string; value: number }[] = []
    for (let i = 0; i < nDays; i++) {
      const d = new Date(start + 'T00:00:00')
      d.setDate(d.getDate() + i)
      const iso = toISODate(d)
      const value = inPeriod.filter((e) => e.date === iso).reduce((s, e) => s + e.amount, 0)
      arr.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, value })
    }
    return arr
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inPeriod, start, todayStr])

  if (categories.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center text-sm text-slate-500">
        아직 데이터가 없어요. 그룹을 만들고 지출을 기록해보세요.
      </div>
    )
  }

  return (
    <div className="space-y-5 px-4 py-3">
      {/* 요약 타일 */}
      <div className="grid grid-cols-3 gap-2">
        <Tile label="이번 달 예산" value={formatWon(totalBudget)} />
        <Tile label="사용" value={formatWon(totalSpent)} accent="text-amber-400" />
        <Tile
          label="남음"
          value={formatWon(remaining)}
          accent={remaining < 0 ? 'text-red-400' : 'text-emerald-400'}
        />
      </div>

      {/* 카테고리 비율 */}
      <div className="rounded-2xl bg-slate-800 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">그룹별 사용</h3>
        {totalSpent === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">이번 달 지출이 아직 없어요.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {byCategory.map((d) => (
                  <Cell key={d.id} fill={d.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatWon(Number(v))}
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#e2e8f0' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: 13 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 일별 추이 */}
      <div className="rounded-2xl bg-slate-800 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">일별 소비 추이</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={daily} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 11 }}
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => formatWon(Number(v))}
              cursor={{ fill: 'rgba(148,163,184,0.1)' }}
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#e2e8f0' }}
            />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Tile({ label, value, accent = 'text-slate-100' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl bg-slate-800 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 text-sm font-bold ${accent}`}>{value}</div>
    </div>
  )
}
