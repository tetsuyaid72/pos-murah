'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadCSV } from '@/lib/export'
import type { Transaction } from '@/types'

interface ExportCSVProps {
  transactions: Transaction[]
}

export function ExportCSV({ transactions }: ExportCSVProps) {
  const handleExport = () => {
    if (transactions.length === 0) return
    downloadCSV(transactions)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-xl"
      onClick={handleExport}
      disabled={transactions.length === 0}
    >
      <Download className="mr-1.5 h-4 w-4" />
      Export CSV
    </Button>
  )
}
