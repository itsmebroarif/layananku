export const PROJECT_TYPES = [
  { value: 'erp', title: 'ERP (Enterprise Resource Planning)' },
  { value: 'simrs', title: 'SIMRS (Sistem Informasi Manajemen Rumah Sakit)' },
  { value: 'lms', title: 'LMS (Learning Management System)' },
  { value: 'cms', title: 'CMS (Content Management System)' },
  { value: 'ems', title: 'EMS (Event Management System)' },
  { value: 'pos', title: 'Point of Sales' },
  { value: 'company_profile', title: 'Website Company Profile' },
  { value: 'landing_page', title: 'Landing Page' },
  { value: 'business_profile', title: 'Web Profil Bisnis' },
  { value: 'ecommerce', title: 'Website E-Commerce' },
  { value: 'invitation', title: 'Website Undangan Digital' }
]

export const PROJECT_STATUS = [
  { value: 'lead', title: 'Lead / Penawaran', color: 'info' },
  { value: 'negotiation', title: 'Negosiasi', color: 'warning' },
  { value: 'production', title: 'Dalam Pengerjaan', color: 'primary' },
  { value: 'testing', title: 'Uji Coba / QA', color: 'purple' },
  { value: 'launched', title: 'Rilis / Launching', color: 'success' },
  { value: 'maintenance', title: 'Maintenance', color: 'secondary' },
  { value: 'cancelled', title: 'Batal', color: 'error' }
]

export const HOSTED_BY = [
  { value: 'kita', title: 'Kami tanggung (paket kami)' },
  { value: 'mitra', title: 'Mitra / Pemesan yang tanggung' },
  { value: 'lainnya', title: 'Pihak ketiga / sudah milik sendiri' }
]

export const CONTACT_STATUS = [
  { value: 'new', title: 'Baru', color: 'info' },
  { value: 'contacted', title: 'Sudah Dihubungi', color: 'warning' },
  { value: 'interested', title: 'Tertarik', color: 'success' },
  { value: 'quoted', title: 'Penawaran Terkirim', color: 'purple' },
  { value: 'rejected', title: 'Tidak Tertarik', color: 'error' },
  { value: 'converted', title: 'Jadi Mitra / Pelanggan', color: 'primary' }
]

