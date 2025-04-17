# Suraksha: Women's Safety App
## Detailed Feature Documentation

## Table of Contents
1. [Safety Score System](#1-safety-score-system)
2. [SOS Emergency Response](#2-sos-emergency-response)
3. [Guardian Mode](#3-guardian-mode)
4. [Safety Check-In System](#4-safety-check-in-system)
5. [Interactive Safety Map](#5-interactive-safety-map)
6. [User Profile & Verification](#6-user-profile--verification)
7. [Emergency Contacts Management](#7-emergency-contacts-management)

---

## 1. Safety Score System

### Feature
The Safety Score system provides users with a real-time quantitative assessment (1-10 scale) of their current location's safety level, displayed as a visually intuitive circular gauge with color-coding and descriptive text.

### Why It Is Needed
Women often lack objective information about the safety of unfamiliar areas. The Safety Score provides:
- Immediate awareness of environmental safety conditions
- Data-driven decision support for route planning and location choices
- Reduced anxiety through increased situational awareness
- Objective measurement to supplement subjective feelings of safety

### How It Was Coded
The Safety Score feature is implemented through several interconnected components:

1. **Core Calculation Logic (`lib/safety-score.ts`)**:
   \`\`\`typescript
   export function calculateSafetyScore(location: LocationData): number {
     // Get current time to factor in time of day
     const currentHour = new Date().getHours()
     
     // Calculate various safety factors
     let timeOfDayScore = calculateTimeScore(currentHour)
     const crimeRateScore = mockCrimeRate(location)
     const crowdednessScore = mockCrowdedness(location, currentHour)
     const lightingScore = currentHour >= 18 || currentHour <= 6 ? 6 : 9
     const knownSafeZonesScore = mockSafeZones(location)
     
     // Calculate weighted average
     const weightedScore =
       timeOfDayScore * 0.3 +
       crimeRateScore * 0.25 +
       crowdednessScore * 0.15 +
       lightingScore * 0.15 +
       knownSafeZonesScore * 0.15
     
     // Round to nearest integer and ensure it's between 1-10
     return Math.max(1, Math.min(10, Math.round(weightedScore)))
   }
   \`\`\`

2. **UI Component (`components/safety-score.tsx`)**:
   - Uses React hooks for state management and side effects
   - Implements Framer Motion for smooth animations
   - Renders a circular progress indicator that fills based on the score
   - Applies color-coding based on score thresholds (green, yellow, red)
   - Displays descriptive text that changes based on the score

3. **Geolocation Integration**:
   \`\`\`typescript
   useEffect(() => {
     // Check if geolocation is available and not in a sandboxed environment
     const isGeolocationAvailable =
       typeof navigator !== "undefined" && 
       "geolocation" in navigator && 
       !window.location.href.includes("vercel.app")
     
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
             // Fallback to default location
             const calculatedScore = calculateSafetyScore(DEFAULT_LOCATION)
             setScore(calculatedScore)
           }
         )
       } catch (error) {
         // Fallback to default location
         const calculatedScore = calculateSafetyScore(DEFAULT_LOCATION)
         setScore(calculatedScore)
       }
     }
   }, [])
   \`\`\`

### How It Connects to the Rest of the Code
- **Home Screen Integration**: The Safety Score component is rendered in the home screen's safety status section
  \`\`\`typescript
  // In components/home-screen.tsx
  <motion.div className="glass-card p-6">
    <h2 className="text-xl font-semibold mb-4 text-primary-foreground">Your Safety Status</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SafetyScore score={safetyScore} />
      <SosButton onActivate={handleSosActivation} />
    </div>
  </motion.div>
  \`\`\`

- **Data Flow**:
  1. The `HomeScreen` component initializes with a default safety score
  2. It fetches the user's location and passes it to the `SafetyScore` component
  3. The `SafetyScore` component recalculates the score based on the current location
  4. The score is displayed to the user with appropriate visual feedback

- **Theme Integration**: The component respects the app's theme settings (light/dark mode)
  \`\`\`typescript
  const { theme } = useTheme()
  // Later in the component
  const isDark = theme === "dark"
  \`\`\`

- **Responsive Design**: Adapts to different screen sizes through the parent grid layout
  \`\`\`typescript
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  \`\`\`

---

## 2. SOS Emergency Response

### Feature
The SOS Emergency Response system provides a prominent, easily accessible emergency button that, when pressed and held for 3 seconds, triggers an alert to the user's emergency contacts with their current location.

### Why It Is Needed
In threatening situations, women need:
- Immediate access to help without navigating complex menus
- A way to silently alert trusted contacts
- Location sharing to facilitate quick assistance
- A mechanism that prevents accidental activation
- Confidence that help can be summoned quickly

### How It Was Coded
The SOS Button is implemented as a stateful React component with several key features:

1. **Button Component (`components/sos-button.tsx`)**:
   \`\`\`typescript
   export function SosButton({ onActivate }: SosButtonProps) {
     const [isPressed, setIsPressed] = useState(false)
     const [countdown, setCountdown] = useState(3)
     const [showRipple, setShowRipple] = useState(false)
     const { toast } = useToast()
     const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false)
     
     // Component logic...
   }
   \`\`\`

2. **Press-and-Hold Logic**:
   \`\`\`typescript
   useEffect(() => {
     let timer: NodeJS.Timeout
     
     if (isPressed && countdown > 0) {
       timer = setTimeout(() => {
         setCountdown(countdown - 1)
       }, 1000)
     } else if (isPressed && countdown === 0) {
       handleSosActivation()
     }
     
     return () => {
       if (timer) clearTimeout(timer)
     }
   }, [isPressed, countdown])
   
   const handlePress = () => {
     setIsPressed(true)
     setShowRipple(true)
     setTimeout(() => setShowRipple(false), 1000)
   }
   
   const handleRelease = () => {
     if (countdown > 0) {
       setIsPressed(false)
       setCountdown(3)
     }
   }
   \`\`\`

3. **SOS Activation Logic**:
   \`\`\`typescript
   const handleSosActivation = async () => {
     try {
       // Get location
       const location = DEFAULT_LOCATION
       
       if (isGeolocationAvailable) {
         try {
           const position = await new Promise<GeolocationPosition>((resolve, reject) => {
             navigator.geolocation.getCurrentPosition(resolve, reject, {
               timeout: 5000,
               enableHighAccuracy: false,
             })
           })
           
           location.lat = position.coords.latitude
           location.lng = position.coords.longitude
         } catch (geoError) {
           console.log("Using default location for SOS")
         }
       }
       
       // Trigger SOS with location
       await mockDataService.triggerSOS(location)
       
       // Send email notification
       const emailTo = "sreejitc2019@gmail.com"
       const subject = "EMERGENCY SOS ALERT"
       const body = `
         Emergency SOS alert triggered!
         
         User: Priya Sharma
         Time: ${new Date().toLocaleString()}
         Location: https://www.google.com/maps?q=${location.lat},${location.lng}
         
         This is an automated emergency alert. The user may be in danger and requires immediate assistance.
       `.trim()
       
       await sendEmail(emailTo, subject, body)
       
       // Call the onActivate callback
       onActivate()
       
       toast({
         title: "SOS Activated",
         description: "Emergency contacts have been notified",
         variant: "destructive",
       })
     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message,
         variant: "destructive",
       })
     } finally {
       setIsPressed(false)
       setCountdown(3)
     }
   }
   \`\`\`

4. **Visual Feedback**:
   \`\`\`typescript
   return (
     <div className="flex flex-col items-center justify-center">
       <div className="relative">
         <motion.button
           className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg relative dark:safety-feature-highlight ${
             isPressed ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
           }`}
           whileTap={{ scale: 0.95 }}
           onTouchStart={handlePress}
           onMouseDown={handlePress}
           onTouchEnd={handleRelease}
           onMouseUp={handleRelease}
           onMouseLeave={handleRelease}
         >
           {showRipple && (
             <motion.span
               className="absolute inset-0 rounded-full border-2 border-primary"
               initial={{ scale: 1, opacity: 0.8 }}
               animate={{ scale: 1.5, opacity: 0 }}
               transition={{ duration: 1 }}
             />
           )}
           
           <div className="flex flex-col items-center justify-center">
             <AlertTriangle size={32} className="mb-1" />
             <span className="font-bold text-lg">{isPressed ? `SOS (${countdown})` : "SOS"}</span>
           </div>
         </motion.button>
       </div>
       
       <p className="mt-4 text-sm text-center max-w-xs">
         Press and hold for {countdown} seconds to activate emergency response
       </p>
     </div>
   )
   \`\`\`

### How It Connects to the Rest of the Code
- **Home Screen Integration**: The SOS Button is prominently displayed in the safety status section
  \`\`\`typescript
  // In components/home-screen.tsx
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <SafetyScore score={safetyScore} />
    <SosButton onActivate={handleSosActivation} />
  </div>
  \`\`\`

- **Event Handling**: The home screen provides a callback function that's triggered when SOS is activated
  \`\`\`typescript
  const handleSosActivation = async () => {
    toast({
      title: "SOS Activated",
      description: "Emergency contacts and nearby authorities have been notified.",
      variant: "destructive",
    })
  }
  \`\`\`

- **Data Services Integration**: The SOS button connects to the mock data service to trigger alerts
  \`\`\`typescript
  // Trigger SOS with location
  await mockDataService.triggerSOS(location)
  \`\`\`

- **Email Service Integration**: Uses the email service to send notifications
  \`\`\`typescript
  await sendEmail(emailTo, subject, body)
  \`\`\`

- **Toast Notifications**: Provides user feedback through the toast notification system
  \`\`\`typescript
  toast({
    title: "SOS Activated",
    description: "Emergency contacts have been notified",
    variant: "destructive",
  })
  \`\`\`

---

## 3. Guardian Mode

### Feature
Guardian Mode allows users to share their real-time location with trusted contacts (guardians) who can monitor their movements during potentially unsafe situations.

### Why It Is Needed
Women often face situations where:
- They need to travel through unfamiliar or potentially unsafe areas
- They want passive monitoring without having to actively check in
- They need someone to know their exact location in case of emergency
- They want the ability to quickly share their route with trusted contacts

Guardian Mode provides peace of mind through transparent location sharing with trusted individuals.

### How It Was Coded
Guardian Mode is implemented as a toggleable feature with real-time location sharing capabilities:

1. **Component Structure (`components/guardian-mode.tsx`)**:
   \`\`\`typescript
   interface GuardianModeProps {
     isActive: boolean
     onToggle: () => void
     location: { lat: number; lng: number } | null
   }
   
   export function GuardianMode({ isActive, onToggle, location }: GuardianModeProps) {
     const { toast } = useToast()
     const [guardians, setGuardians] = useState<any[]>([])
     const [loading, setLoading] = useState(true)
     
     // Component logic...
   }
   \`\`\`

2. **Loading Guardian Contacts**:
   \`\`\`typescript
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
   \`\`\`

3. **Route Sharing Functionality**:
   \`\`\`typescript
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
   \`\`\`

4. **UI Implementation**:
   \`\`\`typescript
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
         {/* Guardian mode content */}
       </div>
     </motion.div>
   )
   \`\`\`

### How It Connects to the Rest of the Code
- **Home Screen Integration**: Guardian Mode is rendered in the home screen layout
  \`\`\`typescript
  // In components/home-screen.tsx
  <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <GuardianMode isActive={guardianActive} onToggle={toggleGuardianMode} location={location} />
    <SafetyCheckIn
      isActive={checkInActive}
      interval={checkInInterval}
      onToggle={toggleCheckIn}
      onIntervalChange={setCheckInInterval}
    />
  </motion.div>
  \`\`\`

- **State Management**: The home screen manages the active state of Guardian Mode
  \`\`\`typescript
  const [guardianActive, setGuardianActive] = useState(false)
  
  // Load initial state
  useEffect(() => {
    const getUser = async () => {
      try {
        // Get guardian mode status
        const guardianMode = await mockDataService.getGuardianMode()
        setGuardianActive(guardianMode.isActive)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }
    
    getUser()
  }, [])
  
  // Toggle handler
  const toggleGuardianMode = async () => {
    const newState = !guardianActive
    setGuardianActive(newState)
    
    try {
      // Update guardian mode status
      await mockDataService.updateGuardianMode(newState)
      
      toast({
        title: newState ? "Guardian Mode Activated" : "Guardian Mode Deactivated",
        description: newState
          ? "Your trusted contacts will receive your location updates."
          : "Your trusted contacts will no longer receive updates.",
      })
    } catch (error) {
      console.error("Error updating guardian mode:", error)
    }
  }
  \`\`\`

- **Location Data**: Uses the location data from the home screen
  \`\`\`typescript
  <GuardianMode isActive={guardianActive} onToggle={toggleGuardianMode} location={location} />
  \`\`\`

- **Emergency Contacts Integration**: Reuses the emergency contacts as guardians
  \`\`\`typescript
  const contacts = await mockDataService.getEmergencyContacts()
  setGuardians(contacts)
  \`\`\`

---

## 4. Safety Check-In System

### Feature
The Safety Check-In system allows users to set regular intervals at which they must confirm their safety. If a check-in is missed, the system can automatically alert emergency contacts.

### Why It Is Needed
Women often need:
- A way to ensure someone is alerted if they don't reach their destination
- Regular prompts to confirm their safety during extended activities
- Automatic alerts if they become unable to respond
- Customizable timing based on the activity and risk level

The Safety Check-In system provides an automated safety net that activates only when needed.

### How It Was Coded
The Safety Check-In feature is implemented as a timer-based system with user interaction:

1. **Component Structure (`components/safety-check-in.tsx`)**:
   \`\`\`typescript
   interface SafetyCheckInProps {
     isActive: boolean
     interval: number
     onToggle: () => void
     onIntervalChange: (value: number) => void
   }
   
   export function SafetyCheckIn({ isActive, interval, onToggle, onIntervalChange }: SafetyCheckInProps) {
     const { toast } = useToast()
     const [timeLeft, setTimeLeft] = useState(interval * 60)
     const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null)
     
     // Component logic...
   }
   \`\`\`

2. **Timer Implementation**:
   \`\`\`typescript
   useEffect(() => {
     let timer: NodeJS.Timeout
     
     if (isActive && timeLeft > 0) {
       timer = setTimeout(() => {
         setTimeLeft(timeLeft - 1)
       }, 1000)
     } else if (isActive && timeLeft === 0) {
       toast({
         title: "Check-In Required",
         description: "Please check in to confirm your safety.",
         variant: "destructive",
       })
       // Reset timer
       setTimeLeft(interval * 60)
     }
     
     return () => {
       if (timer) clearTimeout(timer)
     }
   }, [isActive, timeLeft, interval, toast])
   
   useEffect(() => {
     // Reset timer when interval changes
     if (isActive) {
       setTimeLeft(interval * 60)
     }
   }, [interval, isActive])
   \`\`\`

3. **Check-In Functionality**:
   \`\`\`typescript
   const handleCheckIn = async () => {
     try {
       const now = new Date()
       setLastCheckIn(now)
       setTimeLeft(interval * 60)
       
       // Get current location
       navigator.geolocation.getCurrentPosition(
         async (position) => {
           const location = {
             lat: position.coords.latitude,
             lng: position.coords.longitude,
           }
           
           // Record check-in
           await mockDataService.recordCheckIn(location)
           
           toast({
             title: "Check-In Successful",
             description: "Your safety status has been updated and shared with your emergency contacts.",
           })
         },
         (error) => {
           // Use mock location if geolocation fails
           const mockLocation = { lat: 19.033, lng: 73.0297 }
           mockDataService.recordCheckIn(mockLocation)
           
           toast({
             title: "Check-In Successful",
             description: "Your safety status has been updated with approximate location.",
           })
         },
       )
     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message,
         variant: "destructive",
       })
     }
   }
   \`\`\`

4. **UI Implementation**:
   \`\`\`typescript
   return (
     <motion.div
       className="glass-card p-6 rounded-2xl"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ duration: 0.3 }}
     >
       <div className="flex items-center justify-between mb-4">
         <div className="flex items-center">
           <Bell className="mr-2 h-5 w-5 text-primary-foreground" />
           <h3 className="font-medium">Safety Check-In</h3>
         </div>
         <div className="flex items-center space-x-2">
           <Switch id="check-in" checked={isActive} onCheckedChange={onToggle} />
           <Label htmlFor="check-in" className="sr-only">
             Safety Check-In
           </Label>
         </div>
       </div>
       
       <div className={`space-y-4 ${isActive ? "opacity-100" : "opacity-50"}`}>
         {/* Check-in content */}
       </div>
     </motion.div>
   )
   \`\`\`

### How It Connects to the Rest of the Code
- **Home Screen Integration**: The Safety Check-In component is rendered alongside Guardian Mode
  \`\`\`typescript
  // In components/home-screen.tsx
  <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <GuardianMode isActive={guardianActive} onToggle={toggleGuardianMode} location={location} />
    <SafetyCheckIn
      isActive={checkInActive}
      interval={checkInInterval}
      onToggle={toggleCheckIn}
      onIntervalChange={setCheckInInterval}
    />
  </motion.div>
  \`\`\`

- **State Management**: The home screen manages the active state and interval
  \`\`\`typescript
  const [checkInActive, setCheckInActive] = useState(false)
  const [checkInInterval, setCheckInInterval] = useState(15)
  
  const toggleCheckIn = () => {
    setCheckInActive(!checkInActive)
    toast({
      title: checkInActive ? "Check-In Deactivated" : "Safety Check-In Activated",
      description: checkInActive
        ? "You will no longer receive check-in reminders."
        : `You will be reminded to check in every ${checkInInterval} minutes.`,
    })
  }
  \`\`\`

- **Data Services Integration**: Records check-ins with location data
  \`\`\`typescript
  await mockDataService.recordCheckIn(location)
  \`\`\`

- **Settings Integration**: The check-in interval can be configured in the app settings
  \`\`\`typescript
  // In app/settings/page.tsx
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
      onValueChange={(value) => {
        const interval = value[0]
        setSettings({ ...settings, checkInInterval: interval })
        mockDataService.updateSettings({ ...settings, checkInInterval: interval })
      }}
    />
  </div>
  \`\`\`

---

## 5. Interactive Safety Map

### Feature
The Interactive Safety Map displays the user's current location along with safety ratings for surrounding areas, allowing users to view and contribute safety information for specific locations.

### Why It Is Needed
Women need:
- Visual representation of safety levels in different areas
- Ability to plan routes through safer areas
- Community-contributed safety information
- Ability to share their own experiences to help others
- Real-time location awareness with safety context

The map provides spatial awareness of safety conditions that helps women make informed decisions about their movements.

### How It Was Coded
The map is implemented as a canvas-based interactive component with multiple features:

1. **Component Structure (`components/map-view.tsx`)**:
   \`\`\`typescript
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
   
   export function MapView({ location, onCardStateChange }: MapViewProps) {
     const { theme } = useTheme()
     const { toast } = useToast()
     const canvasRef = useRef<HTMLCanvasElement>(null)
     const [safetyData, setSafetyData] = useState<SafetyData[]>([])
     // More state variables...
     
     // Component logic...
   }
   \`\`\`

2. **Canvas Rendering**:
   \`\`\`typescript
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
     // Draw safety markers
     // Draw user location pin
   }, [safetyData, dimensions, location, theme, mounted, mapOffset, zoom])
   \`\`\`

3. **Interactive Features**:
   \`\`\`typescript
   const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
     if (isDragging) return
     
     const canvas = canvasRef.current
     if (!canvas) return
     
     const rect = canvas.getBoundingClientRect()
     const x = e.clientX - rect.left
     const y = e.clientY - rect.top
     
     // Check if clicked on an existing safety marker
     const clickedMarker = safetyData.find((point) => {
       // Calculate distance and check if within marker radius
     })
     
     if (clickedMarker) {
       // Show details of existing marker
       setSelectedSafetyData(clickedMarker)
       setShowSafetyDetails(true)
       
       // Notify parent that card is opened
       onCardStateChange?.(true)
     } else {
       // Create new marker
       // Convert click position to lat/lng
       setSelectedMarker({
         lat: clickLat,
         lng: clickLng,
         x,
         y,
       })
       setShowRatingCard(true)
       
       // Notify parent that card is opened
       onCardStateChange?.(true)
     }
   }
   \`\`\`

4. **Safety Rating System**:
   \`\`\`typescript
   const handleSaveRating = () => {
     if (!selectedMarker) return
     
     // In a real app, this would save to a database
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
     setShowRatingCard(false)
     setSelectedMarker(null)
     setRatingInput({ score: 5, comment: "" })
     
     // Notify parent that card is closed
     onCardStateChange?.(false)
     
     toast({
       title: "Safety Rating Saved",
       description: "Thank you for contributing to community safety.",
     })
   }
   \`\`\`

### How It Connects to the Rest of the Code
- **Home Screen Integration**: A simplified map view is displayed on the home screen
  \`\`\`typescript
  // In components/home-screen.tsx
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="glass-card p-6"
    style={{ height: "300px" }}
  >
    <h2 className="text-xl font-semibold mb-4 text-primary-foreground">Your Location</h2>
    <div className="h-[220px]">
      <MapView location={location} />
    </div>
  </motion.div>
  \`\`\`

- **Dedicated Map Page**: A full-featured map page provides expanded functionality
  \`\`\`typescript
  // In app/map/page.tsx
  export default function MapPage() {
    const [location, setLocation] = useState(DEFAULT_LOCATION)
    const [searchQuery, setSearchQuery] = useState("")
    const [mounted, setMounted] = useState(false)
    const [isCardOpen, setIsCardOpen] = useState(false)
    
    // Component logic...
    
    return (
      <div className="container py-6 relative">
        <h1 className="text-2xl font-bold mb-6">Safety Map</h1>
        
        <div className="glass-card p-4 mb-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            {/* Search form */}
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
  \`\`\`

- **Location Data Flow**: Uses the location data from the home screen or map page
  \`\`\`typescript
  <MapView location={location} onCardStateChange={setIsCardOpen} />
  \`\`\`

- **Theme Integration**: Respects the app's theme settings for map rendering
  \`\`\`typescript
  const { theme } = useTheme()
  // Later in the component
  const isDark = theme === "dark"
  const bgColor = isDark ? "#1a1a2e" : "#e5e7eb"
  \`\`\`

- **Toast Notifications**: Provides user feedback through the toast notification system
  \`\`\`typescript
  toast({
    title: "Safety Rating Saved",
    description: "Thank you for contributing to community safety.",
  })
  \`\`\`

---

## 6. User Profile & Verification

### Feature
The User Profile & Verification system allows users to create and manage their personal profile and verify their identity through Aadhaar (India's national ID system) to enhance trust and safety within the app.

### Why It Is Needed
Women need:
- A way to establish their identity within the safety ecosystem
- Trust signals when sharing safety information with others
- Secure storage of personal and emergency information
- Control over their privacy and data sharing preferences

Identity verification increases trust in the platform and helps ensure that safety information comes from legitimate users.

### How It Was Coded
The User Profile feature is implemented with verification capabilities:

1. **Component Structure (`components/user-profile.tsx`)**:
   \`\`\`typescript
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
     
     // Component logic...
   }
   \`\`\`

2. **User Data Loading**:
   \`\`\`typescript
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
   \`\`\`

3. **Verification Process**:
   \`\`\`typescript
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
   \`\`\`

4. **UI Implementation**:
   \`\`\`typescript
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
                 <span>Verify Identity</span>
               </Button>
             </DialogTrigger>
             <DialogContent>
               {/* Verification dialog content */}
             </DialogContent>
           </Dialog>
         )}
       </div>
     </motion.div>
   )
   \`\`\`

### How It Connects to the Rest of the Code
- **Home Screen Integration**: The User Profile is displayed at the top of the home screen
  \`\`\`typescript
  // In components/home-screen.tsx
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <UserProfile isVerified={isVerified} onVerify={handleVerification} />
  </motion.div>
  \`\`\`

- **State Management**: The home screen manages the verification state
  \`\`\`typescript
  const [isVerified, setIsVerified] = useState(false)
  
  const handleVerification = () => {
    setIsVerified(true)
  }
  \`\`\`

- **Navigation Integration**: The verification status is displayed in the main navigation
  \`\`\`typescript
  // In components/main-nav.tsx
  {isVerified && (
    <Badge variant="outline" className="ml-2 bg-secondary bg-opacity-30">
      Verified
    </Badge>
  )}
  \`\`\`

- **Data Services Integration**: Uses the mock data service for verification
  \`\`\`typescript
  await mockDataService.verifyAadhaar(aadhaarNumber)
  \`\`\`

- **Profile Page Integration**: Expanded profile information is available on the dedicated profile page
  \`\`\`typescript
  // In app/profile/page.tsx
  export default function ProfilePage() {
    // Profile page implementation
  }
  \`\`\`

---

## 7. Emergency Contacts Management

### Feature
The Emergency Contacts Management system allows users to add, edit, and remove trusted contacts who will be notified in case of emergency situations.

### Why It Is Needed
Women need:
- A way to designate trusted individuals who can help in emergencies
- Quick access to contact these individuals
- Ability to manage and update their emergency network
- Confidence that help is just one button press away

Emergency contacts are a critical component of the safety ecosystem, providing the human response network that complements the app's technological features.

### How It Was Coded
The Emergency Contacts feature is implemented as a CRUD interface:

1. **Component Structure (`components/emergency-contacts.tsx`)**:
   \`\`\`typescript
   interface Contact {
     id: string
     name: string
     phone: string
     email: string
     relation: string
   }
   
   export function EmergencyContacts() {
     const { toast } = useToast()
     const [contacts, setContacts] = useState<Contact[]>([])
     const [isDialogOpen, setIsDialogOpen] = useState(false)
     const [newContact, setNewContact] = useState({ name: "", phone: "", email: "", relation: "" })
     const [loading, setLoading] = useState(true)
     
     // Component logic...
   }
   \`\`\`

2. **Loading Contacts**:
   \`\`\`typescript
   useEffect(() => {
     const loadContacts = async () => {
       try {
         const contactsData = await mockDataService.getEmergencyContacts()
         setContacts(contactsData)
       } catch (error) {
         console.error("Error loading contacts:", error)
       } finally {
         setLoading(false)
       }
     }
     
     loadContacts()
   }, [])
   \`\`\`

3. **Adding Contacts**:
   \`\`\`typescript
   const handleAddContact = async (e: React.FormEvent) => {
     e.preventDefault()
     
     if (!newContact.name || (!newContact.phone && !newContact.email)) {
       toast({
         title: "Missing Information",
         description: "Please provide a name and either a phone number or email.",
         variant: "destructive",
       })
       return
     }
     
     try {
       // Add contact
       const contact = await mockDataService.addEmergencyContact({
         name: newContact.name,
         phone: newContact.phone,
         email: newContact.email || "sreejitc2019@gmail.com", // Use provided email or default
         relation: newContact.relation || "Other",
       })
       
       // Update local state
       setContacts([...contacts, contact])
       
       setNewContact({ name: "", phone: "", email: "", relation: "" })
       setIsDialogOpen(false)
       
       toast({
         title: "Contact Added",
         description: `${newContact.name} has been added to your emergency contacts.`,
       })
     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message,
         variant: "destructive",
       })
     }
   }
   \`\`\`

4. **Deleting Contacts**:
   \`\`\`typescript
   const handleDeleteContact = async (id: string) => {
     try {
       // Delete contact
       await mockDataService.deleteEmergencyContact(id)
       
       // Update local state
       setContacts(contacts.filter((contact) => contact.id !== id))
       
       toast({
         title: "Contact Removed",
         description: "The contact has been removed from your emergency contacts.",
       })
     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message,
         variant: "destructive",
       })
     }
   }
   \`\`\`

5. **UI Implementation**:
   \`\`\`typescript
   return (
     <motion.div
       className="glass-card p-6 rounded-2xl"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ duration: 0.3 }}
     >
       <div className="flex items-center justify-between mb-4">
         <div className="flex items-center">
           <Phone className="mr-2 h-5 w-5 text-primary-foreground" />
           <h3 className="font-medium">Emergency Contacts</h3>
         </div>
         
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
             <Button variant="outline" size="sm">
               <Plus className="h-4 w-4 mr-1" />
               Add Contact
             </Button>
           </DialogTrigger>
           <DialogContent>
             {/* Add contact form */}
           </DialogContent>
         </Dialog>
       </div>
       
       <div className="space-y-3">
         {/* Contact list */}
       </div>
     </motion.div>
   )
   \`\`\`

### How It Connects to the Rest of the Code
- **Home Screen Integration**: The Emergency Contacts component is displayed at the bottom of the home screen
  \`\`\`typescript
  // In components/home-screen.tsx
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    <EmergencyContacts />
  </motion.div>
  \`\`\`

- **SOS Integration**: Emergency contacts are notified when the SOS button is activated
  \`\`\`typescript
  // In components/sos-button.tsx
  // Send email notification
  const emailTo = "sreejitc2019@gmail.com" // Would be emergency contact email
  const subject = "EMERGENCY SOS ALERT"
  const body = `
    Emergency SOS alert triggered!
    
    User: Priya Sharma
    Time: ${new Date().toLocaleString()}
    Location: https://www.google.com/maps?q=${location.lat},${location.lng}
    
    This is an automated emergency alert. The user may be in danger and requires immediate assistance.
  `.trim()
  
  await sendEmail(emailTo, subject, body)
  \`\`\`

- **Guardian Mode Integration**: Emergency contacts are used as guardians in Guardian Mode
  \`\`\`typescript
  // In components/guardian-mode.tsx
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
  \`\`\`

- **Data Services Integration**: Uses the mock data service for CRUD operations
  \`\`\`typescript
  const contactsData = await mockDataService.getEmergencyContacts()
  const contact = await mockDataService.addEmergencyContact({...})
  await mockDataService.deleteEmergencyContact(id)
  \`\`\`

- **Toast Notifications**: Provides user feedback through the toast notification system
  \`\`\`typescript
  toast({
    title: "Contact Added",
    description: `${newContact.name} has been added to your emergency contacts.`,
  })
