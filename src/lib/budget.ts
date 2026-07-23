import type { Category, Expense } from '../types'
import { daysDiff, periodBounds, toISODate } from './date'

export interface CategoryStatus {
  category: Category
  /** 이번 기간 총 예산 */
  budget: number
  /** 이번 기간 총 사용액 */
  spentPeriod: number
  /** 오늘 이전까지 사용액 */
  spentBeforeToday: number
  /** 오늘 사용액 */
  spentToday: number
  /** 기간 남은 예산 (음수 가능) */
  budgetRemaining: number
  /** 오늘 포함 남은 일수 */
  remainingDays: number
  /** 오늘 쓸 수 있는 금액 (남은 예산 ÷ 남은 일수) */
  dailyAllowance: number
  /** 오늘 아직 쓸 수 있는 금액 (dailyAllowance - spentToday, 음수 가능) */
  todayRemaining: number
  /** 오늘 한도 소진률 0~1+ */
  todayRatio: number
}

/**
 * 카테고리별 오늘의 소비 현황을 계산한다.
 *
 * 핵심 로직:
 *   오늘의 일 한도 = max(0, 예산 - 오늘 이전 사용액) ÷ (오늘 포함 남은 일수)
 *   오늘 남은 금액 = 일 한도 - 오늘 사용액
 * 오늘 덜 쓰면 남은 예산이 남아 내일 한도가 오르고, 초과하면 내일 한도가 깎인다.
 */
export function computeStatus(
  category: Category,
  expenses: Expense[],
  today: Date,
  monthStartDay: number
): CategoryStatus {
  const { start, end } = periodBounds(today, monthStartDay)
  const todayStr = toISODate(today)

  const inPeriod = expenses.filter(
    (e) => e.categoryId === category.id && e.date >= start && e.date <= end
  )

  let spentPeriod = 0
  let spentBeforeToday = 0
  let spentToday = 0
  for (const e of inPeriod) {
    spentPeriod += e.amount
    if (e.date < todayStr) spentBeforeToday += e.amount
    else if (e.date === todayStr) spentToday += e.amount
  }

  const budget = category.monthlyBudget
  const budgetRemaining = budget - spentPeriod
  // 오늘 포함 남은 일수 (최소 1)
  const remainingDays = Math.max(1, daysDiff(todayStr, end) + 1)

  const dailyAllowance = Math.max(0, budget - spentBeforeToday) / remainingDays
  const todayRemaining = dailyAllowance - spentToday
  const todayRatio = dailyAllowance > 0 ? spentToday / dailyAllowance : spentToday > 0 ? 1 : 0

  return {
    category,
    budget,
    spentPeriod,
    spentBeforeToday,
    spentToday,
    budgetRemaining,
    remainingDays,
    dailyAllowance,
    todayRemaining,
    todayRatio,
  }
}

/** 진행률에 따른 색 상태 */
export function statusLevel(ratio: number): 'ok' | 'warn' | 'over' {
  if (ratio >= 1) return 'over'
  if (ratio >= 0.75) return 'warn'
  return 'ok'
}
