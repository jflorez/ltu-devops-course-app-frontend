# End-to-End Testing in DevOps

This directory contains the End-to-End (E2E) tests for the Speedrun Tracker Frontend. E2E testing is a crucial component of the DevOps pipeline, ensuring that the application works as expected from a user's perspective.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Setup and Installation](#setup-and-installation)
- [Running Tests](#running-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Overview

End-to-End testing in this project follows key DevOps principles:

1. **Shift-Left Testing**

   - Early integration in development cycle
   - Part of CI/CD pipeline
   - Automated execution on feature branches

2. **Test Environment Management**

   - Isolated test environments
   - Dynamic port allocation
   - Docker-based consistency

3. **Continuous Testing**
   - Automated test execution
   - Jenkins pipeline integration
   - Test result reporting

## Test Structure

```
e2e/
├── tests/                 # Test specifications
│   ├── components/       # Component-specific tests
│   ├── pages/           # Page-specific tests
│   └── utils/           # Test utilities
├── playwright.config.ts  # Playwright configuration
└── test-results/        # Test execution results
```

## Setup and Installation

1. **Install Dependencies**:

```bash
yarn install
```

2. **Install Playwright**:

```bash
yarn playwright install-deps
yarn playwright install
```

3. **Configure Test Environment**:

```bash
# Set environment variables for testing
export PLAYWRIGHT_TEST_BASE_URL=http://localhost:8080
```

## Running Tests

### Local Development

```bash
# Run all tests
yarn test:e2e

# Run specific test file
yarn test:e2e tests/example.spec.ts

# Run tests in headed mode
yarn test:e2e --headed
```

### Debug Mode

```bash
# Run with debugger
yarn test:e2e --debug

# Run with UI mode
yarn test:e2e --ui
```

## CI/CD Integration

### Jenkins Pipeline Integration

1. **Test Execution**:

   - Runs after successful deployment
   - Uses dynamic environment URL
   - Executes against deployed instance

2. **Test Reporting**:

   - JUnit XML reports
   - HTML test results
   - Screenshot artifacts

3. **Pipeline Configuration**:

```groovy
stage('E2E Tests') {
    environment {
        PLAYWRIGHT_TEST_BASE_URL = "http://localhost:${HTTP_PORT}"
    }
    steps {
        sh 'yarn playwright install-deps'
        sh 'yarn playwright install'
        sh 'yarn test:e2e'
    }
    post {
        always {
            junit 'e2e/test-results/junit-results.xml'
        }
    }
}
```

## Best Practices

### 1. Test Independence

- Self-contained tests
- No shared state
- Clean environment per test

### 2. Environment Awareness

- Dynamic configuration
- Environment variables
- Flexible routing

### 3. Test Reliability

- Retry mechanisms
- Timeout handling
- Error screenshots

### 4. Maintenance

- Regular updates
- Flaky test monitoring
- Documentation

## Common Issues and Solutions

1. **Connection Issues**:

   - Ensure correct port configuration
   - Check Docker network settings
   - Verify localhost connectivity

2. **Test Flakiness**:

   - Implement proper wait mechanisms
   - Use test retry options
   - Add detailed error logging

3. **Browser Compatibility**:
   - Regular browser updates
   - Cross-browser testing
   - Platform-specific configurations
