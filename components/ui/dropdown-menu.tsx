'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'end'
  sideOffset?: number
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

type DropdownMenuControlProps = {
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  menuRef?: React.RefObject<HTMLDivElement | null>
}

type DropdownMenuItemControlProps = {
  closeMenu?: () => void
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative inline-flex">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child

        return React.cloneElement(child, {
          open,
          setOpen,
          menuRef: ref,
        } as DropdownMenuControlProps)
      })}
    </div>
  )
}

function DropdownMenuTrigger({
  children,
  className,
  asChild,
  open,
  setOpen,
}: DropdownMenuTriggerProps & DropdownMenuControlProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen?.(!open),
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <button type="button" className={className} onClick={() => setOpen?.(!open)}>
      {children}
    </button>
  )
}

function DropdownMenuContent({
  children,
  className,
  align = 'end',
  sideOffset = 8,
  open,
  setOpen,
  menuRef,
}: DropdownMenuContentProps & DropdownMenuControlProps) {
  const [position, setPosition] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!open || !menuRef?.current) return

    const updatePosition = () => {
      const rect = menuRef.current?.getBoundingClientRect()
      if (!rect) return

      const width = 176
      setPosition({
        position: 'fixed',
        top: rect.bottom + sideOffset,
        left: align === 'end' ? Math.max(8, rect.right - width) : rect.left,
        minWidth: width,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [align, menuRef, open, sideOffset])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      style={position}
      onMouseDown={(event) => event.stopPropagation()}
      className={cn(
        'z-[100] rounded-2xl border border-border/60 bg-popover p-1.5 text-popover-foreground shadow-xl',
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child

        if (child.type === DropdownMenuItem) {
          return React.cloneElement(child, {
            closeMenu: () => setOpen?.(false),
          } as DropdownMenuItemControlProps)
        }

        return child
      })}
    </div>,
    document.body
  )
}

function DropdownMenuItem({
  children,
  className,
  onClick,
  closeMenu,
}: DropdownMenuItemProps & DropdownMenuItemControlProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted',
        className
      )}
      onClick={() => {
        onClick?.()
        closeMenu?.()
      }}
    >
      {children}
    </button>
  )
}

function DropdownMenuLabel({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground', className)} {...props}>
      {children}
    </div>
  )
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('my-1 h-px bg-border/60', className)} {...props} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
