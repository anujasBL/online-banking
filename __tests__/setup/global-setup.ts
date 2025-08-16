import { chromium, FullConfig } from "@playwright/test"

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global test setup...")

  // Set up test environment variables
  // Node environment is already set to test
  process.env.NEXTAUTH_SECRET = "test-secret-key-for-e2e-tests"
  process.env.NEXTAUTH_URL = "http://localhost:3000"
  process.env.DATABASE_URL =
    "postgresql://test:test@localhost:5432/online_banking_test"

  // Create a browser instance for setup tasks
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Wait for the application to be ready
    console.log("⏳ Waiting for application to be ready...")

    // Try to connect to the application
    let retries = 30
    let appReady = false

    while (retries > 0 && !appReady) {
      try {
        const response = await page.goto("http://localhost:3000", {
          waitUntil: "networkidle",
          timeout: 5000,
        })

        if (response && response.status() === 200) {
          appReady = true
          console.log("✅ Application is ready!")
        }
      } catch (error) {
        console.log(`⏳ Application not ready yet, retries left: ${retries}`)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        retries--
      }
    }

    if (!appReady) {
      throw new Error("❌ Application failed to start within timeout period")
    }

    // Additional setup tasks could go here:
    // - Database seeding
    // - Authentication setup
    // - Mock service configuration

    console.log("✅ Global setup completed successfully!")
  } catch (error) {
    console.error("❌ Global setup failed:", error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}

export default globalSetup
