'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
  activeValue?: string
  onSelect?: (value: string) => void
}

interface TabsTriggerProps {
  value: string
  activeValue?: string
  onSelect?: (value: string) => void
  children: React.ReactNode
  className?: string
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn(className)} data-slot="tabs" data-value={value}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child

        if (child.type === TabsList || child.type === TabsContent) {
          return React.cloneElement(child, {
            activeValue: value,
            onSelect: onValueChange,
          } as Partial<TabsTriggerProps>)
        }

        return child
      })}
    </div>
  )
}

function TabsList({
  children,
  className,
  activeValue,
  onSelect,
  ...props
}: TabsListProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex h-11 items-center rounded-2xl border border-border/60 bg-muted/40 p-1 text-muted-foreground',
        className
      )}
      data-slot="tabs-list"
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child

        return React.cloneElement(child, {
          activeValue,
          onSelect,
        } as Partial<TabsTriggerProps>)
      })}
    </div>
  )
}

function TabsTrigger({
  value,
  activeValue,
  onSelect,
  children,
  className,
}: TabsTriggerProps) {
  const isActive = activeValue === value

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => onSelect?.(value)}
      className={cn(
        'inline-flex min-w-[96px] items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  )
}

function TabsContent({
  className,
  children,
  activeValue,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { activeValue?: string; value?: string }) {
  const isVisible = !value || activeValue === value

  if (!isVisible) return null

  return (
    <div className={cn(className)} data-slot="tabs-content" {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
