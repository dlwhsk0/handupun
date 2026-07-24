import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { AmountInput } from './AmountInput'
import { useStore } from '../store'
import { PALETTE } from '../lib/id'
import type { Category } from '../types'

export function CategoryForm({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing?: Category | null
}) {
  const { addCategory, updateCategory, removeCategory, categories } = useStore()
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [color, setColor] = useState(PALETTE[0])
  const [weekdaysOnly, setWeekdaysOnly] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setBudget(editing ? String(editing.monthlyBudget) : '')
      setColor(editing?.color ?? PALETTE[categories.length % PALETTE.length])
      setWeekdaysOnly(editing?.weekdaysOnly ?? false)
    }
  }, [open, editing, categories.length])

  const budgetNum = Number(budget.replace(/[^0-9]/g, ''))
  const valid = name.trim() && budgetNum > 0

  async function submit() {
    if (!valid) return
    if (editing) {
      await updateCategory({ ...editing, name: name.trim(), monthlyBudget: budgetNum, color, weekdaysOnly })
    } else {
      await addCategory({ name: name.trim(), monthlyBudget: budgetNum, color, weekdaysOnly })
    }
    onClose()
  }

  async function handleDelete() {
    if (!editing) return
    if (confirm(`'${editing.name}' 그룹과 관련 기록을 모두 삭제할까요?`)) {
      await removeCategory(editing.id)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? '그룹 수정' : '그룹 추가'}>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 점심"
            autoFocus
            className="w-full rounded-xl bg-slate-700 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-slate-400">월 예산</label>
          <div className="relative">
            <AmountInput
              value={budget}
              onChange={setBudget}
              className="w-full rounded-xl bg-slate-700 px-4 py-3 pr-10 text-right text-xl font-bold text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">원</span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-slate-400">색상</label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-9 w-9 rounded-full transition ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''
                }`}
                style={{ background: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        {/* 주말 제외 */}
        <label className="flex items-center justify-between rounded-xl bg-slate-700/50 px-4 py-3">
          <div>
            <div className="text-slate-200">주중만 계산</div>
            <div className="text-xs text-slate-500">주말을 빼고 평일 수로 일 한도를 나눠요</div>
          </div>
          <input
            type="checkbox"
            checked={weekdaysOnly}
            onChange={(e) => setWeekdaysOnly(e.target.checked)}
            className="h-5 w-5 accent-emerald-500"
          />
        </label>

        <button
          onClick={submit}
          disabled={!valid}
          className="w-full rounded-xl bg-emerald-500 py-3.5 text-lg font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
        >
          {editing ? '저장' : '추가'}
        </button>

        {editing && (
          <button
            onClick={handleDelete}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-red-400 hover:bg-slate-700"
          >
            그룹 삭제
          </button>
        )}
      </div>
    </Modal>
  )
}
