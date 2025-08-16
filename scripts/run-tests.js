#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

const runCommand = (command, description) => {
  log(`\n📋 ${description}`, 'cyan')
  log(`Running: ${command}`, 'blue')
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    log(`✅ ${description} completed successfully`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} failed`, 'red')
    log(`Error: ${error.message}`, 'red')
    return false
  }
}

const main = async () => {
  const testType = process.argv[2] || 'all'
  
  log('🧪 Online Banking System - Test Runner', 'bright')
  log('=' .repeat(50), 'cyan')
  
  // Test results tracking
  const results = {
    unit: null,
    integration: null,
    e2e: null,
    lint: null,
    typecheck: null
  }

  try {
    // Pre-test validation
    if (testType === 'all' || testType === 'lint') {
      results.lint = runCommand('npm run lint', 'ESLint Code Quality Check')
    }

    if (testType === 'all' || testType === 'typecheck') {
      results.typecheck = runCommand('npm run type-check', 'TypeScript Type Checking')
    }

    // Unit tests
    if (testType === 'all' || testType === 'unit') {
      results.unit = runCommand('npm run test:unit -- --passWithNoTests', 'Unit Tests')
    }

    // Integration tests
    if (testType === 'all' || testType === 'integration') {
      results.integration = runCommand('npm run test:integration -- --passWithNoTests', 'Integration Tests')
    }

    // E2E tests (only if server is running or in CI)
    if (testType === 'all' || testType === 'e2e') {
      log('\n🔄 Checking if development server is running...', 'yellow')
      
      try {
        execSync('curl -f http://localhost:3000 > /dev/null 2>&1', { stdio: 'ignore' })
        log('✅ Development server is running', 'green')
        results.e2e = runCommand('npm run test:e2e', 'End-to-End Tests')
      } catch {
        log('⚠️  Development server not running, skipping E2E tests', 'yellow')
        log('💡 Start server with: npm run dev', 'blue')
        results.e2e = 'skipped'
      }
    }

    // Coverage report (for unit and integration tests)
    if (testType === 'all' || testType === 'coverage') {
      log('\n📊 Generating coverage report...', 'cyan')
      runCommand('npm run test:coverage -- --passWithNoTests --silent', 'Test Coverage Report')
    }

  } catch (error) {
    log(`\n❌ Test execution failed: ${error.message}`, 'red')
    process.exit(1)
  }

  // Print summary
  log('\n' + '='.repeat(50), 'cyan')
  log('📊 TEST EXECUTION SUMMARY', 'bright')
  log('='.repeat(50), 'cyan')

  const printResult = (testName, result) => {
    const status = result === true ? '✅ PASSED' : 
                  result === false ? '❌ FAILED' : 
                  result === 'skipped' ? '⏭️  SKIPPED' : 
                  result === null ? '➖ NOT RUN' : '❓ UNKNOWN'
    
    const color = result === true ? 'green' : 
                 result === false ? 'red' : 
                 result === 'skipped' ? 'yellow' : 'reset'
    
    log(`${testName.padEnd(20)} ${status}`, color)
  }

  printResult('Linting:', results.lint)
  printResult('Type Check:', results.typecheck)
  printResult('Unit Tests:', results.unit)
  printResult('Integration:', results.integration)
  printResult('E2E Tests:', results.e2e)

  // Overall result
  const failedTests = Object.values(results).filter(result => result === false)
  const hasFailures = failedTests.length > 0

  log('\n' + '='.repeat(50), 'cyan')
  
  if (hasFailures) {
    log('❌ OVERALL RESULT: TESTS FAILED', 'red')
    log(`${failedTests.length} test suite(s) failed`, 'red')
    process.exit(1)
  } else {
    log('✅ OVERALL RESULT: ALL TESTS PASSED', 'green')
    log('🎉 Ready for deployment!', 'green')
  }

  // Additional information
  log('\n📋 Next Steps:', 'cyan')
  log('• View coverage report: open coverage/lcov-report/index.html', 'blue')
  log('• View E2E test report: npx playwright show-report', 'blue')
  log('• Run specific tests: npm test [pattern]', 'blue')
}

// Handle different test types
const validTestTypes = ['all', 'unit', 'integration', 'e2e', 'lint', 'typecheck', 'coverage']

if (process.argv[2] && !validTestTypes.includes(process.argv[2])) {
  log(`❌ Invalid test type: ${process.argv[2]}`, 'red')
  log(`Valid options: ${validTestTypes.join(', ')}`, 'blue')
  process.exit(1)
}

// Run the main function
main().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red')
  process.exit(1)
})
