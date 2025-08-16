"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  FileText,
  History,
} from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Link href="/transfers">
          <Button
            variant="outline"
            className="h-auto flex-col space-y-2 p-4 w-full"
          >
            <ArrowUpRight className="h-6 w-6" />
            <span>Transfer Money</span>
          </Button>
        </Link>

        <Link href="/transactions">
          <Button
            variant="outline"
            className="h-auto flex-col space-y-2 p-4 w-full"
          >
            <History className="h-6 w-6" />
            <span>Transaction History</span>
          </Button>
        </Link>

        <Button
          variant="outline"
          className="h-auto flex-col space-y-2 p-4"
          disabled
        >
          <CreditCard className="h-6 w-6" />
          <span>Pay Bills</span>
          <span className="text-xs text-muted-foreground">Coming Soon</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto flex-col space-y-2 p-4"
          disabled
        >
          <FileText className="h-6 w-6" />
          <span>View Statements</span>
          <span className="text-xs text-muted-foreground">Coming Soon</span>
        </Button>
      </CardContent>
    </Card>
  )
}
