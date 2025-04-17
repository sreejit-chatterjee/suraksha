import usersData from "@/data/users.json"
import profilesData from "@/data/profiles.json"
import emergencyContactsData from "@/data/emergency-contacts.json"
import locationHistoryData from "@/data/location-history.json"
import guardianModeData from "@/data/guardian-mode.json"
import sosEventsData from "@/data/sos-events.json"
import safetyCheckinsData from "@/data/safety-checkins.json"

// Helper function to simulate async behavior like real API calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock Supabase client with similar API structure
export const mockSupabase = {
  auth: {
    getUser: async () => {
      await delay(500)
      return { data: { user: usersData.currentUser } }
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      await delay(1000)
      // In a real app, we would validate and store the user
      return { data: {}, error: null }
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      await delay(1000)
      // In a real app, we would validate credentials
      if (email === "demo@example.com" && password === "password") {
        return { data: { user: usersData.currentUser }, error: null }
      }
      return { data: {}, error: { message: "Invalid login credentials" } }
    },
    onAuthStateChange: (callback: Function) => {
      // This would normally set up a listener
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
  },
  from: (table: string) => {
    return {
      select: (columns = "*") => {
        const selectQuery = {
          eq: async (column: string, value: any) => {
            await delay(500)

            let data: any[] = []
            let error = null

            switch (table) {
              case "profiles":
                data = profilesData.profiles.filter((profile) => profile[column as keyof typeof profile] === value)
                break
              case "emergency_contacts":
                data = emergencyContactsData.contacts.filter(
                  (contact) => contact[column as keyof typeof contact] === value,
                )
                break
              case "location_history":
                data = locationHistoryData.locations.filter(
                  (location) => location[column as keyof typeof location] === value,
                )
                break
              case "guardian_mode":
                data = guardianModeData.guardians.filter(
                  (guardian) => guardian[column as keyof typeof guardian] === value,
                )
                break
              case "sos_events":
                data = sosEventsData.events.filter((event) => event[column as keyof typeof event] === value)
                break
              case "safety_checkins":
                data = safetyCheckinsData.checkins.filter(
                  (checkin) => checkin[column as keyof typeof checkin] === value,
                )
                break
              default:
                error = { message: `Table ${table} not found` }
            }

            return {
              data,
              error,
              single: async () => {
                await delay(100)
                return { data: data.length > 0 ? data[0] : null, error }
              },
            }
          },
          single: async () => {
            await delay(500)
            let data = null
            let error = null

            switch (table) {
              case "profiles":
                data = profilesData.profiles.length > 0 ? profilesData.profiles[0] : null
                break
              case "guardian_mode":
                data = guardianModeData.guardians.length > 0 ? guardianModeData.guardians[0] : null
                break
              default:
                error = { message: `Table ${table} not found` }
            }

            return { data, error }
          },
        }

        return selectQuery
      },
      insert: async (item: any) => {
        await delay(500)

        const newId = `${table.slice(0, 3)}-${Date.now()}`
        const newItem = { id: newId, ...item, created_at: new Date().toISOString() }

        // In a real app, we would store this data
        console.log(`Inserted into ${table}:`, newItem)

        return {
          data: [newItem],
          error: null,
          select: () => ({
            data: [newItem],
            error: null,
          }),
        }
      },
      upsert: async (item: any) => {
        await delay(500)

        // In a real app, we would update or insert this data
        console.log(`Upserted into ${table}:`, item)

        return { data: item, error: null }
      },
      delete: () => {
        return {
          eq: async (column: string, value: any) => {
            await delay(500)

            // In a real app, we would delete this data
            console.log(`Deleted from ${table} where ${column} = ${value}`)

            return { error: null }
          },
        }
      },
    }
  },
  functions: {
    invoke: async (functionName: string, { body }: { body: any }) => {
      await delay(1000)

      // In a real app, this would call a Supabase Edge Function
      console.log(`Invoked function ${functionName} with:`, body)

      return { data: {}, error: null }
    },
  },
}
