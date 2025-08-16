import { prisma } from '@/lib/prisma'
import { sendTransferNotification, sendTransactionConfirmation } from '@/src/lib/email'
import { 
  InternalTransferInput, 
  ExternalTransferInput, 
  validateTransferAmount,
  calculateTransferFee,
  generateTransactionReference
} from '@/src/lib/validations/transfer'
import { TransactionType, TransactionStatus } from '@prisma/client'

export interface TransferResult {
  success: boolean
  transactionId?: string
  reference?: string
  error?: string
}

export interface TransactionWithDetails {
  id: string
  amount: number
  description: string | null
  type: TransactionType
  status: TransactionStatus
  reference: string
  processingFee: number | null
  createdAt: Date
  updatedAt: Date
  processedAt: Date | null
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

/**
 * Process internal transfer between accounts within the system
 */
export async function processInternalTransfer(data: InternalTransferInput): Promise<TransferResult> {
  try {
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get sender account with lock
      const senderAccount = await tx.bankAccount.findUnique({
        where: { id: data.senderAccountId },
        include: { user: true }
      })

      if (!senderAccount) {
        throw new Error('Sender account not found')
      }

      if (!senderAccount.isActive) {
        throw new Error('Sender account is inactive')
      }

      // Get receiver account
      const receiverAccount = await tx.bankAccount.findUnique({
        where: { id: data.receiverAccountId },
        include: { user: true }
      })

      if (!receiverAccount) {
        throw new Error('Receiver account not found')
      }

      if (!receiverAccount.isActive) {
        throw new Error('Receiver account is inactive')
      }

      // Validate same account transfer
      if (data.senderAccountId === data.receiverAccountId) {
        throw new Error('Cannot transfer to the same account')
      }

      // Validate balance
      const senderBalance = Number(senderAccount.balance)
      if (!validateTransferAmount(senderBalance, data.amount)) {
        throw new Error('Insufficient funds')
      }

      // Generate transaction reference
      const reference = generateTransactionReference()

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount: data.amount,
          description: data.description || `Transfer to ${receiverAccount.accountNumber.slice(-4)}`,
          type: TransactionType.INTERNAL_TRANSFER,
          status: TransactionStatus.PROCESSING,
          reference,
          senderAccountId: data.senderAccountId,
          receiverAccountId: data.receiverAccountId,
          processingFee: 0, // No fee for internal transfers
        }
      })

      // Update account balances
      await tx.bankAccount.update({
        where: { id: data.senderAccountId },
        data: { 
          balance: { decrement: data.amount },
          updatedAt: new Date()
        }
      })

      await tx.bankAccount.update({
        where: { id: data.receiverAccountId },
        data: { 
          balance: { increment: data.amount },
          updatedAt: new Date()
        }
      })

      // Complete transaction
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: TransactionStatus.COMPLETED,
          processedAt: new Date()
        }
      })

      return {
        transaction,
        senderAccount,
        receiverAccount,
        newSenderBalance: senderBalance - data.amount
      }
    })

    // Send email notifications (outside transaction)
    try {
      // Notification to sender
      await sendTransferNotification({
        to: result.senderAccount.user.email,
        userName: result.senderAccount.user.name || 'Customer',
        transactionType: 'Internal Transfer',
        amount: data.amount,
        accountNumber: result.senderAccount.accountNumber,
        reference: result.transaction.reference,
        date: new Date().toLocaleDateString(),
        balance: result.newSenderBalance,
        recipientAccount: result.receiverAccount.accountNumber,
        recipientName: result.receiverAccount.user.name || 'Customer'
      })

      // Notification to receiver
      await sendTransactionConfirmation({
        to: result.receiverAccount.user.email,
        userName: result.receiverAccount.user.name || 'Customer',
        transactionType: 'Incoming Transfer',
        amount: data.amount,
        accountNumber: result.receiverAccount.accountNumber,
        reference: result.transaction.reference,
        date: new Date().toLocaleDateString()
      })
    } catch (emailError) {
      console.error('Failed to send transfer notifications:', emailError)
      // Don't fail the transfer if email fails
    }

    return {
      success: true,
      transactionId: result.transaction.id,
      reference: result.transaction.reference
    }

  } catch (error) {
    console.error('Internal transfer failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed'
    }
  }
}

/**
 * Process external transfer to accounts outside the system
 */
