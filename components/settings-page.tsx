"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, Moon, Sun, Volume2, VolumeX, MapPin, Lock, Shield } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { mockDataService } from "@/lib/supabase"
import { useTheme } from "next-themes"

export function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    sound: true,
    locationTracking: true,
    privacyMode: "standard", // standard, enhanced, maximum
    checkInInterval: 15,
    safetyRadius: 50,
  })

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await mockDataService.getSettings()
        setSettings({
          ...userSettings,
          // Sync darkMode with the actual theme
          darkMode: theme === "dark",
        })
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setLoading(false)
      }
    }

    // Only load settings once theme is available and component is mounted
    if (theme !== undefined && mounted) {
      loadSettings()
    }
  }, [theme, mounted])

  const handleSave = async () => {
    try {
      await mockDataService.updateSettings(settings)
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDarkModeToggle = (checked: boolean) => {
    setSettings({ ...settings, darkMode: checked })
    setTheme(checked ? "dark" : "light")
  }

  // Show loading state only if not mounted or still loading data
  if (!mounted || loading) {
    return (
      <div className="glass-card p-6 text-center">
        <p>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="glass-card p-6 rounded-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <Switch id="dark-mode" checked={settings.darkMode} onCheckedChange={handleDarkModeToggle} />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="glass-card p-6 rounded-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="notifications">Push Notifications</Label>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <Label htmlFor="sound">Sound Alerts</Label>
            </div>
            <Switch
              id="sound"
              checked={settings.sound}
              onCheckedChange={(checked) => setSettings({ ...settings, sound: checked })}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="glass-card p-6 rounded-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-4">Privacy & Location</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <Label htmlFor="location">Location Tracking</Label>
            </div>
            <Switch
              id="location"
              checked={settings.locationTracking}
              onCheckedChange={(checked) => setSettings({ ...settings, locationTracking: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy-mode" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Privacy Mode</span>
            </Label>
            <RadioGroup
              id="privacy-mode"
              value={settings.privacyMode}
              onValueChange={(value) => setSettings({ ...settings, privacyMode: value })}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard">Standard</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="enhanced" id="enhanced" />
                <Label htmlFor="enhanced">Enhanced</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maximum" id="maximum" />
                <Label htmlFor="maximum">Maximum</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="glass-card p-6 rounded-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4">Safety Features</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="check-in-interval" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Default Check-in Interval: {settings.checkInInterval} minutes</span>
            </Label>
            <Slider
              id="check-in-interval"
              min={5}
              max={60}
              step={5}
              value={[settings.checkInInterval]}
              onValueChange={(value) => setSettings({ ...settings, checkInInterval: value[0] })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety-radius" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Safety Alert Radius: {settings.safetyRadius} meters</span>
            </Label>
            <Slider
              id="safety-radius"
              min={10}
              max={200}
              step={10}
              value={[settings.safetyRadius]}
              onValueChange={(value) => setSettings({ ...settings, safetyRadius: value[0] })}
            />
          </div>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  )
}
