import { useState } from 'react'
import { useStore } from './store'
import { BottomNav, type Tab } from './components/BottomNav'
import { Home } from './screens/Home'
import { Stats } from './screens/Stats'
import { Settings } from './screens/Settings'
import { ExpenseForm } from './components/ExpenseForm'
import { CategoryForm } from './components/CategoryForm'

const TITLES: Record<Tab, string> = {
  home: '한두푼',
  stats: '통계',
  settings: '설정',
}

export default function App() {
  const { loading, activeCategories } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [expensePreset, setExpensePreset] = useState<string | undefined>()
  const [categoryOpen, setCategoryOpen] = useState(false)

  function quickAdd(categoryId?: string) {
    setExpensePreset(categoryId)
    setExpenseOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">불러오는 중…</div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col bg-slate-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
        <h1 className="text-lg font-extrabold text-slate-100">{TITLES[tab]}</h1>
        {tab === 'home' && <span className="text-xl">🐷</span>}
      </header>

      {/* 본문 */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {tab === 'home' && (
          <Home onAddCategory={() => setCategoryOpen(true)} onQuickAdd={quickAdd} />
        )}
        {tab === 'stats' && <Stats />}
        {tab === 'settings' && <Settings />}
      </main>

      {/* 지출 기록 FAB (홈에서, 카테고리 있을 때) */}
      {tab === 'home' && activeCategories.length > 0 && (
        <button
          onClick={() => quickAdd(undefined)}
          className="fixed bottom-20 left-1/2 z-30 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-emerald-500 px-6 font-bold text-white shadow-lg shadow-emerald-500/30 active:scale-95"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          기록
        </button>
      )}

      <BottomNav tab={tab} onChange={setTab} />

      <ExpenseForm
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        defaultCategoryId={expensePreset}
      />
      <CategoryForm open={categoryOpen} onClose={() => setCategoryOpen(false)} />
    </div>
  )
}
