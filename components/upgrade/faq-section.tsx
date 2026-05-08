'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQ_ITEMS = [
  {
    question: 'Bagaimana cara pembayaran?',
    answer: 'Transfer ke rekening BCA yang tertera atau scan QRIS, lalu upload bukti pembayaran. Admin akan memverifikasi dan mengaktifkan akun Anda.',
  },
  {
    question: 'Berapa lama aktivasi setelah bayar?',
    answer: 'Aktivasi dilakukan maksimal 1x24 jam setelah bukti pembayaran diterima. Biasanya kurang dari 6 jam pada jam kerja.',
  },
  {
    question: 'Bisa upgrade/downgrade kapan saja?',
    answer: 'Ya, Anda bisa upgrade kapan saja. Untuk downgrade, hubungi admin via WhatsApp dan sisa masa aktif akan diperhitungkan.',
  },
  {
    question: 'Apakah ada garansi uang kembali?',
    answer: 'Ya, kami memberikan garansi 7 hari uang kembali jika Anda tidak puas dengan layanan kami. Hubungi admin untuk proses refund.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Pertanyaan Umum
      </h3>

      <div className="mt-4 space-y-1">
        {FAQ_ITEMS.map((item, index) => (
          <div key={index} className="border-b border-slate-100 last:border-0 dark:border-slate-700">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between py-3 text-left"
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200',
                  openIndex === index && 'rotate-180'
                )}
              />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-200',
                openIndex === index ? 'max-h-40 pb-3' : 'max-h-0'
              )}
            >
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
