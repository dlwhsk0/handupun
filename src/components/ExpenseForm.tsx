import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { useStore } from '../store'
import { todayISO } from '../lib/date'
import { formatWon } from '../lib/format'

export function ExpenseForm({
  open,
  onClose,
  defaultCategoryId,
}: {
  open: boolean
  onClose: () => void
  defaultCategoryId?: string
}) {
  const { activeCategories, addExpense } = useStore()
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [date, setDate] = useState(todayISO())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setCategoryId(defaultCategoryId ?? activeCategories[0]?.id ?? '')
      setAmount('')
      setMemo('')
      setDate(todayISO())
    }
  }, [open, defaultCategoryId, activeCategories])

  const amountNum = Number(amount.replace(/[^0-9]/g, ''))
  const valid = categoryId && amountNum > 0

  async function submit() {
    if (!valid || saving) return
    setSaving(true)
    try {
      await addExpense({ categoryId, amount: amountNum, memo: memo.trim(), date })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="지출 기록">
      <div className="space-y-4">
        {/* 카테고리 */}
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {activeCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  categoryId === c.id ? 'text-white' : 'bg-slate-700 text-slate-300'
                }`}
                style={categoryId === c.id ? { background: c.color } : undefined}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* 금액 */}
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">금액</label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-full rounded-xl bg-slate-700 px-4 py-3 pr-10 text-right text-2xl font-bold text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">원</span>
          </div>
          {amountNum > 0 && (
            <div className="mt-1 text-right text-sm text-slate-500">{formatWon(amountNum)}</div>
          )}
        </div>

        {/* 가게/메모 */}
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">가게 / 메모 (선택)</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 김밥천국"
            className="w-full rounded-xl bg-slate-700 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* 날짜 */}
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl bg-slate-700 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={submit}
          disabled={!valid || saving}
          className="w-full rounded-xl bg-emerald-500 py-3.5 text-lg font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
        >
          기록하기
        </button>
      </div>
    </Modal>
  )
}
