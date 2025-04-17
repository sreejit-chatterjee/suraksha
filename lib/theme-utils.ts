"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

// Custom hook to safely access theme information
export function useSafeTheme() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined)

  // After mounting, we can safely access the theme
  useEffect(() => {
    setMounted(true)
    setCurrentTheme(theme)
  }, [theme])

  // Safe theme setter that works even before mounting
  const safeSetTheme = (newTheme: string) => {
    setTheme(newTheme)
    if (!mounted) {
      // If not mounted yet, also update our local state
      setCurrentTheme(newTheme)
    }
  }

  return {
    theme: currentTheme,
    setTheme: safeSetTheme,
    mounted,
  }
}
