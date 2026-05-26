function escapeCsvValue(value: string | number) {
  const normalized = String(value ?? '').replaceAll('"', '""')
  return `"${normalized}"`
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csvLines = [headers.map(escapeCsvValue).join(',')]
  rows.forEach((row) => {
    csvLines.push(row.map(escapeCsvValue).join(','))
  })

  const blob = new Blob([`\uFEFF${csvLines.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
