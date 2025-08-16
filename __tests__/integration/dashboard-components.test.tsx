import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { AccountOverview } from '@/components/dashboard/account-overview'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Prisma } from '@prisma/client'

// Mock dependencies
jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

const mockSession = {
  user: {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER'
  },
  expires: '2024-12-31'
}

// Use the component's expected interface, not Prisma's
interface BankAccount {
  id: string
  accountType: string
  balance: number
  accountNumber: string
}

const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    accountType: 'CHECKING',
    balance: 1000.00,
    accountNumber: '1234567890'
  },
  {
    id: '2',
    accountType: 'SAVINGS',
    balance: 2500.50,
    accountNumber: '0987654321'
  }
]

describe('Dashboard Components Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn()
    })
  })

  describe('AccountOverview with multiple accounts', () => {
    it('correctly displays multiple account types and balances', () => {
      render(<AccountOverview accounts={mockBankAccounts} />)

      // Check total balance display
      expect(screen.getByText('$3,500.50')).toBeInTheDocument()
      expect(screen.getByText('Across 2 accounts')).toBeInTheDocument()

      // Check individual account displays
      expect(screen.getByText('Checking')).toBeInTheDocument()
      expect(screen.getByText('Savings')).toBeInTheDocument()
      expect(screen.getAllByText('$1,000.00')).toHaveLength(2) // Summary + individual card
      expect(screen.getAllByText('$2,500.50')).toHaveLength(2) // Summary + individual card

      // Check account summaries
      expect(screen.getByText('1 checking account')).toBeInTheDocument()
      expect(screen.getByText('1 savings account')).toBeInTheDocument()
    })

    it('displays masked account numbers correctly', () => {
      render(<AccountOverview accounts={mockBankAccounts} />)

      expect(screen.getByText('••••7890')).toBeInTheDocument()
      expect(screen.getByText('••••4321')).toBeInTheDocument()
    })
  })

  describe('Dashboard Header Integration', () => {
    it('displays user information when authenticated', () => {
      render(<DashboardHeader />)

      // Should show user avatar with initials
      expect(screen.getByText('J')).toBeInTheDocument() // First letter of John
      
      // Should have theme toggle
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
    })

    it('handles unauthenticated state gracefully', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      })

      render(<DashboardHeader />)

      // Should still render theme toggle
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
      
      // Should not crash or show user-specific elements
      expect(screen.queryByText('J')).not.toBeInTheDocument()
    })
  })

  describe('QuickActions Integration', () => {
    it('renders all quick action buttons', () => {
      render(<QuickActions />)

      expect(screen.getByText('Transfer Money')).toBeInTheDocument()
      expect(screen.getByText('Pay Bills')).toBeInTheDocument()
      expect(screen.getByText('Deposit Check')).toBeInTheDocument()
      expect(screen.getByText('View Statements')).toBeInTheDocument()
    })

    it('renders buttons with proper styling', () => {
      render(<QuickActions />)

      // Check that buttons are rendered and clickable
      const transferButton = screen.getByText('Transfer Money').closest('button')
      const payBillsButton = screen.getByText('Pay Bills').closest('button')
      const depositButton = screen.getByText('Deposit Check').closest('button')
      const statementsButton = screen.getByText('View Statements').closest('button')

      expect(transferButton).toBeInTheDocument()
      expect(payBillsButton).toBeInTheDocument()
      expect(depositButton).toBeInTheDocument()
      expect(statementsButton).toBeInTheDocument()
    })
  })

  describe('RecentActivity Integration', () => {
    it('renders recent activity section with mock transactions', () => {
      render(<RecentActivity />)

      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('Initial Deposit')).toBeInTheDocument()
      expect(screen.getByText('ATM Withdrawal')).toBeInTheDocument()
      expect(screen.getByText('Direct Deposit')).toBeInTheDocument()
    })
  })

  describe('Complete Dashboard Layout Integration', () => {
    it('renders all components together without conflicts', () => {
      render(
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          <main className="container mx-auto py-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <AccountOverview accounts={mockBankAccounts} />
                <QuickActions />
              </div>
              <div className="lg:col-span-1">
                <RecentActivity />
              </div>
            </div>
          </main>
        </div>
      )

      // Verify all major sections are present
      expect(screen.getByText('$3,500.50')).toBeInTheDocument() // Account overview
      expect(screen.getByText('Transfer Money')).toBeInTheDocument() // Quick actions
      expect(screen.getByText('Recent Activity')).toBeInTheDocument() // Recent activity
      expect(screen.getByText('J')).toBeInTheDocument() // Header with user info
    })
  })

  describe('Responsive Behavior Integration', () => {
    it('maintains layout structure across different screen sizes', () => {
      render(
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          <main className="container mx-auto py-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <AccountOverview accounts={mockBankAccounts} />
                <QuickActions />
              </div>
              <div className="lg:col-span-1">
                <RecentActivity />
              </div>
            </div>
          </main>
        </div>
      )

      // Check that responsive classes are applied
      const mainContainer = screen.getByRole('main')
      expect(mainContainer).toHaveClass('container', 'mx-auto', 'py-8')

      const gridContainer = mainContainer.querySelector('.grid')
      expect(gridContainer).toHaveClass('gap-8', 'lg:grid-cols-3')
    })
  })

  describe('Account Balance Calculations', () => {
    it('correctly calculates and displays total balance', () => {
      const accounts = [
        { id: '1', accountType: 'CHECKING', balance: 1500.75, accountNumber: '1111111111' },
        { id: '2', accountType: 'SAVINGS', balance: 3200.25, accountNumber: '2222222222' },
        { id: '3', accountType: 'CHECKING', balance: 800.00, accountNumber: '3333333333' }
      ]

      render(<AccountOverview accounts={accounts} />)

      // Total should be 1500.75 + 3200.25 + 800.00 = 5501.00
      expect(screen.getByText('$5,501.00')).toBeInTheDocument()
      expect(screen.getByText('Across 3 accounts')).toBeInTheDocument()
      expect(screen.getByText('2 checking accounts')).toBeInTheDocument()
      expect(screen.getByText('1 savings account')).toBeInTheDocument()
    })

    it('handles zero and negative balances correctly', () => {
      const accounts = [
        { id: '1', accountType: 'CHECKING', balance: 0.00, accountNumber: '1111111111' },
        { id: '2', accountType: 'SAVINGS', balance: -50.25, accountNumber: '2222222222' }
      ]

      render(<AccountOverview accounts={accounts} />)

      expect(screen.getAllByText('$0.00')).toHaveLength(2) // Summary + individual card
      expect(screen.getAllByText('-$50.25')).toHaveLength(3) // Total + Savings summary + individual card
      // Total should be 0.00 + (-50.25) = -50.25
      expect(screen.getByText('Across 2 accounts')).toBeInTheDocument()
    })
  })
})
