'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Camera, X, Loader2, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  className?: string
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export function LogoUpload({ value, onChange, className }: LogoUploadProps) {
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
      formData.append('type', 'logo')

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

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setError(null)
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Logo preview / upload area */}
      <div className="relative group">
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 transition-all duration-200',
            isDragging
              ? 'border-primary bg-primary/5'
              : value
                ? 'border-border/50 bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'
                : 'border-dashed border-muted-foreground/30 bg-muted/50 hover:border-primary/50 hover:bg-muted',
            isUploading && 'pointer-events-none opacity-60'
          )}
        >
          {value ? (
            <Image
              src={value}
              alt="Logo toko"
              width={96}
              height={96}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Store className="h-8 w-8 text-muted-foreground/50" />
              <span className="text-[9px] font-medium text-muted-foreground/50">LOGO</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </div>
        </div>

        {/* Remove button */}
        {value && !isUploading && (
          <button
            onClick={handleRemove}
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
            title="Hapus logo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Label */}
      <p className="text-xs text-muted-foreground">
        {isUploading ? 'Mengupload...' : isDragging ? 'Lepaskan file' : 'Klik atau seret logo'}
      </p>

      {/* Error */}
      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}
    </div>
  )
}
