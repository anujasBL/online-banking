import { test, expect } from '@playwright/test'

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      // Mock NextAuth session
      window.__NEXT_DATA__ = {
        props: {
          pageProps: {
            session: {
              user: {
                id: 'test-user-id',
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER'
              },
              expires: '2024-12-31'
            }
          }
        }
      }
    })
    
    // Mock API responses
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER'
          },
          expires: '2024-12-31'
        })
      })
    })
    
    // Mock accounts API
    await page.route('**/api/accounts', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accounts: [
              {
                id: 'account-1',
                accountType: 'CHECKING',
                balance: 1000.00,
                accountNumber: '1234567890'
              }
            ]
          })
        })
      }
    })
  })

  test('should display dashboard with user welcome message', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.getByText('Welcome back, Test!')).toBeVisible()
    await expect(page.getByText('Here\'s an overview of your accounts and recent activity.')).toBeVisible()
  })

  test('should display account overview cards', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for account overview cards
    await expect(page.getByText('Total Balance')).toBeVisible()
    await expect(page.getByText('$1,000.00')).toBeVisible()
    await expect(page.getByText('Across 1 account')).toBeVisible()
    
    await expect(page.getByText('Checking')).toBeVisible()
    await expect(page.getByText('1 checking account')).toBeVisible()
    
    await expect(page.getByText('Savings')).toBeVisible()
    await expect(page.getByText('0 savings account')).toBeVisible()
  })

  test('should display masked account numbers', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for masked account number
    await expect(page.getByText('••••7890')).toBeVisible()
    await expect(page.getByText('Account Number: ••••••7890')).toBeVisible()
  })

  test('should display quick actions section', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.getByText('Quick Actions')).toBeVisible()
    await expect(page.getByText('Transfer Money')).toBeVisible()
    await expect(page.getByText('Deposit Check')).toBeVisible()
    await expect(page.getByText('Pay Bills')).toBeVisible()
    await expect(page.getByText('View Statements')).toBeVisible()
  })

  test('should display recent activity section', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.getByText('Recent Activity')).toBeVisible()
    
    // Check for mock transactions
    await expect(page.getByText('Initial Deposit')).toBeVisible()
    await expect(page.getByText('ATM Withdrawal')).toBeVisible()
    await expect(page.getByText('Direct Deposit')).toBeVisible()
  })

  test('should have functional header with user dropdown', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check header
    await expect(page.getByText('Online Banking System')).toBeVisible()
    
    // Click user avatar to open dropdown
    const avatarButton = page.locator('button').filter({ has: page.locator('[class*="avatar"]') }).first()
    await avatarButton.click()
    
    // Check dropdown items
    await expect(page.getByText('Test User')).toBeVisible()
    await expect(page.getByText('test@example.com')).toBeVisible()
    await expect(page.getByText('Profile')).toBeVisible()
    await expect(page.getByText('Sign out')).toBeVisible()
  })

  test('should have working theme toggle', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme/i })
    await expect(themeToggle).toBeVisible()
    
    // Click to open theme menu
    await themeToggle.click()
    
    // Check theme options
    await expect(page.getByText('Light')).toBeVisible()
    await expect(page.getByText('Dark')).toBeVisible()
    await expect(page.getByText('System')).toBeVisible()
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByText('Welcome back, Test!')).toBeVisible()
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText('Welcome back, Test!')).toBeVisible()
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText('Welcome back, Test!')).toBeVisible()
    
    // Check that main sections are still visible on mobile
    await expect(page.getByText('Total Balance')).toBeVisible()
    await expect(page.getByText('Quick Actions')).toBeVisible()
  })

  test('should handle sign out functionality', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Mock sign out redirect
    await page.route('**/api/auth/signout', route => {
      route.fulfill({
        status: 302,
        headers: {
          Location: '/'
        }
      })
    })
    
    // Open user dropdown
    const avatarButton = page.locator('button').filter({ has: page.locator('[class*="avatar"]') }).first()
    await avatarButton.click()
    
    // Click sign out
    const signOutButton = page.getByText('Sign out')
    await expect(signOutButton).toBeVisible()
    await signOutButton.click()
    
    // Should redirect or show sign out confirmation
  })

  test('should display proper currency formatting', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check that amounts are properly formatted as currency
    const balanceElements = page.locator('text=/\\$[0-9,]+\\.\\d{2}/')
    await expect(balanceElements.first()).toBeVisible()
    
    // Specifically check for the $1,000.00 format
    await expect(page.getByText('$1,000.00')).toBeVisible()
  })

  test('should show account type capitalization correctly', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check that account types are properly formatted
    await expect(page.getByText('Checking Account')).toBeVisible()
    await expect(page.getByText('Checking')).toBeVisible()
  })

  test('should handle loading states gracefully', async ({ page }) => {
    // Delay API response to test loading state
    await page.route('**/api/accounts', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accounts: [
              {
                id: 'account-1',
                accountType: 'CHECKING',
                balance: 1000.00,
                accountNumber: '1234567890'
              }
            ]
          })
        })
      }, 1000) // 1 second delay
    })
    
    await page.goto('/dashboard')
    
    // Page should load even with delayed API
    await expect(page.getByText('Welcome back, Test!')).toBeVisible()
  })

  test('should have proper accessibility features', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for proper heading hierarchy
    const mainHeading = page.getByRole('heading', { level: 2 }).first()
    await expect(mainHeading).toBeVisible()
    
    // Check for button accessibility
    const buttons = page.getByRole('button')
    expect(await buttons.count()).toBeGreaterThan(0)
    
    // Check for proper link accessibility
    const links = page.getByRole('link')
    // Should have at least the logo/title as a link or other navigation
  })

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Filter out expected test-related errors
    const unexpectedErrors = consoleErrors.filter(error => 
      !error.includes('test') &&
      !error.includes('mock') &&
      !error.includes('next-auth') // NextAuth might have test warnings
    )
    
    expect(unexpectedErrors).toHaveLength(0)
  })
})
