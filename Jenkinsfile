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
 *   - Port: 3101 (production + 100)
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

    // Environment variables that will be available to all stages
    // These are crucial for configuration management and security
    environment {
        PROD_API_PORT = '3001'                                     // Production API port
        PROD_API_HOST = 'localhost'                                // Production API hostname
        REVIEW_API_HOST = 'localhost'                              // Review API hostname
        VITE_API_TOKEN = credentials('speedrun-api-token')         // Secure way to handle sensitive data
    }

    // Configure how the pipeline will be triggered
    triggers {
        // Poll SCM every 5 minutes for changes
        // The schedule uses cron syntax: '*/5 * * * *' means "every 5 minutes"
        pollSCM('*/5 * * * *')
    }

    // Pipeline options for build retention and trigger configuration
    options {
        // Keep only the last 10 builds to conserve disk space
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    // Pipeline stages run sequentially and represent different phases of the pipeline
    stages {
        // Setup stage: Prepare the environment and install dependencies
        stage('Setup') {
            steps {
                script {
                    // Set API URL based on branch
                    if (env.BRANCH_NAME == 'main') {
                        env.VITE_API_BASE_URL = "https://${PROD_API_HOST}:${PROD_API_PORT}"
                    } else {
                        // Review environment uses production port + 100
                        env.VITE_API_BASE_URL = "https://${REVIEW_API_HOST}:${PROD_API_PORT.toInteger() + 100}"
                    }
                }
                // Enable corepack for better yarn version management
                sh 'corepack enable'
                // Install project dependencies using yarn
                // --frozen-lockfile ensures consistent installations across builds
                sh 'yarn install --frozen-lockfile'
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
            when {
                // Only deploy review environment for non-main branches
                // This is a common pattern for feature branch testing
                not { branch 'main' }
            }
            steps {
                script {
                    // Set unique environment variables for this deployment
                    // This allows multiple review environments to coexist
                    env.ENVIRONMENT_ID = "review-${BUILD_NUMBER}"  // Unique identifier for each build
                    env.HTTP_PORT = "3000"                        // Port for the review environment
                    
                    // Use Docker Compose to build and start the application
                    // -p: project name (for isolation)
                    // -d: detached mode (run in background)
                    // --build: rebuild images to ensure latest code is used
                    sh 'docker compose up -d --build --wait'
                    echo "Deployed to http://localhost:${HTTP_PORT}"
                }
            }
        }

        // E2E Tests stage: Run end-to-end tests against the review environment
        stage('E2E Tests') {
            when {
                // Only run E2E tests for review environments (non-main branches)
                not { branch 'main' }
            }
            environment {
                // Configure Playwright to test the review deployment
                PLAYWRIGHT_URL = "http://localhost:${HTTP_PORT}"
            }
            steps {
                sh """
                    cd e2e
                    yarn install --frozen-lockfile
                    yarn playwright install --with-deps
                    yarn test:e2e
                """
            }
            post {
                always {
                    // Publish E2E test results
                    junit 'e2e/test-results/junit.xml'
                }
            }
        }

        // Deploy to Production stage: Deploy the application to production
        stage('Deploy to Production') {
            when {
                // Only deploy to production from the main branch
                // This is a common production deployment safety measure
                branch 'main'
            }
            steps {
                // Manual approval step for production deployments
                // This is a common practice for critical environments
                input message: 'Deploy to production?'
                script {
                    // Set production environment variables
                    env.ENVIRONMENT_ID = "prod"
                    env.HTTP_PORT = "8080"
                    
                    // Deploy to production using Docker Compose
                    sh 'docker compose up -d --build --wait'
                    echo "Deployed to http://localhost:${HTTP_PORT}"
                }
            }
        }
    }

    // Post-pipeline actions
    post {
        // 'always' section runs regardless of pipeline success/failure
        always {
            script {
                    // Clean up Docker containers to prevent resource buildup
                    // This is important for maintaining server resources
                    sh 'docker compose down'
                }
            }
            // Clean up workspace to save disk space
            cleanWs()
        }
    }
}
