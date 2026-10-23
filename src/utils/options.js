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

// Kategori divisi & jabatan bawaan untuk Data Staff. Daftar ini sengaja dibuat
// lengkap agar pengguna tidak perlu menambahkan divisi/jabatan satu per satu.
export const STAFF_DIVISIONS = [
  {
    value: 'manajemen',
    title: 'Manajemen & Direksi',
    icon: 'mdi-account-tie-outline',
    color: 'indigo-darken-2',
    items: [
      'Direktur Utama',
      'Direktur Operasional',
      'Direktur Keuangan',
      'Direktur Teknologi',
      'Direktur Pemasaran',
      'Direktur SDM',
      'General Manager',
      'Manager Operasional',
      'Manager Proyek',
      'Manager Keuangan',
      'Manager SDM',
      'Manager Pemasaran',
      'Manager Teknologi',
      'Manager Produksi',
      'Kepala Cabang',
      'Kepala Unit',
      'Koordinator Wilayah',
      'Sekretaris Direksi',
      'Asisten Direksi',
      'Staf Khusus Direksi',
      'Penasihat / Konsultan',
      'Pengawas Internal'
    ]
  },
  {
    value: 'administrasi',
    title: 'Administrasi & Umum',
    icon: 'mdi-office-building-outline',
    color: 'blue-grey-darken-1',
    items: [
      'Admin Kantor',
      'Staf Administrasi',
      'Staf Tata Usaha',
      'Resepsionis',
      'Sekretaris',
      'Operator Telepon',
      'Staf Pengarsipan',
      'Staf Data Entry',
      'Office Boy',
      'Office Girl',
      'Housekeeping',
      'Driver',
      'Kurir',
      'Petugas Keamanan',
      'Teknisi Gedung',
      'Staf Perlengkapan',
      'Staf Rumah Tangga',
      'Pengelola Kendaraan',
      'Staf Protokol'
    ]
  },
  {
    value: 'keuangan',
    title: 'Keuangan & Akuntansi',
    icon: 'mdi-cash-multiple',
    color: 'green-darken-2',
    items: [
      'Finance Manager',
      'Accounting Manager',
      'Akuntan',
      'Staf Akuntansi',
      'Staf Keuangan',
      'Kasir',
      'Teller',
      'Staf Pajak',
      'Konsultan Pajak',
      'Staf Payroll',
      'Accounts Receivable',
      'Accounts Payable',
      'Staf Anggaran',
      'Auditor Internal',
      'Staf Penagihan',
      'Admin Keuangan',
      'Staf Perpajakan',
      'Analis Keuangan',
      'Bendahara',
      'Staf Bank',
      'Staf Asuransi',
      'Staf Klaim'
    ]
  },
  {
    value: 'sdm',
    title: 'SDM & Personalia',
    icon: 'mdi-account-group-outline',
    color: 'teal-darken-2',
    items: [
      'HR Manager',
      'HRD Officer',
      'HR Generalist',
      'Rekruter',
      'Staf Rekrutmen',
      'Staf Pelatihan & Pengembangan',
      'Staf Payroll & Benefit',
      'Staf Hubungan Industrial',
      'Staf Administrasi HR',
      'Konselor Karyawan',
      'Staf K3',
      'Pengelola Absensi',
      'Pengelola Kinerja',
      'Staf Kesejahteraan Karyawan',
      'Staf Kontrak Kerja',
      'Staf Pengembangan Organisasi'
    ]
  },
  {
    value: 'pemasaran',
    title: 'Pemasaran & Penjualan',
    icon: 'mdi-bullhorn-outline',
    color: 'orange-darken-2',
    items: [
      'Marketing Manager',
      'Sales Manager',
      'Kepala Sales',
      'Sales Executive',
      'Staf Penjualan',
      'Account Executive',
      'Account Manager',
      'Business Development',
      'Business Development Manager',
      'Digital Marketing Specialist',
      'Social Media Specialist',
      'Content Creator',
      'Copywriter',
      'SEO Specialist',
      'SEM Specialist',
      'Email Marketing Specialist',
      'Telemarketing',
      'Sales Admin',
      'Brand Manager',
      'Public Relations',
      'Community Manager',
      'Market Researcher',
      'Staf Promosi',
      'Merchandiser',
      'Canvasser',
      'Affiliate Manager',
      'Customer Acquisition'
    ]
  },
  {
    value: 'teknologi',
    title: 'Teknologi Informasi',
    icon: 'mdi-laptop',
    color: 'blue-darken-2',
    items: [
      'CTO',
      'Kepala IT',
      'IT Manager',
      'Product Manager',
      'Project Manager',
      'Scrum Master',
      'Business Analyst',
      'System Analyst',
      'Software Engineer',
      'Programmer',
      'Frontend Developer',
      'Backend Developer',
      'Fullstack Developer',
      'Mobile Developer (Android)',
      'Mobile Developer (iOS)',
      'Game Developer',
      'QA Engineer',
      'Automation Tester',
      'DevOps Engineer',
      'Site Reliability Engineer',
      'System Administrator',
      'Network Administrator',
      'Database Administrator',
      'IT Security Analyst',
      'UI/UX Designer',
      'UX Researcher',
      'Data Analyst',
      'Data Scientist',
      'Data Engineer',
      'AI/ML Engineer',
      'IT Support',
      'Helpdesk',
      'Technical Writer',
      'Webmaster',
      'API Integrator'
    ]
  },
  {
    value: 'desain',
    title: 'Desain & Kreatif',
    icon: 'mdi-palette-outline',
    color: 'pink-darken-2',
    items: [
      'Creative Director',
      'Art Director',
      'Graphic Designer',
      'Visual Designer',
      'UI Designer',
      'UX Designer',
      'Illustrator',
      'Motion Designer',
      'Animator',
      'Video Editor',
      'Videografer',
      'Fotografer',
      '3D Artist',
      'Brand Designer',
      'Packaging Designer',
      'Interior Designer',
      'Drafter',
      'Content Designer',
      'Sound Designer'
    ]
  },
  {
    value: 'operasional',
    title: 'Operasional & Produksi',
    icon: 'mdi-cog-outline',
    color: 'amber-darken-3',
    items: [
      'Operations Manager',
      'Production Manager',
      'Project Coordinator',
      'Site Supervisor',
      'Kepala Lapangan',
      'Koordinator Lapangan',
      'Staf Operasional',
      'Staf Produksi',
      'Kepala Produksi',
      'Pengawas Produksi',
      'Quality Control',
      'Quality Assurance',
      'Staf Perencanaan',
      'Staf Pengadaan',
      'Staf Logistik',
      'Staf Gudang',
      'Kepala Gudang',
      'Staf Inventaris',
      'Staf Pengiriman',
      'Teknisi',
      'Operator Mesin',
      'PPIC',
      'Staf Maintenance',
      'Staf Keselamatan Kerja'
    ]
  },
  {
    value: 'layanan',
    title: 'Layanan Pelanggan',
    icon: 'mdi-headset',
    color: 'cyan-darken-2',
    items: [
      'Customer Service Manager',
      'Customer Service Supervisor',
      'Customer Service',
      'Technical Support',
      'Helpdesk Support',
      'After Sales Service',
      'Staf Keluhan Pelanggan',
      'Staf Retensi Pelanggan',
      'Customer Success',
      'Service Advisor',
      'Staf Live Chat',
      'Staf Call Center',
      'Staf Reservasi',
      'Staf Front Office',
      'Staf Back Office',
      'Quality Assurance CS',
      'Trainer CS'
    ]
  },
  {
    value: 'hukum',
    title: 'Hukum & Kepatuhan',
    icon: 'mdi-scale-balance',
    color: 'purple-darken-2',
    items: [
      'Legal Manager',
      'Legal Officer',
      'Legal Counsel',
      'Staf Hukum',
      'Compliance Officer',
      'Staf Kepatuhan',
      'Contract Administrator',
      'Staf Perizinan',
      'Paralegal',
      'Auditor Kepatuhan',
      'Staf Regulasi',
      'Pengelola Risiko'
    ]
  },
  {
    value: 'pengadaan',
    title: 'Pengadaan & Kemitraan',
    icon: 'mdi-handshake-outline',
    color: 'brown-darken-1',
    items: [
      'Procurement Manager',
      'Purchasing Manager',
      'Staf Pengadaan',
      'Purchasing Officer',
      'Vendor Manager',
      'Staf Kemitraan',
      'Partnership Manager',
      'Business Partner',
      'Staf Kontrak',
      'Staf Vendor',
      'Admin Pengadaan',
      'Staf Negosiasi',
      'Staf Hubungan Institusi'
    ]
  },
  {
    value: 'riset',
    title: 'Riset & Pengembangan',
    icon: 'mdi-flask-outline',
    color: 'deep-purple-darken-1',
    items: [
      'R&D Manager',
      'Research Analyst',
      'Product Researcher',
      'Data Researcher',
      'Innovation Specialist',
      'Staf Pengembangan Produk',
      'Staf Riset Pasar',
      'Lab Analyst',
      'Quality Assurance R&D',
      'Prototyping Specialist',
      'Staf Uji Coba Produk',
      'Dokumentasi Teknis'
    ]
  },
  {
    value: 'pendidikan',
    title: 'Pendidikan & Pelatihan',
    icon: 'mdi-school-outline',
    color: 'lime-darken-3',
    items: [
      'Training Manager',
      'Trainer',
      'Instruktur',
      'Tutor',
      'Guru',
      'Dosen',
      'Curriculum Developer',
      'Academic Advisor',
      'Staf Administrasi Pendidikan',
      'Koordinator Pelatihan',
      'Fasilitator',
      'Pengembang Modul',
      'Penguji Kompetensi',
      'Mentor',
      'Staf Perpustakaan'
    ]
  },
  {
    value: 'event',
    title: 'Event & Pameran',
    icon: 'mdi-calendar-star',
    color: 'deep-orange-darken-2',
    items: [
      'Event Manager',
      'Event Coordinator',
      'Wedding Organizer',
      'Promotor',
      'Staf Pameran',
      'Liaison Officer',
      'Stage Manager',
      'Sound Engineer',
      'Lighting Technician',
      'Talent Coordinator',
      'Usher',
      'Staf Dekorasi',
      'Staf Logistik Event',
      'Master of Ceremony',
      'Kameramen',
      'Staf Ticketing'
    ]
  },
  {
    value: 'kesehatan',
    title: 'Kesehatan',
    icon: 'mdi-medical-bag',
    color: 'red-darken-2',
    items: [
      'Dokter Umum',
      'Dokter Spesialis',
      'Dokter Gigi',
      'Perawat',
      'Bidan',
      'Apoteker',
      'Asisten Apoteker',
      'Analis Laboratorium',
      'Radiografer',
      'Ahli Gizi',
      'Fisioterapis',
      'Psikolog',
      'Administrator Faskes',
      'Staf Pendaftaran Pasien',
      'Staf Rekam Medis',
      'Staf Kasir Faskes',
      'Petugas Ambulans',
      'Tenaga Sanitasi',
      'Staf Farmasi'
    ]
  },
  {
    value: 'magang',
    title: 'Magang & Lepas',
    icon: 'mdi-account-clock-outline',
    color: 'blue-grey-darken-2',
    items: [
      'Intern',
      'Magang',
      'Mahasiswa Magang',
      'Siswa PKL',
      'Freelancer',
      'Part-time',
      'Volunteer',
      'Konsultan Lepas',
      'Narasumber',
      'Pekerja Harian Lepas'
    ]
  },
  {
    value: 'lainnya',
    title: 'Lainnya',
    icon: 'mdi-dots-horizontal-circle-outline',
    color: 'grey-darken-1',
    items: [
      'Staf Umum',
      'Staf Tambahan',
      'Relawan',
      'Konsultan',
      'Penasihat',
      'Pengawas',
      'Tenaga Ahli',
      'Lainnya'
    ]
  }
]

