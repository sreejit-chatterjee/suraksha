// This is a simplified mock implementation that doesn't try to mimic Supabase's API
// Instead, it provides direct access to mock data

import { mockData } from "./mock-data"

// Simple helper to simulate async behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const supabase = {
  // Mock auth methods
  auth: {
    getUser: async () => {
      await delay(300)
      return { data: { user: mockData.currentUser } }
    },
    signUp: async () => {
      await delay(500)
      return { data: {}, error: null }
    },
    signInWithPassword: async () => {
      await delay(500)
      return { data: { user: mockData.currentUser }, error: null }
    },
    onAuthStateChange: () => {
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
  },
}

// Direct data access functions instead of trying to mimic Supabase's API
export const mockDataService = {
  // User profile
  getUserProfile: async () => {
    await delay(300)
    return mockData.profile
  },
  updateUserProfile: async (updates: any) => {
    await delay(300)
    mockData.profile = { ...mockData.profile, ...updates }
    return mockData.profile
  },

  // Emergency contacts
  getEmergencyContacts: async () => {
    await delay(300)
    return mockData.emergencyContacts
  },
  addEmergencyContact: async (contact: any) => {
    await delay(300)
    const newContact = {
      id: `contact-${Date.now()}`,
      ...contact,
    }
    mockData.emergencyContacts.push(newContact)
    return newContact
  },
  deleteEmergencyContact: async (id: string) => {
    await delay(300)
    mockData.emergencyContacts = mockData.emergencyContacts.filter((c) => c.id !== id)
    return true
  },

  // Guardian mode
  getGuardianMode: async () => {
    await delay(300)
    return mockData.guardianMode
  },
  updateGuardianMode: async (isActive: boolean) => {
    await delay(300)
    mockData.guardianMode.isActive = isActive
    return mockData.guardianMode
  },

  // Safety score
  getSafetyScore: async () => {
    await delay(300)
    return mockData.safetyScore
  },

  // SOS
  triggerSOS: async (location: any) => {
    await delay(300)
    console.log("SOS triggered at location:", location)
    return { success: true }
  },

  // Safety check-in
  recordCheckIn: async (location: any) => {
    await delay(300)
    console.log("Safety check-in recorded at location:", location)
    return { success: true }
  },

  // Aadhaar verification
  verifyAadhaar: async (aadhaarNumber: string) => {
    await delay(500)
    mockData.profile.aadhaar_verified = true
    mockData.profile.aadhaar_number = aadhaarNumber
    return { success: true }
  },

  // User settings
  getSettings: async () => {
    await delay(300)
    return mockData.settings
  },
  updateSettings: async (updates: any) => {
    await delay(300)
    mockData.settings = { ...mockData.settings, ...updates }
    return mockData.settings
  },

  // Alerts/Notifications
  getAlerts: async () => {
    await delay(300)
    return mockData.alerts
  },
  markAlertAsRead: async (id: string) => {
    await delay(200)
    const alert = mockData.alerts.find((a) => a.id === id)
    if (alert) {
      alert.read = true
    }
    return { success: true }
  },
  markAllAlertsAsRead: async () => {
    await delay(300)
    mockData.alerts.forEach((alert) => {
      alert.read = true
    })
    return { success: true }
  },
  deleteAlert: async (id: string) => {
    await delay(200)
    mockData.alerts = mockData.alerts.filter((a) => a.id !== id)
    return { success: true }
  },
}
