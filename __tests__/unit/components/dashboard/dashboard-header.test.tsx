import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession, signOut } from 'next-auth/react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

// Mock next-auth
jest.mock('next-auth/react')
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: 'light'
  })
}))

const mockSession = {
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    image: 'https://example.com/avatar.jpg',
    role: 'USER'
  },
  expires: '2024-12-31'
}

describe('DashboardHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignOut.mockResolvedValue({ url: '/' })
  })

  it('renders header with app title', () => {
    mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' })
    
    render(<DashboardHeader />)
    
    expect(screen.getByText('Online Banking System')).toBeInTheDocument()
  })

  it('displays user avatar and name when authenticated', () => {
    mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' })
    
    render(<DashboardHeader />)
    
    // Find the avatar button specifically
    const avatarButton = screen.getAllByRole('button').find(button => 
      button.className.includes('rounded-full')
    )
    expect(avatarButton).toBeDefined()
    
    // Check that the avatar shows the user's initial
    expect(screen.getByText('J')).toBeInTheDocument() // First letter of "John"
  })

  it('shows user initials when no image is provided', () => {
    const sessionWithoutImage = {
      ...mockSession,
      user: { ...mockSession.user, image: null }
    }
    mockUseSession.mockReturnValue({ data: sessionWithoutImage, status: 'authenticated' })
    
    render(<DashboardHeader />)
    
    // Check that the initial is displayed in the avatar (without clicking)
    expect(screen.getByText('J')).toBeInTheDocument() // First letter of "John"
  })

  it('handles user with no name gracefully', () => {
    const sessionWithoutName = {
      ...mockSession,
      user: { ...mockSession.user, name: null }
    }
    mockUseSession.mockReturnValue({ data: sessionWithoutName, status: 'authenticated' })
    
    render(<DashboardHeader />)
    
    // Find the avatar button specifically
    const avatarButton = screen.getAllByRole('button').find(button => 
      button.className.includes('rounded-full')
    )
    expect(avatarButton).toBeDefined()
    fireEvent.click(avatarButton!)
    
    expect(screen.getByText('U')).toBeInTheDocument() // Default fallback
  })

  it('has clickable avatar button', () => {
    mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' })
    
    render(<DashboardHeader />)
    
    // Find the avatar button specifically (the one with rounded-full class)
    const avatarButton = screen.getAllByRole('button').find(button => 
      button.className.includes('rounded-full')
    )
    expect(avatarButton).toBeDefined()
    expect(avatarButton).toBeEnabled()
  })

  it('includes theme toggle component', () => {
    mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' })
    
    render(<DashboardHeader />)
    
    // Theme toggle button should be present (sun/moon icon)
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeToggle).toBeInTheDocument()
  })

  it('has proper header styling and layout', () => {
    mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' })
    
    render(<DashboardHeader />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('border-b')
    
    const container = header.querySelector('.container')
    expect(container).toHaveClass('flex', 'h-16', 'items-center', 'justify-between')
  })

  it('renders when no session is available', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    
    render(<DashboardHeader />)
    
    expect(screen.getByText('Online Banking System')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('renders both theme toggle and avatar buttons', () => {
    mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' })
    
    render(<DashboardHeader />)
    
    // Should have theme toggle button
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeToggle).toBeInTheDocument()
    
    // Should have avatar button
    const avatarButton = screen.getAllByRole('button').find(button => 
      button.className.includes('rounded-full')
    )
    expect(avatarButton).toBeDefined()
  })
})
