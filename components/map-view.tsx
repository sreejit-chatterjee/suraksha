"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { MapPin, X, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogOverlay,
  DialogTrigger,
} from "@/components/ui/dialog"

interface MapViewProps {
  location: { lat: number; lng: number }
  onCardStateChange?: (isOpen: boolean) => void
}

interface SafetyData {
  id: string
  lat: number
  lng: number
  score: number
  comment: string
  createdAt: string
  createdBy: {
    name: string
    isVerified: boolean
  }
}

interface MapMarker {
  lat: number
  lng: number
  x: number
  y: number
}

export function MapView({ location, onCardStateChange }: MapViewProps) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [safetyData, setSafetyData] = useState<SafetyData[]>([])
  const [loading, setLoading] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 })
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [showRatingCard, setShowRatingCard] = useState(false)
  const [ratingInput, setRatingInput] = useState({ score: 5, comment: "" })
  const [selectedSafetyData, setSelectedSafetyData] = useState<SafetyData | null>(null)
  const [showSafetyDetails, setShowSafetyDetails] = useState(false)

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load safety data
  useEffect(() => {
    if (!location) return

    const loadSafetyData = async () => {
      try {
        // In a real app, this would fetch from an API
        const mockData: SafetyData[] = [
          {
            id: "safety-1",
            lat: location.lat + 0.003,
            lng: location.lng + 0.002,
            score: 9,
            comment: "Well-lit area with regular police patrols. Safe for walking even at night.",
            createdAt: "2023-05-15T14:30:00Z",
            createdBy: {
              name: "Priya S.",
              isVerified: true,
            },
          },
          {
            id: "safety-2",
            lat: location.lat - 0.002,
            lng: location.lng + 0.004,
            score: 3,
            comment: "Poorly lit street with few people around. Avoid at night.",
            createdAt: "2023-05-10T18:45:00Z",
            createdBy: {
              name: "Anjali K.",
              isVerified: true,
            },
          },
          {
            id: "safety-3",
            lat: location.lat + 0.005,
            lng: location.lng - 0.003,
            score: 7,
            comment: "Busy market area. Safe during day, moderate caution at night.",
            createdAt: "2023-05-12T10:15:00Z",
            createdBy: {
              name: "Meera R.",
              isVerified: false,
            },
          },
        ]

        setSafetyData(mockData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading safety data:", error)
      }
    }

    loadSafetyData()
  }, [location])

  // Update dimensions when container size changes
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    // Initial dimensions
    updateDimensions()

    // Add resize listener
    window.addEventListener("resize", updateDimensions)

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  // Draw the map when safety data or dimensions change
  useEffect(() => {
    if (!canvasRef.current || !location || dimensions.width === 0 || !mounted) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set background color based on theme
    const isDark = theme === "dark"
    const bgColor = isDark ? "#1a1a2e" : "#e5e7eb"
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw map grid (streets)
    ctx.strokeStyle = isDark ? "rgba(100, 100, 100, 0.7)" : "rgba(255, 255, 255, 0.7)"
    ctx.lineWidth = 1

    const gridSize = 40 * zoom
    const offsetX = mapOffset.x % gridSize
    const offsetY = mapOffset.y % gridSize

    // Horizontal streets
    for (let i = offsetY; i < canvas.height; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Vertical streets
    for (let i = offsetX; i < canvas.width; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }

    // Draw safety markers
    safetyData.forEach((point) => {
      // Convert lat/lng to pixel coordinates with zoom and offset
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const x = centerX + (point.lng - location.lng) * 10000 * zoom + mapOffset.x
      const y = centerY + (point.lat - location.lat) * -10000 * zoom + mapOffset.y

      // Only draw if within canvas bounds
      if (x >= -20 && x <= canvas.width + 20 && y >= -20 && y <= canvas.height + 20) {
        // Determine color based on safety score
        let color
        if (point.score >= 8) {
          color = isDark ? "rgba(0, 200, 0, 0.7)" : "rgba(0, 255, 0, 0.7)" // Green for safe
        } else if (point.score >= 5) {
          color = isDark ? "rgba(200, 200, 0, 0.7)" : "rgba(255, 255, 0, 0.7)" // Yellow for moderate
        } else {
          color = isDark ? "rgba(200, 0, 0, 0.7)" : "rgba(255, 0, 0, 0.7)" // Red for unsafe
        }

        // Draw marker
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = isDark ? "#ffffff" : "#000000"
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw score
        ctx.font = "bold 10px Arial"
        ctx.fillStyle = "#ffffff"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(point.score.toString(), x, y)
      }
    })

    // Draw user location pin
    const userX = canvas.width / 2 + mapOffset.x
    const userY = canvas.height / 2 + mapOffset.y
    ctx.beginPath()
    ctx.arc(userX, userY, 8, 0, Math.PI * 2)
    ctx.fillStyle = "#ff6b6b"
    ctx.fill()
    ctx.beginPath()
    ctx.arc(userX, userY, 4, 0, Math.PI * 2)
    ctx.fillStyle = "#ffffff"
    ctx.fill()
  }, [safetyData, dimensions, location, theme, mounted, mapOffset, zoom])

  // Handle map interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (showRatingCard || showSafetyDetails) return

    let clientX, clientY

    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    }

    setIsDragging(true)
    setStartDragPos({ x: clientX, y: clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    let clientX, clientY

    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    }

    const deltaX = clientX - startDragPos.x
    const deltaY = clientY - startDragPos.y

    setMapOffset((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }))

    setStartDragPos({ x: clientX, y: clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on an existing safety marker
    const clickedMarkerData = safetyData.find((point) => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const pointX = centerX + (point.lng - location.lng) * 10000 * zoom + mapOffset.x
      const pointY = centerY + (point.lat - location.lat) * -10000 * zoom + mapOffset.y

      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2))
      return distance <= 10
    })

    if (clickedMarkerData) {
      // Show details of existing marker
      setSelectedSafetyData(clickedMarkerData)
      setShowSafetyDetails(true)
      onCardStateChange?.(true)
    } else {
      // Clicked on empty space - Prepare to show Rating Dialog
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const clickLng = location.lng + (x - centerX - mapOffset.x) / (10000 * zoom)
      const clickLat = location.lat - (y - centerY - mapOffset.y) / (10000 * zoom)

      // Store the location data needed for the rating using selectedMarker
      setSelectedMarker({ lat: clickLat, lng: clickLng, x, y })
      // Reset rating input before opening
      setRatingInput({ score: 5, comment: "" })
      // Open the dialog
      setShowRatingCard(true)
      onCardStateChange?.(true) // Notify parent
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5))
  }

  const handleSaveRating = () => {
    // Use selectedMarker
    if (!selectedMarker) return

    const newSafetyData: SafetyData = {
      id: `safety-${Date.now()}`,
      lat: selectedMarker.lat,
      lng: selectedMarker.lng,
      score: ratingInput.score,
      comment: ratingInput.comment,
      createdAt: new Date().toISOString(),
      createdBy: {
        name: "You",
        isVerified: true, // Assuming current user is verified
      },
    }

    setSafetyData((prev) => [...prev, newSafetyData])
    setShowRatingCard(false) // Close dialog
    setSelectedMarker(null) // Clear marker data
    onCardStateChange?.(false) // Notify parent

    toast({
      title: "Safety Rating Saved",
      description: "Thank you for contributing to community safety.",
    })
  }

  const handleRatingDialogOpenChange = (open: boolean) => {
      if (!open) {
          if (ratingInput.comment.trim() !== "" || ratingInput.score !== 5) {
              if (!confirm("Discard your safety rating?")) {
                  return;
              }
          }
          setShowRatingCard(false)
          setSelectedMarker(null) // Clear marker on close
          onCardStateChange?.(false)
      }
  }

  const handleSafetyDetailsOpenChange = (open: boolean) => {
    if (!open) {
      setShowSafetyDetails(false)
      setSelectedSafetyData(null)
      onCardStateChange?.(false)
    }
    // If opening, setShowSafetyDetails(true) is handled by handleClick
  }

  const getSafetyColor = (score: number) => {
    if (score >= 8) return "bg-green-500"
    if (score >= 5) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getSafetyText = (score: number) => {
    if (score >= 8) return "Safe"
    if (score >= 5) return "Moderate"
    return "Unsafe"
  }

  if (loading || !mounted) {
    return (
      <div className="w-full h-full rounded-xl relative bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <MapPin className="h-8 w-8 text-primary animate-pulse" />
        <span className="ml-2">Loading map...</span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl relative bg-gray-200 dark:bg-gray-800"
      style={{ minHeight: "200px" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-xl cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onClick={handleClick}
      />

      {/* Zoom controls */}
      <div className="absolute top-2 left-2 flex flex-col space-y-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70"
          onClick={handleZoomIn}
        >
          +
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70"
          onClick={handleZoomOut}
        >
          -
        </Button>
      </div>

      {/* Safety Legend */}
      <div className="absolute top-2 right-2 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 p-2 rounded-md text-xs">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span>Safe</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span>Unsafe</span>
        </div>
      </div>

      {/* Rating Card Dialog */}
      <Dialog open={showRatingCard} onOpenChange={handleRatingDialogOpenChange}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Rate this location</span>
              <DialogClose asChild>
                 <Button variant="ghost" size="icon" className="h-6 w-6">
                   <X className="h-4 w-4" />
                 </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Safety Rating: {ratingInput.score}/10</span>
                <span className="text-sm font-medium">{getSafetyText(ratingInput.score)}</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[ratingInput.score]}
                onValueChange={(value) => setRatingInput((prev) => ({ ...prev, score: value[0] }))}
              />
            </div>

            <div>
              <label className="text-sm block mb-1">Comments</label>
              <Textarea
                placeholder="Share your experience about this location..."
                value={ratingInput.comment}
                onChange={(e) => setRatingInput((prev) => ({ ...prev, comment: e.target.value }))}
                className="h-24"
              />
            </div>

            <Button onClick={handleSaveRating} className="w-full">
              Save Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Safety Details Dialog */}
      <Dialog open={showSafetyDetails} onOpenChange={handleSafetyDetailsOpenChange}>
         <DialogContent className="max-w-xs">
             <DialogHeader>
                 <DialogTitle className="flex justify-between items-center">
                     {/* Title with color indicator */}
                     <div className="flex items-center">
                         <div className={`w-4 h-4 rounded-full ${selectedSafetyData ? getSafetyColor(selectedSafetyData.score) : 'bg-gray-400'} mr-2`}></div>
                         <h3 className="font-medium">{selectedSafetyData ? getSafetyText(selectedSafetyData.score) : ''} Area</h3>
                     </div>
                     {/* Close button */}
                     <DialogClose asChild>
                         <Button variant="ghost" size="icon" className="h-6 w-6">
                             <X className="h-4 w-4" />
                         </Button>
                     </DialogClose>
                 </DialogTitle>
             </DialogHeader>

             {/* Details Content */}
             {selectedSafetyData && (
                 <div className="space-y-3 pt-4">
                     {/* Rating Bar */}
                     <div>
                         <div className="flex justify-between mb-1">
                             <span className="text-sm">Safety Rating</span>
                             <span className="text-sm font-medium">{selectedSafetyData.score}/10</span>
                         </div>
                         <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                             <div
                                 className={`h-full ${getSafetyColor(selectedSafetyData.score)}`}
                                 style={{ width: `${selectedSafetyData.score * 10}%` }}
                             ></div>
                         </div>
                     </div>

                     {/* Comment */}
                     <div>
                         <p className="text-sm whitespace-pre-wrap">{selectedSafetyData.comment}</p>
                     </div>

                     {/* Footer with user info */}
                     <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                         <div className="flex items-center">
                             <Avatar className="h-6 w-6 mr-2">
                                 <AvatarFallback>{selectedSafetyData.createdBy.name[0]}</AvatarFallback>
                             </Avatar>
                             <span className="text-xs">{selectedSafetyData.createdBy.name}</span>
                         </div>
                         {selectedSafetyData.createdBy.isVerified && (
                             <div className="flex items-center text-xs text-green-500">
                                 <Shield className="h-3 w-3 mr-1" />
                                 <span>Verified</span>
                             </div>
                         )}
                     </div>

                     {/* Date */}
                     <div className="text-xs text-gray-500">
                         {new Date(selectedSafetyData.createdAt).toLocaleDateString()}
                     </div>
                 </div>
             )}
         </DialogContent>
     </Dialog>

      {/* Coordinates */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 p-2 rounded-md text-xs">
        Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
      </div>
    </div>
  )
}
