/**
 * DevOps Through a Vue.js Application
 * 
 * This example demonstrates fundamental DevOps concepts that you'll encounter
 * in modern software development. We use a Vue.js application as our case study
 * to show how theory applies to real-world scenarios.
 *
 * Important considerations:
 *
 * - In real-world scenarios, you'll have more environments and more complex configurations. 
 * - In this example all our deployments are done using docker compose in the same host, in real world scenarios deployments of different environments will be done against cloud infrastructure
 *
 * Key Learning Objectives:
 *
 * 1. Understanding CI/CD (Continuous Integration/Continuous Deployment):
 *    - Learn how code changes automatically flow from development to production
 *    - See how automated testing ensures code quality
 *    - Experience different deployment environments in action
 *
 * 2. Version Control Workflow:
 *    - main branch: Where our production code lives
 *    - develop branch: Where we integrate and test new features
 *    - feature/* branches: Where we develop new functionality
 *    This is a common workflow you'll see in professional development teams!
 *
 * 3. Environment Management:
 *    - Learn how to handle different deployment environments
 *    - See how configuration changes between environments
 *    - Understand why isolation between environments is important
 *
 * 4. Infrastructure as Code (IaC):
 *    - See how Docker containers make deployments consistent
 *    - Learn how to define infrastructure in code
 *    - Understand why manual server configuration is problematic
 *
 * 5. Automated Testing:
 *    - Experience different types of testing:
 *      * Unit tests: Testing individual components
 *      * E2E tests: Testing the whole application
 *    - Learn why automated testing is crucial in DevOps
 *
 * 6. Pipeline Stages:
 *    Study how code flows through these stages:
 *    a) Get the code (Checkout)
 *    b) Install dependencies (Setup)
 *    c) Run tests (Unit Tests)
 *    d) Create deployable package (Build)
 *    e) Deploy to servers (Deploy)
 *    f) Verify deployment (E2E Tests)
 *    g) Clean up (Cleanup)
 *
 * 7. DevOps Best Practices:
 *    - Learn why automation is important
 *    - See how to manage different environments
 *    - Understand resource cleanup importance
 *
 * 8. Security in DevOps:
 *    - Learn about secure credential management
 *    - See how to handle sensitive configuration
 *    - Understand environment isolation
 *
 * 9. Resource Management:
 *    - Learn about cleaning up unused resources
 *    - Understand why resource management matters
 *    - See automated cleanup in action
 *
 * 10. Automation Triggers:
 *    - Learn how pipelines start automatically
 *    - Understand different trigger types
 *    - See branch-specific behaviors
 *
 * Important Configuration:
 * - Frontend runs on different ports for different environments
 * - API endpoints change between environments
 * - Each environment is isolated from others
 *
 * This example brings together:
 * - Modern web development (Vue.js)
 * - Container technology (Docker)
 * - Automated testing
 * - Environment management
 * - Continuous deployment
 */

