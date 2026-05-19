'use client'

import Image from 'next/image'
import { useState, useRef, useCallback } from 'react'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  className?: string
  compact?: boolean
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export function ImageUpload({ value, onChange, className, compact = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Format tidak didukung. Gunakan JPG, PNG, atau WebP.'
    }
    if (file.size > MAX_SIZE) {
      return 'Ukuran file terlalu besar. Maksimal 2MB.'
    }
    return null
  }

  const uploadFile = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'product')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Gagal mengupload file.')
        return
      }

      onChange(data.url)
    } catch {
      setError('Gagal mengupload file. Silakan coba lagi.')
    } finally {
      setIsUploading(false)
    }
  }, [onChange])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
    // Reset input so the same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleRemove = () => {
    onChange(null)
    setError(null)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  // Show preview if we have an image
  if (value) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="relative inline-block">
          <div className={cn('relative overflow-hidden rounded-lg border bg-muted', compact ? 'h-24 w-24 md:h-32 md:w-32' : 'h-32 w-32')}>
            <Image
              src={value}
              alt="Product image"
              width={128}
              height={128}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              'absolute flex items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-transform hover:scale-110',
              compact ? '-right-1.5 -top-1.5 h-5 w-5 md:-right-2 md:-top-2 md:h-6 md:w-6' : '-right-2 -top-2 h-6 w-6'
            )}
            title="Hapus gambar"
          >
            <X className={cn(compact ? 'h-3 w-3 md:h-3.5 md:w-3.5' : 'h-3.5 w-3.5')} />
          </button>
        </div>
        <p className={cn('text-xs text-muted-foreground', compact && 'text-[11px]')}>
          Klik tombol X untuk menghapus gambar
        </p>
      </div>
    )
  }

  // Upload area
  return (
    <div className={cn('space-y-2', className)}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
          compact ? 'p-4 md:p-6' : 'p-6',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          isUploading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <>
            <Loader2 className={cn('animate-spin text-primary', compact ? 'mb-1.5 h-6 w-6 md:mb-2 md:h-8 md:w-8' : 'mb-2 h-8 w-8')} />
            <p className={cn('font-medium text-muted-foreground', compact ? 'text-[13px] md:text-sm' : 'text-sm')}>
              Mengupload...
            </p>
          </>
        ) : (
          <>
            <div className={cn('flex items-center justify-center rounded-full bg-muted', compact ? 'mb-1.5 h-10 w-10 md:mb-2 md:h-12 md:w-12' : 'mb-2 h-12 w-12')}>
              {isDragging ? (
                <Upload className={cn(compact ? 'h-5 w-5 md:h-6 md:w-6' : 'h-6 w-6', 'text-primary')} />
              ) : (
                <ImageIcon className={cn(compact ? 'h-5 w-5 md:h-6 md:w-6' : 'h-6 w-6', 'text-muted-foreground')} />
              )}
            </div>
            <p className={cn('font-medium text-foreground', compact ? 'text-[13px] md:text-sm' : 'text-sm')}>
              {isDragging ? 'Lepaskan file di sini' : 'Klik atau seret gambar ke sini'}
            </p>
            <p className={cn('text-muted-foreground', compact ? 'mt-0.5 text-[11px] md:mt-1 md:text-xs' : 'mt-1 text-xs')}>
              JPG, PNG, atau WebP. Maks 2MB.
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
