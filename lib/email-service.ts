export async function sendEmail(to: string, subject: string, body: string) {
  // In a real app, you would use a service like SendGrid, Mailgun, etc.
  // For now, we'll simulate sending an email

  console.log(`Sending email to: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body: ${body}`)

  // For demo purposes, open the default mail client
  // This will only work in a browser environment
  try {
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, "_blank")
    return { success: true }
  } catch (error) {
    console.error("Error opening mail client:", error)
    return { success: false, error }
  }
}
