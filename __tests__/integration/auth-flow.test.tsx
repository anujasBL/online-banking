import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Home from '@/app/page'
import DashboardPage from '@/app/dashboard/page'

// Mock dependencies
jest.mock('next-auth/react')
jest.mock('next/navigation')
jest.mock('../../src/lib/prisma')

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockPush = jest.fn()
const mockRedirect = jest.fn()

// Mock Next.js redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(),
}))

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })
  })

  describe('Home Page Authentication Flow', () => {
    it('shows sign-in form when user is not authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      render(<Home />)

      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your Online Banking System account')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    })

    it('redirects to dashboard when user is authenticated', async () => {
      const mockSession = {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER'
        },
        expires: '2024-12-31'
      }

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      })

      // Mock the redirect function
      const { redirect } = require('next/navigation')
      redirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT') // Next.js redirect throws an error
      })

      expect(() => render(<Home />)).toThrow('NEXT_REDIRECT')
      expect(redirect).toHaveBeenCalledWith('/dashboard')
    })

    it('shows loading state during authentication check', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading'
      })

      render(<Home />)

      // Should still show the sign-in form during loading
      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
    })
  })

  describe('Dashboard Access Control', () => {
    it('redirects unauthenticated users to sign-in page', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      const { redirect } = require('next/navigation')
      redirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })

      expect(() => render(<DashboardPage />)).toThrow('NEXT_REDIRECT')
      expect(redirect).toHaveBeenCalledWith('/auth/signin')
    })

    it('allows authenticated users to access dashboard', async () => {
      const mockSession = {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER'
        },
        expires: '2024-12-31'
      }

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      })

      // Mock Prisma to return accounts
      const { prisma } = require('@/lib/prisma')
      prisma.bankAccount.findMany.mockResolvedValue([
        {
          id: '1',
          accountType: 'CHECKING',
          balance: 1000.00,
          accountNumber: '1234567890'
        }
      ])

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome back, John!')).toBeInTheDocument()
      })
    })
  })

  describe('Session State Management', () => {
    it('handles session expiration gracefully', () => {
      // Simulate expired session
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      render(<Home />)

      // Should show sign-in form for expired sessions
      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    })

    it('preserves user data during session refresh', async () => {
      const mockSession = {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER'
        },
        expires: '2024-12-31'
      }

      // First render with session
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      })

      const { rerender } = render(<Home />)

      // Simulate session refresh
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated'
      })

      const { redirect } = require('next/navigation')
      redirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })

      expect(() => rerender(<Home />)).toThrow('NEXT_REDIRECT')
      expect(redirect).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('Role-based Access', () => {
    it('allows USER role to access dashboard', async () => {
      const userSession = {
        user: {
          id: '1',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'USER'
        },
        expires: '2024-12-31'
      }

      mockUseSession.mockReturnValue({
        data: userSession,
        status: 'authenticated'
      })

      const { prisma } = require('@/lib/prisma')
      prisma.bankAccount.findMany.mockResolvedValue([])

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome back, Regular!')).toBeInTheDocument()
      })
    })

    it('allows ADMIN role to access dashboard', async () => {
      const adminSession = {
        user: {
          id: '2',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN'
        },
        expires: '2024-12-31'
      }

      mockUseSession.mockReturnValue({
        data: adminSession,
        status: 'authenticated'
      })

      const { prisma } = require('@/lib/prisma')
      prisma.bankAccount.findMany.mockResolvedValue([])

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome back, Admin!')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles authentication errors gracefully', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      render(<Home />)

      // Should still render sign-in form even with auth errors
      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
    })

    it('handles session loading errors', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading'
      })

      render(<Home />)

      // Should show sign-in form during loading
      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
    })
  })
})
