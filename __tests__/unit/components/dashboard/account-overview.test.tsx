import { render, screen } from '@testing-library/react'
import { AccountOverview } from '@/components/dashboard/account-overview'

const mockBankAccounts = [
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

describe('AccountOverview Component', () => {
  it('renders account overview with correct total balance', () => {
    render(<AccountOverview accounts={mockBankAccounts} />)
    
    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    expect(screen.getByText('$3,500.50')).toBeInTheDocument()
    expect(screen.getByText('Across 2 accounts')).toBeInTheDocument()
  })

  it('displays checking account balance correctly', () => {
    render(<AccountOverview accounts={mockBankAccounts} />)
    
    expect(screen.getByText('Checking')).toBeInTheDocument()
    expect(screen.getAllByText('$1,000.00')).toHaveLength(2) // Summary card + individual card
    expect(screen.getByText('1 checking account')).toBeInTheDocument()
  })

  it('displays savings account balance correctly', () => {
    render(<AccountOverview accounts={mockBankAccounts} />)
    
    expect(screen.getByText('Savings')).toBeInTheDocument()
    expect(screen.getAllByText('$2,500.50')).toHaveLength(2) // Summary card + individual card
    expect(screen.getByText('1 savings account')).toBeInTheDocument()
  })

  it('shows individual account cards with masked account numbers', () => {
    render(<AccountOverview accounts={mockBankAccounts} />)
    
    expect(screen.getByText('••••7890')).toBeInTheDocument()
    expect(screen.getByText('••••4321')).toBeInTheDocument()
    
    expect(screen.getByText('Account Number: ••••••7890')).toBeInTheDocument()
    expect(screen.getByText('Account Number: ••••••4321')).toBeInTheDocument()
  })

  it('handles singular account text correctly', () => {
    const singleAccount = [mockBankAccounts[0]]
    render(<AccountOverview accounts={singleAccount} />)
    
    expect(screen.getByText('Across 1 account')).toBeInTheDocument()
    expect(screen.getByText('1 checking account')).toBeInTheDocument()
    expect(screen.getByText('0 savings accounts')).toBeInTheDocument() // Note: plural for 0
  })

  it('handles empty accounts array', () => {
    render(<AccountOverview accounts={[]} />)
    
    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    expect(screen.getAllByText('$0.00')).toHaveLength(3) // Total, Checking, Savings all show $0.00
    expect(screen.getByText('Across 0 accounts')).toBeInTheDocument()
  })

  it('renders account type labels correctly', () => {
    render(<AccountOverview accounts={mockBankAccounts} />)
    
    expect(screen.getByText('Checking Account')).toBeInTheDocument()
    expect(screen.getByText('Savings Account')).toBeInTheDocument()
  })

  it('displays account overview cards with proper structure', () => {
    render(<AccountOverview accounts={mockBankAccounts} />)
    
    // Check that cards are rendered
    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    expect(screen.getByText('Checking')).toBeInTheDocument()
    expect(screen.getByText('Savings')).toBeInTheDocument()
    
    // Check that individual account cards are rendered
    expect(screen.getByText('Checking Account')).toBeInTheDocument()
    expect(screen.getByText('Savings Account')).toBeInTheDocument()
  })

  it('calculates totals correctly with decimal precision', () => {
    const preciseAccounts = [
      { id: '1', accountType: 'CHECKING', balance: 999.99, accountNumber: '1111111111' },
      { id: '2', accountType: 'SAVINGS', balance: 0.01, accountNumber: '2222222222' }
    ]
    
    render(<AccountOverview accounts={preciseAccounts} />)
    
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
  })

  it('handles large account numbers correctly', () => {
    const accountWithLongNumber = [{
      id: '1',
      accountType: 'CHECKING',
      balance: 1000,
      accountNumber: '1234567890123456'
    }]
    
    render(<AccountOverview accounts={accountWithLongNumber} />)
    
    expect(screen.getByText('••••3456')).toBeInTheDocument()
    expect(screen.getByText('Account Number: ••••••3456')).toBeInTheDocument()
  })
})
