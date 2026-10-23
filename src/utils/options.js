export const CUSTOMER_TYPES = [
  { value: 'personal', title: 'Perorangan' },
  { value: 'business', title: 'Badan Usaha' }
]

export const CUSTOMER_CATEGORIES = ['Umum', 'Korporat', 'UMKM', 'Instansi Pemerintah', 'Reseller', 'VIP']

export const CUSTOMER_STATUS = [
  { value: 'prospect', title: 'Prospect', color: 'info' },
  { value: 'active', title: 'Aktif', color: 'success' },
  { value: 'inactive', title: 'Tidak Aktif', color: 'grey' }
]

export const TICKET_STATUS = [
  { value: 'open', title: 'Terbuka', color: 'primary' },
  { value: 'in_progress', title: 'Diproses', color: 'warning' },
  { value: 'waiting', title: 'Menunggu Balasan', color: 'purple' },
  { value: 'resolved', title: 'Selesai', color: 'success' },
  { value: 'closed', title: 'Ditutup', color: 'grey' }
]

export const TICKET_PRIORITY = [
  { value: 'low', title: 'Rendah', color: 'success' },
  { value: 'medium', title: 'Sedang', color: 'info' },
  { value: 'high', title: 'Tinggi', color: 'warning' },
  { value: 'urgent', title: 'Mendesak', color: 'error' }
]

export const TICKET_CHANNELS = [
  { value: 'portal', title: 'Portal' },
  { value: 'email', title: 'Email' },
  { value: 'phone', title: 'Telepon' },
  { value: 'whatsapp', title: 'WhatsApp' },
  { value: 'walk_in', title: 'Datang Langsung' },
  { value: 'social', title: 'Media Sosial' }
]

export const PRODUCT_TYPES = [
  { value: 'product', title: 'Produk' },
  { value: 'service', title: 'Jasa / Layanan' }
]

export const PAYMENT_METHODS = [
  { value: 'cash', title: 'Tunai', icon: 'mdi-cash' },
  { value: 'qris', title: 'QRIS', icon: 'mdi-qrcode-scan' },
  { value: 'debit', title: 'Kartu Debit', icon: 'mdi-credit-card-outline' },
  { value: 'transfer', title: 'Transfer Bank', icon: 'mdi-bank-transfer' },
  { value: 'ewallet', title: 'E-Wallet', icon: 'mdi-wallet' }
]

export const EVENT_CATEGORIES = [
  { value: 'meeting', title: 'Rapat / Meeting', color: 'primary' },
  { value: 'deadline', title: 'Tenggat / Deadline', color: 'error' },
  { value: 'maintenance', title: 'Maintenance', color: 'warning' },
  { value: 'support', title: 'Dukungan Pelanggan', color: 'secondary' },
  { value: 'sales', title: 'Penjualan / Event', color: 'purple' },
  { value: 'other', title: 'Lainnya', color: 'grey' }
]

export const CURRENCIES = [
  { value: 'IDR', title: 'IDR — Rupiah' },
  { value: 'USD', title: 'USD — US Dollar' },
  { value: 'SGD', title: 'SGD — Singapore Dollar' },
  { value: 'MYR', title: 'MYR — Malaysian Ringgit' }
]

export function optionLabel (options, value) {
  const found = options.find(o => o.value === value)
  return found ? found.title : value
}

export function optionColor (options, value, fallback = 'grey') {
  const found = options.find(o => o.value === value)
  return found ? found.color : fallback
}
