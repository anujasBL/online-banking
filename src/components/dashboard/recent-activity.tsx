"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

// Mock data for demonstration - in iteration 2 this will come from the database
const mockTransactions = [
  {
    id: "1",
    type: "credit",
    description: "Initial Deposit",
    amount: 1000.00,
    date: new Date().toISOString(),
  },
  {
    id: "2", 
    type: "debit",
    description: "ATM Withdrawal",
    amount: -50.00,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    type: "credit", 
    description: "Direct Deposit",
    amount: 2500.00,
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent transactions
            </p>
          ) : (
            mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {transaction.type === "credit" ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-medium ${
                    transaction.amount > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}