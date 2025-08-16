import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTransactionByReference } from "@/src/lib/services/transfer"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: {
    reference: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reference } = params

    if (!reference) {
      return NextResponse.json(
        { error: "Transaction reference is required" },
        { status: 400 }
      )
    }

    // Get transaction by reference
    const transaction = await getTransactionByReference(reference)

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Verify user has access to this transaction
    const userAccounts = await prisma.bankAccount.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    })

    const accountIds = userAccounts.map((account) => account.id)

    const hasAccess =
      (transaction.senderAccount &&
        accountIds.includes(transaction.senderAccount.id)) ||
      (transaction.receiverAccount &&
        accountIds.includes(transaction.receiverAccount.id))

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Transaction not accessible" },
        { status: 403 }
      )
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Transaction by reference API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
