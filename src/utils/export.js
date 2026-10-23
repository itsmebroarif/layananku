function trigger (blob, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function downloadCsv (filename, rows) {
  const csv = rows
    .map(r => r.map(v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  trigger(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

export function downloadJson (filename, data) {
  trigger(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename)
}

export function csvDate () {
  return new Date().toISOString().slice(0, 10)
}

export function printHtml (html, title = 'Cetak') {
  const frame = document.createElement('iframe')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(frame)
  const w = frame.contentWindow
  w.document.open()
  w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${title}</title></head><body>${html}</body></html>`)
  w.document.close()
  w.onafterprint = () => setTimeout(() => frame.remove(), 300)
  setTimeout(() => {
    try { w.focus(); w.print() } catch (e) { window.print() }
    setTimeout(() => frame.remove(), 120000)
  }, 250)
}
