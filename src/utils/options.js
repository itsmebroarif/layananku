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

export const MITRA_JENIS = [
  {
    value: 'pendidikan',
    title: 'Pendidikan',
    icon: 'mdi-school-outline',
    color: 'primary',
    items: [
      { value: 'paud_tk', title: 'PAUD / TK' },
      { value: 'sd', title: 'SD / MI' },
      { value: 'smp', title: 'SMP / MTs' },
      { value: 'sma_smk', title: 'SMA / SMK / MA' },
      { value: 'pesantren', title: 'Pesantren' },
      { value: 'universitas', title: 'Universitas / Akademi' },
      { value: 'kursus', title: 'Lembaga Kursus / Bimbel' },
      { value: 'dinas_pendidikan', title: 'Dinas Pendidikan' },
      { value: 'lainnya', title: 'Lainnya' }
    ]
  },
  {
    value: 'agama',
    title: 'Agama',
    icon: 'mdi-hands-pray',
    color: 'purple',
    items: [
      { value: 'masjid', title: 'Masjid' },
      { value: 'mushola', title: 'Mushola' },
      { value: 'gereja', title: 'Gereja' },
      { value: 'vihara', title: 'Vihara / Klenteng' },
      { value: 'pura', title: 'Pura' },
      { value: 'yayasan', title: 'Pesantren / Yayasan Keagamaan' },
      { value: 'toko_ibadah', title: 'Toko Kitab / Perlengkapan Ibadah' },
      { value: 'lainnya', title: 'Lainnya' }
    ]
  },
  {
    value: 'polisi',
    title: 'Polisi',
    icon: 'mdi-police-badge-outline',
    color: 'blue-darken-2',
    items: [
      { value: 'polres_polsek', title: 'Polres / Polsek' },
      { value: 'polda', title: 'Polda' },
      { value: 'satlantas', title: 'Satlantas' },
      { value: 'satreskrim', title: 'Satreskrim' },
      { value: 'brimob', title: 'Brimob' },
      { value: 'pol_pp', title: 'Polisi Pamong Praja' },
      { value: 'lainnya', title: 'Lainnya' }
    ]
  },
  {
    value: 'tni',
    title: 'TNI',
    icon: 'mdi-shield-star-outline',
    color: 'green-darken-2',
    items: [
      { value: 'kodim_koramil', title: 'Kodim / Koramil' },
      { value: 'korem', title: 'Korem' },
      { value: 'kodam', title: 'Kodam' },
      { value: 'angkatan_darat', title: 'Angkatan Darat' },
      { value: 'angkatan_laut', title: 'Angkatan Laut' },
      { value: 'angkatan_udara', title: 'Angkatan Udara' },
      { value: 'lainnya', title: 'Lainnya' }
    ]
  },
  {
    value: 'damkar',
    title: 'Damkar',
    icon: 'mdi-fire-truck',
    color: 'red-darken-2',
    items: [
      { value: 'dinas_damkar', title: 'Dinas Pemadam Kebakaran' },
      { value: 'pos_damkar', title: 'Pos Damkar' },
      { value: 'sektor_damkar', title: 'Sektor Damkar' },
      { value: 'relawan_damkar', title: 'Relawan / Komunitas Damkar' },
      { value: 'lainnya', title: 'Lainnya' }
    ]
  },
  {
    value: 'umkm',
    title: 'UMKM',
    icon: 'mdi-storefront-outline',
    color: 'orange-darken-2',
    items: [
      { value: 'warung', title: 'Warung / Toko Kelontong' },
      { value: 'retail', title: 'Toko Retail' },
      { value: 'kuliner', title: 'Kuliner / F&B' },
      { value: 'fashion', title: 'Fashion / Butik' },
      { value: 'bengkel', title: 'Bengkel' },
      { value: 'salon', title: 'Salon / Barbershop' },
      { value: 'laundry', title: 'Laundry' },
      { value: 'toko_online', title: 'Toko Online' },
      { value: 'produsen', title: 'Produsen / Home Industry' },
      { value: 'lainnya', title: 'Lainnya' }
    ]
  },
  {
    value: 'bisnis',
    title: 'Bisnis',
    icon: 'mdi-briefcase-outline',
    color: 'teal-darken-2',
    items: [
      { value: 'perusahaan', title: 'Perusahaan Swasta' },
      { value: 'startup', title: 'Startup' },
      { value: 'perdagangan', title: 'Perdagangan / Distributor' },
      { value: 'manufaktur', title: 'Manufaktur' },
      { value: 'konstruksi', title: 'Konstruksi' },
      { value: 'perhotelan', title: 'Perhotelan' },
      { value: 'restoran', title: 'Restoran / Cafe' },
      { value: 'logistik', title: 'Logistik / Transportasi' },
      { value: 'lainnya', title: 'Lainnya' }
    ]
  },
  {
    value: 'kantor',
    title: 'Kantor',
    icon: 'mdi-office-building-outline',
    color: 'indigo-darken-2',
    items: [
      { value: 'pemkab_pemkot', title: 'Pemerintah Kabupaten / Kota' },
      { value: 'kecamatan', title: 'Kecamatan / Kelurahan' },
      { value: 'desa', title: 'Kantor Desa' },
      { value: 'dinas_badan', title: 'Dinas / Badan' },
      { value: 'instansi_vertikal', title: 'Instansi Vertikal' },
      { value: 'kantor_perusahaan', title: 'Kantor Perusahaan' },
      { value: 'lainnya', title: 'Lainnya' }
    ]
  },
  {
    value: 'faskes',
    title: 'Faskes',
    icon: 'mdi-hospital-box-outline',
    color: 'cyan-darken-2',
    items: [
      { value: 'klinik', title: 'Klinik' },
      { value: 'puskesmas', title: 'Puskesmas' },
      { value: 'rs', title: 'RS (Rumah Sakit)' },
      { value: 'labkesda', title: 'Labkesda' },
      { value: 'tpmd', title: 'TPMD' },
      { value: 'tpmb', title: 'TPMB' }
    ]
  },
  {
    value: 'event_organizer',
    title: 'Event Organizer',
    icon: 'mdi-calendar-star',
    color: 'pink-darken-2',
    items: [
      { value: 'eo', title: 'Event Organizer' },
      { value: 'wo', title: 'Wedding Organizer' },
      { value: 'vendor', title: 'Vendor Event' },
      { value: 'promotor', title: 'Promotor' },
      { value: 'sound_lighting', title: 'Sound System / Lighting' },
      { value: 'lainnya', title: 'Lainnya' }
    ]
  }
]

