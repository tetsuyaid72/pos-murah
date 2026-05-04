/**
 * ESC/POS Command Encoder
 *
 * Generates byte arrays (Uint8Array) for thermal printers using the ESC/POS protocol.
 * Supports text formatting, alignment, bold, font sizes, separators, and two-column layout.
 *
 * Paper widths:
 * - 58mm: 32 characters per line
 * - 80mm: 48 characters per line
 */

// ESC/POS command constants
const ESC = 0x1b
const GS = 0x1d
const LF = 0x0a

// Commands
const CMD = {
  /** Initialize printer */
  INIT: new Uint8Array([ESC, 0x40]),

  /** Align left */
  ALIGN_LEFT: new Uint8Array([ESC, 0x61, 0x00]),
  /** Align center */
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 0x01]),
  /** Align right */
  ALIGN_RIGHT: new Uint8Array([ESC, 0x61, 0x02]),

  /** Bold on */
  BOLD_ON: new Uint8Array([ESC, 0x45, 0x01]),
  /** Bold off */
  BOLD_OFF: new Uint8Array([ESC, 0x45, 0x00]),

  /** Normal font size (1x) */
  FONT_NORMAL: new Uint8Array([GS, 0x21, 0x00]),
  /** Double height + double width (2x) */
  FONT_LARGE: new Uint8Array([GS, 0x21, 0x11]),

  /** Select character code table — UTF-8 (code page 28) */
  CODE_PAGE_UTF8: new Uint8Array([ESC, 0x74, 0x1c]),

  /** Feed and cut paper (partial cut) */
  CUT: new Uint8Array([GS, 0x56, 0x42, 0x03]),

  /** Line feed */
  LF: new Uint8Array([LF]),
} as const

/** Paper size configuration */
export type PaperSize = '58mm' | '80mm'

/** Characters per line for each paper size */
export const CHARS_PER_LINE: Record<PaperSize, number> = {
  '58mm': 32,
  '80mm': 48,
}

/**
 * Encode a string to Uint8Array bytes.
 * Uses TextEncoder (UTF-8) which works for ASCII and Indonesian text.
 */
function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

/** Concatenate multiple Uint8Arrays into one */
function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

/**
 * Fluent ESC/POS encoder.
 *
 * Usage:
 * ```ts
 * const data = new EscPosEncoder(32)
 *   .initialize()
 *   .align('center')
 *   .bold(true)
 *   .text('WARUNG MADURA')
 *   .bold(false)
 *   .newline()
 *   .separator()
 *   .twoColumns('Subtotal', 'Rp 50.000')
 *   .cut()
 *   .encode()
 * ```
 */
export class EscPosEncoder {
  private buffer: Uint8Array[] = []
  private width: number

  constructor(paperSize: PaperSize = '58mm') {
    this.width = CHARS_PER_LINE[paperSize]
  }

  /** Get the configured line width */
  getWidth(): number {
    return this.width
  }

  /** Add raw bytes to the buffer */
  raw(data: Uint8Array): this {
    this.buffer.push(data)
    return this
  }

  /** Initialize the printer and set UTF-8 code page */
  initialize(): this {
    this.buffer.push(CMD.INIT)
    this.buffer.push(CMD.CODE_PAGE_UTF8)
    return this
  }

  /** Set text alignment */
  align(position: 'left' | 'center' | 'right'): this {
    switch (position) {
      case 'left':
        this.buffer.push(CMD.ALIGN_LEFT)
        break
      case 'center':
        this.buffer.push(CMD.ALIGN_CENTER)
        break
      case 'right':
        this.buffer.push(CMD.ALIGN_RIGHT)
        break
    }
    return this
  }

  /** Toggle bold text */
  bold(on: boolean): this {
    this.buffer.push(on ? CMD.BOLD_ON : CMD.BOLD_OFF)
    return this
  }

  /** Set font size */
  fontSize(size: 'normal' | 'large'): this {
    this.buffer.push(size === 'large' ? CMD.FONT_LARGE : CMD.FONT_NORMAL)
    return this
  }

  /** Print text (without line feed) */
  text(content: string): this {
    this.buffer.push(textToBytes(content))
    return this
  }

  /** Print text followed by a line feed */
  textLine(content: string): this {
    this.buffer.push(textToBytes(content))
    this.buffer.push(CMD.LF)
    return this
  }

  /** Add line feed(s) */
  newline(count: number = 1): this {
    for (let i = 0; i < count; i++) {
      this.buffer.push(CMD.LF)
    }
    return this
  }

  /**
   * Print a separator line.
   * @param char Character to repeat (default: '-')
   */
  separator(char: string = '-'): this {
    const line = char.repeat(this.width)
    this.buffer.push(textToBytes(line))
    this.buffer.push(CMD.LF)
    return this
  }

  /**
   * Print two columns: left-aligned text and right-aligned text on the same line.
   * Fills the gap with spaces.
   *
   * Example: twoColumns('Subtotal', 'Rp 50.000')
   * Output:  "Subtotal          Rp 50.000"
   */
  twoColumns(left: string, right: string): this {
    const gap = this.width - left.length - right.length
    if (gap < 1) {
      // If text is too long, print on separate lines
      this.buffer.push(textToBytes(left))
      this.buffer.push(CMD.LF)
      this.buffer.push(CMD.ALIGN_RIGHT)
      this.buffer.push(textToBytes(right))
      this.buffer.push(CMD.LF)
      this.buffer.push(CMD.ALIGN_LEFT)
    } else {
      const line = left + ' '.repeat(gap) + right
      this.buffer.push(textToBytes(line))
      this.buffer.push(CMD.LF)
    }
    return this
  }

  /**
   * Print three columns: left, center, and right text on the same line.
   */
  threeColumns(left: string, center: string, right: string): this {
    const totalContent = left.length + center.length + right.length
    const totalGap = this.width - totalContent
    if (totalGap < 2) {
      // Fallback: print left and right only
      this.twoColumns(left, right)
    } else {
      const leftGap = Math.floor(totalGap / 2)
      const rightGap = totalGap - leftGap
      const line = left + ' '.repeat(leftGap) + center + ' '.repeat(rightGap) + right
      this.buffer.push(textToBytes(line))
      this.buffer.push(CMD.LF)
    }
    return this
  }

  /** Feed paper and cut */
  cut(): this {
    this.newline(3)
    this.buffer.push(CMD.CUT)
    return this
  }

  /** Encode all buffered commands into a single Uint8Array */
  encode(): Uint8Array {
    return concatBytes(...this.buffer)
  }

  /** Reset the buffer */
  reset(): this {
    this.buffer = []
    return this
  }
}
