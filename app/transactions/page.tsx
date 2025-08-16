import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TransactionHistory } from "@/src/components/transactions/transaction-history"

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Get user's bank accounts for filtering
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { 
      userId: session.user.id,
      isActive: true 
    },
    select: {
      id: true,
      accountType: true,
      accountNumber: true,
    },
    orderBy: { createdAt: 'asc' }
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Transaction History
          </h1>
          <p className="text-muted-foreground">
            View and manage your transaction history across all accounts.
          </p>
        </div>

        <TransactionHistory accounts={bankAccounts} />
      </main>
    </div>
  )
}
