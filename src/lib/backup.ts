import type { BackupData, Category, Expense, Settings } from '../types'
import { toISODate } from './date'

export function buildBackup(
  categories: Category[],
  expenses: Expense[],
  settings: Settings
): BackupData {
  return {
    app: '한두푼',
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    expenses,
    settings,
  }
}

export function downloadBackup(data: BackupData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `handupun-backup-${toISODate(new Date())}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export interface ParsedBackup {
  categories: Category[]
  expenses: Expense[]
  settings: Settings
}

export function parseBackup(text: string): ParsedBackup {
  const data = JSON.parse(text) as Partial<BackupData>
  if (data.app !== '한두푼' || !Array.isArray(data.categories) || !Array.isArray(data.expenses)) {
    throw new Error('한두푼 백업 파일 형식이 아닙니다.')
  }
  if (!data.settings || typeof data.settings.monthStartDay !== 'number') {
    throw new Error('설정 정보가 없는 백업 파일입니다.')
  }
  return {
    categories: data.categories,
    expenses: data.expenses,
    settings: data.settings,
  }
}
