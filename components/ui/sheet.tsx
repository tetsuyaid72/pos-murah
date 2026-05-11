'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type SheetSide = 'top' | 'right' | 'bottom' | 'left'

interface SheetContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

function useSheetContext() {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error('Sheet components must be used within <Sheet>')
  return context
}

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  return <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>
}

function SheetTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function SheetPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function SheetOverlay({ className }: { className?: string }) {
  const { open, onOpenChange } = useSheetContext()

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm dark:bg-black/70', className)}
          onClick={() => onOpenChange(false)}
        />
      ) : null}
    </AnimatePresence>
  )
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: SheetSide
}

function getMotionProps(side: SheetSide) {
  switch (side) {
    case 'top':
      return { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } }
    case 'left':
      return { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } }
    case 'right':
      return { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
    default:
      return { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
  }
}

function getSideClasses(side: SheetSide) {
  switch (side) {
    case 'top':
      return 'inset-x-0 top-0 border-b'
    case 'left':
      return 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm'
    case 'right':
      return 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm'
    default:
      return 'inset-x-0 bottom-0 border-t'
  }
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = 'right', className, children, ...props }, ref) => {
    const { open, onOpenChange } = useSheetContext()
    const motionProps = getMotionProps(side)

    return (
      <SheetPortal>
        <SheetOverlay />
        <AnimatePresence>
          {open ? (
            <motion.div
              ref={ref}
              {...motionProps}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={cn(
                'fixed z-50 border-border bg-card text-card-foreground shadow-[var(--shadow-lg)]',
                getSideClasses(side),
                className
              )}
              {...props}
            >
              {children}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:bg-accent hover:text-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </SheetPortal>
    )
  }
)
SheetContent.displayName = 'SheetContent'

function SheetClose({ children, className }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useSheetContext()
  return (
    <button type="button" className={className} onClick={() => onOpenChange(false)}>
      {children}
    </button>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
}

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props} />
  )
)
SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
)
SheetDescription.displayName = 'SheetDescription'

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
}
