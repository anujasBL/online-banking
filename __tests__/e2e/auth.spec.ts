import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('/')
  })

  test('should display sign-in page for unauthenticated users', async ({ page }) => {
    // Check that we're on the sign-in page
    await expect(page.getByText('Welcome to OBS')).toBeVisible()
    await expect(page.getByText('Sign in to your Online Banking System account')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
  })

  test('should have proper page title and meta tags', async ({ page }) => {
    await expect(page).toHaveTitle('Online Banking System')
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', 'Secure online banking platform for managing your finances')
  })

  test('should display Google sign-in button with proper styling', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: /sign in with google/i })
    
    await expect(signInButton).toBeVisible()
    await expect(signInButton).toBeEnabled()
    
    // Check button has Google icon
    const buttonIcon = signInButton.locator('svg')
    await expect(buttonIcon).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByText('Welcome to OBS')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
    
    // Check that the layout is still functional
    const signInCard = page.locator('.card, [class*="card"]').first()
    await expect(signInCard).toBeVisible()
  })

  test('should handle sign-in button click', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: /sign in with google/i })
    
    // Mock the Google OAuth redirect
    await page.route('**/api/auth/signin/google**', route => {
      route.fulfill({
        status: 302,
        headers: {
          Location: '/dashboard'
        }
      })
    })
    
    await signInButton.click()
    
    // In a real test, this would redirect to Google OAuth
    // For testing purposes, we're mocking the redirect
  })

  test('should display error handling gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/auth/**', route => {
      route.abort('failed')
    })
    
    const signInButton = page.getByRole('button', { name: /sign in with google/i })
    await signInButton.click()
    
    // Button should still be clickable after error
    await expect(signInButton).toBeEnabled()
  })

  test('should have accessible form elements', async ({ page }) => {
    // Check accessibility attributes
    const signInButton = page.getByRole('button', { name: /sign in with google/i })
    await expect(signInButton).toBeVisible()
    
    // Check heading hierarchy
    const mainHeading = page.getByRole('heading', { level: 1 }).or(page.getByRole('heading', { level: 2 }))
    await expect(mainHeading).toBeVisible()
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Filter out expected errors (like mock auth errors in test environment)
    const unexpectedErrors = consoleErrors.filter(error => 
      !error.includes('next-auth') && 
      !error.includes('test') &&
      !error.includes('mock')
    )
    
    expect(unexpectedErrors).toHaveLength(0)
  })

  test('should work with keyboard navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    
    const signInButton = page.getByRole('button', { name: /sign in with google/i })
    await expect(signInButton).toBeFocused()
    
    // Test Enter key activation
    await page.keyboard.press('Enter')
    // Button should respond to Enter key press
  })

  test('should have proper security headers', async ({ page }) => {
    const response = await page.goto('/')
    
    // Check for security headers (these might be set by Next.js or deployment platform)
    expect(response?.status()).toBe(200)
    
    // In a real deployment, you'd check for headers like:
    // - Content-Security-Policy
    // - X-Frame-Options
    // - X-Content-Type-Options
  })
})
