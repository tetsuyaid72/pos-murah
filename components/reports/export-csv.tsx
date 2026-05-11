'use client'

import { Download, FileSpreadsheet, FileText, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadCSV } from '@/lib/export'
import { usePlanGate } from '@/hooks/use-plan-gate'
import { PlanLimitModal } from '@/components/plan-limit-modal'
import type { Transaction } from '@/types'

interface ExportCSVProps {
  transactions: Transaction[]
  mobile?: boolean
}

export function ExportCSV({ transactions, mobile = false }: ExportCSVProps) {
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
      <div className={mobile ? 'grid grid-cols-2 gap-2' : 'flex items-center gap-2'}>
        {/* Excel/CSV Export — available to all plans */}
        <Button
          variant="outline"
          size="sm"
          className={mobile ? 'h-11 rounded-2xl border-border bg-card text-sm font-semibold text-foreground shadow-sm shadow-black/5 hover:bg-accent disabled:text-muted-foreground dark:border-[#253044] dark:bg-[#111827] dark:text-slate-100 dark:shadow-black/20 dark:hover:bg-[#162033] dark:disabled:text-slate-500' : 'rounded-xl'}
          onClick={handleExportCSV}
          disabled={transactions.length === 0}
        >
          <FileSpreadsheet className="mr-1.5 h-4 w-4" />
          {mobile ? 'Excel' : 'Export Excel'}
        </Button>

        {/* PDF Export — PRO+ only */}
        <Button
          variant="outline"
          size="sm"
          className={mobile ? `h-11 rounded-2xl border-border bg-card text-sm font-semibold text-foreground shadow-sm shadow-black/5 hover:bg-accent disabled:text-muted-foreground dark:border-[#253044] dark:bg-[#111827] dark:text-slate-100 dark:shadow-black/20 dark:hover:bg-[#162033] dark:disabled:text-slate-500 ${!canExportPdf ? 'opacity-60' : ''}` : `rounded-xl ${!canExportPdf ? 'opacity-60' : ''}`}
          onClick={handleExportPDF}
          disabled={transactions.length === 0}
        >
          {canExportPdf ? (
            <FileText className="mr-1.5 h-4 w-4" />
          ) : (
            <Lock className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
          )}
          {mobile ? 'PDF' : 'Export PDF'}
          {!canExportPdf && (
            <span className="ml-1 text-[10px] font-semibold text-amber-500 uppercase">Pro</span>
          )}
        </Button>
      </div>

      <PlanLimitModal {...modalProps} />
    </>
  )
}
