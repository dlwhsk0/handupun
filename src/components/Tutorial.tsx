import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { AmountInput } from './AmountInput'
import { LUNCH_PRESET } from '../lib/presets'
import { formatWon } from '../lib/format'
import { countDaysInclusive, periodBounds } from '../lib/date'
import { markOnboarded } from '../lib/onboarding'

interface Slide {
  emoji: string
  title: string
  body: string
}

const SLIDES: Slide[] = [
  {
    emoji: '🏢',
    title: '출근하면 매일 점심,\n나가서 사먹죠',
    body: '문제는 한 달에 대체 얼마를 쓰는지 감이 안 온다는 거예요. 카드값 보고 놀라기 전엔 모르죠.',
  },
  {
    emoji: '🎯',
    title: '예산을 정하면\n하루 한도를 알려줘요',
    body: '월 예산을 남은 날로 나눠서 "오늘 이만큼 쓸 수 있어요"를 계산해줘요. 덜 쓰면 내일 한도가 오르고, 초과하면 깎여요.',
  },
  {
    emoji: '🗓️',
    title: '주말엔 회사 점심\n안 사먹잖아요',
    body: '"주중만" 옵션을 켜면 토·일을 빼고 평일 수로만 나눠서, 실제 출근일 기준으로 한도를 계산해요.',
  },
]

export function Tutorial({
  onDone,
  onCreateOther,
}: {
  onDone: () => void
  onCreateOther: () => void
}) {
  const { addCategory } = useStore()
  const [step, setStep] = useState(0)
  const [budget, setBudget] = useState(String(LUNCH_PRESET.monthlyBudget))
  const [saving, setSaving] = useState(false)

  const budgetNum = Number(budget.replace(/[^0-9]/g, ''))
  const isLast = step === SLIDES.length // 마지막은 프리셋 시작 화면

  // 회사점심 프리셋으로 시작했을 때 예상 평일 한도 미리보기
  const previewDaily = useMemo(() => {
    const { start, end } = periodBounds(new Date(), 1)
    const weekdays = countDaysInclusive(start, end, true)
    return budgetNum > 0 ? budgetNum / weekdays : 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetNum])

  async function startWithLunch() {
    if (budgetNum <= 0 || saving) return
    setSaving(true)
    try {
      await addCategory({
        name: LUNCH_PRESET.name,
        color: LUNCH_PRESET.color,
        monthlyBudget: budgetNum,
        weekdaysOnly: LUNCH_PRESET.weekdaysOnly,
      })
      markOnboarded()
      onDone()
    } finally {
      setSaving(false)
    }
  }

  function skip() {
    markOnboarded()
    onCreateOther()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 px-6 pt-[env(safe-area-inset-top)] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      {/* 상단: 건너뛰기 + 진행 점 */}
      <div className="flex items-center justify-between py-4">
        <div className="flex gap-1.5">
          {[...SLIDES, null].map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-emerald-400' : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
        </div>
        <button onClick={skip} className="text-sm text-slate-500">
          건너뛰기
        </button>
      </div>

      {!isLast ? (
        <>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 text-7xl">{SLIDES[step].emoji}</div>
            <h2 className="mb-4 whitespace-pre-line text-2xl font-extrabold leading-tight text-slate-100">
              {SLIDES[step].title}
            </h2>
            <p className="max-w-xs text-slate-400">{SLIDES[step].body}</p>
          </div>
          <button
            onClick={() => setStep((s) => s + 1)}
            className="w-full rounded-xl bg-emerald-500 py-3.5 text-lg font-bold text-white active:scale-[0.98]"
          >
            다음
          </button>
        </>
      ) : (
        <>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-5 text-6xl">{LUNCH_PRESET.emoji}</div>
            <h2 className="mb-2 text-2xl font-extrabold text-slate-100">
              회사점심으로 시작하기
            </h2>
            <p className="mb-6 text-sm text-slate-400">{LUNCH_PRESET.desc} · 주중만 계산</p>

            <div className="w-full max-w-xs">
              <label className="mb-1.5 block text-left text-sm text-slate-400">
                월 예산
              </label>
              <div className="relative">
                <AmountInput
                  value={budget}
                  onChange={setBudget}
                  className="w-full rounded-xl bg-slate-800 px-4 py-3 pr-10 text-right text-2xl font-bold text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  원
                </span>
              </div>
              {previewDaily > 0 && (
                <p className="mt-2 text-sm text-emerald-400">
                  평일 하루 약 {formatWon(previewDaily)} 쓸 수 있어요
                </p>
              )}
            </div>
          </div>

          <button
            onClick={startWithLunch}
            disabled={budgetNum <= 0 || saving}
            className="mb-2 w-full rounded-xl bg-emerald-500 py-3.5 text-lg font-bold text-white active:scale-[0.98] disabled:opacity-40"
          >
            회사점심으로 시작
          </button>
          <button
            onClick={skip}
            className="w-full py-2 text-sm font-medium text-slate-400"
          >
            직접 다른 그룹 만들기
          </button>
        </>
      )}
    </div>
  )
}
