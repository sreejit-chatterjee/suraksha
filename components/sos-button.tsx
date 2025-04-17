"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { mockDataService } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-service"

// Default location (Navi Mumbai coordinates)
const DEFAULT_LOCATION = { lat: 19.033, lng: 73.0297 }

interface SosButtonProps {
  onActivate: () => void
}

export function SosButton({ onActivate }: SosButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [showRipple, setShowRipple] = useState(false)
  const { toast } = useToast()
  const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false)

  // Check if geolocation is available
  useEffect(() => {
    const checkGeolocation = () => {
      const available =
        typeof navigator !== "undefined" &&
        "geolocation" in navigator &&
        // Check if we're not in a sandboxed environment (like v0 preview)
        !window.location.href.includes("vercel.app")

      setIsGeolocationAvailable(available)
    }

    checkGeolocation()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isPressed && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (isPressed && countdown === 0) {
      handleSosActivation()
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isPressed, countdown])

  const handlePress = () => {
    setIsPressed(true)
    setShowRipple(true)
    setTimeout(() => setShowRipple(false), 1000)
  }

  const handleRelease = () => {
    if (countdown > 0) {
      setIsPressed(false)
      setCountdown(3)
    }
  }

  const handleSosActivation = async () => {
    try {
      // Use default location since geolocation is disabled in the preview
      const location = DEFAULT_LOCATION

      // Only try geolocation if available and not in preview
      if (isGeolocationAvailable) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false,
            })
          })

          location.lat = position.coords.latitude
          location.lng = position.coords.longitude
        } catch (geoError) {
          console.log("Using default location for SOS")
        }
      }

      // Trigger SOS with location (default or actual)
      await mockDataService.triggerSOS(location)

      // Send email notification
      const emailTo = "sreejitc2019@gmail.com"
      const subject = "EMERGENCY SOS ALERT"
      const body = `
Emergency SOS alert triggered!

User: Priya Sharma
Time: ${new Date().toLocaleString()}
Location: https://www.google.com/maps?q=${location.lat},${location.lng}${!isGeolocationAvailable ? " (approximate)" : ""}

This is an automated emergency alert. The user may be in danger and requires immediate assistance.
      `.trim()

      await sendEmail(emailTo, subject, body)

      // Call the onActivate callback
      onActivate()

      toast({
        title: "SOS Activated",
        description:
          "Emergency contacts have been notified" + (!isGeolocationAvailable ? " with approximate location" : ""),
        variant: "destructive",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsPressed(false)
      setCountdown(3)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <motion.button
          className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg relative dark:safety-feature-highlight ${
            isPressed ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
          }`}
          whileTap={{ scale: 0.95 }}
          onTouchStart={handlePress}
          onMouseDown={handlePress}
          onTouchEnd={handleRelease}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
        >
          {showRipple && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-primary"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}

          <div className="flex flex-col items-center justify-center">
            <AlertTriangle size={32} className="mb-1" />
            <span className="font-bold text-lg">{isPressed ? `SOS (${countdown})` : "SOS"}</span>
          </div>
        </motion.button>
      </div>

      <p className="mt-4 text-sm text-center max-w-xs">
        Press and hold for {countdown} seconds to activate emergency response
      </p>
      {!isGeolocationAvailable && (
        <p className="mt-2 text-xs text-center text-amber-500 max-w-xs">
          Using approximate location for demonstration purposes
        </p>
      )}
    </div>
  )
}
