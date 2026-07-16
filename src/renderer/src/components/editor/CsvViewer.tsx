import React, { useMemo } from 'react'
import { detectCsvDelimiter, parseCsv } from './csv-parse'
import SpreadsheetTable from './SpreadsheetTable'

type CsvViewerProps = {
  content: string
  filePath: string
}

export default function CsvViewer({ content, filePath }: CsvViewerProps): React.JSX.Element {
  const parsed = useMemo(() => {
    const delimiter = detectCsvDelimiter(filePath, content)
    return parseCsv(content, delimiter)
  }, [content, filePath])

  const { headerRow, bodyRows } = useMemo(() => {
    if (parsed.rows.length === 0) {
      return { headerRow: [] as string[], bodyRows: [] as string[][] }
    }
    const [head, ...rest] = parsed.rows
    return { headerRow: head ?? [], bodyRows: rest }
  }, [parsed])

  return (
    <SpreadsheetTable
      headerRow={headerRow}
      bodyRows={bodyRows}
      maxColumns={parsed.maxColumns}
    />
  )
}
