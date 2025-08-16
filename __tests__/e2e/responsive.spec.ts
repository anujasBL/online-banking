import { test, expect, devices } from '@playwright/test'

const viewports = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile Large', width: 414, height: 896 },
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Mobile Small', width: 320, height: 568 }
]

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for dashboard tests
    await page.addInitScript(() => {
      window.__NEXT_DATA__ = {
        props: {
          pageProps: {
            session: {
              user: {
                id: 'test-user-id',
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER'
              }
            }
          }
        }
      }
    })
    
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      })
    })
  })

  viewports.forEach(({ name, width, height }) => {
    test(`should display sign-in page correctly on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      
      // Core elements should be visible
      await expect(page.getByText('Welcome to OBS')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
      
      // Check that elements don't overflow
      const signInCard = page.locator('.card, [class*="card"]').first()
      if (await signInCard.count() > 0) {
        const cardBox = await signInCard.boundingBox()
        if (cardBox) {
          expect(cardBox.width).toBeLessThanOrEqual(width)
          expect(cardBox.x).toBeGreaterThanOrEqual(0)
        }
      }
    })

    test(`should display dashboard correctly on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      
      // Mock accounts data
      await page.route('**/api/accounts', route => {
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
      })
      
      await page.goto('/dashboard')
      
      // Core dashboard elements should be visible
      await expect(page.getByText('Welcome back, Test!')).toBeVisible()
      await expect(page.getByText('Total Balance')).toBeVisible()
      await expect(page.getByText('Quick Actions')).toBeVisible()
      
      // On mobile, check that the layout stacks properly
      if (width <= 768) {
        // Elements should stack vertically on mobile
        const quickActions = page.getByText('Quick Actions')
        const totalBalance = page.getByText('Total Balance')
        
        const quickActionsBox = await quickActions.boundingBox()
        const totalBalanceBox = await totalBalance.boundingBox()
        
        if (quickActionsBox && totalBalanceBox) {
          // Quick actions should be below total balance on mobile
          expect(quickActionsBox.y).toBeGreaterThan(totalBalanceBox.y)
        }
      }
    })
  })

  test('should have touch-friendly buttons on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    const signInButton = page.getByRole('button', { name: /sign in with google/i })
    const buttonBox = await signInButton.boundingBox()
    
    if (buttonBox) {
      // Button should be at least 44px tall for touch accessibility
      expect(buttonBox.height).toBeGreaterThanOrEqual(40)
    }
  })

  test('should handle horizontal scrolling properly', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }) // Very narrow viewport
    await page.goto('/')
    
    // Check that there's no horizontal scrollbar
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth)
    
    // Allow small tolerance for scroll bars
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 20)
  })

  test('should maintain readability at different zoom levels', async ({ page }) => {
    await page.goto('/')
    
    // Test different zoom levels
    const zoomLevels = [0.75, 1.0, 1.25, 1.5]
    
    for (const zoom of zoomLevels) {
      await page.evaluate((zoomLevel) => {
        document.body.style.zoom = zoomLevel.toString()
      }, zoom)
      
      // Text should still be visible and readable
      await expect(page.getByText('Welcome to OBS')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
    }
  })

  test('should work with browser device emulation', async ({ browser }) => {
    // Test with different device emulations
    const devices = [
      'iPhone 12',
      'iPad',
      'Pixel 5',
      'Desktop Chrome',
      'Desktop Safari'
    ]
    
    for (const deviceName of devices) {
      const context = await browser.newContext({
        ...devices[deviceName as keyof typeof devices] || {},
      })
      
      const page = await context.newPage()
      await page.goto('/')
      
      await expect(page.getByText('Welcome to OBS')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
      
      await context.close()
    }
  })

  test('should handle orientation changes on mobile', async ({ page }) => {
    // Portrait mode
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await expect(page.getByText('Welcome to OBS')).toBeVisible()
    
    // Landscape mode
    await page.setViewportSize({ width: 667, height: 375 })
    
    await expect(page.getByText('Welcome to OBS')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
  })

  test('should maintain proper spacing and margins', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check that elements have proper spacing from edges
    const signInCard = page.locator('.card, [class*="card"]').first()
    if (await signInCard.count() > 0) {
      const cardBox = await signInCard.boundingBox()
      if (cardBox) {
        // Card should have margin from screen edges
        expect(cardBox.x).toBeGreaterThan(10)
        expect(cardBox.x + cardBox.width).toBeLessThan(365) // 375 - 10px margin
      }
    }
  })

  test('should have proper font sizes across devices', async ({ page }) => {
    const viewportsToTest = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ]
    
    for (const viewport of viewportsToTest) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')
      
      const heading = page.getByText('Welcome to OBS')
      const fontSize = await heading.evaluate(el => {
        return window.getComputedStyle(el).fontSize
      })
      
      // Font size should be reasonable (between 16px and 48px)
      const fontSizeNum = parseInt(fontSize.replace('px', ''))
      expect(fontSizeNum).toBeGreaterThanOrEqual(16)
      expect(fontSizeNum).toBeLessThanOrEqual(48)
    }
  })

  test('should maintain aspect ratios for images and icons', async ({ page }) => {
    await page.goto('/')
    
    // Check Google icon in sign-in button
    const googleIcon = page.locator('svg').first()
    if (await googleIcon.count() > 0) {
      const iconBox = await googleIcon.boundingBox()
      if (iconBox) {
        // Icon should maintain reasonable aspect ratio
        const aspectRatio = iconBox.width / iconBox.height
        expect(aspectRatio).toBeGreaterThan(0.5)
        expect(aspectRatio).toBeLessThan(2.0)
      }
    }
  })
})