export const FEATURE_TEMPLATE = {
  erp: [
    { category: 'Konfigurasi', items: [{ name: 'Setup struktur organisasi & cabang', price: 750000 }, { name: 'Chart of account & pajak', price: 500000 }] },
    { category: 'Modul Utama', items: [{ name: 'Modul pembelian & pemasok', price: 1250000 }, { name: 'Modul penjualan & pelanggan', price: 1250000 }, { name: 'Modul inventori/gudang', price: 1500000 }, { name: 'Modul keuangan & pembukuan', price: 1750000 }, { name: 'Modul HRD & penggajian', price: 1500000 }] },
    { category: 'Laporan & Analitik', items: [{ name: 'Dashboard manajemen', price: 750000 }, { name: 'Laporan penjualan & pembelian', price: 500000 }] },
    { category: 'Pelatihan & Go-Live', items: [{ name: 'Pelatihan admin & operator', price: 1000000 }, { name: 'Pendampingan go-live 1 bulan', price: 1000000 }] }
  ],
  simrs: [
    { category: 'Instalasi', items: [{ name: 'Instalasi server & database', price: 1000000 }, { name: 'Konfigurasi jaringan lokal', price: 750000 }] },
    { category: 'Modul Rawat', items: [{ name: 'Pendaftaran rawat jalan', price: 1500000 }, { name: 'Rekam medis elektronik (RME)', price: 2000000 }, { name: 'Farmasi & kasir', price: 1500000 }, { name: 'Laboratorium', price: 1250000 }, { name: 'Rawat inap & kamar', price: 1500000 }] },
    { category: 'Integrasi', items: [{ name: 'Integrasi BPJS / antrean online', price: 2000000 }, { name: 'Backup & recovery', price: 750000 }] },
    { category: 'Pelatihan', items: [{ name: 'Pelatihan tenaga medis & admin', price: 1250000 }] }
  ],
  lms: [
    { category: 'Fitur Akademik', items: [{ name: 'Manajemen Kursus & kelas', price: 1250000 }, { name: 'Materi & video learning', price: 1000000 }, { name: 'Quiz, tugas & rapor', price: 1250000 }] },
    { category: 'Komunitas', items: [{ name: 'Forum diskusi', price: 750000 }, { name: 'Sertifikat otomatis', price: 750000 }] },
    { category: 'Administrasi', items: [{ name: 'Sistem pendaftaran siswa', price: 1000000 }, { name: 'Manajemen instruktur', price: 750000 }] }
  ],
  cms: [
    { category: 'Definisi', items: [{ name: 'Perancanaan struktur konten', price: 500000 }] },
    { category: 'Development', items: [{ name: 'Manajemen artikel & halaman', price: 1250000 }, { name: 'Media gallery', price: 750000 }, { name: 'User role & permission', price: 1000000 }] },
    { category: 'Optimasi & Go-Live', items: [{ name: 'SEO basic', price: 500000 }, { name: 'Pelatihan editor konten', price: 750000 }] }
  ],
  ems: [
    { category: 'Event', items: [{ name: 'Manajemen event & sesi', price: 1000000 }, { name: 'Pendaftaran peserta', price: 1000000 }, { name: 'Tiket digital & check-in QR', price: 1250000 }] },
    { category: 'Report', items: [{ name: 'Dashboard statistik peserta', price: 750000 }] }
  ],
  pos: [
    { category: 'Kasir', items: [{ name: 'Layar kasir & keranjang', price: 1250000 }, { name: 'Manajemen produk & stok', price: 1000000 }] },
    { category: 'Perangkat', items: [{ name: 'Koneksi printer struk', price: 500000 }, { name: 'Barcode scanner & timbangan', price: 750000 }] },
    { category: 'Backoffice', items: [{ name: 'Laporan penjualan & modal', price: 750000 }, { name: 'Manajemen shift & kas', price: 750000 }] }
  ],
  company_profile: [
    { category: 'Desain', items: [{ name: 'Desain halaman utama (5 halaman)', price: 1250000 }, { name: 'Desain logo / identitas visual', price: 400000 }] },
    { category: 'Frontend', items: [{ name: 'Responsive & animasi', price: 750000 }, { name: 'Form kontak & peta', price: 400000 }] }
  ],
  landing_page: [
    { category: 'Content', items: [{ name: 'Copywriting 1 halaman', price: 400000 }, { name: 'Desain landing page', price: 750000 }] },
    { category: 'Frontend', items: [{ name: 'Development & deploy', price: 750000 }, { name: 'Integrasi WhatsApp & form', price: 300000 }] },
    { category: 'Optimasi', items: [{ name: 'Setup iklan pixel / UTM', price: 250000 }] }
  ],
  business_profile: [
    { category: 'Desain', items: [{ name: 'Desain 8–12 halaman', price: 1750000 }] },
    { category: 'Frontend', items: [{ name: 'Blog / berita bisnis', price: 750000 }, { name: 'Galeri produk & layanan', price: 500000 }, { name: 'Multi bahasa', price: 500000 }] }
  ],
  ecommerce: [
    { category: 'Toko', items: [{ name: 'Katalog produk & kategori', price: 1250000 }, { name: 'Keranjang & checkout', price: 1250000 }, { name: 'Metode pembayaran (transfer/VA/QRIS)', price: 1500000 }] },
    { category: 'Ongkir & Layanan', items: [{ name: 'Integrasi ongkos kirim (RajaOngkir)', price: 750000 }, { name: 'Tracking pesanan', price: 500000 }] },
    { category: 'Marketing', items: [{ name: 'Kupon & promo', price: 750000 }, { name: 'Email / WhatsApp notifikasi', price: 500000 }] },
    { category: 'Admin', items: [{ name: 'Dashboard admin & rekap', price: 1000000 }] }
  ],
  invitation: [
    { category: 'Desain', items: [{ name: 'Desain undangan digital', price: 750000 }, { name: 'Galeri foto & love story', price: 400000 }] },
    { category: 'Fitur', items: [{ name: 'Countdown & acara', price: 300000 }, { name: 'RSVP & dibuat oleh guestbook', price: 400000 }, { name: 'Amplop digital (transfer info)', price: 300000 }] },
    { category: 'Distribusi', items: [{ name: 'Streaming (YouTube embed)', price: 250000 }] }
  ]
}

export function templateFor (type) {
  return (FEATURE_TEMPLATE[type] || []).map(cat => ({
    category: cat.category,
    items: cat.items.map(i => ({ name: i.name, price: i.price }))
  }))
}
