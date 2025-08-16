import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AccountOverview } from "@/components/dashboard/account-overview"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { generateAccountNumber, generateRoutingNumber } from "@/lib/utils"

async function createDefaultBankAccount(userId: string) {
  return await prisma.bankAccount.create({
    data: {
      userId,
      accountType: "CHECKING",
      balance: 1000.00, // Starting balance for demo
      accountNumber: generateAccountNumber(),
      routingNumber: generateRoutingNumber(),
    },
  })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Get or create bank accounts for the user
  let bankAccounts = await prisma.bankAccount.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      accountType: true,
      balance: true,
      accountNumber: true,
    },
  })

  // If user has no bank accounts, create a default checking account
  if (bankAccounts.length === 0) {
    const newAccount = await createDefaultBankAccount(session.user.id)
    bankAccounts = [{
      id: newAccount.id,
      accountType: newAccount.accountType,
      balance: Number(newAccount.balance),
      accountNumber: newAccount.accountNumber,
    }]
  } else {
    // Convert Decimal to number for display
    bankAccounts = bankAccounts.map(account => ({
      ...account,
      balance: Number(account.balance)
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {session.user.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your accounts and recent activity.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <AccountOverview accounts={bankAccounts} />
            <QuickActions />
          </div>
          
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  )
}
