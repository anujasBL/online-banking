import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  InternalTransferInput,
  ExternalTransferInput,
} from "@/src/lib/validations/transfer"

interface TransferResponse {
  success: boolean
  transactionId?: string
  reference?: string
  message?: string
  error?: string
}

/**
 * Hook for internal transfers
 */
export function useInternalTransfer() {
  const queryClient = useQueryClient()

  return useMutation<TransferResponse, Error, InternalTransferInput>({
    mutationFn: async (data: InternalTransferInput) => {
      const response = await fetch("/api/transfers/internal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Transfer failed")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch account balances and transactions
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
  })
}

/**
 * Hook for external transfers
 */
export function useExternalTransfer() {
  const queryClient = useQueryClient()

  return useMutation<TransferResponse, Error, ExternalTransferInput>({
    mutationFn: async (data: ExternalTransferInput) => {
      const response = await fetch("/api/transfers/external", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Transfer failed")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch account balances and transactions
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
  })
}

/**
 * Helper hook to get transfer mutation state
 */
export function useTransferState() {
  const internalTransfer = useInternalTransfer()
  const externalTransfer = useExternalTransfer()

  return {
    internalTransfer,
    externalTransfer,
    isTransferring: internalTransfer.isPending || externalTransfer.isPending,
    transferError: internalTransfer.error || externalTransfer.error,
    lastTransferResult: internalTransfer.data || externalTransfer.data,
  }
}
