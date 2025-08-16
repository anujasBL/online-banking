import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateAccountNumber, generateRoutingNumber } from "@/lib/utils"

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const accounts = await prisma.bankAccount.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        accountType: true,
        balance: true,
        accountNumber: true,
      },
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    // Log error in production - could use a proper logging service
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching accounts:", error)
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await _request.json()
    const { accountType = "CHECKING" } = body

    const account = await prisma.bankAccount.create({
      data: {
        userId: session.user.id,
        accountType,
        balance: 1000.00, // Starting balance for demo
        accountNumber: generateAccountNumber(),
        routingNumber: generateRoutingNumber(),
      },
    })

    return NextResponse.json({ account })
  } catch (error) {
    // Log error in production - could use a proper logging service
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating account:", error)
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
