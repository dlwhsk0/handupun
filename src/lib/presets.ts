export interface Preset {
  name: string
  color: string
  monthlyBudget: number
  weekdaysOnly: boolean
  emoji: string
  desc: string
}

/** 기본 카테고리 프리셋 */
export const PRESETS: Preset[] = [
  {
    name: '회사점심',
    color: '#10b981',
    monthlyBudget: 300000,
    weekdaysOnly: true,
    emoji: '🍚',
    desc: '출근해서 사먹는 평일 점심',
  },
]

export const LUNCH_PRESET = PRESETS[0]
