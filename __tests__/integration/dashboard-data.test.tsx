import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import DashboardPage from '@/app/dashboard/page'

// Mock dependencies
jest.mock('next-auth/react')
jest.mock('../../src/lib/prisma')
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
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

describe('Dashboard Data Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated'
    })
  })

  describe('Account Creation Flow', () => {
    it('creates default account for new user with no accounts', async () => {
      const { prisma } = require('@/lib/prisma')
      
      // Mock finding no existing accounts
      prisma.bankAccount.findMany.mockResolvedValue([])
      
      // Mock account creation
      const newAccount = {
        id: 'new-account-id',
        accountType: 'CHECKING',
        balance: 1000.00,
        accountNumber: '1234567890',
        routingNumber: '021000021'
      }
      prisma.bankAccount.create.mockResolvedValue(newAccount)

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome back, John!')).toBeInTheDocument()
      })

      // Verify account creation was called
      expect(prisma.bankAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          accountType: 'CHECKING',
          balance: 1000.00,
          accountNumber: expect.any(String),
          routingNumber: expect.any(String),
        },
      })

      // Verify account is displayed
      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument()
        expect(screen.getByText('••••7890')).toBeInTheDocument()
      })
    })

    it('displays existing accounts without creating new ones', async () => {
      const { prisma } = require('@/lib/prisma')
      
      const existingAccounts = [
        {
          id: 'account1',
          accountType: 'CHECKING',
          balance: 2500.75,
          accountNumber: '9876543210'
        },
        {
          id: 'account2',
          accountType: 'SAVINGS',
          balance: 5000.25,
          accountNumber: '1111222233'
        }
      ]
      
      prisma.bankAccount.findMany.mockResolvedValue(existingAccounts)

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome back, John!')).toBeInTheDocument()
      })

      // Verify no account creation was attempted
      expect(prisma.bankAccount.create).not.toHaveBeenCalled()

      // Verify existing accounts are displayed
      await waitFor(() => {
        expect(screen.getByText('$7,501.00')).toBeInTheDocument() // Total balance
        expect(screen.getByText('$2,500.75')).toBeInTheDocument() // Checking balance
        expect(screen.getByText('$5,000.25')).toBeInTheDocument() // Savings balance
        expect(screen.getByText('••••3210')).toBeInTheDocument() // Checking account number
        expect(screen.getByText('••••2233')).toBeInTheDocument() // Savings account number
      })
    })
  })

  describe('Balance Calculations', () => {
    it('correctly calculates total balance across multiple accounts', async () => {
      const { prisma } = require('@/lib/prisma')
      
      const accounts = [
        { id: '1', accountType: 'CHECKING', balance: 1500.00, accountNumber: '1111111111' },
        { id: '2', accountType: 'SAVINGS', balance: 3250.50, accountNumber: '2222222222' },
        { id: '3', accountType: 'CHECKING', balance: 750.25, accountNumber: '3333333333' }
      ]
      
      prisma.bankAccount.findMany.mockResolvedValue(accounts)

      render(<DashboardPage />)

      await waitFor(() => {
        // Total: 1500 + 3250.50 + 750.25 = 5500.75
        expect(screen.getByText('$5,500.75')).toBeInTheDocument()
        expect(screen.getByText('Across 3 accounts')).toBeInTheDocument()
      })
    })

    it('correctly separates checking and savings balances', async () => {
      const { prisma } = require('@/lib/prisma')
      
      const accounts = [
        { id: '1', accountType: 'CHECKING', balance: 1000.00, accountNumber: '1111111111' },
        { id: '2', accountType: 'CHECKING', balance: 500.00, accountNumber: '2222222222' },
        { id: '3', accountType: 'SAVINGS', balance: 2000.00, accountNumber: '3333333333' },
        { id: '4', accountType: 'SAVINGS', balance: 1500.00, accountNumber: '4444444444' }
      ]
      
      prisma.bankAccount.findMany.mockResolvedValue(accounts)

      render(<DashboardPage />)

      await waitFor(() => {
        // Checking total: 1000 + 500 = 1500
        expect(screen.getByText('$1,500.00')).toBeInTheDocument()
        expect(screen.getByText('2 checking accounts')).toBeInTheDocument()
        
        // Savings total: 2000 + 1500 = 3500
        expect(screen.getByText('$3,500.00')).toBeInTheDocument()
        expect(screen.getByText('2 savings accounts')).toBeInTheDocument()
      })
    })

    it('handles zero balances correctly', async () => {
      const { prisma } = require('@/lib/prisma')
      
      const accounts = [
        { id: '1', accountType: 'CHECKING', balance: 0.00, accountNumber: '1111111111' }
      ]
      
      prisma.bankAccount.findMany.mockResolvedValue(accounts)

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('$0.00')).toBeInTheDocument()
        expect(screen.getByText('Across 1 account')).toBeInTheDocument()
      })
    })
  })

  describe('Account Number Masking', () => {
    it('properly masks account numbers in display', async () => {
      const { prisma } = require('@/lib/prisma')
      
      const accounts = [
        { id: '1', accountType: 'CHECKING', balance: 1000.00, accountNumber: '1234567890' },
        { id: '2', accountType: 'SAVINGS', balance: 2000.00, accountNumber: '9876543210123456' }
      ]
      
      prisma.bankAccount.findMany.mockResolvedValue(accounts)

      render(<DashboardPage />)

      await waitFor(() => {
        // Should show last 4 digits for overview
        expect(screen.getByText('••••7890')).toBeInTheDocument()
        expect(screen.getByText('••••3456')).toBeInTheDocument()
        
        // Should show last 4 digits for detailed view
        expect(screen.getByText('Account Number: ••••••7890')).toBeInTheDocument()
        expect(screen.getByText('Account Number: ••••••3456')).toBeInTheDocument()
      })
    })
  })

  describe('Database Error Handling', () => {
    it('handles database connection errors gracefully', async () => {
      const { prisma } = require('@/lib/prisma')
      
      prisma.bankAccount.findMany.mockRejectedValue(new Error('Database connection failed'))

      // Should not crash the application
      expect(() => render(<DashboardPage />)).not.toThrow()
    })

    it('handles account creation errors gracefully', async () => {
      const { prisma } = require('@/lib/prisma')
      
      prisma.bankAccount.findMany.mockResolvedValue([])
      prisma.bankAccount.create.mockRejectedValue(new Error('Account creation failed'))

      // Should not crash the application
      expect(() => render(<DashboardPage />)).not.toThrow()
    })
  })

  describe('Data Type Conversions', () => {
    it('correctly converts Decimal balance types to numbers', async () => {
      const { prisma } = require('@/lib/prisma')
      
      // Simulate Prisma Decimal objects
      const accounts = [
        { 
          id: '1', 
          accountType: 'CHECKING', 
          balance: { toNumber: () => 1000.50 }, // Mock Decimal object
          accountNumber: '1111111111' 
        }
      ]
      
      prisma.bankAccount.findMany.mockResolvedValue(accounts)

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome back, John!')).toBeInTheDocument()
      })

      // Should handle the conversion without errors
      expect(screen.queryByText('$1,000.50')).toBeInTheDocument()
    })
  })

  describe('User Name Display', () => {
    it('displays first name correctly when full name is provided', async () => {
      const { prisma } = require('@/lib/prisma')
      prisma.bankAccount.findMany.mockResolvedValue([])
      prisma.bankAccount.create.mockResolvedValue({
        id: '1',
        accountType: 'CHECKING',
        balance: 1000.00,
        accountNumber: '1234567890'
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome back, John!')).toBeInTheDocument()
      })
    })

    it('handles single name correctly', async () => {
      const singleNameSession = {
        ...mockSession,
        user: { ...mockSession.user, name: 'Madonna' }
      }
      
      mockUseSession.mockReturnValue({
        data: singleNameSession,
        status: 'authenticated'
      })

      const { prisma } = require('@/lib/prisma')
      prisma.bankAccount.findMany.mockResolvedValue([])
      prisma.bankAccount.create.mockResolvedValue({
        id: '1',
        accountType: 'CHECKING',
        balance: 1000.00,
        accountNumber: '1234567890'
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome back, Madonna!')).toBeInTheDocument()
      })
    })
  })
})
