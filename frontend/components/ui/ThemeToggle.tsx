'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-[3px] border border-transparent" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-10 h-10 flex items-center justify-center rounded-[3px] border border-border bg-bg-white text-text-muted hover:text-primary hover:border-primary transition-all cursor-pointer overflow-hidden group"
      aria-label="Toggle theme"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Sun 
          className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" 
        />
        <Moon 
          className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" 
        />
      </div>
    </button>
  )
}
