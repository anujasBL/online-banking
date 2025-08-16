import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { externalTransferSchema } from '@/src/lib/validations/transfer'
import { processExternalTransfer } from '@/src/lib/services/transfer'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request data
    const validationResult = externalTransferSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { 
      senderAccountId, 
      amount, 
      externalAccountNumber,
      externalRoutingNumber,
      externalBankName,
      description 
    } = validationResult.data

    // Verify sender account belongs to the user
    const senderAccount = await prisma.bankAccount.findFirst({
      where: {
        id: senderAccountId,
        userId: session.user.id,
        isActive: true
      }
    })

    if (!senderAccount) {
      return NextResponse.json(
        { error: 'Sender account not found or not accessible' },
        { status: 403 }
      )
    }

    // Process the external transfer
    const result = await processExternalTransfer({
      senderAccountId,
      amount,
      externalAccountNumber,
      externalRoutingNumber,
      externalBankName,
      description
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      reference: result.reference,
      message: 'External transfer initiated successfully'
    })

  } catch (error) {
    console.error('External transfer API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
