/**
 * DevOps Pipeline Example
 * 
 * This pipeline configuration demonstrates core DevOps principles and practices
 * through a Vue.js application deployment. It serves as a learning example for
 * understanding fundamental DevOps concepts.
 *
 * Core DevOps Concepts Demonstrated:
 *
 * 1. Continuous Integration & Continuous Deployment (CI/CD):
 *    - Automated build and deployment pipeline
 *    - Multiple environment support
 *    - Automated testing at multiple stages
 *    - Consistent deployment processes
 *
 * 2. GitOps & Branch Strategy:
 *    - Production branch (main) → Live environment
 *    - Development branch (develop) → Testing environment
 *    - Feature branches → Review environments
 *    This represents standard git workflow practices in modern development.
 *
 * 3. Environment Management:
 *    - Isolated environments for different purposes
 *    - Dynamic resource allocation
 *    - Environment-specific configurations
 *    - Secure credential handling
 *
 * 4. Infrastructure as Code (IaC):
 *    - Containerized applications
 *    - Declarative configuration
 *    - Reproducible environments
 *    - Automated infrastructure management
 *
 * 5. Testing Strategy:
 *    - Shift-Left Testing approach
 *    - Multiple testing layers:
 *      * Unit testing for components
 *      * End-to-end testing for integration
 *    - Automated test execution
 *    - Test result reporting and analysis
 *
 * 6. Pipeline Stages (Standard CI/CD Flow):
 *    a) Source → Retrieve code
 *    b) Dependencies → Prepare build environment
 *    c) Test → Verify code quality
 *    d) Build → Create deployable artifacts
 *    e) Deploy → Release to appropriate environment
 *    f) Validate → Verify deployment
 *    g) Cleanup → Manage resources
 *
 * 7. DevOps Best Practices:
 *    - Automated processes
 *    - Environment isolation
 *    - Resource management
 *    - Build artifact retention
 *    - Workspace maintenance
 *    - Continuous monitoring
 *
 * 8. Configuration Management:
 *    - Environment variables
 *    - Secure secrets handling
 *    - Dynamic configuration
 *    - Port management
 *
 * 9. Resource Optimization:
 *    - Cleanup of temporary resources
 *    - Build history management
 *    - Workspace cleanup
 *    - Container lifecycle management
 *
 * 10. Pipeline Triggers:
 *    - Source code change detection
 *    - Automated pipeline execution
 *    - Branch-specific behaviors
 *
 * Common Pipeline Parameters:
 * - Frontend port configuration
 * - API endpoint configuration
 * - Base URL configuration
 *
 * This implementation showcases the integration of:
 * - Version Control
 * - Containerization
 * - Automated Testing
 * - Configuration Management
 * - Environment Management
 * - Continuous Deployment
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
        string(name: 'OVERRIDE_API_BASE_URL', defaultValue: '', description: 'Optional: Override the default API base URL (default: http://host.docker.internal)')
    }

    // Environment variables that will be available to all stages
    // These are crucial for configuration management and security
    environment {
        // Dynamic Port Assignment:
        // - For main branch: Uses fixed production ports (8080 for frontend, 3001 for API)
        // - For develop branch: Uses fixed test ports (8081 for frontend, 3002 for API)
        // - For feature branches: Calculates unique ports based on build number to avoid conflicts
        //   Frontend ports range: 5000-5499
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
        VITE_API_TOKEN = credentials('app-api-token')

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

        // Docker host constant for container-to-host communication
        FRONTEND_HOST = 'host.docker.internal'

        // Construct full API URL with dynamic port, allowing for override
        VITE_API_BASE_URL = """${params.OVERRIDE_API_BASE_URL ?: "http://localhost:${API_PORT}"}"""
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

    // Pipeline stages represent the core DevOps workflow phases
    // Each stage represents a distinct step in the software delivery process
    stages {
        // Source Code Management
        // Retrieves latest code and establishes the build context
        stage('Checkout') {
            steps {
                // Standard SCM checkout for version control integration
                checkout scm
            }
        }

        // Environment Preparation
        // Sets up build tools and project dependencies
        stage('Setup') {
            steps {
                // Enable package manager version control
                sh 'corepack enable'
                // Install project dependencies
                sh 'yarn install'
            }
        }

        // Quality Assurance - Unit Testing
        // Executes component-level tests and generates coverage reports
        stage('Unit Tests') {
            steps {
                sh 'yarn test:coverage'
            }
            post {
                // Collect test results for analysis
                always {
                    junit 'coverage/junit.xml'
                }
            }
        }

        // Artifact Creation
        // Builds Docker images for deployment
        stage('Build') {
            when {
                // Build artifacts for main deployment branches
                anyOf {
                    branch 'develop'
                    branch 'main'
                }
            }
            steps {
                sh 'docker compose build'
            }
        }

        // Non-Production Deployment
        // Handles deployments to development and review environments
        stage('Deploy Review/Test') {
            when {
                anyOf {
                    branch 'develop'
                    branch pattern: "feature/*", comparator: "GLOB"
                }
            }
            steps {
                // Clean environment and deploy
                sh 'docker compose down -v --remove-orphans'
                sh 'docker compose up -d --wait'
                echo "Deployed to http://localhost:${HTTP_PORT}"
            }
        }

        // Integration Testing
        // Executes E2E tests against deployed environment
        stage('E2E Tests') {
            when {
                not { branch 'main' }
            }
            environment {
                PLAYWRIGHT_TEST_BASE_URL = "http://${FRONTEND_HOST}:${HTTP_PORT}"
            }
            steps {
                // Setup and execute E2E test suite
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

        // Resource Management
        // Cleans up review environments to prevent resource saturation
        stage('Cleanup Review') {
            when {
                branch pattern: "feature/*", comparator: "GLOB"
            }
            steps {
                sh 'docker compose down -v --remove-orphans'
            }
        }

        // Production Release
        // Manages deployment to production environment
        stage('Deploy Production') {
            when {
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

    // Pipeline Cleanup
    // Handles post-execution workspace management
    post {
        always {
            cleanWs(patterns: [[pattern: 'test-results/**', type: 'INCLUDE']])
        }
    }
}
