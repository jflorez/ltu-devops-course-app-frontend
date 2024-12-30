/**
 * Jenkins Pipeline Configuration for Speedrun Tracker Frontend
 * 
 * This Jenkinsfile implements a trunk-based development workflow where:
 * - 'main' branch is the trunk (source of truth)
 * - Feature branches are short-lived (usually less than 2 days)
 * - All changes are integrated frequently into the trunk
 * - Only trunk (main) gets deployed to production
 * - E2E tests run only on feature branch deployments
 *
 * Required Jenkins Credentials:
 * - speedrun-api-token: API token for backend authentication
 *   Used as VITE_API_TOKEN in the application
 *
 * Environment Configuration:
 * - VITE_API_BASE_URL: Backend API endpoint
 *   - Production: https://api.speedrun-app.example.com:3001
 *   - Review: https://api-review.speedrun-app.example.com:3101
 * - ENVIRONMENT_ID: Automatically set by pipeline
 *   - review-{BUILD_NUMBER} for feature branches
 *   - prod for production deployment
 * - HTTP_PORT: Frontend application port
 *   - Review: 3000
 *   - Production: 8080
 *
 * API Configuration:
 * - Production:
 *   - Host: api.speedrun-app.example.com
 *   - Port: 3001
 * - Review:
 *   - Host: api-review.speedrun-app.example.com
 *   - Port: 3101
 * This convention ensures clear separation between environments
 * and allows for different deployment targets
 *
 * Docker Configuration:
 * - Uses Docker Compose for containerization
 * - Project names ensure environment isolation:
 *   - Review: speedrun-review-{BUILD_NUMBER}
 *   - Production: speedrun-prod
 * - Containers are automatically cleaned up post-deployment
 *
 * DevOps Learning Points:
 * 1. Continuous Integration (CI):
 *    - Automated testing on every code change
 *    - Unit tests run on all branches
 *    - E2E tests run only on feature branches
 *    - Test results published in JUnit format
 * 
 * 2. Continuous Deployment (CD):
 *    - Automated deployments to review environment
 *    - Manual approval for production deployments
 *    - Environment-specific configurations
 *    - Container-based deployments
 * 
 * 3. Best Practices:
 *    - Environment separation (review vs prod)
 *    - Port isolation between environments
 *    - Automated cleanup of resources
 *    - Regular SCM polling (every 5 minutes)
 *    - Build history management (keep last 10)
 *    - Secure credential handling
 *    - Workspace cleanup post-deployment
 *    - Environment-specific hostnames
 * 
 * 4. Testing Strategy:
 *    - Unit tests for all branches
 *    - E2E tests only for review environments
 *    - "Shift Left" testing with early feature validation
 *    - Test result tracking and analysis
 */

// This Jenkinsfile defines a CI/CD pipeline for a Vue.js frontend application
// CI/CD (Continuous Integration/Continuous Deployment) automates the process of
// building, testing, and deploying software.

