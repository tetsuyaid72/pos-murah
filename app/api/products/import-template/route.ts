import { NextResponse } from 'next/server'

export async function GET() {
  const rows = [
    ['Nama Produk', 'Kategori', 'Barcode', 'SKU', 'Harga Modal', 'Harga Jual', 'Stok', 'Stok Minimum', 'Satuan', 'Aktif'],
    ['Indomie Goreng', 'Mie Instan', '089686010130', 'MIE-001', '2800', '3500', '50', '10', 'pcs', 'Ya'],
    ['Aqua 600ml', 'Minuman', '8992761136022', 'MIN-001', '2500', '3500', '24', '6', 'botol', 'Ya'],
  ]
  const csv = '\uFEFF' + rows.map((row) => row.map(escapeCsv).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="template-import-produk.csv"',
    },
  })
}

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}
