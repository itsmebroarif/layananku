# service-management-tools

Aplikasi layanan pelanggan all-in-one (PWA, berjalan offline, data tersimpan di localStorage):

- **Dashboard** — ringkasan KPI harian (tiket, pelanggan, penjualan, agenda)
- **Pelanggan** — database pelanggan, detail + riwayat tiket & transaksi, tombol WhatsApp/Email, ekspor CSV
- **Tiket Dukungan** — antrean tiket dengan filter, SLA/tenggat, catatan internal, ekspor CSV
- **Produk & Jasa** — katalog, penyesuaian stok, peringatan stok menipis
- **POS / Kasir** — keranjang, diskon & pajak, "Bayar Pas", cetak struk, riwayat + ekspor CSV, pengembalian stok saat hapus transaksi
- **Kalender Event** — kalender bulanan berkategori
- **Laporan** — omzet, laba kotor, grafik harian, metode pembayaran, produk terlaris, pelanggan teratas, ekspor CSV & cetak
- **Kalkulator** — standar, markup/margin, bagi tagihan
- **Pengaturan** — profil usaha (dicetak di struk), pajak, mata uang, tema terang/gelap, ekspor/impor JSON, reset data

Pintasan: `Ctrl+K` (atau `/`) untuk pencarian global; lonceng di app bar menampilkan tiket lewat tenggat, stok menipis, dan agenda hari ini.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

Build menghasilkan folder `dist/` yang bisa dibuka langsung (`dist/index.html`) maupun dihosting di web server apa pun (routing memakai hash `#/`).

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
