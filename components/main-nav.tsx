"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, Shield, Bell, User, Settings, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockDataService } from "@/lib/supabase"

interface MainNavProps {
  isVerified: boolean
}

export function MainNav({ isVerified: initialIsVerified }: MainNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVerified, setIsVerified] = useState(initialIsVerified)
  const pathname = usePathname()

  // Check verification status on mount
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const profile = await mockDataService.getUserProfile()
        setIsVerified(profile.aadhaar_verified)
      } catch (error) {
        console.error("Error checking verification status:", error)
      }
    }

    checkVerification()
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const menuItems = [
    { icon: <Shield className="h-5 w-5" />, label: "Safety", href: "/" },
    { icon: <Bell className="h-5 w-5" />, label: "Alerts", href: "/alerts" },
    { icon: <User className="h-5 w-5" />, label: "Profile", href: "/profile" },
    { icon: <HelpCircle className="h-5 w-5" />, label: "Help", href: "/help" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/settings" },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white bg-opacity-30 border-b border-white border-opacity-20 dark:bg-black dark:bg-opacity-30 dark:border-gray-800 dark:border-opacity-20">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary-foreground" />
            <span className="font-bold text-xl">Suraksha</span>
          </Link>
          {isVerified && (
            <Badge variant="outline" className="ml-2 bg-secondary bg-opacity-30">
              Verified
            </Badge>
          )}
        </div>

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center space-x-1 text-sm font-medium transition-colors py-1 ${
                isActive(item.href)
                  ? "text-primary-foreground border-b-2 border-primary"
                  : "hover:text-primary-foreground"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t border-white border-opacity-20 dark:border-gray-800 dark:border-opacity-20"
        >
          <div className="container py-4 space-y-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center space-x-2 p-2 rounded-lg ${
                  isActive(item.href)
                    ? "bg-white bg-opacity-20 dark:bg-gray-800 dark:bg-opacity-20"
                    : "hover:bg-white hover:bg-opacity-10 dark:hover:bg-gray-800 dark:hover:bg-opacity-10"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  )
}
