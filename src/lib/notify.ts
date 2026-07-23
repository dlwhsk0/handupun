/**
 * 리마인더 알림 (베스트 에포트).
 *
 * 웹은 백엔드/푸시 서버 없이 앱을 완전히 닫은 상태에서 정시 알림을 보장할 수 없다.
 * 여기서는 "앱(탭/PWA)이 살아있을 때" 설정 시각에 로컬 알림을 띄우는 방식으로 구현한다.
 */

let timer: ReturnType<typeof setTimeout> | null = null

export function notifySupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotifyPermission(): Promise<NotificationPermission> {
  if (!notifySupported()) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

function msUntil(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1)
  return next.getTime() - now.getTime()
}

const LAST_KEY = 'handupun:lastReminder'

function fire() {
  const today = new Date().toISOString().slice(0, 10)
  if (localStorage.getItem(LAST_KEY) === today) return
  localStorage.setItem(LAST_KEY, today)
  if (notifySupported() && Notification.permission === 'granted') {
    new Notification('한두푼', {
      body: '오늘 지출 기록했어요? 지금 바로 남겨보세요 💸',
      icon: '/icon.svg',
      badge: '/icon.svg',
    })
  }
}

/** reminderTime('HH:MM' 또는 null)에 맞춰 스케줄. null이면 해제. */
export function scheduleReminder(reminderTime: string | null): void {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (!reminderTime) return
  const tick = () => {
    fire()
    // 다음 발화 예약
    timer = setTimeout(tick, msUntil(reminderTime))
  }
  timer = setTimeout(tick, msUntil(reminderTime))
}
