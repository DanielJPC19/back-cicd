[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/GsgP_xZE)

---

Acceda al informe para esta entrega del pipeline con Jenkins, dirigiendo al archivo informe-jenkins.md.

# CI/CD Pipeline Documentation

## Overview
This project uses a **Jenkins-based CI/CD pipeline** that automates testing, code quality analysis, security scanning, and deployment.

## Prerequisites

### Required Tools
- **Docker** (for running Jenkins and SonarQube)
- **Node.js** 18+
- **npm** 9+
- **Trivy** (Docker image available via `aquasec/trivy:latest`)
- **SonarQube** (Docker container - community edition)

### Jenkins Agent Requirements
- Label: `node docker nestjs`
- Must have Docker access
- Must be able to run npm commands

## Pipeline Stages

The pipeline consists of the following stages:

1. **Load Env** - Load environment variables from Jenkins credentials
2. **Checkout** - Clone code from repository
3. **Validate Branch** - Ensure only main branch is deployed
4. **Build** - Install dependencies and compile TypeScript
5. **Test** - Run unit tests
6. **SonarQube Analysis** - ✅ Static code analysis & Security Hotspot detection
7. **Docker Build** - Build Docker image
8. **Trivy Security Scan** - ✅ Scan Docker image for vulnerabilities
9. **Deploy** - Deploy to production using docker-compose

## Quality Gates (Gatekeeping)

The pipeline **FAILS** automatically if:

### SonarQube
- **Security Hotspots** detected (status: TO_REVIEW)
  - Accessed via: `http://localhost:9000/projects/compunet3-back`
  - Must be resolved before deployment

### Trivy
- **CRITICAL** vulnerabilities found in Docker image
  - Only scans for CRITICAL severity
  - Prevents deployment of unsafe containers

## Setup Instructions

### 1. Start SonarQube
```bash
docker run -d --name sonarqube -p 9000:9000 -p 9092:9092 sonarqube:community
```

**Initial Setup:**
- Access: http://localhost:9000
- Username: `admin`
- Password: `admin`
- Create a token in **My Account → Security → Tokens**

### 2. Configure Jenkins

Add these credentials in Jenkins:
- **Type:** Secret text
- **Secret:** Your SonarQube token
- **ID:** `sonarqube-token` (or update in Jenkinsfile)

### 3. Docker Build and Deployment

Ensure `docker-compose.yml` is configured with:
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000" # Adjust port as needed
    environment:
      - NODE_ENV=production
```

## Running the Pipeline Locally

### 1. Build and Test
```bash
npm ci
npm run build
npm test
```

### 2. SonarQube Analysis
```bash
npx sonar-scanner \
  -Dsonar.projectKey=compunet3-back \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_TOKEN
```

### 3. Docker Build
```bash
docker build -t compunet3-back:latest .
```

### 4. Trivy Scan
```bash
# Report all vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image compunet3-back:latest

# Fail on CRITICAL only
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 1 --severity CRITICAL compunet3-back:latest
```

### 5. Deploy
```bash
docker compose down
docker compose up -d --build
```

## Cleanup

The pipeline automatically:
- **On Success:** Removes unused Docker images (`docker image prune -f`)
- **On Failure:** Stops containers without failing the cleanup
- **Always:** Cleans the Jenkins workspace

## Troubleshooting

### SonarQube Connection Timeout
```
Error: Connection refused at http://localhost:9000
```
**Solution:** Ensure SonarQube container is running
```bash
docker ps | grep sonarqube
docker logs sonarqube
```

### Trivy Scanner Not Found
```
docker: command not found
```
**Solution:** Ensure Docker is running and accessible

### Security Hotspots Blocking Deployment
1. Review hotspots at: http://localhost:9000/security_hotspots
2. Mark as "Safe" or fix the code
3. Re-run the pipeline

### CRITICAL Vulnerabilities
1. Check Trivy report in Jenkins logs
2. Update base image or vulnerable dependencies
3. Example: If Node.js image has vulnerabilities, upgrade to latest LTS
   ```dockerfile
   FROM node:20-alpine  # Use latest LTS
   ```

## Environment Variables

Required in `.env` file (from Jenkins credentials):
```bash
DB_HOST =db-postgres
DB_TYPE =postgres
DB_PORT = 5432
DB_USERNAME = root
DB_PASSWORD =root
DB_DATABASE =vet
DB_SYNCHRONIZE=true
JWT_SECRET=c2d8e47b1f73a9e24f58107cdb1a5c926e3f0d87f5a3d9278e65c4a0f19d8e4b
JWT_EXPIRES_IN=1h
```

## Pipeline Flow Diagram

```
┌─────────────────┐
│   Load Env      │
└────────┬────────┘
         │
┌────────▼────────┐
│   Checkout      │
└────────┬────────┘
         │
┌────────▼──────────────┐
│ Validate Branch       │
│ (only main allowed)   │
└────────┬──────────────┘
         │
┌────────▼────────┐
│   Build (npm)   │
└────────┬────────┘
         │
┌────────▼────────┐
│   Tests (npm)   │
└────────┬────────┘
         │
┌────────▼───────────────────────────┐
│ SonarQube Analysis (Quality Gate)   │
│ ❌ FAILS if Security Hotspots found │
└────────┬───────────────────────────┘
         │
┌────────▼──────────────┐
│   Docker Build        │
└────────┬──────────────┘
         │
┌────────▼─────────────────────────────┐
│ Trivy Security Scan (Quality Gate)   │
│ ❌ FAILS if CRITICAL vulns found     │
└────────┬─────────────────────────────┘
         │
┌────────▼────────┐
│    Deploy       │
└────────┬────────┘
         │
    ✅ SUCCESS or ❌ FAILURE
    └─ Cleanup & Prune
```

---

Contenido del **.env**:
```bash
DB_HOST =localhost
DB_TYPE =postgres
DB_PORT = 5432
DB_USERNAME = root
DB_PASSWORD =root
DB_DATABASE =vet
DB_SYNCHRONIZE=true
JWT_SECRET=c2d8e47b1f73a9e24f58107cdb1a5c926e3f0d87f5a3d9278e65c4a0f19d8e4b
JWT_EXPIRES_IN=1h

```

> Para ver el informe, puedes dirigirte al archivo INFORME_API_VETERINARIA.md o dirigiendote a este enlace: [Informe](https://github.com/Computacion-3/taller-nest-hyprlandts/blob/main/INFORME_API_VETERINARIA.md)

> Para ver el video de deploy ve a [deploy](https://youtu.be/gOtUE5P9jSE)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