pipeline {
    // Jenkins needs to know where to run this pipeline
    agent {
        docker {
            image 'jenkins-agent-node22:latest'
        }
    }

    parameters {
        // These parameters let us override default settings
        // This is useful for learning how configuration works
        string(name: 'OVERRIDE_FRONTEND_PORT', defaultValue: '', description: 'Optional: Change the frontend port (main: 8080, develop: 8081, features: 5000-5499)')
        string(name: 'OVERRIDE_API_PORT', defaultValue: '', description: 'Optional: Change the API port (main: 3001, develop: 3002, features: 3100-3599)')
        string(name: 'OVERRIDE_API_BASE_URL', defaultValue: '', description: 'Optional: Change where the API is located (default: http://host.docker.internal)')
    }

    environment {
        // Port Assignment Learning Example:
        // - Production (main): Uses port 8080 (standard HTTP port)
        // - Testing (develop): Uses port 8081 (separate from production)
        // - Feature branches: Use dynamic ports (prevents conflicts)
        HTTP_PORT = """${params.OVERRIDE_FRONTEND_PORT ?: (
            env.BRANCH_NAME == 'main' ? '8080' : (
            env.BRANCH_NAME == 'develop' ? '8081' : 
            (5000 + (BUILD_NUMBER.toInteger() % 500))
        ))}"""
        
        // API port configuration - similar concept to frontend ports
        API_PORT = """${params.OVERRIDE_API_PORT ?: (
            env.BRANCH_NAME == 'main' ? '3001' : '3002'
        )}"""

        // Secure way to handle sensitive data
        // Never put actual tokens in your code!
        VITE_API_TOKEN = credentials('app-api-token')

        // Building the API URL dynamically
        // Shows how configuration can change between environments
        VITE_API_BASE_URL = """${params.OVERRIDE_API_BASE_URL ?: "http://localhost:${API_PORT}"}"""
    }

    triggers {
        // Automatically check for code changes every 5 minutes
        // The schedule uses cron syntax: '*/5 * * * *'
        pollSCM('*/5 * * * *')
    }

    options {
        // Learn about managing build history:
        // - Keep more builds for important branches
        // - Clean up old builds to save space
        buildDiscarder(logRotator(
            numToKeepStr: BRANCH_NAME == 'main' || BRANCH_NAME == 'develop' ? '10' : '3',
            daysToKeepStr: BRANCH_NAME == 'main' || BRANCH_NAME == 'develop' ? '' : '2'
        ))
    }

    stages {
        // Each stage represents a step in our pipeline
        // This helps us organize and understand the process

        stage('Checkout') {
            steps {
                // Get the latest code from version control
                checkout scm
            }
        }

        stage('Setup') {
            steps {
                // Prepare our development environment
                sh 'corepack enable'  // Enable Yarn package manager
                sh 'yarn install'      // Install project dependencies
            }
        }

        stage('Unit Tests') {
            steps {
                // Run unit tests and measure code coverage
                sh 'yarn test:coverage'
            }
            post {
                always {
                    // Report JUnit test results
                    junit 'coverage/junit.xml'
                    // Report coverage results using new Coverage plugin
                    recordCoverage(
                        tools: [[parser: 'COBERTURA', pattern: 'coverage/cobertura-coverage.xml']],
                        id: 'vue-app',
                        name: 'Vue.js Application Coverage',
                        // Set coverage targets
                        qualityGates: [
                            [metric: 'LINE', threshold: 80.0],
                            [metric: 'BRANCH', threshold: 70.0],
                            [metric: 'METHOD', threshold: 80.0]
                        ]
                    )
                }
            }
        }

        stage('Build') {
            steps {
                // Create our Docker container
                sh 'docker compose build'
            }
        }

        stage('Deploy Test') {
            environment {
                ENVIRONMENT_ID = 'test'
            }
            when {
                // Only deploy to test when on develop branch
                branch 'develop'
            }
            steps {
                // Launch the application in test environment
                sh 'docker compose up -d --wait'
                echo "Test environment ready at http://localhost:${HTTP_PORT}"
            }
        }

        stage('Deploy Review') {
            environment {
                // Create unique names for feature branch deployments
                ENVIRONMENT_ID = "${'review-' + env.BRANCH_NAME.replaceAll(/[^a-zA-Z0-9]/, '-') + '-' + env.BUILD_NUMBER}"
            }
            when {
                // Only for feature branches
                branch pattern: "feature/*", comparator: "GLOB"
            }
            steps {
                // Launch the application in review environment
                sh 'docker compose up -d --wait'
                echo "Review environment ready at http://localhost:${HTTP_PORT}"
            }
        }

        stage('E2E Tests') {
            when {
                // Don't run E2E tests in production
                not { branch 'main' }
            }
            environment {
                // Tell tests where to find the application
                PLAYWRIGHT_TEST_BASE_URL = "http://host.docker.internal:${HTTP_PORT}"
            }
            steps {
                // Run end-to-end tests
                sh 'yarn playwright install-deps'
                sh 'yarn playwright install'
                sh 'yarn test:e2e'
            }
            post {
                // Save E2E test results
                always {
                    junit 'e2e/test-results/junit-results.xml'
                }
            }
        }

        stage('Cleanup Review') {
            environment {
                ENVIRONMENT_ID = "${'review-' + env.BRANCH_NAME.replaceAll(/[^a-zA-Z0-9]/, '-') + '-' + env.BUILD_NUMBER}"
            }
            when {
                // Only clean up feature branch deployments
                branch pattern: "feature/*", comparator: "GLOB"
            }
            steps {
                // Remove the review environment to save resources
                sh 'docker compose down -v --remove-orphans'
            }
        }

        stage('Deploy Production') {
            environment {
                ENVIRONMENT_ID = 'prod'
            }
            when {
                // Only deploy to production from main branch
                branch 'main'
            }
            steps {
                // Launch the application in production
                sh 'docker compose up -d --wait'
                echo "Production site is live at http://localhost:${HTTP_PORT}"
                echo "Production deployment complete"
            }
        }
    }

    // Actions to take after the pipeline finishes
    post {
        always {
            // Clean up our workspace to save space
            cleanWs(patterns: [[pattern: 'test-results/**', type: 'INCLUDE']])
        }
    }
}
