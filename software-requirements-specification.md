# Software Requirements Specification (SRS)  
**System:** Online Banking System  
**Version:** 1.0  
**Date:** 2025-08-16  
**Author:** Anuja Semindra  

---

## 1. Introduction

### 1.1 Purpose
This document defines the software requirements for the Online Banking System (OBS).  
It specifies functional and non-functional requirements, external interfaces, and constraints.  
The intended audience includes developers, architects, testers, business stakeholders, and deployment engineers.

### 1.2 Scope
The Online Banking System enables users to manage accounts, transfer funds, pay bills, and monitor financial activity online.  
It will provide secure authentication, transaction management, and real-time notifications.  
The system will be available via web application, optimized for desktop and mobile.

### 1.3 Definitions, Acronyms, and Abbreviations
- **OBS** – Online Banking System  
- **MVP** – Minimum Viable Product  
- **CI/CD** – Continuous Integration / Continuous Deployment  
- **OAuth 2.0** – Open Authorization Protocol  

### 1.4 References
- IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications  
- Stripe API Documentation  
- NextAuth.js Documentation  
- Prisma ORM Documentation  
- Neon PostgreSQL Documentation  

---

## 2. Overall Description

### 2.1 Product Perspective
OBS is a standalone cloud-native system deployed on **Vercel**, integrated with external services like Stripe, Cloudinary, and SendGrid.  
It uses **Next.js (frontend)** and **Prisma ORM with Neon PostgreSQL (backend)**.

### 2.2 Product Functions
- User authentication (Google OAuth 2.0 via NextAuth.js)  
- Account management (balances, profile updates)  
- Fund transfers (internal & external)  
- Transaction history  
- Bill payments (via Stripe)  
- Notifications (email via SendGrid)  
- Secure session handling and role-based access  

### 2.3 User Characteristics
- **End Users:** Retail banking customers (basic technical literacy).  
- **Admin Users:** Bank staff (finance operations, technical knowledge).  

### 2.4 Constraints
- Backend runtime: **Node.js 22.18.0 (LTS)**  
- Frontend: **Next.js 14 (App Router)**  
- Database: **Neon PostgreSQL with Prisma ORM**  
- Authentication: **NextAuth.js (Google OAuth 2.0)**  
- Deployment: **Vercel + Edge Functions**  
- CI/CD: **GitHub Actions**  

### 2.5 Assumptions and Dependencies
- Stable internet connectivity is assumed.  
- Stripe requires valid financial integration.  
- SendGrid requires a configured API key.  
- Users must have Google accounts for login in MVP.  

---

## 3. System Features

### 3.1 Authentication & Authorization
- Secure login via Google OAuth 2.0.  
- Role-based access (User, Admin).  
- Session persistence via NextAuth.js.  

### 3.2 Account Dashboard
- View balances, recent transactions, account details.  
- Responsive UI with Tailwind CSS and shadcn/ui.  

### 3.3 Fund Transfers
- Internal (within OBS) and external (via Stripe).  
- Transfer validation using Zod schemas.  

### 3.4 Transaction History
- Paginated history with filtering.  
- Real-time updates via React Query.  

### 3.5 Notifications
- Transaction confirmation emails via SendGrid.  

### 3.6 Administration
- Manage user accounts, monitor system logs.  

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- Web application, mobile responsive.  
- Dark/light mode support.  

### 4.2 Hardware Interfaces
- Accessible via browsers on desktops and mobile devices.  

### 4.3 Software Interfaces
- Stripe SDK for payments.  
- SendGrid for email notifications.  
- Cloudinary SDK for document uploads.  

### 4.4 Communication Interfaces
- HTTPS REST APIs, JSON format.  

---

## 5. Nonfunctional Requirements

### 5.1 Performance
- Response time < 200ms for 90% of requests.  
- Support up to 100,000 concurrent users (scaling via Vercel Edge Functions).  

### 5.2 Security
- Enforce HTTPS and TLS 1.3.  
- Role-based authorization.  
- Data encryption (PostgreSQL at rest, TLS in transit).  

### 5.3 Reliability & Availability
- 99.9% uptime SLA.  
- Automated backups via Neon PostgreSQL.  

### 5.4 Maintainability
- Strict coding standards (ESLint + Prettier).  
- Modular architecture with Prisma ORM.  

### 5.5 Usability
- Intuitive dashboard with shadcn/ui components.  
- Mobile-first responsive design.  

---

## 6. Other Requirements
- All code managed in GitHub with PR-based workflow.  
- CI/CD pipeline enforces linting, tests, and deployment.  
- Observability: Vercel Analytics and logging integration.  

---

## 7. MVP Development Plan

The project will be delivered in **3 iterations**, each producing a deployable MVP.

### **Iteration 1 – Core Authentication & Accounts**
- **Functional Requirements**
  - User login via Google OAuth 2.0.  
  - Dashboard with account balance and basic profile.  
- **Technical Implementation**
  - NextAuth.js integration.  
  - Neon PostgreSQL schema (users, accounts).  
- **Deliverables**
  - Secure login, dashboard prototype.  
- **Acceptance Criteria**
  - Users can log in with Google.  
  - Dashboard displays correct user data.  

---

### **Iteration 2 – Transactions & Notifications**
- **Functional Requirements**
  - Internal fund transfers.  
  - Transaction history display.  
  - Email confirmation of transfers.  
- **Technical Implementation**
  - Prisma ORM schema for transactions.  
  - React Query for real-time updates.  
  - SendGrid integration.  
- **Deliverables**
  - Working transfer system + email notifications.  
- **Acceptance Criteria**
  - Transfers update balances in real-time.  
  - Transaction history visible and accurate.  
  - Email confirmation received.  

---

### **Iteration 3 – Bill Payments & Admin Panel**
- **Functional Requirements**
  - External bill payments via Stripe.  
  - Admin panel for user management.  
- **Technical Implementation**
  - Stripe SDK integration.  
  - Admin role with restricted access.  
- **Deliverables**
  - Bill payment workflow.  
  - Admin dashboard.  
- **Acceptance Criteria**
  - Users can pay bills using Stripe.  
  - Admins can view/manage users.  

---

## 8. Architecture Overview

```mermaid
graph TD
    A[Frontend - Next.js 14 + TypeScript] -->|API Calls| B[Backend - Vercel Edge Functions]
    B --> C[Database - Neon PostgreSQL + Prisma]
    B --> D[Stripe SDK - Payments]
    B --> E[SendGrid - Email Service]
    B --> F[Cloudinary - Document Storage]
    A -->|Auth| G[NextAuth.js - Google OAuth 2.0]
    B --> H[Vercel Analytics]
