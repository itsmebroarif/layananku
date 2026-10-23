const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  pwa: {
    name: 'Service Management Tools',
    shortName: 'ServiceTools',
    themeColor: '#1976D2',
    msTileColor: '#1976D2',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    manifestOptions: {
      name: 'Service Management Tools — Customer Support Suite',
      short_name: 'ServiceTools',
      description: 'Aplikasi layanan pelanggan all-in-one: tiket support, POS, katalog produk & jasa, kalender event, dan kalkulator.',
      start_url: '.',
      display: 'standalone',
      orientation: 'portrait-primary',
      background_color: '#f5f5f5',
      theme_color: '#1976D2',
      lang: 'id',
      icons: [
        { src: 'img/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'img/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'img/icons/android-chrome-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: 'img/icons/android-chrome-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      navigateFallback: 'index.html',
      runtimeCaching: [
        {
          handler: 'CacheFirst',
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2?|ttf|otf|eot)$/,
          options: { cacheName: 'assets-images-fonts', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } }
        },
        {
          handler: 'StaleWhileRevalidate',
          urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
          options: { cacheName: 'google-fonts', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 } }
        },
        {
          handler: 'NetworkFirst',
          urlPattern: /\.js$|\.css$|\.html$/,
          options: { cacheName: 'app-shell', networkTimeoutSeconds: 4 }
        }
      ]
    }
  }
})
