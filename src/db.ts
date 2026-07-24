import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Category, Expense, Settings } from './types'

interface HandupunDB extends DBSchema {
  categories: {
    key: string
    value: Category
  }
  expenses: {
    key: string
    value: Expense
    indexes: { 'by-date': string; 'by-category': string }
  }
  settings: {
    key: string
    value: Settings
  }
}

const DB_NAME = 'handupun'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<HandupunDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<HandupunDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('categories', { keyPath: 'id' })
        const expenses = db.createObjectStore('expenses', { keyPath: 'id' })
        expenses.createIndex('by-date', 'date')
        expenses.createIndex('by-category', 'categoryId')
        db.createObjectStore('settings', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'app',
  currency: 'KRW',
  monthStartDay: 1,
  reminderTime: null,
  primaryCategoryId: null,
}

// --- Categories ---
export async function getCategories(): Promise<Category[]> {
  const db = await getDB()
  const all = await db.getAll('categories')
  return all.sort((a, b) => a.createdAt - b.createdAt)
}

export async function putCategory(cat: Category): Promise<void> {
  const db = await getDB()
  await db.put('categories', cat)
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['categories', 'expenses'], 'readwrite')
  await tx.objectStore('categories').delete(id)
  // 해당 카테고리 지출도 함께 삭제
  const idx = tx.objectStore('expenses').index('by-category')
  let cursor = await idx.openCursor(id)
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}

// --- Expenses ---
export async function getExpenses(): Promise<Expense[]> {
  const db = await getDB()
  const all = await db.getAll('expenses')
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function putExpense(exp: Expense): Promise<void> {
  const db = await getDB()
  await db.put('expenses', exp)
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('expenses', id)
}

// --- Settings ---
export async function getSettings(): Promise<Settings> {
  const db = await getDB()
  const s = await db.get('settings', 'app')
  return s ?? DEFAULT_SETTINGS
}

export async function putSettings(s: Settings): Promise<void> {
  const db = await getDB()
  await db.put('settings', s)
}

// --- Backup / Restore ---
export async function replaceAll(data: {
  categories: Category[]
  expenses: Expense[]
  settings: Settings
}): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['categories', 'expenses', 'settings'], 'readwrite')
  await tx.objectStore('categories').clear()
  await tx.objectStore('expenses').clear()
  await tx.objectStore('settings').clear()
  for (const c of data.categories) await tx.objectStore('categories').put(c)
  for (const e of data.expenses) await tx.objectStore('expenses').put(e)
  await tx.objectStore('settings').put(data.settings)
  await tx.done
}
