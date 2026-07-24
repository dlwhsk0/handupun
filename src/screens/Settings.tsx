import { useRef, useState } from 'react'
import { useStore } from '../store'
import { CategoryForm } from '../components/CategoryForm'
import { buildBackup, downloadBackup, parseBackup } from '../lib/backup'
import { formatWon } from '../lib/format'
import { requestNotifyPermission, notifySupported } from '../lib/notify'
import type { Category } from '../types'

export function Settings() {
  const { categories, expenses, settings, updateSettings, replaceAll } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(c: Category) {
    setEditing(c)
    setFormOpen(true)
  }

  async function onReminderToggle(enabled: boolean) {
    if (enabled) {
      const perm = await requestNotifyPermission()
      if (perm !== 'granted') {
        alert('알림 권한이 거부되어 리마인더를 켤 수 없어요. 브라우저 설정에서 허용해주세요.')
        return
      }
      await updateSettings({ reminderTime: settings.reminderTime ?? '21:00' })
    } else {
      await updateSettings({ reminderTime: null })
    }
  }

  function exportData() {
    downloadBackup(buildBackup(categories, expenses, settings))
  }

  async function importData(file: File) {
    try {
      const text = await file.text()
      const parsed = parseBackup(text)
      if (confirm('현재 데이터를 백업 파일로 덮어씁니다. 계속할까요?')) {
        await replaceAll(parsed)
        alert('복원 완료!')
      }
    } catch (err) {
      alert(`복원 실패: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-6 px-4 py-3">
      {/* 카테고리 관리 */}
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-slate-400">그룹 · 예산</h3>
          <button onClick={openAdd} className="text-sm font-medium text-emerald-400">
            + 추가
          </button>
        </div>
        <div className="space-y-1.5">
          {categories.length === 0 && (
            <p className="rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-500">
              아직 그룹이 없어요.
            </p>
          )}
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => openEdit(c)}
              className="flex w-full items-center justify-between rounded-xl bg-slate-800 px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                <span className="font-medium text-slate-200">{c.name}</span>
              </div>
              <span className="text-sm text-slate-400">월 {formatWon(c.monthlyBudget)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 예산 기간 */}
      <section>
        <h3 className="mb-2 px-1 text-sm font-semibold text-slate-400">예산 시작일</h3>
        <div className="rounded-xl bg-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-200">매월</span>
            <select
              value={settings.monthStartDay}
              onChange={(e) => updateSettings({ monthStartDay: Number(e.target.value) })}
              className="rounded-lg bg-slate-700 px-3 py-1.5 text-slate-100 outline-none"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}일
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            급여일 등 기준으로 한 달 주기를 맞출 수 있어요.
          </p>
        </div>
      </section>

      {/* 리마인더 */}
      <section>
        <h3 className="mb-2 px-1 text-sm font-semibold text-slate-400">리마인더</h3>
        <div className="rounded-xl bg-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-200">매일 기록 알림</span>
            <input
              type="checkbox"
              checked={!!settings.reminderTime}
              onChange={(e) => onReminderToggle(e.target.checked)}
              className="h-5 w-5 accent-emerald-500"
              disabled={!notifySupported()}
            />
          </div>
          {settings.reminderTime && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">시각</span>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                className="rounded-lg bg-slate-700 px-3 py-1.5 text-slate-100 outline-none"
              />
            </div>
          )}
          <p className="mt-2 text-xs text-slate-500">
            앱(또는 홈화면 아이콘)이 실행 중일 때 알림을 보내요. 완전히 종료된 상태에서는
            브라우저 특성상 알림이 오지 않을 수 있어요.
          </p>
        </div>
      </section>

      {/* 백업 / 복원 */}
      <section>
        <h3 className="mb-2 px-1 text-sm font-semibold text-slate-400">데이터 백업</h3>
        <div className="space-y-1.5">
          <button
            onClick={exportData}
            className="w-full rounded-xl bg-slate-800 px-4 py-3 text-left font-medium text-slate-200"
          >
            JSON으로 내보내기
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl bg-slate-800 px-4 py-3 text-left font-medium text-slate-200"
          >
            JSON에서 복원하기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importData(f)
              e.target.value = ''
            }}
          />
          <p className="px-1 pt-1 text-xs text-slate-500">
            데이터는 이 기기에만 저장돼요. 기기를 바꾸거나 브라우저 데이터를 지우기 전
            내보내기로 백업하세요.
          </p>
        </div>
      </section>

      <CategoryForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />
    </div>
  )
}
