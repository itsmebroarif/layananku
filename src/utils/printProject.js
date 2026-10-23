import { money } from '@/utils/format'
import { optionLabel } from '@/utils/options'
import { PROJECT_STATUS, PROJECT_TYPES } from '@/utils/projectPresets'
import { printHtml } from '@/utils/export'
import { totals } from '@/store/modules/projects'

const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

const css = `
@page{margin:10mm}
body{font-family:ui-monospace,'Courier New',monospace;font-size:12px;width:760px;margin:0 auto;color:#000}
h1{font-size:16px;margin:0}
.center{text-align:center}
.title{text-align:center;font-size:15px;font-weight:700;letter-spacing:2px;margin:10px 0 2px}
table{width:100%;border-collapse:collapse;margin-top:6px}
th,td{border:1px solid #999;padding:4px 6px;font-size:11.5px;text-align:left}
th{background:#eee}
td.r{text-align:right}
td.c{text-align:center}
.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px double #000;padding-bottom:8px}
.sec{font-weight:700;margin:14px 0 3px;border-bottom:1px dashed #999;padding-bottom:2px}
.row{display:flex;justify-content:space-between;gap:12px;margin:2px 0}
.muted{color:#555;font-size:10.5px}
.note{font-size:10.5px;margin-top:8px;white-space:pre-wrap}
.row.total{font-weight:700;font-size:13px;border-top:1px solid #000;margin-top:4px;padding-top:3px}
.foot{display:flex;justify-content:space-between;margin-top:34px;text-align:center}
.foot .sig{width:250px}
.foot .name{border-top:1px solid #000;margin-top:56px;padding-top:2px}
.itd{font-weight:700}
`

function companyBlock (b) {
  return `<div class="head">
    <div>
      <h1>${esc(b.businessName || 'Nama Usaha')}</h1>
      <div class="muted">${esc(b.address || '')}</div>
      <div class="muted">${esc(b.phone || '')}${b.email ? ' · ' + esc(b.email) : ''}${b.website ? ' · ' + esc(b.website) : ''}</div>
    </div>
    <div style="text-align:right">
      <div class="muted">${esc((b.businessType) || 'Penyedia Jasa Digital')}</div>
      <div class="muted">${esc(b.email || '')}</div>
    </div>
  </div>`
}

function partyBlock (project, typeTitle, mitra) {
  return `<table><tbody>
    <tr><td style="width:150px">Judul Project</td><td class="itd">${esc(project.name)}</td></tr>
    <tr><td>Kode Project</td><td>${esc(project.code)}</td></tr>
    <tr><td>Jenis Layanan</td><td>${esc(typeTitle)}</td></tr>
    <tr><td>Pemesan (Mitra)</td><td>${esc(mitra ? mitra.name + (mitra.company ? ' — ' + mitra.company : '') : '—')}</td></tr>
    <tr><td>Jatuh Tempo</td><td>${esc(project.dueDate || '—')}</td></tr>
  </tbody></table>`
}

function featureTable (project, currency) {
  const feats = project.features || []
  if (!feats.length) return '<div class="note"><i>Belum ada rincian fitur.</i></div>'
  const cats = [...new Set(feats.map(f => f.category || 'Lainnya'))]
  let no = 0
  let body = ''
  cats.forEach(cat => {
    const items = feats.filter(f => (f.category || 'Lainnya') === cat)
    items.forEach((f, i) => {
      no += 1
      const name = i === 0 ? `<b>${esc(cat)}</b> — ${esc(f.name)}` : esc(f.name)
      const qty = Number(f.qty) > 1 ? ` × ${Number(f.qty)}` : ''
      body += `<tr><td class="c" style="width:30px">${no}</td><td>${name}${qty}</td><td class="r" style="width:130px">${money((Number(f.price) || 0) * (Number(f.qty) || 1), currency)}</td></tr>`
    })
  })
  return `<table>
    <thead><tr><th class="c" style="width:30px">No</th><th>Kategori — Fitur</th><th class="r" style="width:130px">Harga</th></tr></thead>
    <tbody>${body}</tbody>
  </table>`
}

function hostingSection (project) {
  if (project.hostedBy !== 'kita') {
    const label = project.hostedBy === 'mitra' ? 'ditanggung Mitra / Pemesan' : 'sudah milik pemesan / pihak ketiga'
    return `<div class="note"><i>Biaya hosting &amp; domain ${esc(label)} — tidak termasuk dalam tagihan ini.</i></div>`
  }
  const h = project.hosting || {}
  return `<div class="sec">Hosting &amp; Domain (ditanggung kami)</div>
  <table><tbody>
    <tr><td style="width:140px">Provider</td><td>${esc(h.provider || '—')}</td></tr>
    <tr><td>Spesifikasi</td><td>${esc(h.spec || '—')}</td></tr>
    <tr><td>Domain</td><td>${esc(h.domain || '—')}</td></tr>
    <tr><td>Biaya / tahun</td><td><b>${money(Number(h.price) || 0, currency)}</b></td></tr>
  </tbody></table>`
}

function summaryBlock (project, currency, t) {
  const h = Number(project.hosting && project.hosting.price) || 0
  return `<div style="margin-left:auto;width:360px">
    ${row('Subtotal fitur', money(t.subtotal - (project.hostedBy === 'kita' ? h : 0), currency))}
    ${project.hostedBy === 'kita' ? row('Hosting & domain', money(h, currency)) : ''}
    ${t.discount ? row('Diskon', '-' + money(t.discount, currency)) : ''}
    ${Number(project.taxPercent) ? row(`Pajak (${Number(project.taxPercent)}%)`, money(t.tax, currency)) : ''}
    <div class="row total"><span>TOTAL</span><span>${money(t.total, currency)}</span></div>
    ${row('Sudah dibayar', money(t.paid, currency))}
    <div class="row total"><span>SISA TAGIHAN</span><span>${money(t.remaining, currency)}</span></div>
  </div>`
}

