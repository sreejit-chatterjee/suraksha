"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Phone, Shield, Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { mockDataService } from "@/lib/supabase"

export function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    blood_group: "",
    allergies: "",
    medications: "",
  })

  const [editedProfile, setEditedProfile] = useState({ ...profile })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await mockDataService.getUserProfile()
        setProfile(profileData)
        setEditedProfile(profileData)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile({ ...profile })
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      await mockDataService.updateUserProfile(editedProfile)
      setProfile({ ...editedProfile })
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProfile({
      ...editedProfile,
      [e.target.name]: e.target.value,
    })
  }

  if (loading) {
    return (
      <div className="glass-card p-6 text-center">
        <p>Loading profile...</p>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="User" />
              <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{profile.full_name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit2 className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="personal">
          <TabsList className="mb-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="medical">Medical Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={editedProfile.full_name}
                    onChange={handleChange}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={editedProfile.email}
                    onChange={handleChange}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={editedProfile.phone}
                    onChange={handleChange}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={editedProfile.address}
                    onChange={handleChange}
                    className="glass-input"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p>{profile.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{profile.phone}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-4 w-4 mr-3 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p>{profile.address}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Input
                    id="blood_group"
                    name="blood_group"
                    value={editedProfile.blood_group}
                    onChange={handleChange}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    name="allergies"
                    value={editedProfile.allergies}
                    onChange={handleChange}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Input
                    id="medications"
                    name="medications"
                    value={editedProfile.medications}
                    onChange={handleChange}
                    className="glass-input"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p>{profile.blood_group}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allergies</p>
                  <p>{profile.allergies}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Medications</p>
                  <p>{profile.medications}</p>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              This information will only be shared with emergency responders in case of an SOS alert.
            </p>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Account Security</p>
              <div className="flex justify-between items-center mt-2">
                <p>Password</p>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Two-Factor Authentication</p>
              <div className="flex justify-between items-center mt-2">
                <p>Not Enabled</p>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Verification</p>
              <div className="flex justify-between items-center mt-2">
                <p>Aadhaar Verification</p>
                <Button variant="outline" size="sm">
                  Verify Identity
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
