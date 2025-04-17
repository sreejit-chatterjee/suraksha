"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { mockDataService } from "@/lib/supabase"

interface SafetyCheckInProps {
  isActive: boolean
  interval: number
  onToggle: () => void
  onIntervalChange: (value: number) => void
}

export function SafetyCheckIn({ isActive, interval, onToggle, onIntervalChange }: SafetyCheckInProps) {
  const { toast } = useToast()
  const [timeLeft, setTimeLeft] = useState(interval * 60)
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      toast({
        title: "Check-In Required",
        description: "Please check in to confirm your safety.",
        variant: "destructive",
      })
      // Reset timer
      setTimeLeft(interval * 60)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isActive, timeLeft, interval, toast])

  useEffect(() => {
    // Reset timer when interval changes
    if (isActive) {
      setTimeLeft(interval * 60)
    }
  }, [interval, isActive])

  const handleCheckIn = async () => {
    try {
      const now = new Date()
      setLastCheckIn(now)
      setTimeLeft(interval * 60)

      // Get current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          // Record check-in
          await mockDataService.recordCheckIn(location)

          toast({
            title: "Check-In Successful",
            description: "Your safety status has been updated and shared with your emergency contacts.",
          })
        },
        (error) => {
          // Use mock location if geolocation fails
          const mockLocation = { lat: 19.033, lng: 73.0297 }
          mockDataService.recordCheckIn(mockLocation)

          toast({
            title: "Check-In Successful",
            description: "Your safety status has been updated with approximate location.",
          })
        },
      )
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <motion.div
      className="glass-card p-6 rounded-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-primary-foreground" />
          <h3 className="font-medium">Safety Check-In</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="check-in" checked={isActive} onCheckedChange={onToggle} />
          <Label htmlFor="check-in" className="sr-only">
            Safety Check-In
          </Label>
        </div>
      </div>

      <div className={`space-y-4 ${isActive ? "opacity-100" : "opacity-50"}`}>
        <p className="text-sm text-muted-foreground">
          {isActive ? "You will be prompted to check in periodically" : "Enable to set up periodic safety check-ins"}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="check-interval" className="text-sm">
              Check-in interval: {interval} minutes
            </Label>
          </div>
          <Slider
            id="check-interval"
            min={5}
            max={60}
            step={5}
            value={[interval]}
            onValueChange={(value) => onIntervalChange(value[0])}
            disabled={!isActive}
          />
        </div>

        {isActive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span className="text-sm">Next check-in:</span>
              </div>
              <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
            </div>

            {lastCheckIn && (
              <p className="text-xs text-muted-foreground">Last check-in: {lastCheckIn.toLocaleTimeString()}</p>
            )}
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full" disabled={!isActive} onClick={handleCheckIn}>
          Check In Now
        </Button>
      </div>
    </motion.div>
  )
}
