"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Bell, MapPin, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { mockDataService } from "@/lib/supabase"

interface Alert {
  id: string
  type: "sos" | "checkin" | "area" | "system"
  title: string
  message: string
  location?: string
  time: string
  read: boolean
}

export function AlertsPage() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const alertsData = await mockDataService.getAlerts()
        setAlerts(alertsData)
      } catch (error) {
        console.error("Error loading alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  const markAllAsRead = async () => {
    try {
      await mockDataService.markAllAlertsAsRead()
      setAlerts(alerts.map((alert) => ({ ...alert, read: true })))
      toast({
        title: "All Alerts Marked as Read",
        description: "Your alerts have been updated.",
      })
    } catch (error) {
      console.error("Error marking alerts as read:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await mockDataService.markAlertAsRead(id)
      setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const deleteAlert = async (id: string) => {
    try {
      await mockDataService.deleteAlert(id)
      setAlerts(alerts.filter((alert) => alert.id !== id))
      toast({
        title: "Alert Deleted",
        description: "The alert has been removed.",
      })
    } catch (error) {
      console.error("Error deleting alert:", error)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "sos":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "checkin":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "area":
        return <MapPin className="h-5 w-5 text-orange-500" />
      case "system":
        return <Bell className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-6 text-center">
        <p>Loading alerts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          <Badge variant="outline" className="ml-2">
            {alerts.filter((a) => !a.read).length} new
          </Badge>
        </div>

        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          Mark All as Read
        </Button>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              className={`glass-card p-4 rounded-xl ${!alert.read ? "border-l-4 border-primary" : ""}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between">
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">{getAlertIcon(alert.type)}</div>
                  <div>
                    <h3 className="font-medium">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    {alert.location && (
                      <div className="flex items-center mt-2">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{alert.location}</span>
                      </div>
                    )}
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-1">
                  {!alert.read && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(alert.id)}>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteAlert(alert.id)}>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-6 text-center">
          <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <h3 className="font-medium">No Notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
        </div>
      )}
    </div>
  )
}
