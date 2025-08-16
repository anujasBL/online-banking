"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight, ArrowRight, Loader2 } from "lucide-react"
import {
  useRecentTransactions,
  getTransactionAmount,
  getTransactionDirection,
  getTransactionCounterparty,
} from "@/src/hooks/use-transactions"

interface RecentActivityProps {
  accountId?: string
}

export function RecentActivity({ accountId }: RecentActivityProps) {
  const { data, isLoading, error } = useRecentTransactions(accountId, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Recent Activity</CardTitle>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center py-4">
              Error loading transactions
            </p>
          )}

          {data?.transactions && data.transactions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent transactions
            </p>
          )}

          {data?.transactions && data.transactions.length > 0 && (
            <>
              {data.transactions.map((transaction) => {
                const amount = getTransactionAmount(
                  transaction,
                  accountId || ""
                )
                const direction = getTransactionDirection(
                  transaction,
                  accountId || ""
                )
                const counterparty = getTransactionCounterparty(
                  transaction,
                  accountId || ""
                )
                const isPositive = amount > 0

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between space-x-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {isPositive ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {transaction.description || `${direction} Transfer`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {direction} • {counterparty.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? "+" : "-"}
                      {formatCurrency(Math.abs(amount))}
                    </div>
                  </div>
                )
              })}

              <div className="pt-2">
                <Link href="/transactions">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Transactions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
