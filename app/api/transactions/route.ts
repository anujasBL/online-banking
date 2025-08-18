import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { transactionFiltersSchema } from "@/src/lib/validations/transfer"
import { getTransactionHistory } from "@/src/lib/services/transfer"
import { prisma } from "@/lib/prisma"
import { TransactionType, TransactionStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure request.url is valid before creating URL object
    if (!request.url) {
      return NextResponse.json(
        { error: "Invalid request URL" },
        { status: 400 }
      )
    }

    let searchParams
    try {
      const url = new URL(request.url)
      searchParams = url.searchParams
    } catch (error) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Parse and validate query parameters
    const filters = {
      accountId: searchParams.get("accountId") || undefined,
      type: (searchParams.get("type") as TransactionType) || undefined,
      status: (searchParams.get("status") as TransactionStatus) || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      minAmount: searchParams.get("minAmount")
        ? parseFloat(searchParams.get("minAmount") || "0")
        : undefined,
      maxAmount: searchParams.get("maxAmount")
        ? parseFloat(searchParams.get("maxAmount") || "0")
        : undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page") || "1")
        : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit") || "20")
        : 20,
    }

    const validationResult = transactionFiltersSchema.safeParse(filters)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const validatedFilters = validationResult.data

    // If accountId is specified, verify it belongs to the user
    if (validatedFilters.accountId) {
      const account = await prisma.bankAccount.findFirst({
        where: {
          id: validatedFilters.accountId,
          userId: session.user.id,
        },
      })

      if (!account) {
        return NextResponse.json(
          { error: "Account not found or not accessible" },
          { status: 403 }
        )
      }

      // Get transactions for specific account
      const result = await getTransactionHistory(
        validatedFilters.accountId,
        validatedFilters.page,
        validatedFilters.limit,
        {
          type: validatedFilters.type,
          status: validatedFilters.status,
          startDate: validatedFilters.startDate
            ? new Date(validatedFilters.startDate)
            : undefined,
          endDate: validatedFilters.endDate
            ? new Date(validatedFilters.endDate)
            : undefined,
        }
      )

      return NextResponse.json(result)
    } else {
      // Get transactions for all user accounts
      const userAccounts = await prisma.bankAccount.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      })

      const accountIds = userAccounts.map((account) => account.id)

      if (accountIds.length === 0) {
        return NextResponse.json({
          transactions: [],
          totalCount: 0,
          currentPage: validatedFilters.page,
          totalPages: 0,
        })
      }

      // Get transactions for all accounts
      const skip = (validatedFilters.page - 1) * validatedFilters.limit

      const where = {
        OR: [
          { senderAccountId: { in: accountIds } },
          { receiverAccountId: { in: accountIds } },
        ],
        ...(validatedFilters.type && { type: validatedFilters.type }),
        ...(validatedFilters.status && { status: validatedFilters.status }),
        ...(validatedFilters.startDate &&
          validatedFilters.endDate && {
            createdAt: {
              gte: new Date(validatedFilters.startDate),
              lte: new Date(validatedFilters.endDate),
            },
          }),
        ...(validatedFilters.minAmount && {
          amount: { gte: validatedFilters.minAmount },
        }),
        ...(validatedFilters.maxAmount && {
          amount: { lte: validatedFilters.maxAmount },
        }),
      }

      const [transactions, totalCount] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            senderAccount: {
              select: {
                id: true,
                accountNumber: true,
                accountType: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            receiverAccount: {
              select: {
                id: true,
                accountNumber: true,
                accountType: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: validatedFilters.limit,
        }),
        prisma.transaction.count({ where }),
      ])

      return NextResponse.json({
        transactions,
        totalCount,
        currentPage: validatedFilters.page,
        totalPages: Math.ceil(totalCount / validatedFilters.limit),
      })
    }
  } catch (error) {
    console.error("Transactions API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