pipeline {
    // 'agent any' means this pipeline can run on any available Jenkins agent
    // In a real-world scenario, you might want to specify a particular agent
    // with specific tools or capabilities
    agent any

    parameters {
        // Optional port overrides
        string(name: 'OVERRIDE_FRONTEND_PORT', defaultValue: '', description: 'Optional: Override the default frontend port (main: 8080, develop: 8081, other branches: 5000-5499)')
        string(name: 'OVERRIDE_API_PORT', defaultValue: '', description: 'Optional: Override the default API port (main: 3001, develop: 3002, other branches: 3100-3599)')
        
        // API configuration
        string(name: 'VITE_API_BASE_URL', defaultValue: 'http://localhost', description: 'Base URL for the API endpoint')
    }

    // Environment variables that will be available to all stages
    // These are crucial for configuration management and security
    environment {
        // Dynamic Port Assignment:
        // - For main branch: Uses fixed production ports (8080 for frontend, 3001 for API)
        // - For develop branch: Uses fixed test ports (8081 for frontend, 3002 for API)
        // - For feature branches: Calculates unique ports based on build number to avoid conflicts
        //   Frontend ports range: 5000-5499
        //   API ports range: 3100-3599
        HTTP_PORT = """${params.OVERRIDE_FRONTEND_PORT ?: (
            env.BRANCH_NAME == 'main' ? '8080' : (
            env.BRANCH_NAME == 'develop' ? '8081' : 
            (5000 + (BUILD_NUMBER.toInteger() % 500))
        ))}"""
        API_PORT = """${params.OVERRIDE_API_PORT ?: (
            env.BRANCH_NAME == 'main' ? '3001' : '3002'
        )}"""

        // Secure Credential Management:
        // Jenkins credentials store sensitive data like tokens
        // These are automatically masked in logs for security
        VITE_API_TOKEN = credentials('speedrun-api-token')

        // Environment Identification:
        // Creates a unique identifier for each deployment environment
        // - 'prod' for production (main branch)
        // - 'test' for testing (develop branch)
        // - 'review-{branch-name}-{build-number}' for feature branches
        // The replaceAll regex removes any non-alphanumeric characters for clean environment names
        ENVIRONMENT_ID = """${
            env.BRANCH_NAME == 'main' ? 'prod' : (
            env.BRANCH_NAME == 'develop' ? 'test' : 
            'review-' + env.BRANCH_NAME.replaceAll(/[^a-zA-Z0-9]/, '-') + '-' + env.BUILD_NUMBER
        )}"""

        // Construct full API URL with dynamic port
        VITE_API_BASE_URL = "${params.VITE_API_BASE_URL}:${API_PORT}"
    }

    // Configure how the pipeline will be triggered
    triggers {
        // Poll SCM every 5 minutes for changes
        // The schedule uses cron syntax: '*/5 * * * *' means "every 5 minutes"
        pollSCM('*/5 * * * *')
    }

    options {
        // Build retention strategy to manage disk space while maintaining useful history
        // - Main branch: Keep 10 builds (production history)
        // - Feature branches: Keep 3 builds for 2 days (temporary work)
        buildDiscarder(logRotator(
            numToKeepStr: BRANCH_NAME == 'main' || BRANCH_NAME == 'develop' ? '10' : '3',
            daysToKeepStr: BRANCH_NAME == 'main' || BRANCH_NAME == 'develop' ? '' : '2'
        ))
    }

    // Pipeline stages run sequentially and represent different phases of the pipeline
    stages {
        // Stage 1: Source Code Management
        stage('Checkout') {
            steps {
                // Fetch the latest code from version control
                // 'scm' refers to the Source Control Management system configured in the job
                checkout scm
            }
        }
        // Setup stage: Prepare the environment and install dependencies
        stage('Setup') {
            steps {
                // Enable corepack for better yarn version management
                sh 'corepack enable'
                // Install project dependencies using yarn
                sh 'yarn install'
            }
        }

        // Unit Tests stage: Run automated tests to verify individual components
        stage('Unit Tests') {
            steps {
                // Run Jest tests with coverage reporting
                sh 'yarn test:coverage'
            }
            post {
                // 'post' section defines actions to take after stage completion
                always {
                    // Publish test results in JUnit format for Jenkins to analyze
                    junit 'coverage/junit.xml'
                }
            }
        }

        // Deploy to Review stage: Create a temporary environment for testing
        // This is part of the "Shift Left" testing strategy, allowing early testing
        stage('Deploy to Review') {
            steps {
                script {
                    sh 'docker compose up -d --build --wait'
                    echo "Deployed to http://localhost:${HTTP_PORT}"
                }
            }
        }

        // E2E Tests stage: Run end-to-end tests against the review environment
        stage('E2E Tests') {
            when {
                // Only run E2E tests for test and review environments (non-main branches)
                not { branch 'main' }
            }
            environment {
                // Configure Playwright to test the review deployment
                PLAYWRIGHT_URL = "http://localhost:${HTTP_PORT}"
            }
            steps {
                sh 'yarn test:e2e'
            }
            post {
                always {
                    // Publish E2E test results
                    junit 'e2e/test-results/junit.xml'
                }
            }
        }

        stage('Build') {
            when {
                // Only build Docker images for develop and main branches
                anyOf {
                    branch 'develop'
                    branch 'main'
                }
            }
            steps {
                // Build Docker images using docker-compose
                // This creates consistent, reproducible environments
                // In real world use the images will be stored in a registry and pulled from there during deployment
                sh 'docker compose build'
            }
        }

        stage('Deploy Test') {
            when {
                // Only deploy test environment for develop branch
                branch 'develop'
            }
            steps {
                sh 'docker compose down -v --remove-orphans'
                sh 'docker compose up -d --wait'
                echo "Deployed to http://localhost:${HTTP_PORT}"
            }
        }

        // Deploy to Production stage: Deploy the application to production
        stage('Deploy Production') {
            when {
                // Only deploy to production from the main branch
                // This is a common production deployment safety measure
                branch 'main'
            }
            steps {
                sh 'docker compose down --remove-orphans'
                sh 'docker compose up -d --wait'
                echo "Deployed to http://localhost:${HTTP_PORT}"
                echo "Production deployment complete"
            }
        }
    }

    // Post-build actions
    post {
        // Always perform these actions to clean up after the build
        always {
            // Clean up test artifacts to save disk space
            cleanWs(patterns: [[pattern: 'test-results/**', type: 'INCLUDE']])
        }
    }
}
