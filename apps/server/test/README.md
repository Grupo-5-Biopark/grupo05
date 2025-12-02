# E2E Testing Guide

## Overview

This directory contains end-to-end (e2e) tests for the NestJS backend application. These tests verify the entire application flow by making actual HTTP requests to the API.

## Test Files

- **`app.e2e-spec.ts`** - Basic health check endpoint test
- **`auth.e2e-spec.ts`** - Authentication and login endpoint tests
- **`users.e2e-spec.ts`** - User CRUD operations tests
- **`courses.e2e-spec.ts`** - Course CRUD operations tests
- **`classes.e2e-spec.ts`** - Class CRUD operations tests
- **`calculation-parameters.e2e-spec.ts`** - Calculation parameters CRUD operations tests

## Prerequisites

E2E tests require a running PostgreSQL database. You have two options:

### Option 1: Use Docker Compose (Recommended)

Start the database using docker-compose from the project root:

```bash
# From project root
docker-compose up -d postgres
```

### Option 2: Use Local PostgreSQL

Ensure you have PostgreSQL running locally with the credentials from `.env` file.

## Environment Setup

1. **Copy environment file:**

   ```bash
   cp ../../.env.example ../../.env
   ```

2. **Update database configuration in `.env`:**

   ```bash
   POSTGRES_USER=myuser
   POSTGRES_PASSWORD=mypassword
   POSTGRES_DB=mydatabase
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   ```

3. **Set JWT configuration:**
   ```bash
   JWT_SECRET=your-test-secret-key
   JWT_EXPIRES_IN=3600
   ```

## Running E2E Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run specific e2e test file
npm run test:e2e -- auth.e2e-spec.ts
npm run test:e2e -- users.e2e-spec.ts
```

## Test Structure

Each e2e test suite follows this pattern:

1. **Setup (`beforeAll`)**:
   - Create NestJS testing module
   - Initialize the application
   - Obtain authentication token (for protected routes)

2. **Test Cases**:
   - Test authentication requirements (401 responses)
   - Test validation (400 responses)
   - Test successful operations (200/201 responses)
   - Test error cases (404 responses)

3. **Cleanup (`afterAll`)**:
   - Remove created test data
   - Close application connections

## Authentication

Most endpoints require JWT authentication. Tests that need authentication will:

1. Attempt to login with test credentials (`admin@example.com`)
2. Extract the JWT token from the response
3. Include the token in subsequent requests

**Note**: You need to seed an admin user in the database for authenticated tests to work.

## Coverage

E2E tests cover:

- ✅ Authentication (login, JWT validation)
- ✅ Authorization (protected routes return 401 without token)
- ✅ Input validation (malformed requests return 400)
- ✅ CRUD operations for all entities
- ✅ Error handling (404 for non-existent resources)

## Troubleshooting

### "POSTGRES_HOST is a required variable"

- **Cause**: Missing environment variables
- **Solution**: Ensure `.env` file exists with proper database configuration

### "Cannot read properties of undefined (reading 'close')"

- **Cause**: Application failed to initialize
- **Solution**: Check that database is running and accessible

### Login returns 401 in authenticated tests

- **Cause**: No admin user in database
- **Solution**: Run the application once to seed the database, or manually create an admin user

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up created test data in `afterAll`
3. **Unique Data**: Use timestamps or UUIDs to ensure unique test data (e.g., `test-${Date.now()}@example.com`)
4. **Conditional Tests**: Skip authenticated tests gracefully if login fails
5. **Database State**: Consider using a separate test database to avoid affecting development data

## CI/CD Integration

For continuous integration, you can:

1. Use a separate test database
2. Run database migrations before tests
3. Seed required test data
4. Clean up after tests complete

Example GitHub Actions workflow:

```yaml
- name: Start PostgreSQL
  run: docker-compose up -d postgres

- name: Wait for database
  run: sleep 10

- name: Run e2e tests
  run: npm run test:e2e
  env:
    POSTGRES_HOST: localhost
    POSTGRES_PORT: 5432
    # ... other env vars
```
