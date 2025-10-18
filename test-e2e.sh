#!/bin/bash

docker compose down -v

docker compose up -d

npm run seed

npm run test:e2e