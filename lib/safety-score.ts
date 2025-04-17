interface LocationData {
  lat: number
  lng: number
}

interface SafetyFactors {
  timeOfDay: number // 0-10, lower at night
  crimeRate: number // 0-10, lower in high crime areas
  crowdedness: number // 0-10, higher in crowded areas
  lighting: number // 0-10, higher in well-lit areas
  knownSafeZones: number // 0-10, higher near police stations, etc.
}

export function calculateSafetyScore(location: LocationData): number {
  // Get current time to factor in time of day
  const currentHour = new Date().getHours()

  // Time of day factor (lower at night)
  let timeOfDayScore = 10
  if (currentHour >= 22 || currentHour <= 5) {
    timeOfDayScore = 5 // Night time (10 PM - 5 AM)
  } else if (currentHour >= 18 || currentHour <= 7) {
    timeOfDayScore = 7 // Evening/early morning
  }

  // Mock crime rate based on location
  // In a real app, this would come from a crime data API
  const crimeRateScore = mockCrimeRate(location)

  // Mock crowdedness based on location and time
  // In a real app, this would come from location data API
  const crowdednessScore = mockCrowdedness(location, currentHour)

  // Mock lighting based on location and time
  const lightingScore = currentHour >= 18 || currentHour <= 6 ? 6 : 9

  // Mock known safe zones
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

// Mock functions to simulate real data
function mockCrimeRate(location: LocationData): number {
  // This would normally use real crime data
  // For demo, generate a score based on location
  const baseScore = 7

  // Add some variation based on coordinates
  const latVariation = Math.sin(location.lat * 10) * 2
  const lngVariation = Math.cos(location.lng * 10) * 2

  return Math.max(1, Math.min(10, baseScore + latVariation + lngVariation))
}

function mockCrowdedness(location: LocationData, hour: number): number {
  // Base score depends on time of day
  let baseScore = 7

  // Busier during day, less crowded at night
  if (hour >= 9 && hour <= 17) {
    baseScore = 8 // Daytime
  } else if (hour >= 18 && hour <= 22) {
    baseScore = 7 // Evening
  } else {
    baseScore = 4 // Night
  }

  // Add some variation based on location
  const variation = (Math.sin(location.lat + location.lng) + 1) * 2

  return Math.max(1, Math.min(10, baseScore + variation))
}

function mockSafeZones(location: LocationData): number {
  // This would normally check proximity to police stations, hospitals, etc.
  // For demo, generate a score based on location
  const baseScore = 6

  // Add some variation based on coordinates
  const variation = Math.cos(location.lat * location.lng) * 3

  return Math.max(1, Math.min(10, baseScore + variation))
}
