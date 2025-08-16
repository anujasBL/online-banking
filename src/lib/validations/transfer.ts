import { z } from "zod"

/**
 * Internal transfer validation schema
 */
export const internalTransferSchema = z.object({
  senderAccountId: z.string().min(1, "Sender account is required"),
  receiverAccountId: z.string().min(1, "Receiver account is required"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(0.01, "Minimum transfer amount is $0.01")
    .max(50000, "Maximum transfer amount is $50,000"),
  description: z
    .string()
    .max(255, "Description must be less than 255 characters")
    .optional(),
})

/**
 * External transfer validation schema
 */
export const externalTransferSchema = z.object({
  senderAccountId: z.string().min(1, "Sender account is required"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(0.01, "Minimum transfer amount is $0.01")
    .max(10000, "Maximum external transfer amount is $10,000"),
  externalAccountNumber: z
    .string()
    .min(8, "Account number must be at least 8 digits")
    .max(17, "Account number must be less than 18 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
  externalRoutingNumber: z
    .string()
    .length(9, "Routing number must be exactly 9 digits")
    .regex(/^\d+$/, "Routing number must contain only digits"),
  externalBankName: z
    .string()
    .min(1, "Bank name is required")
    .max(100, "Bank name must be less than 100 characters"),
  description: z
    .string()
    .max(255, "Description must be less than 255 characters")
    .optional(),
})

/**
 * Transaction status update schema
 */
export const transactionStatusSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]),
  metadata: z.record(z.any()).optional(),
})

/**
 * Transaction query filters schema
 */
export const transactionFiltersSchema = z.object({
  accountId: z.string().optional(),
  type: z
    .enum([
      "INTERNAL_TRANSFER",
      "EXTERNAL_TRANSFER",
      "DEPOSIT",
      "WITHDRAWAL",
      "FEE",
      "INTEREST",
    ])
    .optional(),
  status: z
    .enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

// Type exports
export type InternalTransferInput = z.infer<typeof internalTransferSchema>
export type ExternalTransferInput = z.infer<typeof externalTransferSchema>
export type TransactionStatusInput = z.infer<typeof transactionStatusSchema>
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>

/**
 * Validate account balance for transfer
 */
export const validateTransferAmount = (
  balance: number,
  amount: number,
  fee = 0
): boolean => {
  return balance >= amount + fee
}

/**
 * Calculate transfer fee based on amount and type
 */
export const calculateTransferFee = (
  amount: number,
  isExternal = false
): number => {
  if (!isExternal) {
    // No fee for internal transfers
    return 0
  }

  // External transfer fees
  if (amount <= 1000) {
    return 2.99
  } else if (amount <= 5000) {
    return 4.99
  } else {
    return 9.99
  }
}

/**
 * Generate unique transaction reference
 */
export const generateTransactionReference = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `TXN-${timestamp}-${random}`.toUpperCase()
}
