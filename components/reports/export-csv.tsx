'use client'

import { Download, FileSpreadsheet, FileText, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadCSV } from '@/lib/export'
import { usePlanGate } from '@/hooks/use-plan-gate'
import { PlanLimitModal } from '@/components/plan-limit-modal'
import type { Transaction } from '@/types'

interface ExportCSVProps {
  transactions: Transaction[]
}

export function ExportCSV({ transactions }: ExportCSVProps) {
  const { gate, canUse, modalProps } = usePlanGate()

  const canExportPdf = canUse('export_pdf') === true

  const handleExportCSV = () => {
    if (transactions.length === 0) return
    downloadCSV(transactions)
  }

  const handleExportPDF = () => {
    if (transactions.length === 0) return
    if (!gate('export_pdf')) return
    // TODO: Implement PDF export when ready
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Excel/CSV Export — available to all plans */}
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={handleExportCSV}
          disabled={transactions.length === 0}
        >
          <FileSpreadsheet className="mr-1.5 h-4 w-4" />
          Export Excel
        </Button>

        {/* PDF Export — PRO+ only */}
        <Button
          variant="outline"
          size="sm"
          className={`rounded-xl ${!canExportPdf ? 'opacity-60' : ''}`}
          onClick={handleExportPDF}
          disabled={transactions.length === 0}
        >
          {canExportPdf ? (
            <FileText className="mr-1.5 h-4 w-4" />
          ) : (
            <Lock className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
          )}
          Export PDF
          {!canExportPdf && (
            <span className="ml-1 text-[10px] font-semibold text-amber-500 uppercase">Pro</span>
          )}
        </Button>
      </div>

      <PlanLimitModal {...modalProps} />
    </>
  )
}
