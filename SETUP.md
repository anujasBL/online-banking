# Quick Setup Guide - Online Banking System

## 🚀 Quick Start (5 minutes)

### 1. Clone and Install

```bash
git clone <repository-url>
cd online-banking-system
npm install
```

### 2. Environment Setup

```bash
cp env.example .env.local
```

Update `.env.local` with your values:

- Get Neon PostgreSQL database URL
- Generate NextAuth secret: `openssl rand -base64 32`
- Create Google OAuth credentials

### 3. Database Setup

```bash
npm run db:generate
npm run db:push
npm run db:init
```

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with Google!

## 🔧 Required Environment Variables

| Variable               | Description                       | Example                                          |
| ---------------------- | --------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`         | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_URL`         | Your app URL                      | `http://localhost:3000`                          |
| `NEXTAUTH_SECRET`      | Random secret for JWT             | `your-secret-here`                               |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID            | `123456789.googleusercontent.com`                |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret        | `GOCSPX-xxxxxxxxxxxxx`                           |

## 🗄️ Setting up Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy connection string to `DATABASE_URL`
4. Database schema will be created automatically

## 🔐 Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

## ✅ Verification Steps

After setup, verify:

- [ ] App starts without errors (`npm run dev`)
- [ ] Database connection works (`npm run db:init`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Google sign-in works
- [ ] Dashboard displays with default account

## 🚀 Deployment to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard.

## 📞 Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the [SRS document](./software-requirements-specification.md) for requirements
- Open an issue if you encounter problems
