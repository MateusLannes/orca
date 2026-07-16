import * as XLSX from 'xlsx'

export type XlsxParseResult = {
  headerRow: string[]
  bodyRows: string[][]
  maxColumns: number
  sheetName: string
  totalRows: number
  truncated: boolean
}

// Why: SheetJS is a synchronous, full-document parser — it must materialize
// every cell into JS arrays. For spreadsheets with 500k+ rows, this can
// allocate hundreds of MB and freeze the renderer. We cap at 100k rows to
// match the practical limit already tested with the CSV viewer's
// virtualization path. The footer shows the real row count so the user
// knows they're seeing a subset.
const MAX_XLSX_ROWS = 100_000

export function parseXlsx(base64Content: string): XlsxParseResult {
  const binary = Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0))
  const workbook = XLSX.read(binary, { type: 'array' })
  const sheetName = workbook.SheetNames[0] ?? 'Sheet1'
  const sheet = workbook.Sheets[sheetName]!
  const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1')
  const totalRows = range.e.r - range.s.r + 1
  const truncated = totalRows > MAX_XLSX_ROWS

  const opts: XLSX.Sheet2JSONOpts = { header: 1, defval: '' }
  if (truncated) {
    opts.range = { s: range.s, e: { r: range.s.r + MAX_XLSX_ROWS - 1, c: range.e.c } }
  }

  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, opts)
  const maxColumns = rows.reduce((max, r) => Math.max(max, r.length), 0)
  const [firstRow = [] as string[], ...bodyRows] = rows
  const headerRow = [...firstRow]
  while (headerRow.length < maxColumns) {
    headerRow.push('')
  }
  return { headerRow, bodyRows, maxColumns, sheetName, totalRows, truncated }
}