export async function processExternalTransfer(data: ExternalTransferInput): Promise<TransferResult> {
  try {
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get sender account with lock
      const senderAccount = await tx.bankAccount.findUnique({
        where: { id: data.senderAccountId },
        include: { user: true }
      })

      if (!senderAccount) {
        throw new Error('Sender account not found')
      }

      if (!senderAccount.isActive) {
        throw new Error('Sender account is inactive')
      }

      // Calculate fee
      const fee = calculateTransferFee(data.amount, true)
      const totalAmount = data.amount + fee

      // Validate balance including fee
      const senderBalance = Number(senderAccount.balance)
      if (!validateTransferAmount(senderBalance, data.amount, fee)) {
        throw new Error(`Insufficient funds. Required: $${totalAmount.toFixed(2)} (including $${fee.toFixed(2)} fee)`)
      }

      // Generate transaction reference
      const reference = generateTransactionReference()

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount: data.amount,
          description: data.description || `External transfer to ${data.externalBankName}`,
          type: TransactionType.EXTERNAL_TRANSFER,
          status: TransactionStatus.PENDING, // External transfers start as pending
          reference,
          senderAccountId: data.senderAccountId,
          externalAccountNumber: data.externalAccountNumber,
          externalRoutingNumber: data.externalRoutingNumber,
          externalBankName: data.externalBankName,
          processingFee: fee,
          metadata: {
            externalTransfer: true,
            estimatedCompletionDays: '1-2'
          }
        }
      })

      // Deduct amount and fee from sender account
      await tx.bankAccount.update({
        where: { id: data.senderAccountId },
        data: { 
          balance: { decrement: totalAmount },
          updatedAt: new Date()
        }
      })

      return {
        transaction,
        senderAccount,
        newSenderBalance: senderBalance - totalAmount,
        fee
      }
    })

    // Send email notification (outside transaction)
    try {
      await sendTransferNotification({
        to: result.senderAccount.user.email,
        userName: result.senderAccount.user.name || 'Customer',
        transactionType: 'External Transfer',
        amount: data.amount,
        accountNumber: result.senderAccount.accountNumber,
        reference: result.transaction.reference,
        date: new Date().toLocaleDateString(),
        balance: result.newSenderBalance
      })
    } catch (emailError) {
      console.error('Failed to send external transfer notification:', emailError)
      // Don't fail the transfer if email fails
    }

    return {
      success: true,
      transactionId: result.transaction.id,
      reference: result.transaction.reference
    }

  } catch (error) {
    console.error('External transfer failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed'
    }
  }
}

/**
 * Get transaction history for an account
 */
export async function getTransactionHistory(
  accountId: string,
  page = 1,
  limit = 20,
  filters?: {
    type?: TransactionType
    status?: TransactionStatus
    startDate?: Date
    endDate?: Date
  }
): Promise<{
  transactions: TransactionWithDetails[]
  totalCount: number
  currentPage: number
  totalPages: number
}> {
  const skip = (page - 1) * limit

  const where = {
    OR: [
      { senderAccountId: accountId },
      { receiverAccountId: accountId }
    ],
    ...(filters?.type && { type: filters.type }),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.startDate && filters?.endDate && {
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate
      }
    })
  }

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        senderAccount: {
          select: {
            id: true,
            accountNumber: true,
            accountType: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        receiverAccount: {
          select: {
            id: true,
            accountNumber: true,
            accountType: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.transaction.count({ where })
  ])

  return {
    transactions: transactions.map(tx => ({
      ...tx,
      amount: Number(tx.amount),
      processingFee: tx.processingFee ? Number(tx.processingFee) : null
    })) as TransactionWithDetails[],
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit)
  }
}

/**
 * Get transaction by reference
 */
export async function getTransactionByReference(reference: string): Promise<TransactionWithDetails | null> {
  const transaction = await prisma.transaction.findUnique({
    where: { reference },
    include: {
      senderAccount: {
        select: {
          id: true,
          accountNumber: true,
          accountType: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      receiverAccount: {
        select: {
          id: true,
          accountNumber: true,
          accountType: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  })

  if (!transaction) return null
  
  return {
    ...transaction,
    amount: Number(transaction.amount),
    processingFee: transaction.processingFee ? Number(transaction.processingFee) : null
  } as TransactionWithDetails
}
