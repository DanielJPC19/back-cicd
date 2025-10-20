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
npm run seed

echo "Running e2e tests..."
npm run test:e2e

echo "Tests completed"