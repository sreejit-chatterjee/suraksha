"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, UserCheck, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { mockDataService } from "@/lib/supabase"

interface GuardianModeProps {
  isActive: boolean
  onToggle: () => void
  location: { lat: number; lng: number } | null
}

export function GuardianMode({ isActive, onToggle, location }: GuardianModeProps) {
  const { toast } = useToast()
  const [guardians, setGuardians] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load guardians (using emergency contacts for demo)
  useEffect(() => {
    const loadGuardians = async () => {
      try {
        const contacts = await mockDataService.getEmergencyContacts()
        setGuardians(contacts)
      } catch (error) {
        console.error("Error loading guardians:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGuardians()
  }, [])

  const handleShareRoute = async () => {
    if (!location) return

    try {
      // Log the action
      console.log("Sharing route with guardians:", location)

      toast({
        title: "Route Shared",
        description: "Your current route has been shared with your guardians.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
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
          {isActive ? (
            <Eye className="mr-2 h-5 w-5 text-primary-foreground" />
          ) : (
            <EyeOff className="mr-2 h-5 w-5 text-muted-foreground" />
          )}
          <h3 className="font-medium">Guardian Mode</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="guardian-mode" checked={isActive} onCheckedChange={onToggle} />
          <Label htmlFor="guardian-mode" className="sr-only">
            Guardian Mode
          </Label>
        </div>
      </div>

      <div className={`space-y-4 ${isActive ? "opacity-100" : "opacity-50"}`}>
        <p className="text-sm text-muted-foreground">
          {isActive
            ? "Your trusted contacts can see your location in real-time"
            : "Enable to share your location with trusted contacts"}
        </p>

        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center">
            <UserCheck className="mr-2 h-4 w-4" /> Trusted Guardians
          </h4>

          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading guardians...</p>
            ) : guardians.length > 0 ? (
              guardians.map((guardian) => (
                <div
                  key={guardian.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white bg-opacity-10"
                >
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{guardian.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{guardian.name}</p>
                      <p className="text-xs text-muted-foreground">{guardian.phone || guardian.email}</p>
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No guardians added yet</p>
            )}
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full" disabled={!isActive} onClick={handleShareRoute}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Current Route
        </Button>
      </div>
    </motion.div>
  )
}