// Pemetaan data lama (sebelum ada kategori Jenis) agar mitra lama tetap terbaca.
const LEGACY_USAHA = {
  pendidikan: { jenis: 'pendidikan', usaha: 'lainnya' },
  pendidikan_universitas: { jenis: 'pendidikan', usaha: 'universitas' },
  medis_rumah_sakit: { jenis: 'faskes', usaha: 'rs' },
  medis_puskesmas: { jenis: 'faskes', usaha: 'puskesmas' },
  medis_klinik: { jenis: 'faskes', usaha: 'klinik' },
  pelayanan_masyarakat: { jenis: 'kantor', usaha: 'instansi_vertikal' },
  kantor: { jenis: 'kantor', usaha: 'lainnya' },
  usaha_mikro: { jenis: 'umkm', usaha: 'warung' },
  jasa: { jenis: 'bisnis', usaha: 'perusahaan' },
  perbankan: { jenis: 'bisnis', usaha: 'perusahaan' },
  energi: { jenis: 'bisnis', usaha: 'lainnya' },
  teknologi: { jenis: 'bisnis', usaha: 'startup' },
  perhotelan: { jenis: 'bisnis', usaha: 'perhotelan' },
  transportasi: { jenis: 'bisnis', usaha: 'logistik' },
  media_kreatif: { jenis: 'bisnis', usaha: 'lainnya' },
  non_profit: { jenis: 'agama', usaha: 'yayasan' },
  pertahanan: { jenis: 'tni', usaha: 'lainnya' },
  lainnya: { jenis: '', usaha: '' }
}

export function mitraJenisByValue (value) {
  return MITRA_JENIS.find(j => j.value === value) || null
}

export function mitraJenisLabel (value) {
  const found = mitraJenisByValue(value)
  return found ? found.title : (value || '')
}

export function mitraItemLabel (jenis, value) {
  if (!value) return ''
  const category = mitraJenisByValue(jenis)
  const item = category && category.items.find(i => i.value === value)
  return item ? item.title : String(value)
}

export function mitraJenisIcon (value) {
  const found = mitraJenisByValue(value)
  return found ? found.icon : 'mdi-domain'
}

export function mitraJenisColor (value) {
  const found = mitraJenisByValue(value)
  return found ? found.color : 'primary'
}

export function normalizeMitraFields (mitra) {
  const data = mitra || {}
  let jenis = data.jenis || ''
  let usaha = data.usaha || ''

  if (usaha && typeof usaha === 'object') usaha = usaha.value || usaha.title || ''
  if (usaha === '[object Object]') usaha = ''

  if (!jenis && usaha && LEGACY_USAHA[usaha]) {
    jenis = LEGACY_USAHA[usaha].jenis
    usaha = LEGACY_USAHA[usaha].usaha
  }

  if (jenis && !mitraJenisByValue(jenis)) jenis = ''

  return { jenis, usaha }
}

export function mitraSearchText (mitra) {
  const { jenis, usaha } = normalizeMitraFields(mitra)
  return [mitraJenisLabel(jenis), mitraItemLabel(jenis, usaha)].filter(Boolean).join(' ')
}

export function optionLabel (options, value) {
  const found = options.find(o => o.value === value)
  return found ? found.title : value
}

export function optionColor (options, value, fallback = 'grey') {
  const found = options.find(o => o.value === value)
  return found ? found.color : fallback
}
