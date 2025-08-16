"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AccountOverview } from "@/components/dashboard/account-overview"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"

// Mock data for E2E testing
const mockBankAccounts = [
  {
    id: 'test-account-1',
    accountType: 'CHECKING' as const,
    balance: 1000.00,
    accountNumber: '1234567890',
  }
]

// Mock session for testing
const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  },
  expires: '2024-12-31'
}

// Test-only dashboard page that doesn't require authentication
export default function TestDashboardPage() {
  return (
    <SessionProvider session={mockSession}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          
          <main className="container mx-auto py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Welcome back, Test!
              </h2>
              <p className="text-muted-foreground">
                Here&apos;s an overview of your accounts and recent activity.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <AccountOverview accounts={mockBankAccounts} />
                <QuickActions />
              </div>
              
              <div className="lg:col-span-1">
                <RecentActivity />
              </div>
            </div>
          </main>
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}
