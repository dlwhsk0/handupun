import { useEffect, useState } from 'react'
import { useStore } from './store'
import { BottomNav, type Tab } from './components/BottomNav'
import { Home } from './screens/Home'
import { Records } from './screens/Records'
import { Stats } from './screens/Stats'
import { Settings } from './screens/Settings'
import { ExpenseForm } from './components/ExpenseForm'
import { CategoryForm } from './components/CategoryForm'
import { Tutorial } from './components/Tutorial'
import { isOnboarded } from './lib/onboarding'

const TITLES: Record<Tab, string> = {
  home: '한두푼',
  records: '기록',
  stats: '통계',
  settings: '설정',
}

export default function App() {
  const { loading, categories, activeCategories, settings } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [expensePreset, setExpensePreset] = useState<string | undefined>()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  // 첫 실행(온보딩 전 · 카테고리 없음)이면 튜토리얼 표시
  useEffect(() => {
    if (!loading && !isOnboarded() && categories.length === 0) {
      setShowTutorial(true)
    }
  }, [loading, categories.length])

  function quickAdd(categoryId?: string) {
    setExpensePreset(categoryId)
    setExpenseOpen(true)
  }

  // 홈 하단 기록 버튼이 기록할 대상 = 대표 그룹(없으면 첫 그룹)
  const focused =
    (settings.primaryCategoryId &&
      activeCategories.find((c) => c.id === settings.primaryCategoryId)) ||
    activeCategories[0]
  const focusedId = focused?.id

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">불러오는 중…</div>
    )
  }

  if (showTutorial) {
    return (
      <Tutorial
        onDone={() => setShowTutorial(false)}
        onCreateOther={() => {
          setShowTutorial(false)
          setCategoryOpen(true)
        }}
      />
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col bg-slate-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
        <h1 className="text-lg font-extrabold text-slate-100">{TITLES[tab]}</h1>
        {tab === 'home' && <span className="text-xl">🪙</span>}
      </header>

      {/* 본문 */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {tab === 'home' && (
          <Home
            onAddCategory={() => setCategoryOpen(true)}
            onSeeAll={() => setTab('records')}
          />
        )}
        {tab === 'records' && <Records />}
        {tab === 'stats' && <Stats />}
        {tab === 'settings' && <Settings />}
      </main>

      {/* 홈 하단 고정 기록 버튼 */}
      {tab === 'home' && activeCategories.length > 0 && (
        <div className="border-t border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur">
          <button
            onClick={() => quickAdd(focusedId)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-white active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {focused ? `${focused.name} 기록하기` : '기록하기'}
          </button>
        </div>
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
