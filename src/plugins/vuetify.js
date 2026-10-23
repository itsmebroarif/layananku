import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#00897B',
          accent: '#7E57C2',
          success: '#2E7D32',
          warning: '#ED6C02',
          error: '#D32F2F',
          info: '#0288D1',
          background: '#F5F5F5',
          surface: '#FFFFFF'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#64B5F6',
          secondary: '#4DB6AC',
          accent: '#B39DDB',
          success: '#81C784',
          warning: '#FFB74D',
          error: '#E57373',
          info: '#4FC3F7',
          background: '#121212',
          surface: '#1E1E1E'
        }
      }
    }
  },
  defaults: {
    VBtn: { rounded: 'lg' },
    VCard: { rounded: 'lg', elevation: 0 },
    VTextField: { variant: 'outlined', density: 'compact', hideDetails: 'auto' },
    VSelect: { variant: 'outlined', density: 'compact', hideDetails: 'auto' },
    VTextarea: { variant: 'outlined', density: 'compact', hideDetails: 'auto' },
    VChip: { rounded: 'lg' },
    VDialog: { scrim: 'rgba(0,0,0,.45)' }
  }
})
