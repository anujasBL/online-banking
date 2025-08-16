import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/providers/theme-provider'

// Mock session data
const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  },
  expires: '2024-12-31'
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any
  initialTheme?: string
}

function AllTheProviders({ 
  children, 
  session = mockSession,
  initialTheme = 'light' 
}: { 
  children: React.ReactNode
  session?: any
  initialTheme?: string
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={initialTheme}
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { session, initialTheme, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: (props) => AllTheProviders({ 
      ...props, 
      session: session || mockSession,
      initialTheme 
    }),
    ...renderOptions,
  })
}

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  ...overrides
})

export const createMockSession = (userOverrides = {}) => ({
  user: createMockUser(userOverrides),
  expires: '2024-12-31'
})

export const createMockBankAccount = (overrides = {}) => ({
  id: 'test-account-id',
  accountType: 'CHECKING',
  balance: 1000.00,
  accountNumber: '1234567890',
  ...overrides
})

export const createMockTransaction = (overrides = {}) => ({
  id: 'test-transaction-id',
  type: 'credit',
  description: 'Test Transaction',
  amount: 100.00,
  date: new Date().toISOString(),
  ...overrides
})

// Custom matchers for testing
export const expectToHaveCurrency = (element: HTMLElement, amount: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })
  const expectedText = formatter.format(amount)
  expect(element).toHaveTextContent(expectedText)
}

export const expectToHaveMaskedAccount = (element: HTMLElement, accountNumber: string) => {
  const maskedNumber = `••••${accountNumber.slice(-4)}`
  expect(element).toHaveTextContent(maskedNumber)
}

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
})

// Common test scenarios
export const testScenarios = {
  newUser: {
    session: createMockSession(),
    accounts: []
  },
  userWithCheckingAccount: {
    session: createMockSession(),
    accounts: [createMockBankAccount()]
  },
  userWithMultipleAccounts: {
    session: createMockSession(),
    accounts: [
      createMockBankAccount({ id: '1', accountType: 'CHECKING', balance: 1500.00 }),
      createMockBankAccount({ id: '2', accountType: 'SAVINGS', balance: 2500.50 })
    ]
  },
  adminUser: {
    session: createMockSession({ role: 'ADMIN', name: 'Admin User' }),
    accounts: [createMockBankAccount()]
  }
}

// Async test helpers
export const waitForApiCall = async (mockFn: jest.Mock, timeout = 5000) => {
  const startTime = Date.now()
  while (!mockFn.mock.calls.length && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  if (!mockFn.mock.calls.length) {
    throw new Error(`API call not made within ${timeout}ms`)
  }
}

// Database test helpers
export const createTestDatabase = async () => {
  // This would set up a test database in a real test environment
  // For now, we'll just mock the database interactions
}

export const cleanupTestDatabase = async () => {
  // This would clean up the test database
}

// Environment setup
export const setupTestEnvironment = () => {
  // Set up test environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXTAUTH_SECRET = 'test-secret'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
}

// Export everything including the custom render
export * from '@testing-library/react'
export { customRender as render }
