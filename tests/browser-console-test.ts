/**
 * Women's Safety App - Browser Console Test
 *
 * Copy and paste these functions into your browser console to test
 * specific features of the app.
 */

// Test the SOS button programmatically
function testSOS() {
  // Find the SOS button
  const sosButton = document.querySelector('button:has(> div > span:contains("SOS"))')
  if (!sosButton) {
    console.error("SOS button not found")
    return
  }

  // Simulate press and hold
  console.log("Simulating SOS button press...")
  const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true })
  sosButton.dispatchEvent(mouseDownEvent)

  // Wait 3 seconds then check result
  setTimeout(() => {
    console.log("SOS should be triggered now")
  }, 3000)
}

// Test adding an emergency contact
function testAddContact() {
  // Find and click the Add Contact button
  const addButton = Array.from(document.querySelectorAll("button")).find((button) =>
    button.textContent?.includes("Add Contact"),
  )

  if (!addButton) {
    console.error("Add Contact button not found")
    return
  }

  console.log("Clicking Add Contact button...")
  addButton.click()

  // Wait for dialog to open
  setTimeout(() => {
    // Fill in the form
    const nameInput = document.querySelector("input#name")
    const phoneInput = document.querySelector("input#phone")
    const emailInput = document.querySelector("input#email")
    const relationInput = document.querySelector("input#relation")

    if (!nameInput || !phoneInput || !emailInput || !relationInput) {
      console.error("Form inputs not found")
      return
    }

    // Set values
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(nameInput, "Console Test")
    nameInput.dispatchEvent(new Event("input", { bubbles: true }))

    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(phoneInput, "XXXXXXXXXX")
    phoneInput.dispatchEvent(new Event("input", { bubbles: true }))

    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(
      emailInput,
      "console@test.com",
    )
    emailInput.dispatchEvent(new Event("input", { bubbles: true }))

    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(relationInput, "Test")
    relationInput.dispatchEvent(new Event("input", { bubbles: true }))

    console.log("Form filled, submitting...")

    // Find and click submit button
    const submitButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Add Contact" && button.closest("form"),
    )

    if (submitButton) {
      submitButton.click()
      console.log("Form submitted")
    } else {
      console.error("Submit button not found")
    }
  }, 500)
}

// Test toggling guardian mode
function testGuardianMode() {
  // Find the guardian mode switch
  const guardianSwitch = document.querySelector("#guardian-mode")
  if (!guardianSwitch) {
    console.error("Guardian mode switch not found")
    return
  }

  console.log("Current guardian mode state:", guardianSwitch.checked)
  console.log("Toggling guardian mode...")

  // Toggle the switch
  guardianSwitch.click()

  console.log("New guardian mode state:", guardianSwitch.checked)
}

// Test safety check-in
function testCheckIn() {
  // Find the check-in button
  const checkInButton = Array.from(document.querySelectorAll("button")).find((button) =>
    button.textContent?.includes("Check In Now"),
  )

  if (!checkInButton) {
    console.error("Check In button not found")
    return
  }

  console.log("Clicking Check In Now button...")
  checkInButton.click()
}

// To run these tests, paste the following in your browser console:
// testSOS()
// testAddContact()
// testGuardianMode()
// testCheckIn()
