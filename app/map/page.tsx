"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MapView } from "@/components/map-view"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"

// Default location (Navi Mumbai coordinates)
const DEFAULT_LOCATION = { lat: 19.033, lng: 73.0297 }

export default function MapPage() {
  const [location, setLocation] = useState(DEFAULT_LOCATION)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isCardOpen, setIsCardOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would geocode the search query
    // For demo, we'll just show a success message
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`)
      // Reset search
      setSearchQuery("")
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to retrieve your location. Using default location.")
        },
      )
    } else {
      alert("Geolocation is not supported by your browser. Using default location.")
    }
  }

  if (!mounted) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Safety Map</h1>
        <div className="glass-card p-6 text-center">
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 relative">
      <h1 className="text-2xl font-bold mb-6">Safety Map</h1>

      <div className="glass-card p-4 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" onClick={handleGetCurrentLocation}>
            <MapPin className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="glass-card" style={{ height: "70vh" }}>
        <MapView location={location} onCardStateChange={setIsCardOpen} />
      </div>

      <div className="mt-4 text-sm text-center text-muted-foreground">
        <p>Tap anywhere on the map to add a safety rating</p>
        <p>Tap on existing markers to view safety details</p>
      </div>
    </div>
  )
}
