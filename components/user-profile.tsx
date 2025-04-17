"use client"

import type React from "react"

import { motion } from "framer-motion"
import { CheckCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { supabase, mockDataService } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface UserProfileProps {
  isVerified: boolean
  onVerify: () => void
}

export function UserProfile({ isVerified, onVerify }: UserProfileProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [aadhaarNumber, setAadhaarNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const { toast } = useToast()

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        // Get user profile
        const profileData = await mockDataService.getUserProfile()
        setProfile(profileData)

        if (profileData.aadhaar_verified) {
          onVerify()
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    getUser()
  }, [onVerify])

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to verify your identity",
        variant: "destructive",
      })
      return
    }

    if (step === 1) {
      // Validate Aadhaar number (simple validation for demo)
      if (aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
        toast({
          title: "Invalid Aadhaar Number",
          description: "Please enter a valid 12-digit Aadhaar number",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would call an API to send OTP to the user's registered mobile
      // For demo purposes, we'll just move to the next step
      setStep(2)
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your registered mobile number",
      })
    } else {
      // Validate OTP (simple validation for demo)
      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        toast({
          title: "Invalid OTP",
          description: "Please enter a valid 6-digit OTP",
          variant: "destructive",
        })
        return
      }

      try {
        // In a real app, you would verify the OTP with an API
        // For demo purposes, we'll just update the database
        await mockDataService.verifyAadhaar(aadhaarNumber)

        onVerify()
        setIsDialogOpen(false)
        setStep(1)
        setAadhaarNumber("")
        setOtp("")

        toast({
          title: "Verification Successful",
          description: "Your identity has been verified with Aadhaar",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <motion.div
      className="glass-card glass-card-accent p-6 rounded-2xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg?height=48&width=48" alt="User" />
            <AvatarFallback>{profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">
              Welcome, {profile?.full_name || user?.email?.split("@")[0] || "demo"}
            </h2>
            <p className="text-sm text-muted-foreground">Stay safe today</p>
          </div>
        </div>

        {isVerified ? (
          <div className="flex items-center text-green-500">
            <CheckCircle className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Verified</span>
          </div>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Verify Identity</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aadhaar Verification</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                {step === 1 ? (
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar">Aadhaar Number</Label>
                    <Input
                      id="aadhaar"
                      placeholder="XXXX XXXX XXXX"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                      required
                      maxLength={12}
                      className="glass-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your information is secure and will only be used for verification purposes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP sent to your registered mobile</Label>
                    <Input
                      id="otp"
                      placeholder="XXXXXX"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                      maxLength={6}
                      className="glass-input"
                    />
                  </div>
                )}
                <Button type="submit" className="w-full">
                  {step === 1 ? "Send OTP" : "Verify"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </motion.div>
  )
}
