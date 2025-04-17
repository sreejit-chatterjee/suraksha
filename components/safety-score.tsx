"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"
import { calculateSafetyScore } from "@/lib/safety-score"

// Default location (Navi Mumbai coordinates)
const DEFAULT_LOCATION = { lat: 19.033, lng: 73.0297 }

interface SafetyScoreProps {
  score: number
}

export function SafetyScore({ score: initialScore }: SafetyScoreProps) {
  const [score, setScore] = useState(initialScore)
  const [location, setLocation] = useState(DEFAULT_LOCATION)

  // Get location and calculate real safety score
  useEffect(() => {
    // Check if geolocation is available and not in a sandboxed environment
    const isGeolocationAvailable =
      typeof navigator !== "undefined" && "geolocation" in navigator && !window.location.href.includes("vercel.app")

    if (isGeolocationAvailable) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            setLocation(userLocation)

            // Calculate safety score based on location
            const calculatedScore = calculateSafetyScore(userLocation)
            setScore(calculatedScore)
          },
          () => {
            // Silently fall back to default location
            const calculatedScore = calculateSafetyScore(DEFAULT_LOCATION)
            setScore(calculatedScore)
          },
        )
      } catch (error) {
        // Silently fall back to default location
        const calculatedScore = calculateSafetyScore(DEFAULT_LOCATION)
        setScore(calculatedScore)
      }
    } else {
      // Use default location
      const calculatedScore = calculateSafetyScore(DEFAULT_LOCATION)
      setScore(calculatedScore)
    }
  }, [])

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 8) return "text-green-500"
    if (score >= 5) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreText = () => {
    if (score >= 8) return "Safe"
    if (score >= 5) return "Moderate"
    return "Caution"
  }

  const getScoreDescription = () => {
    if (score >= 8) return "This area is generally considered safe."
    if (score >= 5) return "Exercise normal caution in this area."
    return "Exercise increased caution in this area."
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center mb-4">
        <Shield className="mr-2 h-5 w-5" />
        <h3 className="font-medium">Safety Score</h3>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className={`text-4xl font-bold ${getScoreColor()}`}>{score}/10</p>
          <p className="text-sm font-medium mt-1">{getScoreText()}</p>
          <p className="text-xs text-muted-foreground mt-1">{getScoreDescription()}</p>
        </div>

        <div className="w-24 h-24 relative dark:safety-feature-highlight">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-muted stroke-current"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <motion.circle
              className={`${getScoreColor()} stroke-current`}
              strokeWidth="10"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              strokeDasharray="251.2"
              style={{ strokeDashoffset: "251.2" }}
              animate={{
                strokeDashoffset: 251.2 - (251.2 * score) / 10,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Shield className={`h-8 w-8 ${getScoreColor()}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