// Alias divisi lama agar data staff yang sudah ada tetap terbaca dan
// otomatis diarahkan ke kategori baru saat diedit.
const STAFF_DIVISION_ALIASES = {
  it: 'teknologi',
  informatika: 'teknologi',
  development: 'teknologi',
  developer: 'teknologi',
  engineering: 'teknologi',
  software: 'teknologi',
  marketing: 'pemasaran',
  sales: 'pemasaran',
  finance: 'keuangan',
  accounting: 'keuangan',
  akunting: 'keuangan',
  hr: 'sdm',
  hrd: 'sdm',
  personalia: 'sdm',
  operations: 'operasional',
  operation: 'operasional',
  produksi: 'operasional',
  cs: 'layanan',
  'customer service': 'layanan',
  support: 'layanan',
  admin: 'administrasi',
  administration: 'administrasi',
  umum: 'administrasi',
  management: 'manajemen',
  direksi: 'manajemen',
  design: 'desain',
  kreatif: 'desain',
  legal: 'hukum',
  compliance: 'hukum',
  procurement: 'pengadaan',
  purchasing: 'pengadaan',
  research: 'riset',
  'r&d': 'riset',
  training: 'pendidikan',
  edukasi: 'pendidikan',
  eo: 'event',
  health: 'kesehatan',
  medis: 'kesehatan',
  intern: 'magang'
}

export function staffDivisionByTitle (value) {
  const needle = String(value || '').trim().toLowerCase()
  if (!needle) return null
  const direct = STAFF_DIVISIONS.find(d => d.title.toLowerCase() === needle || d.value === needle)
  if (direct) return direct
  const alias = STAFF_DIVISION_ALIASES[needle]
  return alias ? STAFF_DIVISIONS.find(d => d.value === alias) || null : null
}
