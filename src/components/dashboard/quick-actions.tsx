"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownLeft, CreditCard, FileText } from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
          <ArrowUpRight className="h-6 w-6" />
          <span>Transfer Money</span>
        </Button>
        
        <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
          <ArrowDownLeft className="h-6 w-6" />
          <span>Deposit Check</span>
        </Button>
        
        <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
          <CreditCard className="h-6 w-6" />
          <span>Pay Bills</span>
        </Button>
        
        <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
          <FileText className="h-6 w-6" />
          <span>View Statements</span>
        </Button>
      </CardContent>
    </Card>
  )
}