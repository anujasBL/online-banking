import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/online_banking_test'
    }
  }
})

export const setupTestDatabase = async () => {
  try {
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to test database')

    // Clean up existing data
    await cleanupTestDatabase()

    // Create test data
    await seedTestDatabase()

    console.log('✅ Test database setup completed')
  } catch (error) {
    console.error('❌ Test database setup failed:', error)
    throw error
  }
}

export const cleanupTestDatabase = async () => {
  try {
    // Clean up in reverse order of dependencies
    await prisma.bankAccount.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
    await prisma.verificationToken.deleteMany()

    console.log('✅ Test database cleaned up')
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error)
    throw error
  }
}

export const seedTestDatabase = async () => {
  try {
    // Create test users
    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        emailVerified: new Date(),
      }
    })

    const adminUser = await prisma.user.create({
      data: {
        id: 'admin-user-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    })

    // Create test bank accounts
    await prisma.bankAccount.create({
      data: {
        id: 'test-account-1',
        userId: testUser.id,
        accountType: 'CHECKING',
        balance: 1000.00,
        accountNumber: '1234567890',
        routingNumber: '021000021',
      }
    })

    await prisma.bankAccount.create({
      data: {
        id: 'test-account-2',
        userId: testUser.id,
        accountType: 'SAVINGS',
        balance: 2500.50,
        accountNumber: '0987654321',
        routingNumber: '021000021',
      }
    })

    await prisma.bankAccount.create({
      data: {
        id: 'admin-account-1',
        userId: adminUser.id,
        accountType: 'CHECKING',
        balance: 5000.00,
        accountNumber: '1111222233',
        routingNumber: '021000021',
      }
    })

    console.log('✅ Test database seeded with sample data')
  } catch (error) {
    console.error('❌ Test database seeding failed:', error)
    throw error
  }
}

export const disconnectTestDatabase = async () => {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from test database')
  } catch (error) {
    console.error('❌ Failed to disconnect from test database:', error)
    throw error
  }
}

// Helper functions for specific test scenarios
export const createTestUser = async (userData: {
  email: string
  name: string
  role?: 'USER' | 'ADMIN'
}) => {
  return await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      role: userData.role || 'USER',
      emailVerified: new Date(),
    }
  })
}

export const createTestBankAccount = async (accountData: {
  userId: string
  accountType: 'CHECKING' | 'SAVINGS'
  balance: number
  accountNumber?: string
}) => {
  return await prisma.bankAccount.create({
    data: {
      userId: accountData.userId,
      accountType: accountData.accountType,
      balance: accountData.balance,
      accountNumber: accountData.accountNumber || `${Date.now()}${Math.random().toString().substr(2, 6)}`,
      routingNumber: '021000021',
    }
  })
}

export const getUserWithAccounts = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bankAccounts: true
    }
  })
}

export const getAccountBalance = async (accountId: string) => {
  const account = await prisma.bankAccount.findUnique({
    where: { id: accountId },
    select: { balance: true }
  })
  return account ? Number(account.balance) : 0
}

export { prisma as testPrisma }
