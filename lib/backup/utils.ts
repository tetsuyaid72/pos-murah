/**
 * Backup Utility Functions
 *
 * - CSV conversion for export
 * - ZIP file construction (manual, no external deps)
 * - ID mapping for cross-account restore
 */

import { generateId } from '@/lib/utils'

// =============================================================================
// CSV Conversion
// =============================================================================

/**
 * Escape a CSV field value.
 * Wraps in quotes if the value contains commas, quotes, or newlines.
 */
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Convert an array of objects to a CSV string.
 * Uses the keys of the first object as headers.
 */
export function convertToCSV(data: Record<string, unknown>[], columns?: string[]): string {
  if (data.length === 0) return ''

  const headers = columns ?? Object.keys(data[0])
  const lines: string[] = [headers.map(escapeCSV).join(',')]

  for (const row of data) {
    const values = headers.map((h) => escapeCSV(row[h]))
    lines.push(values.join(','))
  }

  return lines.join('\r\n')
}

// =============================================================================
// ZIP Construction (minimal, no compression — CSV files are small)
// =============================================================================

/**
 * Build a ZIP file from a map of filename → content (UTF-8 strings).
 * Uses the ZIP format spec (local file headers + central directory + EOCD).
 * No compression (STORE method) — keeps implementation simple and dependency-free.
 */
export function buildZip(files: Record<string, string>): Uint8Array {
  const encoder = new TextEncoder()
  const entries: {
    name: Uint8Array
    data: Uint8Array
    offset: number
  }[] = []

  // Build local file entries
  const localParts: Uint8Array[] = []
  let offset = 0

  for (const [filename, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(filename)
    const dataBytes = encoder.encode(content)
    const crc = crc32(dataBytes)

    // Local file header (30 bytes + name + data)
    const header = new ArrayBuffer(30)
    const view = new DataView(header)
    view.setUint32(0, 0x04034b50, true)   // Local file header signature
    view.setUint16(4, 20, true)            // Version needed (2.0)
    view.setUint16(6, 0, true)             // General purpose bit flag
    view.setUint16(8, 0, true)             // Compression method (STORE)
    view.setUint16(10, 0, true)            // Last mod file time
    view.setUint16(12, 0, true)            // Last mod file date
    view.setUint32(14, crc, true)          // CRC-32
    view.setUint32(18, dataBytes.length, true) // Compressed size
    view.setUint32(22, dataBytes.length, true) // Uncompressed size
    view.setUint16(26, nameBytes.length, true) // File name length
    view.setUint16(28, 0, true)            // Extra field length

    const headerBytes = new Uint8Array(header)
    entries.push({ name: nameBytes, data: dataBytes, offset })

    localParts.push(headerBytes, nameBytes, dataBytes)
    offset += 30 + nameBytes.length + dataBytes.length
  }

  // Build central directory
  const centralParts: Uint8Array[] = []
  let centralSize = 0

  for (const entry of entries) {
    const crc = crc32(entry.data)
    const cdHeader = new ArrayBuffer(46)
    const view = new DataView(cdHeader)
    view.setUint32(0, 0x02014b50, true)    // Central directory header signature
    view.setUint16(4, 20, true)             // Version made by
    view.setUint16(6, 20, true)             // Version needed
    view.setUint16(8, 0, true)              // General purpose bit flag
    view.setUint16(10, 0, true)             // Compression method (STORE)
    view.setUint16(12, 0, true)             // Last mod file time
    view.setUint16(14, 0, true)             // Last mod file date
    view.setUint32(16, crc, true)           // CRC-32
    view.setUint32(20, entry.data.length, true) // Compressed size
    view.setUint32(24, entry.data.length, true) // Uncompressed size
    view.setUint16(28, entry.name.length, true) // File name length
    view.setUint16(30, 0, true)             // Extra field length
    view.setUint16(32, 0, true)             // File comment length
    view.setUint16(34, 0, true)             // Disk number start
    view.setUint16(36, 0, true)             // Internal file attributes
    view.setUint32(38, 0, true)             // External file attributes
    view.setUint32(42, entry.offset, true)  // Relative offset of local header

    const cdBytes = new Uint8Array(cdHeader)
    centralParts.push(cdBytes, entry.name)
    centralSize += 46 + entry.name.length
  }

  // End of central directory record (EOCD)
  const eocd = new ArrayBuffer(22)
  const eocdView = new DataView(eocd)
  eocdView.setUint32(0, 0x06054b50, true)  // EOCD signature
  eocdView.setUint16(4, 0, true)            // Disk number
  eocdView.setUint16(6, 0, true)            // Disk with central directory
  eocdView.setUint16(8, entries.length, true)  // Entries on this disk
  eocdView.setUint16(10, entries.length, true) // Total entries
  eocdView.setUint32(12, centralSize, true)    // Central directory size
  eocdView.setUint32(16, offset, true)         // Central directory offset
  eocdView.setUint16(20, 0, true)              // Comment length

  // Concatenate all parts
  const allParts = [...localParts, ...centralParts, new Uint8Array(eocd)]
  const totalLength = allParts.reduce((sum, p) => sum + p.length, 0)
  const result = new Uint8Array(totalLength)
  let pos = 0
  for (const part of allParts) {
    result.set(part, pos)
    pos += part.length
  }

  return result
}

/**
 * CRC-32 calculation (used by ZIP format).
 * Standard CRC-32 with polynomial 0xEDB88320.
 */
function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

// =============================================================================
// ID Mapping for Cross-Account Restore
// =============================================================================

export type IdMap = Map<string, string>

/**
 * Generate a mapping of old IDs to new IDs.
 * Used during import to re-generate all primary keys while preserving relations.
 */
export function generateIdMapping(oldIds: string[]): IdMap {
  const map = new Map<string, string>()
  for (const oldId of oldIds) {
    map.set(oldId, generateId())
  }
  return map
}

/**
 * Resolve an old ID to a new ID using the mapping.
 * Returns null if the old ID is null/undefined or not found in the map.
 */
export function resolveId(map: IdMap, oldId: string | null | undefined): string | null {
  if (!oldId) return null
  return map.get(oldId) ?? null
}
