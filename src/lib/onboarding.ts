const ONBOARDED_KEY = 'handupun:onboarded'

export function markOnboarded(): void {
  localStorage.setItem(ONBOARDED_KEY, '1')
}

export function isOnboarded(): boolean {
  return !!localStorage.getItem(ONBOARDED_KEY)
}
