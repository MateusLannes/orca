import React, { useMemo } from 'react'
import { parseXlsx } from '@/lib/xlsx-parse'
import { translate } from '@/i18n/i18n'
import SpreadsheetTable from './SpreadsheetTable'

type XlsxViewerProps = {
  content: string
  filePath: string
}

export default function XlsxViewer({ content }: XlsxViewerProps): React.JSX.Element {
  const parsed = useMemo(() => {
    try {
      return parseXlsx(content)
    } catch {
      return null
    }
  }, [content])

  if (!parsed) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {translate('auto.components.editor.XlsxViewer.e1a2b3c4d5', 'Could not read spreadsheet file')}
      </div>
    )
  }

  const footerNote = parsed.truncated
    ? translate(
        'auto.components.editor.XlsxViewer.f6a7b8c9d0',
        `Showing first ${parsed.bodyRows.length.toLocaleString()} of ${parsed.totalRows.toLocaleString()} rows`
      )
    : undefined

  return (
    <SpreadsheetTable
      headerRow={parsed.headerRow}
      bodyRows={parsed.bodyRows}
      maxColumns={parsed.maxColumns}
      footerNote={footerNote}
    />
  )
}
