# Testing Guide - Online Banking System

This document provides comprehensive testing documentation for the Online Banking System MVP Iteration 1, covering all acceptance criteria from the Software Requirements Specification.

## 🧪 Test Suite Overview

Our test suite follows a three-tier testing strategy:

1. **Unit Tests** - Component and function-level testing
2. **Integration Tests** - Cross-component and API testing
3. **End-to-End Tests** - Complete user workflow testing

## 📋 Test Coverage

### ✅ **Acceptance Criteria Coverage**

Based on SRS Iteration 1 requirements:

| Requirement                          | Test Type         | Status | Location                                       |
| ------------------------------------ | ----------------- | ------ | ---------------------------------------------- |
| Users can log in with Google         | E2E, Unit         | ✅     | `auth.spec.ts`, `signin-form.test.tsx`         |
| Dashboard displays correct user data | Integration, E2E  | ✅     | `dashboard-data.test.tsx`, `dashboard.spec.ts` |
| Responsive design (mobile/desktop)   | E2E               | ✅     | `responsive.spec.ts`                           |
| Secure session handling              | Integration       | ✅     | `auth-flow.test.tsx`                           |
| Account balance display              | Unit, Integration | ✅     | `account-overview.test.tsx`                    |
| Theme support (dark/light)           | E2E               | ✅     | `dashboard.spec.ts`                            |
| Account creation for new users       | Integration       | ✅     | `dashboard-data.test.tsx`                      |

### 📊 **Test Statistics**

- **Unit Tests**: 40+ test cases
- **Integration Tests**: 25+ test cases
- **E2E Tests**: 30+ test cases
- **Total Coverage**: 95%+ target
- **Browser Coverage**: Chrome, Firefox, Safari, Mobile

## 🛠️ **Testing Framework Stack**

### Unit & Integration Testing

- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - DOM matchers
- **@testing-library/user-event** - User interaction simulation

### End-to-End Testing

- **Playwright** - Cross-browser automation
- **Multiple browsers** - Chrome, Firefox, Safari
- **Mobile testing** - iOS Safari, Android Chrome
- **Visual regression** - Screenshot comparison

### Mocking & Test Data

- **MSW** - API mocking
- **jest-mock-extended** - Enhanced mocking
- **Custom test utilities** - Reusable test helpers

## 🚀 **Running Tests**

### Prerequisites

```bash
# Install dependencies
npm install

# Set up test database (if using real DB)
npm run db:test:push
```

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm test __tests__/integration/auth-flow.test.tsx
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test auth.spec.ts
```

### All Tests

```bash
# Run complete test suite
npm run test:all
```

## 📁 **Test Structure**

```
__tests__/
├── unit/                     # Unit tests
│   ├── components/           # Component tests
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard components
│   │   └── ui/              # UI components
│   ├── lib/                 # Utility function tests
│   └── api/                 # API route tests
├── integration/             # Integration tests
│   ├── auth-flow.test.tsx   # Authentication flow
│   └── dashboard-data.test.tsx # Dashboard data flow
├── e2e/                     # End-to-end tests
│   ├── auth.spec.ts         # Authentication workflows
│   ├── dashboard.spec.ts    # Dashboard functionality
│   └── responsive.spec.ts   # Responsive design
├── setup/                   # Test configuration
│   ├── global-setup.ts      # Global test setup
│   └── test-database.ts     # Database test utilities
└── utils/                   # Test utilities
    └── test-utils.tsx       # Custom render & helpers
```

## 🎯 **Key Test Scenarios**

### Authentication Tests

```typescript
// User can sign in with Google OAuth
test("should redirect to Google OAuth when sign-in clicked")

// Dashboard access control
test("should redirect unauthenticated users to sign-in")

// Session management
test("should handle session expiration gracefully")
```

### Dashboard Tests

```typescript
// Account display
test("should display correct account balances")

// Account creation
test("should create default account for new users")

// Responsive design
test("should work on mobile and desktop")
```

### API Tests

```typescript
// Account API
test("should return user accounts when authenticated")
test("should create new account with proper data")

// Error handling
test("should handle database errors gracefully")
```

## 📱 **Cross-Browser & Device Testing**

### Desktop Browsers

- **Chrome** (Latest)
- **Firefox** (Latest)
- **Safari** (Latest)
- **Edge** (Latest)

### Mobile Devices

- **iPhone 12** (iOS Safari)
- **Pixel 5** (Android Chrome)
- **iPad** (iOS Safari)

### Responsive Breakpoints

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## 🔧 **Test Configuration**

### Jest Configuration (`jest.config.js`)

```javascript
// Custom matchers, mock setup, coverage thresholds
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### Playwright Configuration (`playwright.config.ts`)

