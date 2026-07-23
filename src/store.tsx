import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Category, Expense, Settings } from './types'
import * as db from './db'
import { newId } from './lib/id'
import { scheduleReminder } from './lib/notify'

interface StoreValue {
  loading: boolean
  categories: Category[]
  expenses: Expense[]
  settings: Settings
  /** 보관되지 않은 카테고리 */
  activeCategories: Category[]
  addCategory: (input: {
    name: string
    color: string
    monthlyBudget: number
    weekdaysOnly?: boolean
  }) => Promise<void>
  updateCategory: (cat: Category) => Promise<void>
  removeCategory: (id: string) => Promise<void>
  addExpense: (input: { categoryId: string; amount: number; memo: string; date: string }) => Promise<void>
  removeExpense: (id: string) => Promise<void>
  updateSettings: (patch: Partial<Omit<Settings, 'id'>>) => Promise<void>
  replaceAll: (data: { categories: Category[]; expenses: Expense[]; settings: Settings }) => Promise<void>
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settings, setSettings] = useState<Settings>(db.DEFAULT_SETTINGS)

  const reload = useCallback(async () => {
    const [c, e, s] = await Promise.all([
      db.getCategories(),
      db.getExpenses(),
      db.getSettings(),
    ])
    setCategories(c)
    setExpenses(e)
    setSettings(s)
  }, [])

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [reload])

  // 리마인더 스케줄 (설정 변경 시 갱신)
  useEffect(() => {
    scheduleReminder(settings.reminderTime)
  }, [settings.reminderTime])

  const addCategory: StoreValue['addCategory'] = useCallback(async (input) => {
    const cat: Category = {
      id: newId(),
      name: input.name,
      color: input.color,
      monthlyBudget: input.monthlyBudget,
      weekdaysOnly: input.weekdaysOnly ?? false,
      archived: false,
      createdAt: Date.now(),
    }
    await db.putCategory(cat)
    setCategories((prev) => [...prev, cat])
  }, [])

  const updateCategory: StoreValue['updateCategory'] = useCallback(async (cat) => {
    await db.putCategory(cat)
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)))
  }, [])

  const removeCategory: StoreValue['removeCategory'] = useCallback(async (id) => {
    await db.deleteCategory(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setExpenses((prev) => prev.filter((e) => e.categoryId !== id))
  }, [])

  const addExpense: StoreValue['addExpense'] = useCallback(async (input) => {
    const exp: Expense = {
      id: newId(),
      categoryId: input.categoryId,
      amount: input.amount,
      memo: input.memo,
      date: input.date,
      createdAt: Date.now(),
    }
    await db.putExpense(exp)
    setExpenses((prev) => [exp, ...prev])
  }, [])

  const removeExpense: StoreValue['removeExpense'] = useCallback(async (id) => {
    await db.deleteExpense(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const updateSettings: StoreValue['updateSettings'] = useCallback(
    async (patch) => {
      const next = { ...settings, ...patch, id: 'app' as const }
      await db.putSettings(next)
      setSettings(next)
    },
    [settings]
  )

  const replaceAll: StoreValue['replaceAll'] = useCallback(async (data) => {
    await db.replaceAll(data)
    setCategories([...data.categories].sort((a, b) => a.createdAt - b.createdAt))
    setExpenses([...data.expenses].sort((a, b) => b.createdAt - a.createdAt))
    setSettings(data.settings)
  }, [])

  const activeCategories = useMemo(
    () => categories.filter((c) => !c.archived),
    [categories]
  )

  const value: StoreValue = {
    loading,
    categories,
    expenses,
    settings,
    activeCategories,
    addCategory,
    updateCategory,
    removeCategory,
    addExpense,
    removeExpense,
    updateSettings,
    replaceAll,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
