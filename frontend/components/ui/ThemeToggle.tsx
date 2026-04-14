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
    <div 
      className="relative w-[72px] h-[36px] bg-bg-white border border-border rounded-full p-1 flex items-center justify-between cursor-pointer transition-colors duration-300"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {/* Active Indicator Slab */}
      <div 
        className={`absolute w-[30px] h-[28px] bg-primary rounded-full transition-all duration-300 ease-out shadow-sm ${
          theme === 'dark' ? 'translate-x-[34px]' : 'translate-x-0'
        }`} 
      />
      
      {/* Light Icon Area */}
      <div className="flex-1 flex items-center justify-center relative z-10 transition-colors">
        <Sun 
          size={14} 
          className={theme === 'light' ? 'text-white' : 'text-text-muted opacity-50'} 
        />
      </div>

      {/* Dark Icon Area */}
      <div className="flex-1 flex items-center justify-center relative z-10 transition-colors">
        <Moon 
          size={14} 
          className={theme === 'dark' ? 'text-white' : 'text-text-muted opacity-50'} 
        />
      </div>
    </div>
  )
}
