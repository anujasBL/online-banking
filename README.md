# Online Banking System - Phase 1 Iteration 2

A modern, secure online banking platform built with Next.js 14, TypeScript, and PostgreSQL. This iteration adds **fund transfers** and **transaction history** capabilities to the core authentication and account management system.

## 🚀 New Features in Iteration 2

### ✅ Fund Transfers

- **Internal Transfers**: Transfer money between accounts within the system
- **External Transfers**: Send money to external bank accounts
- **Real-time Processing**: Internal transfers process immediately
- **Transfer Fees**: Automatic fee calculation for external transfers
- **Validation**: Comprehensive validation using Zod schemas

### ✅ Transaction History

- **Real-time Updates**: Live transaction data using React Query
- **Advanced Filtering**: Filter by account, type, status, date range, amount
- **Pagination**: Efficient pagination for large transaction sets
- **Rich Details**: Complete transaction information with counterparty details

### ✅ Email Notifications

- **Transfer Confirmations**: Automatic email notifications for all transfers
- **Transaction Receipts**: Detailed email receipts with transaction details
- **SendGrid Integration**: Production-ready email delivery system

### ✅ Enhanced Dashboard

- **Live Activity Feed**: Real-time transaction updates
- **Quick Actions**: Direct access to transfer and history features
- **Account Overview**: Updated with real-time balance changes

## 🛠 Tech Stack

### Core Technologies

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Neon PostgreSQL
- **Authentication**: NextAuth.js with Google OAuth 2.0
- **Email**: SendGrid for notifications
- **State Management**: React Query for server state
- **Validation**: Zod schemas
- **UI Components**: Radix UI + shadcn/ui

### Development Tools

- **Testing**: Jest, React Testing Library, Playwright
- **Code Quality**: ESLint, Prettier, TypeScript
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 22.18.0 (LTS) or later
- npm or yarn package manager
- Neon PostgreSQL database
- Google OAuth 2.0 credentials
- SendGrid account (optional for email features)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone [repository-url]
cd online-banking
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```env
# Database
DATABASE_URL="postgresql://username:password@hostname:5432/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# SendGrid Email (Optional)
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
SENDGRID_FROM_NAME="Online Banking System"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Apply database schema
npm run db:push

# Initialize database (optional)
npm run db:init
```

### 4. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📊 Database Schema

### Core Tables

- **Users**: User accounts with Google OAuth integration
- **BankAccounts**: Customer bank accounts with balances
- **Transactions**: Complete transaction history with metadata
- **NextAuth Tables**: Session and account management

### Transaction Types

- `INTERNAL_TRANSFER`: Transfers within the system
- `EXTERNAL_TRANSFER`: Transfers to external banks
- `DEPOSIT`: Account deposits
- `WITHDRAWAL`: Account withdrawals
- `FEE`: Processing fees
- `INTEREST`: Interest payments

### Transaction Statuses

- `PENDING`: Awaiting processing
- `PROCESSING`: Currently being processed
- `COMPLETED`: Successfully completed
- `FAILED`: Processing failed
- `CANCELLED`: Cancelled by user or system

## 🔒 Security Features

- **OAuth 2.0**: Secure Google authentication
- **HTTPS**: Enforced secure connections
- **Input Validation**: Comprehensive validation with Zod
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **Account Verification**: Transfer authorization checks
- **Rate Limiting**: Built-in API rate limiting

## 🧪 Testing

### Run All Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# All tests
npm run test:all
```

### Test Coverage

```bash
npm run test:coverage
```

### Development Testing

```bash
# Watch mode
npm run test:watch

# E2E with UI
npm run test:e2e:ui
```

## 📦 Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:init` - Initialize database

### Testing

- `npm run test` - Run unit tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only
- `npm run test:e2e` - End-to-end tests
- `npm run test:coverage` - Test coverage report

## 🌐 API Endpoints

### Authentication

- `GET /api/auth/*` - NextAuth.js authentication routes

### Accounts

- `GET /api/accounts` - Get user accounts
- `POST /api/accounts` - Create new account

### Transfers

- `POST /api/transfers/internal` - Process internal transfer
- `POST /api/transfers/external` - Process external transfer

### Transactions

- `GET /api/transactions` - Get transaction history (with filters)
- `GET /api/transactions/[reference]` - Get specific transaction

## 🎯 Features by Iteration

### ✅ Iteration 1 (Completed)

- User authentication (Google OAuth 2.0)
- Account dashboard with balance display
- Basic account management
- Responsive UI with dark/light mode

### ✅ Iteration 2 (Current)

- Internal fund transfers
- External fund transfers
- Transaction history with filtering
- Email notifications
- Real-time updates with React Query

### 🔄 Iteration 3 (Planned)

- Bill payments via Stripe
- Admin panel for user management
- Advanced reporting
- Mobile optimization

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [Issues](../../issues) section
2. Review the documentation
3. Contact the development team

---

**Built with ❤️ using Next.js, TypeScript, and PostgreSQL**
