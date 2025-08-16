import { useQuery } from '@tanstack/react-query'
import { TransactionType, TransactionStatus } from '@prisma/client'

interface TransactionFilters {
  accountId?: string
  type?: TransactionType
  status?: TransactionStatus
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
}

interface TransactionData {
  id: string
  amount: number
  description: string | null
  type: TransactionType
  status: TransactionStatus
  reference: string
  processingFee: number | null
  createdAt: string
  updatedAt: string
  processedAt: string | null
  senderAccount: {
    id: string
    accountNumber: string
    accountType: string
    user: {
      name: string | null
      email: string
    }
  } | null
  receiverAccount: {
    id: string
    accountNumber: string
    accountType: string
    user: {
      name: string | null
      email: string
    }
  } | null
  externalAccountNumber: string | null
  externalRoutingNumber: string | null
  externalBankName: string | null
}

interface TransactionResponse {
  transactions: TransactionData[]
  totalCount: number
  currentPage: number
  totalPages: number
}

/**
 * Hook to fetch transaction history
 */
export function useTransactions(filters: TransactionFilters = {}) {
  const queryParams = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString())
    }
  })

  return useQuery<TransactionResponse>({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?${queryParams.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch transactions')
      }
      
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch a specific transaction by reference
 */
export function useTransaction(reference: string) {
  return useQuery<{ transaction: TransactionData }>({
    queryKey: ['transaction', reference],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/${reference}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch transaction')
      }
      
      return response.json()
    },
    enabled: !!reference,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for real-time transaction updates
 */
export function useRecentTransactions(accountId?: string, limit = 5) {
  return useTransactions({
    accountId,
    limit,
    page: 1,
  })
}

/**
 * Helper to format transaction amount based on account perspective
 */
export function getTransactionAmount(transaction: TransactionData, accountId: string) {
  const isSender = transaction.senderAccount?.id === accountId
  const isReceiver = transaction.receiverAccount?.id === accountId
  
  if (isSender) {
    return -transaction.amount // Outgoing
  } else if (isReceiver) {
    return transaction.amount // Incoming
  }
  
  return 0
}

/**
 * Helper to get transaction direction text
 */
export function getTransactionDirection(transaction: TransactionData, accountId: string) {
  const isSender = transaction.senderAccount?.id === accountId
  const isReceiver = transaction.receiverAccount?.id === accountId
  
  if (isSender) {
    return 'Sent'
  } else if (isReceiver) {
    return 'Received'
  }
  
  return 'Unknown'
}

/**
 * Helper to get transaction counterparty
 */
export function getTransactionCounterparty(transaction: TransactionData, accountId: string) {
  const isSender = transaction.senderAccount?.id === accountId
  
  if (isSender) {
    // Show receiver info
    if (transaction.receiverAccount) {
      return {
        name: transaction.receiverAccount.user.name || 'Unknown',
        account: `****${transaction.receiverAccount.accountNumber.slice(-4)}`,
        isExternal: false
      }
    } else {
      return {
        name: transaction.externalBankName || 'External Bank',
        account: `****${transaction.externalAccountNumber?.slice(-4) || '0000'}`,
        isExternal: true
      }
    }
  } else {
    // Show sender info
    if (transaction.senderAccount) {
      return {
        name: transaction.senderAccount.user.name || 'Unknown',
        account: `****${transaction.senderAccount.accountNumber.slice(-4)}`,
        isExternal: false
      }
    } else {
      return {
        name: 'External Source',
        account: 'External',
        isExternal: true
      }
    }
  }
}
