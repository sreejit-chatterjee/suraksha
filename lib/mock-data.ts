// Mock data for the application
export const mockData = {
  // Current user
  currentUser: {
    id: "user-123",
    email: "demo@example.com",
    name: "Priya Sharma",
  },

  // User profile
  profile: {
    id: "user-123",
    full_name: "Priya Sharma",
    email: "demo@example.com",
    phone: "XXXXXXXXXX",
    address: "123 Main Street, Mumbai",
    aadhaar_verified: false,
    aadhaar_number: "",
    blood_group: "O+",
    allergies: "None",
    medications: "None",
  },

  // Emergency contacts
  emergencyContacts: [
    {
      id: "contact-1",
      name: "Mom",
      phone: "XXXXXXXXXX",
      email: "sreejitc2019@gmail.com",
      relation: "Family",
    },
    {
      id: "contact-2",
      name: "Sister",
      phone: "XXXXXXXXXX",
      email: "sreejitc2019@gmail.com",
      relation: "Family",
    },
  ],

  // Guardian mode settings
  guardianMode: {
    isActive: false,
  },

  // Safety score (1-10)
  safetyScore: 7,

  // User settings
  settings: {
    darkMode: false,
    notifications: true,
    sound: true,
    locationTracking: true,
    privacyMode: "standard", // standard, enhanced, maximum
    checkInInterval: 15,
    safetyRadius: 50,
  },

  // Alerts/Notifications
  alerts: [
    {
      id: "alert-1",
      type: "area",
      title: "Safety Alert: Your Area",
      message: "Recent incidents reported in your vicinity. Exercise caution when traveling alone.",
      location: "Within 500m of your location",
      time: "Today, 10:30 AM",
      read: false,
    },
    {
      id: "alert-2",
      type: "checkin",
      title: "Missed Check-in",
      message: "You missed your scheduled safety check-in at 9:00 AM.",
      time: "Today, 9:15 AM",
      read: true,
    },
    {
      id: "alert-3",
      type: "system",
      title: "Guardian Mode Activated",
      message: "Guardian mode was activated for your journey home.",
      time: "Yesterday, 8:45 PM",
      read: true,
    },
  ],
}
