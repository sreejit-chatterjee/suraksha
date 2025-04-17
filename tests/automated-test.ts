/**
 * Women's Safety App - Automated Test Example
 *
 * This file demonstrates how you could write automated tests for the app
 * using a testing library like Jest and React Testing Library.
 *
 * Note: This is a demonstration and would need to be adapted to your
 * actual testing setup.
 */

// Example of how automated tests might look
// You would need to install Jest and React Testing Library to run these

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { HomeScreen } from "../components/home-screen"
import { mockDataService } from "../lib/supabase"

// Mock the dependencies
jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "user-123", email: "demo@example.com" } },
      }),
    },
  },
  mockDataService: {
    getUserProfile: jest.fn().mockResolvedValue({
      id: "user-123",
      full_name: "Priya Sharma",
      email: "demo@example.com",
      aadhaar_verified: false,
    }),
    getEmergencyContacts: jest.fn().mockResolvedValue([
      {
        id: "contact-1",
        name: "Mom",
        phone: "+91 98765 43210",
        email: "sreejitc2019@gmail.com",
        relation: "Family",
      },
    ]),
    getGuardianMode: jest.fn().mockResolvedValue({ isActive: false }),
    updateGuardianMode: jest.fn().mockResolvedValue({ isActive: true }),
    getSafetyScore: jest.fn().mockResolvedValue(7),
    addEmergencyContact: jest.fn().mockImplementation((contact) => {
      return Promise.resolve({
        id: "new-contact-id",
        ...contact,
      })
    }),
    deleteEmergencyContact: jest.fn().mockResolvedValue(true),
    triggerSOS: jest.fn().mockResolvedValue({ success: true }),
    recordCheckIn: jest.fn().mockResolvedValue({ success: true }),
    verifyAadhaar: jest.fn().mockResolvedValue({ success: true }),
  },
}))

// Mock the hooks
jest.mock("../hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock("../hooks/use-mobile", () => ({
  useMobile: () => false,
}))

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest
    .fn()
    .mockImplementation((success) => success({ coords: { latitude: 19.033, longitude: 73.0297 } })),
}
global.navigator.geolocation = mockGeolocation

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders all main components", async () => {
    render(<HomeScreen />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Welcome, Priya Sharma/i)).toBeInTheDocument()
    })

    // Check main components are rendered
    expect(screen.getByText("Your Safety Status")).toBeInTheDocument()
    expect(screen.getByText("SOS")).toBeInTheDocument()
    expect(screen.getByText("Guardian Mode")).toBeInTheDocument()
    expect(screen.getByText("Safety Check-In")).toBeInTheDocument()
    expect(screen.getByText("Emergency Contacts")).toBeInTheDocument()
  })

  test("toggles guardian mode", async () => {
    render(<HomeScreen />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Guardian Mode/i)).toBeInTheDocument()
    })

    // Find and click the guardian mode toggle
    const guardianToggle = screen.getByRole("switch", { name: /Guardian Mode/i })
    fireEvent.click(guardianToggle)

    // Check if the service was called
    expect(mockDataService.updateGuardianMode).toHaveBeenCalledWith(true)
  })

  test("adds emergency contact", async () => {
    render(<HomeScreen />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Emergency Contacts/i)).toBeInTheDocument()
    })

    // Click add contact button
    const addButton = screen.getByRole("button", { name: /Add Contact/i })
    fireEvent.click(addButton)

    // Fill the form
    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()
    })

    userEvent.type(screen.getByLabelText(/Name/i), "Friend")
    userEvent.type(screen.getByLabelText(/Phone Number/i), "XXXXXXXXXX")
    userEvent.type(screen.getByLabelText(/Email/i), "friend@example.com")
    userEvent.type(screen.getByLabelText(/Relation/i), "Friend")

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /^Add Contact$/i })
    fireEvent.click(submitButton)

    // Check if the service was called with correct data
    expect(mockDataService.addEmergencyContact).toHaveBeenCalledWith({
      name: "Friend",
      phone: "XXXXXXXXXX",
      email: "friend@example.com",
      relation: "Friend",
    })
  })

  test("triggers SOS when button is held", async () => {
    jest.useFakeTimers()
    render(<HomeScreen />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/SOS/i)).toBeInTheDocument()
    })

    // Find SOS button
    const sosButton = screen.getByText(/SOS/i).closest("button")
    expect(sosButton).toBeInTheDocument()

    // Press and hold
    fireEvent.mouseDown(sosButton!)

    // Fast-forward timers
    jest.advanceTimersByTime(3000)

    // Check if SOS was triggered
    expect(mockDataService.triggerSOS).toHaveBeenCalled()

    jest.useRealTimers()
  })
})
