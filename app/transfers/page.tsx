import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TransferForm } from "@/src/components/transfers/transfer-form"

export default async function TransfersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Get user's bank accounts
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { 
      userId: session.user.id,
      isActive: true 
    },
    select: {
      id: true,
      accountType: true,
      balance: true,
      accountNumber: true,
    },
    orderBy: { createdAt: 'asc' }
  })

  // Convert Decimal to number for display
  const accounts = bankAccounts.map(account => ({
    ...account,
    balance: Number(account.balance.toString())
  }))

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Transfer Funds
          </h1>
          <p className="text-muted-foreground">
            Send money to other accounts within our system or external banks.
          </p>
        </div>

        <div className="flex justify-center">
          <TransferForm 
            accounts={accounts}
          />
        </div>
      </main>
    </div>
  )
}
