pipeline {
    environment {
        IMAGE_NAME = 'compunet3-back'
    }
    agent { label 'node docker nestjs' }

    stages {
        stage('Load Env') {
            steps {
                echo 'Loading environment variables...'
                withCredentials([file(credentialsId: 'compunet3-env', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE .env'
                    sh 'cat .env | wc -l' // Verify that the .env file has been loaded
                }
            }
        }
        stage('Checkout') {
            // Checkout code from repository
            steps {
                echo 'Checking out code from repository...'
                checkout scm
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
        stage('Test') {
            // Run tests
            steps {
                echo 'Running tests...'
                sh 'npm test'
            }
        }
        stage('Docker Build') {
            // Build Docker Image
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t ${IMAGE_NAME}:latest .'
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
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
        always {
            cleanWs() // Clean workspace after execution
            echo 'Pipeline execution finished.'
        }
    }
}