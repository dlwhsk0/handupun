export interface Category {
  id: string
  name: string
  color: string
  /** 이번 달(기간) 예산, 원 단위 */
  monthlyBudget: number
  /** 일 한도 계산 시 주말(토·일)을 남은 일수에서 제외 (회사 점심 등) */
  weekdaysOnly: boolean
  /** 보관 처리 시 목록에서 숨김 */
  archived: boolean
  createdAt: number
}

export interface Expense {
  id: string
  categoryId: string
  /** 원 단위 양수 */
  amount: number
  /** 가게/메모 (선택) */
  memo: string
  /** 로컬 기준 'YYYY-MM-DD' */
  date: string
  createdAt: number
}

export interface Settings {
  id: 'app'
  currency: string
  /** 예산 기간이 시작되는 날 (1~28, 급여일 등) */
  monthStartDay: number
  /** 리마인더 시각 'HH:MM', 끄면 null */
  reminderTime: string | null
  /** 홈에서 메인으로 보여줄 대표 그룹. null이면 첫 그룹 */
  primaryCategoryId: string | null
}

export interface BackupData {
  app: '한두푼'
  version: 1
  exportedAt: string
  categories: Category[]
  expenses: Expense[]
  settings: Settings
}
