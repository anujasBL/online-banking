# Online Banking System - MVP Iteration 1

A modern, secure online banking system built with Next.js 14, TypeScript, and Prisma ORM.

## 🚀 Features (Iteration 1)

- **Secure Authentication**: Google OAuth 2.0 integration via NextAuth.js
- **User Dashboard**: Clean, responsive interface displaying account balances and user profile
- **Account Management**: Automatic creation of default checking account for new users
- **Theme Support**: Dark/light mode toggle
- **Responsive Design**: Mobile-first design using Tailwind CSS and shadcn/ui components

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: NextAuth.js with Google OAuth 2.0
- **UI Components**: shadcn/ui, Radix UI primitives
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 22.18.0 (LTS) or higher
- PostgreSQL database (we recommend Neon for cloud deployment)
- Google OAuth 2.0 credentials
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-banking-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your actual values:
   ```env
   # Database - Get from Neon console
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   
   # NextAuth.js - Generate a random secret
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Google OAuth - Get from Google Cloud Console
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to your `.env.local`

## 🗄️ Database Schema

The current schema includes:
- **Users**: User profiles from Google OAuth
- **Accounts**: NextAuth.js session management
- **BankAccounts**: User bank accounts with balances
- **Sessions**: NextAuth.js sessions
- **VerificationTokens**: NextAuth.js verification

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/auth/          # NextAuth.js API routes
│   ├── auth/signin/       # Sign-in page
│   ├── dashboard/         # Main dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── providers/         # Context providers
│   ├── theme-toggle.tsx   # Theme switcher
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
    └── next-auth.d.ts     # NextAuth type extensions
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Set Environment Variables**
   Add all environment variables in Vercel dashboard

3. **Database Migration**
   Run `npm run db:push` after deployment

### GitHub Actions CI/CD

The project includes automated CI/CD pipeline that:
- Runs linting and type checking
- Builds the application
- Deploys to Vercel on main branch

Required GitHub Secrets:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 🧪 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run type-check      # TypeScript type checking
npm run format          # Format with Prettier

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Create and apply migrations
npm run db:studio       # Open Prisma Studio
```

## 📚 Iteration Roadmap

### ✅ Iteration 1 (Current)
- Google OAuth 2.0 authentication
- User dashboard with account overview
- Basic account management
- Responsive UI with theme support

### 🔄 Iteration 2 (Next)
- Internal fund transfers
- Transaction history
- Email notifications via SendGrid
- Real-time updates with React Query

### 🔮 Iteration 3 (Future)
- External bill payments via Stripe
- Admin panel
- Advanced user management

## 🔒 Security Features

- HTTPS enforcement
- Secure session handling
- Role-based access control
- SQL injection prevention via Prisma
- XSS protection via Next.js

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in `/docs`
- Review the SRS document for detailed requirements

---

**Built with ❤️ by the OBS Development Team**