```javascript
// Browser configuration, test timeout, reporters
projects: [
  { name: "chromium" },
  { name: "firefox" },
  { name: "webkit" },
  { name: "Mobile Chrome" },
  { name: "Mobile Safari" },
]
```

## 🎪 **Mock Strategies**

### Authentication Mocking

```typescript
// Mock NextAuth session
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))
```

### Database Mocking

```typescript
// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    bankAccount: { findMany: jest.fn() },
  },
}))
```

### API Mocking (E2E)

```typescript
// Mock API responses in Playwright
await page.route('**/api/accounts', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ accounts: [...] })
  })
})
```

## 📊 **Test Data Management**

### Test Data Factories

```typescript
// Create consistent test data
export const createMockUser = (overrides = {}) => ({
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  role: "USER",
  ...overrides,
})
```

### Test Scenarios

```typescript
// Pre-defined test scenarios
export const testScenarios = {
  newUser: { session: createMockSession(), accounts: [] },
  userWithAccounts: { session: createMockSession(), accounts: [...] }
}
```

## 🚨 **Error Testing**

### Network Errors

```typescript
test("should handle API failures gracefully", async () => {
  mockApi.mockRejectedValue(new Error("Network error"))
  // Test error handling
})
```

### Database Errors

```typescript
test("should handle database connection failures", async () => {
  mockPrisma.findMany.mockRejectedValue(new Error("DB error"))
  // Test error recovery
})
```

### Authentication Errors

```typescript
test("should handle OAuth failures", async () => {
  mockSignIn.mockRejectedValue(new Error("OAuth error"))
  // Test auth error handling
})
```

## 🎭 **Accessibility Testing**

### ARIA Testing

```typescript
test("should have proper ARIA labels", () => {
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
})
```

### Keyboard Navigation

```typescript
test("should work with keyboard navigation", async () => {
  await page.keyboard.press("Tab")
  await expect(signInButton).toBeFocused()
})
```

## 📈 **Performance Testing**

### Load Time Testing

```typescript
test("should load within acceptable time", async ({ page }) => {
  const startTime = Date.now()
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  const loadTime = Date.now() - startTime
  expect(loadTime).toBeLessThan(3000) // 3 seconds
})
```

## 🔍 **Visual Regression Testing**

### Screenshot Testing

```typescript
test("should match visual baseline", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page).toHaveScreenshot("dashboard.png")
})
```

## 🚀 **CI/CD Integration**

### GitHub Actions

```yaml
- name: Run Tests
  run: |
    npm run test:unit
    npm run test:integration
    npm run test:e2e
```

### Test Reports

- **Coverage Reports**: HTML & JSON formats
- **E2E Reports**: Playwright HTML reports
- **JUnit XML**: For CI integration

## 🎯 **Quality Gates**

### Code Coverage Requirements

- **Minimum Coverage**: 70%
- **Critical Paths**: 90%+
- **New Code**: 80%+

### Test Success Criteria

- All unit tests pass
- All integration tests pass
- E2E tests pass on all target browsers
- No accessibility violations
- Performance benchmarks met

## 🔧 **Debugging Tests**

### Unit Test Debugging

```bash
# Debug specific test
npm test -- --runInBand signin-form.test.tsx

# Debug with verbose output
npm test -- --verbose
```

### E2E Test Debugging

```bash
# Run with headed browser
npx playwright test --headed

# Debug specific test
npx playwright test auth.spec.ts --debug

# Open trace viewer
npx playwright show-trace trace.zip
```

## 📚 **Best Practices**

### Test Writing Guidelines

1. **Descriptive test names** - What, when, expected result
2. **Arrange, Act, Assert** - Clear test structure
3. **Test user behavior** - Not implementation details
4. **Mock external dependencies** - Isolate units under test
5. **Use semantic queries** - `getByRole`, `getByLabelText`

### Performance Guidelines

1. **Parallel execution** - Run tests concurrently
2. **Smart mocking** - Mock expensive operations
3. **Test data cleanup** - Reset state between tests
4. **Selective test runs** - Only run affected tests when possible

---

## 🎉 **Summary**

This comprehensive test suite ensures the Online Banking System MVP Iteration 1 meets all acceptance criteria:

✅ **Complete Authentication Flow Testing**  
✅ **Dashboard Functionality Verification**  
✅ **Cross-Browser Compatibility**  
✅ **Mobile Responsiveness**  
✅ **Error Handling Coverage**  
✅ **Performance Benchmarks**  
✅ **Accessibility Compliance**

The test suite provides confidence in deployment and serves as documentation for expected system behavior.
