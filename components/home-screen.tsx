"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SosButton } from "./sos-button"
import { SafetyScore } from "./safety-score"
import { GuardianMode } from "./guardian-mode"
import { SafetyCheckIn } from "./safety-check-in"
import { UserProfile } from "./user-profile"
import { MapView } from "./map-view"
import { EmergencyContacts } from "./emergency-contacts"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { supabase, mockDataService } from "@/lib/supabase"
import { useTheme } from "next-themes"

// Default location (Navi Mumbai coordinates)
const DEFAULT_LOCATION = { lat: 19.033, lng: 73.0297 }

export function HomeScreen() {
  const { toast } = useToast()
  const { theme } = useTheme()
  const isMobile = useMobile()
  const [location, setLocation] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION)
  const [safetyScore, setSafetyScore] = useState(7)
  const [guardianActive, setGuardianActive] = useState(false)
  const [checkInActive, setCheckInActive] = useState(false)
  const [checkInInterval, setCheckInInterval] = useState(15)
  const [isVerified, setIsVerified] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if user is logged in
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        // Get guardian mode status
        const guardianMode = await mockDataService.getGuardianMode()
        setGuardianActive(guardianMode.isActive)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  // Get user location
  useEffect(() => {
    // Always set default location first
    setLocation(DEFAULT_LOCATION)

    // Check if geolocation is available and not in a sandboxed environment
    const isGeolocationAvailable =
      typeof navigator !== "undefined" &&
      "geolocation" in navigator &&
      // Check if we're not in a sandboxed environment (like v0 preview)
      !window.location.href.includes("vercel.app")

    if (isGeolocationAvailable) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          (error) => {
            // Silently fall back to default location
            console.log("Using default location due to geolocation error")
          },
          { timeout: 5000, enableHighAccuracy: false },
        )
      } catch (error) {
        // Silently fall back to default location
        console.log("Using default location due to geolocation exception")
      }
    } else {
      console.log("Geolocation not available, using default location")
    }
  }, [])

  // Get safety score
  useEffect(() => {
    const getSafetyScore = async () => {
      try {
        const score = await mockDataService.getSafetyScore()
        setSafetyScore(score)
      } catch (error) {
        console.error("Error fetching safety score:", error)
      }
    }

    getSafetyScore()
  }, [])

  const handleSosActivation = async () => {
    toast({
      title: "SOS Activated",
      description: "Emergency contacts and nearby authorities have been notified.",
      variant: "destructive",
    })
  }

  const toggleGuardianMode = async () => {
    const newState = !guardianActive
    setGuardianActive(newState)

    try {
      // Update guardian mode status
      await mockDataService.updateGuardianMode(newState)

      toast({
        title: newState ? "Guardian Mode Activated" : "Guardian Mode Deactivated",
        description: newState
          ? "Your trusted contacts will receive your location updates."
          : "Your trusted contacts will no longer receive updates.",
      })
    } catch (error) {
      console.error("Error updating guardian mode:", error)
    }
  }

  const toggleCheckIn = () => {
    setCheckInActive(!checkInActive)
    toast({
      title: checkInActive ? "Check-In Deactivated" : "Safety Check-In Activated",
      description: checkInActive
        ? "You will no longer receive check-in reminders."
        : `You will be reminded to check in every ${checkInInterval} minutes.`,
    })
  }

  const handleVerification = () => {
    setIsVerified(true)
  }

  // If loading, show loading state
  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="container px-2 sm:px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <UserProfile isVerified={isVerified} onVerify={handleVerification} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-primary-foreground">Your Safety Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SafetyScore score={safetyScore} />
          <SosButton onActivate={handleSosActivation} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-6"
        style={{ height: "300px" }}
      >
        <h2 className="text-xl font-semibold mb-4 text-primary-foreground">Your Location</h2>
        <div className="h-[220px]">
          <MapView location={location} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <GuardianMode isActive={guardianActive} onToggle={toggleGuardianMode} location={location} />

        <SafetyCheckIn
          isActive={checkInActive}
          interval={checkInInterval}
          onToggle={toggleCheckIn}
          onIntervalChange={setCheckInInterval}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <EmergencyContacts />
      </motion.div>
    </main>
  )
}
