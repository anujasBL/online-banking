const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Initializing database...')
    
    // Test the connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if we can query users table
    const userCount = await prisma.user.count()
    console.log(`📊 Current user count: ${userCount}`)
    
    // Check if we can query bank accounts table
    const accountCount = await prisma.bankAccount.count()
    console.log(`🏦 Current bank account count: ${accountCount}`)
    
    // Check if we can query transactions table
    const transactionCount = await prisma.transaction.count()
    console.log(`💳 Current transaction count: ${transactionCount}`)
    
    console.log('🎉 Database initialization complete!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
