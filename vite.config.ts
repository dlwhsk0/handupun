import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages는 https://<user>.github.io/handupun/ 서브경로로 서빙된다.
// 개발 서버는 루트('/')로 두고, 빌드 시에만 서브경로 base를 적용한다.
const BASE = '/handupun/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: '한두푼',
        short_name: '한두푼',
        description: '카테고리별 예산을 남은 일수로 나눠 오늘 쓸 수 있는 금액을 알려주는 소비 관리 앱',
        theme_color: '#10b981',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ko',
        start_url: BASE,
        scope: BASE,
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
}))