const row = (l, r) => `<div class="row"><span>${l}</span><span>${r}</span></div>`

function paymentsTable (project, currency) {
  const payments = project.payments || []
  if (!payments.length) return ''
  return `<div class="sec">Riwayat Pembayaran</div>
  <table>
    <thead><tr><th class="c" style="width:30px">No</th><th>Tanggal</th><th>Metode</th><th class="r" style="width:130px">Jumlah</th></tr></thead>
    <tbody>${payments.map((p, i) => `<tr><td class="c">${i + 1}</td><td>${esc(p.date)}</td><td>${esc(p.method || '—')}</td><td class="r">${money(p.amount, currency)}</td></tr>`).join('')}</tbody>
  </table>`
}

export function printInvoice (project, mitra, business, currency = 'IDR', mode = 'invoice') {
  const t = totals(project)
  const typeTitle = optionLabel(PROJECT_TYPES, project.type)
  const statusTitle = optionLabel(PROJECT_STATUS, project.status)
  const title = mode === 'nota' ? 'NOTA' : 'INVOICE'
  const number = `${mode === 'nota' ? 'NT' : 'INV'}-${String(project.code || '').replace(/^PRJ-/, '')}`

  const html = `<div>
    ${companyBlock(business)}
    <div class="title">${title}</div>
    <div class="center muted">Nomor: ${esc(number)} · Tanggal: ${esc(project.createdAt ? String(project.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10))}</div>
    <div class="sec">Kepada</div>
    <div>${esc(mitra ? mitra.name : '—')}${mitra && mitra.company ? ` — ${esc(mitra.company)}` : ''}
      <div class="muted">${esc((mitra && mitra.phone) || '')} ${esc((mitra && mitra.email) || '')}</div>
    </div>

    <div class="sec">Detail Project</div>
    ${partyBlock(project, typeTitle, mitra)}
    ${project.description ? `<div class="note">${esc(project.description)}</div>` : ''}

    <div class="sec">Rincian Fitur &amp; Biaya</div>
    ${featureTable(project, currency)}

    ${hostingSection(project)}

    <div class="sec">Ringkasan Pembayaran</div>
    ${summaryBlock(project, currency, t)}
    ${paymentsTable(project, currency)}

    <div class="foot">
      <div class="sig"><div class="name">Pemesan</div><div class="muted">${esc(mitra ? mitra.name : '')}</div></div>
      <div class="sig"><div class="name">${esc(business.businessName || 'Nama Usaha')}</div><div class="muted">Mengetahui, PJ: ${esc(project.staffName || '—')} · ${esc(statusTitle)}</div></div>
    </div>
  </div>`

  printHtml(`<style>${css}</style>${html}`, `${title} ${project.code}`)
}

export function printKwitansi (project, payment, mitra, business, currency = 'IDR') {
  const t = totals(project)
  const typeTitle = optionLabel(PROJECT_TYPES, project.type)
  const number = `KW-${String(project.code || '').replace(/^PRJ-/, '')}-${String(payment.date || '').replace(/\D/g, '').slice(-8)}`

  const html = `<div>
    ${companyBlock(business)}
    <div class="title">KWITANSI PEMBAYARAN</div>
    <div class="center muted">Nomor: ${esc(number)}</div>
    <table style="margin-top:10px"><tbody>
      <tr><td style="width:170px">Telah terima dari</td><td class="itd">${esc(mitra ? mitra.name + (mitra.company ? ' — ' + mitra.company : '') : '—')}</td></tr>
      <tr><td>Uang sejumlah</td><td class="itd">${money(payment.amount, currency)}</td></tr>
      <tr><td>Untuk pembayaran</td><td>${esc(project.name)} ${esc(typeTitle ? `(${typeTitle})` : '')} — ${esc(project.code)}</td></tr>
      <tr><td>Metode</td><td>${esc(payment.method || '—')}</td></tr>
      <tr><td>Tanggal</td><td>${esc(payment.date || '—')}</td></tr>
      ${payment.note ? `<tr><td>Keterangan</td><td>${esc(payment.note)}</td></tr>` : ''}
      <tr><td>Terbilang</td><td><i>${esc(terbilang(payment.amount))} Rupiah</i></td></tr>
    </tbody></table>

    <div style="margin-left:auto;width:360px;margin-top:10px">
      ${row('Total tagihan', money(t.total, currency))}
      ${row('Sudah dibayar (termasuk ini)', money(t.paid, currency))}
      <div class="row total"><span>SISA</span><span>${money(t.remaining, currency)}</span></div>
    </div>

    <div class="foot">
      <div class="sig"><div class="name">Penerima</div><div class="muted">${esc(business.businessName || '')}</div></div>
      <div class="sig"><div class="name">Pemberi</div><div class="muted">${esc(mitra ? mitra.name : '')}</div></div>
    </div>
  </div>`

  printHtml(`<style>${css}</style>${html}`, number)
}

function terbilang (n) {
  n = Math.abs(Math.floor(Number(n) || 0))
  const angka = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas']
  if (n < 12) return angka[n] || 'nol'
  if (n < 20) return terbilang(n - 10) + ' belas'
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' puluh ' + terbilang(n % 10)
  if (n < 200) return 'seratus ' + terbilang(n - 100)
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' ratus ' + terbilang(n % 100)
  if (n < 2000) return 'seribu ' + terbilang(n - 1000)
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' ribu ' + terbilang(n % 1000)
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' juta ' + terbilang(n % 1000000)
  if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + ' miliar ' + terbilang(n % 1000000000)
  return 'sangat besar'
}
