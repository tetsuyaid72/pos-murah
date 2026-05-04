'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { cn, getAvatarUrl } from '@/lib/utils'

interface AvatarUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  fallbackInitial?: string
  className?: string
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export function AvatarUpload({ value, onChange, fallbackInitial = 'A', className }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
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
      formData.append('type', 'profile')

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
      {/* Avatar circle */}
      <div className="relative group">
        <div
          onClick={handleClick}
          className={cn(
            'relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-border/50 bg-muted transition-all duration-200',
            'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10',
            isUploading && 'pointer-events-none opacity-60'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value || getAvatarUrl(null, fallbackInitial)}
            alt="Foto profil"
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
            title="Hapus foto"
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
        {isUploading ? 'Mengupload...' : 'Klik untuk ubah foto'}
      </p>

      {/* Error */}
      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}
    </div>
  )
}
