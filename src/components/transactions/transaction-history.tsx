"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react"
import {
  useTransactions,
  getTransactionAmount,
  getTransactionDirection,
  getTransactionCounterparty,
} from "@/src/hooks/use-transactions"
import { TransactionType, TransactionStatus } from "@prisma/client"

interface BankAccount {
  id: string
  accountType: string
  accountNumber: string
}

interface TransactionHistoryProps {
  accounts: BankAccount[]
  selectedAccountId?: string
}

export function TransactionHistory({
  accounts,
  selectedAccountId,
}: TransactionHistoryProps) {
  const [filters, setFilters] = useState({
    accountId: selectedAccountId || "",
    type: undefined as TransactionType | undefined,
    status: undefined as TransactionStatus | undefined,
    startDate: "",
    endDate: "",
    page: 1,
    limit: 20,
  })

  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, error, refetch } = useTransactions(filters)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case "COMPLETED":
        return "default"
      case "PENDING":
        return "secondary"
      case "PROCESSING":
        return "secondary"
      case "FAILED":
        return "destructive"
      case "CANCELLED":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTypeBadgeVariant = (type: TransactionType) => {
    switch (type) {
      case "INTERNAL_TRANSFER":
        return "default"
      case "EXTERNAL_TRANSFER":
        return "secondary"
      case "DEPOSIT":
        return "default"
      case "WITHDRAWAL":
        return "outline"
      case "FEE":
        return "destructive"
      case "INTEREST":
        return "default"
      default:
        return "secondary"
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
      page: 1, // Reset to first page when filters change
    }))
  }

  const clearFilters = () => {
    setFilters({
      accountId: selectedAccountId || "",
      type: undefined,
      status: undefined,
      startDate: "",
      endDate: "",
      page: 1,
      limit: 20,
    })
  }

  const loadMore = () => {
    setFilters((prev) => ({
      ...prev,
      page: prev.page + 1,
    }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>
              View and filter your transaction history
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account-filter">Account</Label>
                <Select
                  value={filters.accountId}
                  onValueChange={(value) =>
                    handleFilterChange("accountId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountType} - ****
                        {account.accountNumber.slice(-4)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="INTERNAL_TRANSFER">
                      Internal Transfer
                    </SelectItem>
                    <SelectItem value="EXTERNAL_TRANSFER">
                      External Transfer
                    </SelectItem>
                    <SelectItem value="DEPOSIT">Deposit</SelectItem>
                    <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                    <SelectItem value="FEE">Fee</SelectItem>
                    <SelectItem value="INTEREST">Interest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading transactions...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            Error loading transactions: {error.message}
          </div>
        )}

        {data && data.transactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found matching your criteria.
          </div>
        )}

        {data && data.transactions.length > 0 && (
          <div className="space-y-4">
            {data.transactions.map((transaction) => {
              const amount = getTransactionAmount(
                transaction,
                filters.accountId
              )
              const direction = getTransactionDirection(
                transaction,
                filters.accountId
              )
              const counterparty = getTransactionCounterparty(
                transaction,
                filters.accountId
              )
              const isPositive = amount > 0

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {isPositive ? (
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {transaction.description || `${direction} Transfer`}
                        </p>
                        <Badge variant={getTypeBadgeVariant(transaction.type)}>
                          {transaction.type.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant={getStatusBadgeVariant(transaction.status)}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {direction} • {counterparty.name} •{" "}
                          {counterparty.account}
                        </p>
                        <p>
                          Ref: {transaction.reference} •{" "}
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-lg font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
                    >
                      {isPositive ? "+" : "-"}
                      {formatCurrency(amount)}
                    </div>
                    {transaction.processingFee &&
                      Number(transaction.processingFee) > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Fee:{" "}
                          {formatCurrency(Number(transaction.processingFee))}
                        </div>
                      )}
                  </div>
                </div>
              )
            })}

            {data.currentPage < data.totalPages && (
              <div className="flex justify-center pt-4">
                <Button onClick={loadMore} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground pt-4">
              Showing {data.transactions.length} of {data.totalCount}{" "}
              transactions
              {data.totalPages > 1 &&
                ` • Page ${data.currentPage} of ${data.totalPages}`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
