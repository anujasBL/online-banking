"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, TrendingUp, Wallet } from "lucide-react"

interface BankAccount {
  id: string
  accountType: string
  balance: number
  accountNumber: string
}

interface AccountOverviewProps {
  accounts: BankAccount[]
}

export function AccountOverview({ accounts }: AccountOverviewProps) {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const checkingAccounts = accounts.filter(acc => acc.accountType === "CHECKING")
  const savingsAccounts = accounts.filter(acc => acc.accountType === "SAVINGS")

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-xs text-muted-foreground">
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Checking</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(
              checkingAccounts.reduce((sum, acc) => sum + acc.balance, 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {checkingAccounts.length} checking account{checkingAccounts.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(
              savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {savingsAccounts.length} savings account{savingsAccounts.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {accounts.map((account) => (
        <Card key={account.id} className="md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {account.accountType.toLowerCase().charAt(0).toUpperCase() + 
               account.accountType.toLowerCase().slice(1)} Account
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              ••••{account.accountNumber.slice(-4)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(account.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Account Number: ••••••{account.accountNumber.slice(-4)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}