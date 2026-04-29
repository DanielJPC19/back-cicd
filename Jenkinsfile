pipeline {
    environment {
        IMAGE_NAME = 'compunet3-back'
    }
    agent { label 'node docker nestjs' }

    stages {
        stage('Checkout') {
            // Checkout code from repository
            steps {
                echo 'Checking out code from repository...'
                checkout scm
            }
        }
        stage('Load Env') {
            steps {
                echo 'Loading environment variables...'
                withCredentials([file(credentialsId: '4d765e2f-7e6c-4246-bb9e-5ab6e3d4fd3a', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE .env'
                    sh 'cat .env | wc -l' // Verify that the .env file has been loaded
                }
            }
        }
        stage('Validate Branch') {
            steps {
                script {
                    def branch = sh(
                        script: 'git rev-parse --abbrev-ref HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Current branch: ${branch}"

                    if (branch != 'main' && branch != 'HEAD') {
                        error("Build aborted: this job only runs on 'main', current branch is '${branch}'.")
                    }

                    echo 'Branch is main. Proceeding...'
                }
            }
        }
        stage('Build') {
            // Build the application
            steps {
                echo 'Building the application...'
                sh 'npm ci'
                sh 'npm run build'
            }
        }
        stage('Test + Coverage') {
            // Run tests
            steps {
                echo 'Running tests...'
                sh 'npm run test:cov'
            }
        }
        stage('Static Analysis (SonarQube)') {
            steps {
                echo 'Running SonarQube analysis...'

                withSonarQubeEnv('SonarQube') {
                    sh 'npx sonar-scanner -Dsonar.projectKey=compunet3-back -Dsonar.host.url=http://sonarqube:9000'
                }
            }
        }
        stage('SonarQube Analysis') {
            // Static code analysis with quality gate
            steps {
                echo 'Running SonarQube analysis...'
                script {
                    sh '''
                        npx sonar-scanner \
                            -Dsonar.projectKey=compunet3-back \
                            -Dsonar.sources=src \
                            -Dsonar.host.url=http://localhost:9000 \
                            -Dsonar.login=sqa_e62de8ebd5f6f036665ae690a921591c62fbdee8
                    '''

                    // Check for Security Hotspots
                    echo 'Checking for Security Hotspots...'
                    def hotspots = sh(
                        script: '''
                            curl -s "http://localhost:9000/api/hotspots/search?projectKey=compunet3-back&status=TO_REVIEW" | grep -o '"total":[0-9]*' | head -1 | cut -d':' -f2
                        ''',
                        returnStdout: true
                    ).trim()

                    if (hotspots.toInteger() > 0) {
                        error("SonarQube found ${hotspots} Security Hotspot(s). Please review and fix them before deploying.")
                    } else {
                        echo "No Security Hotspots found. ✓"
                    }
                }
            }
        }
        stage('Docker Build') {
            // Build Docker Image
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t ${IMAGE_NAME}:latest .'
            }
        }
        stage('Trivy Security Scan') {
            // Container security scan with quality gate
            steps {
                echo 'Scanning Docker image for vulnerabilities...'
                script {
                    // First scan: report all vulnerabilities (exit-code 0)
                    sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 0 ${IMAGE_NAME}:latest'

                    // Second scan: fail if CRITICAL vulnerabilities found (exit-code 1)
                    echo 'Checking for CRITICAL vulnerabilities...'
                    sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 1 --severity CRITICAL ${IMAGE_NAME}:latest'
                }
            }
        }
        stage('Deploy') {
            // Deploy the application
            steps {
                echo 'Deploying the application...'
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '✓ Pipeline completed successfully!'
            sh 'docker image prune -f' // Clean unused Docker images
        }
        failure {
            echo '✗ Pipeline failed. Please check the logs for details.'
            sh 'docker compose down || true' // Stop containers without failing
        }
        always {
            echo 'Performing cleanup...'
            cleanWs() // Clean workspace after execution
            echo 'Pipeline execution finished.'
        }
    }
}