#!/bin/bash

# Exit on any error
set -e

echo "Cleaning up previous environment..."
docker compose down -v

echo "Starting services..."
docker compose up -d

echo "Waiting for database to be ready..."
sleep 5

echo "Seeding database..."
cp .env.test .env 2>/dev/null || echo "Using existing .env file"
npm run seed

echo "Running e2e tests..."
npm run test:e2e

echo "Tests completed"