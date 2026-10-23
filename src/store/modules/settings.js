import { read, write } from '@/utils/storage'
import { nowISO } from '@/utils/id'

const DEFAULTS = {
  businessName: '',
  businessType: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  currency: 'IDR',
  taxRate: 11,
  lowStockThreshold: 5,
  receiptFooter: 'Terima kasih atas kepercayaan Anda.',
  logoText: '',
  theme: 'light',
  updatedAt: nowISO()
}

const state = () => ({ ...DEFAULTS, ...read('settings', {}) })

const getters = {
  currency: s => s.currency || 'IDR',
  taxRate: s => Number(s.taxRate) || 0,
  business: s => s,
  theme: s => (s.theme === 'dark' ? 'dark' : 'light'),
  profileComplete: s => !!s.businessName,
  DEFAULTS: () => DEFAULTS
}

const mutations = {
  UPDATE_SETTINGS (s, payload) {
    Object.assign(s, payload)
    s.updatedAt = nowISO()
    write('settings', s)
  },
  RESET_SETTINGS (s) {
    Object.assign(s, { ...DEFAULTS, theme: s.theme, updatedAt: nowISO() })
    write('settings', s)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
