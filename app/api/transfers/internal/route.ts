import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { internalTransferSchema } from "@/src/lib/validations/transfer"
import { processInternalTransfer } from "@/src/lib/services/transfer"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate request data
    const validationResult = internalTransferSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { senderAccountId, receiverAccountId, amount, description } =
      validationResult.data

    // Verify sender account belongs to the user
    const senderAccount = await prisma.bankAccount.findFirst({
      where: {
        id: senderAccountId,
        userId: session.user.id,
        isActive: true,
      },
    })

    if (!senderAccount) {
      return NextResponse.json(
        { error: "Sender account not found or not accessible" },
        { status: 403 }
      )
    }

    // Verify receiver account exists and is active
    const receiverAccount = await prisma.bankAccount.findFirst({
      where: {
        id: receiverAccountId,
        isActive: true,
      },
    })

    if (!receiverAccount) {
      return NextResponse.json(
        { error: "Receiver account not found or inactive" },
        { status: 400 }
      )
    }

    // Process the transfer
    const result = await processInternalTransfer({
      senderAccountId,
      receiverAccountId,
      amount,
      description,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      reference: result.reference,
      message: "Internal transfer completed successfully",
    })
  } catch (error) {
    console.error("Internal transfer API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
