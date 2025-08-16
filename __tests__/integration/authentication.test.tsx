import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession, signIn } from 'next-auth/react'
import { SignInForm } from '@/components/auth/signin-form'

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
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

describe('Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('SignInForm Component Integration', () => {
    it('renders sign-in form with all required elements', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      render(<SignInForm />)

      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your Online Banking System account')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    })

    it('handles Google sign-in button click', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      mockSignIn.mockResolvedValue({
        error: null,
        status: 200,
        ok: true,
        url: 'http://localhost:3000/dashboard'
      })

      render(<SignInForm />)

      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', {
          callbackUrl: '/dashboard'
        })
      })
    })

    it('displays loading state during authentication', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading'
      })

      render(<SignInForm />)

      // Component should handle loading state gracefully
      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
    })

    it('handles authentication errors gracefully', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      mockSignIn.mockResolvedValue({
        error: 'AccessDenied',
        status: 401,
        ok: false,
        url: null
      })

      render(<SignInForm />)

      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })

      // Component should remain functional even after error
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    })
  })

  describe('Session State Management', () => {
    it('handles loading session state correctly', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading'
      })
      
      render(<SignInForm />)
      
      // Should not crash with loading state
      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
    })

    it('handles unauthenticated session state correctly', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })
      
      render(<SignInForm />)
      
      // Should show sign-in form for unauthenticated users
      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    })

    it('handles authenticated session state correctly', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'USER'
          },
          expires: '2024-12-31'
        },
        status: 'authenticated'
      })
      
      render(<SignInForm />)
      
      // Should still render the form (redirect is handled at page level)
      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
    })
  })

  describe('Google OAuth Integration', () => {
    it('configures Google OAuth provider correctly', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      render(<SignInForm />)

      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      fireEvent.click(signInButton)

      expect(mockSignIn).toHaveBeenCalledWith('google', {
        callbackUrl: '/dashboard'
      })
    })

    it('handles OAuth callback URL correctly', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      render(<SignInForm />)

      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      fireEvent.click(signInButton)

      expect(mockSignIn).toHaveBeenCalledWith('google', 
        expect.objectContaining({
          callbackUrl: '/dashboard'
        })
      )
    })
  })

  describe('User Interface Integration', () => {
    it('displays proper styling and layout', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      render(<SignInForm />)

      const container = screen.getByText('Welcome to OBS').closest('div')
      expect(container).toBeInTheDocument()

      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      expect(signInButton).toBeInTheDocument()
      expect(signInButton).toBeEnabled()
    })

    it('maintains accessibility standards', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      render(<SignInForm />)

      // Check for proper ARIA roles and labels
      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      expect(signInButton).toBeInTheDocument()
      
      // Check for proper heading structure
      const heading = screen.getByRole('heading')
      expect(heading).toHaveTextContent('Welcome to OBS')
    })
  })

  describe('Authentication Flow Integration', () => {
    it('completes full authentication flow simulation', async () => {
      // Start with unauthenticated state
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      const { rerender } = render(<SignInForm />)

      // User clicks sign in
      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      fireEvent.click(signInButton)

      // Should call signIn with correct parameters
      expect(mockSignIn).toHaveBeenCalledWith('google', {
        callbackUrl: '/dashboard'
      })

      // Simulate loading state
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading'
      })

      rerender(<SignInForm />)

      // Component should handle loading state
      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()

      // Simulate successful authentication
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'USER'
          },
          expires: '2024-12-31'
        },
        status: 'authenticated'
      })

      rerender(<SignInForm />)

      // Component should still render (it doesn't handle redirect, that's done at page level)
      expect(screen.getByText('Welcome to OBS')).toBeInTheDocument()
    })
  })

  describe('Error Handling Integration', () => {
    it('calls signIn function when button is clicked', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      // Mock successful sign-in
      mockSignIn.mockResolvedValue({
        error: null,
        status: 200,
        ok: true,
        url: 'http://localhost:3000/dashboard'
      })

      render(<SignInForm />)

      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      
      // Click should call signIn
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', {
          callbackUrl: '/dashboard'
        })
      })

      // Component should remain functional
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    })

    it('handles OAuth provider errors', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      mockSignIn.mockResolvedValue({
        error: 'OAuthSignin',
        status: 400,
        ok: false,
        url: null
      })

      render(<SignInForm />)

      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })

      // Component should handle OAuth errors gracefully
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    })
  })
})
