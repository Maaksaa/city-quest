import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      // "generateSW" — плагин сам создаёт service worker с помощью Workbox.
      // Альтернатива "injectManifest" — писать SW вручную (нужно для сложной логики).
      strategies: 'generateSW',

      // Автоматически регистрирует service worker при загрузке страницы.
      // Без этого пришлось бы писать navigator.serviceWorker.register() вручную.
      registerType: 'autoUpdate',

      // includeAssets — файлы из /public, которые нужно закешировать,
      // но которые не попадают в билд автоматически (favicon и т.д.)
      includeAssets: ['favicon.ico'],

      // manifest — это содержимое файла manifest.webmanifest,
      // который браузер читает, чтобы понять: "это приложение".
      manifest: {
        name: 'CityQuest — Исследуй город',
        // short_name — отображается под иконкой на домашнем экране (макс ~12 символов)
        short_name: 'CityQuest',
        description: 'Исследуй город в реальном мире, открывая туман войны',
        // theme_color — цвет верхней панели браузера на Android
        theme_color: '#1a1a2e',
        // background_color — цвет фона splash-экрана при запуске
        background_color: '#1a1a2e',
        // display: 'standalone' — приложение открывается БЕЗ адресной строки,
        // как нативное. Другие варианты: 'fullscreen', 'minimal-ui', 'browser'
        display: 'standalone',
        // scope и start_url — определяют, какие URL "принадлежат" приложению
        scope: '/',
        start_url: '/',
        // icons — иконки для разных размеров экранов и контекстов
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            // purpose: 'maskable' — иконка, которую Android может обрезать
            // в круг/квадрат с закруглёнными углами. Важно: у такой иконки
            // должен быть "безопасный отступ" от краёв (~20%)
            purpose: 'maskable',
          },
        ],
      },

      // workbox — настройки для Workbox (библиотека от Google для service worker).
      // runtimeCaching — правила кеширования для запросов, которые происходят
      // уже ПОСЛЕ загрузки приложения (API-запросы, тайлы карты и т.д.)
      workbox: {
        // globPatterns — какие файлы из билда закешировать заранее (precache).
        // При первом визите SW скачает и сохранит их все.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        runtimeCaching: [
          {
            // Кеширование тайлов карты от MapTiler.
            // urlPattern — регулярка, по которой SW перехватывает запросы.
            urlPattern: /^https:\/\/api\.maptiler\.com\/.*/i,
            // CacheFirst — сначала ищем в кеше, если нет — идём в сеть.
            // Идеально для тайлов: они редко меняются.
            handler: 'CacheFirst',
            options: {
              cacheName: 'maptiler-tiles',
              expiration: {
                // Храним максимум 500 тайлов (чтобы не забить хранилище)
                maxEntries: 500,
                // Тайлы живут 30 дней, потом обновляются
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              // cacheableResponse — кешируем только успешные ответы (статус 0 для opaque, 200 для обычных)
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
