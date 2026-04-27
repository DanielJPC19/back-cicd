pipeline {
    environment {
        IMAGE_NAME = 'compunet3-back'
    }
    agent { label 'node docker nestjs' }

    stages {
        stage('Load Env') {
            steps {
                echo 'Loading environment variables...'
                withCredentials([file(credentialsId: '4d765e2f-7e6c-4246-bb9e-5ab6e3d4fd3a', variable: 'ENV_FILE')]) {
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
        stage('Validate Trigger') {
            steps {
                echo 'Validating trigger...'
                script {
                    echo "Build triggered by: ${env.BRANCH_NAME}"
                    echo "Change target branch: ${env.CHANGE_TARGET}"

                    if (env.BRANCH_NAME == 'main' || env.CHANGE_TARGET == 'main') {
                        echo 'Trigger is valid. Proceeding with the pipeline...'
                    } else {
                        error('Trigger is not valid. Pipeline will be aborted.')
                    }
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
            when {
                branch 'main'
            }
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