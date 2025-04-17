/**
 * Women's Safety App - API Test Example
 *
 * This file demonstrates how you could test the mock data service API.
 */

import { mockDataService } from "../lib/supabase"

/**
 * Test the mock data service API
 *
 * Steps:
 * 1. Run these tests in the browser console to verify the mock API works
 */

async function testMockDataService() {
  console.log("Testing Mock Data Service API...")

  try {
    // Test user profile
    console.log("1. Testing getUserProfile()")
    const profile = await mockDataService.getUserProfile()
    console.log("✅ Profile:", profile)

    // Test emergency contacts
    console.log("2. Testing getEmergencyContacts()")
    const contacts = await mockDataService.getEmergencyContacts()
    console.log("✅ Contacts:", contacts)

    // Test adding a contact
    console.log("3. Testing addEmergencyContact()")
    const newContact = await mockDataService.addEmergencyContact({
      name: "Test Contact",
      phone: "XXXXXXXXXX",
      email: "test@example.com",
      relation: "Test",
    })
    console.log("✅ Added contact:", newContact)

    // Test getting updated contacts
    console.log("4. Testing getEmergencyContacts() after adding")
    const updatedContacts = await mockDataService.getEmergencyContacts()
    console.log("✅ Updated contacts:", updatedContacts)

    // Test deleting a contact
    if (updatedContacts.length > 0) {
      console.log("5. Testing deleteEmergencyContact()")
      const deleteResult = await mockDataService.deleteEmergencyContact(updatedContacts[updatedContacts.length - 1].id)
      console.log("✅ Delete result:", deleteResult)
    }

    // Test guardian mode
    console.log("6. Testing getGuardianMode()")
    const guardianMode = await mockDataService.getGuardianMode()
    console.log("✅ Guardian mode:", guardianMode)

    console.log("7. Testing updateGuardianMode()")
    const updatedGuardianMode = await mockDataService.updateGuardianMode(true)
    console.log("✅ Updated guardian mode:", updatedGuardianMode)

    // Test safety score
    console.log("8. Testing getSafetyScore()")
    const safetyScore = await mockDataService.getSafetyScore()
    console.log("✅ Safety score:", safetyScore)

    // Test SOS
    console.log("9. Testing triggerSOS()")
    const sosResult = await mockDataService.triggerSOS({ lat: 19.033, lng: 73.0297 })
    console.log("✅ SOS result:", sosResult)

    // Test check-in
    console.log("10. Testing recordCheckIn()")
    const checkInResult = await mockDataService.recordCheckIn({ lat: 19.033, lng: 73.0297 })
    console.log("✅ Check-in result:", checkInResult)

    // Test Aadhaar verification
    console.log("11. Testing verifyAadhaar()")
    const verifyResult = await mockDataService.verifyAadhaar("123456789012")
    console.log("✅ Verify result:", verifyResult)

    console.log("✅ All tests passed!")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

// To run this test, paste the following in your browser console:
// testMockDataService()
