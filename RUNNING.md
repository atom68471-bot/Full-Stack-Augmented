# 🚀 Financial Planner - Running & Setup Guide

This guide provides step-by-step instructions to build, test, and run the Financial Planner application.

## System Requirements

- **Java**: JDK 17 or higher
- **Maven**: 3.9 or higher
- **Node.js**: 20+ with npm 10+
- **Git**: 2.30+
- **Port Availability**: 8080 (backend), 4200 (frontend)

### Verify Installation

```bash
# Check Java
java -version

# Check Maven
mvn -version

# Check Node and npm
node --version
npm --version

# Check Git
git --version
```

---

## Quick Start (Docker Dev Container)

### Setup with VS Code Remote Containers

1. **Prerequisites:**
   - VS Code with "Remote - Containers" extension
   - Docker Desktop installed and running

2. **Steps:**
   ```bash
   # Open the project in VS Code
   code /path/to/Full-Stack-Augmented
   
   # Click the "Reopen in Container" prompt
   # OR Command Palette > Dev Containers: Reopen in Container
   ```

3. **Dev Container Initialization:**
   - Java 17 will be installed
   - Node 20 will be installed
   - Maven will be available
   - npm dependencies will be installed automatically

4. **Verify Container Setup:**
   ```bash
   java -version
   mvn -version
   node --version
   ```

---

## Local Setup (Manual Installation)

### 1. Navigate to Project Root

```bash
cd /path/to/Full-Stack-Augmented
```

### 2. Build Backend

```bash
cd backend

# Clean and compile
mvn clean compile

# Run all tests
mvn test

# Build JAR package
mvn clean package

# Back to root
cd ..
```

### 3. Install Frontend Dependencies

```bash
cd frontend

# Install npm packages
npm install

# Back to root
cd ..
```

### 4. Verify Builds

```bash
# Test that backend JAR exists
ls -la backend/target/backend-1.0.0.jar

# Test Angular CLI is available
npx @angular/cli@17 --version
```

---

## Running the Application
> A simple helper script is provided for convenience. From the project root run:
>
> ```bash
> ./run.sh        # build (if needed) and start both services
> ./run.sh build  # only build backend jar and install frontend deps
> ```
>

### Option 1: Run Both Services (Terminal Approach)

#### Terminal 1 - Start Backend

```bash
cd backend
mvn spring-boot:run

# Output should include:
# Started FinancialPlannerApplication in X.XXX seconds
# Tomcat started on port(s): 8080
```

#### Terminal 2 - Start Frontend

```bash
cd frontend
npm start

# Output should include:
# ✔ Compiled successfully.
# Application bundle generated. 
# Local: http://localhost:4200
```

#### Open Application

Navigate to: `http://localhost:4200`

### Option 2: Run Using Maven & npm (Parallel)

```bash
# Terminal 1
cd backend && mvn spring-boot:run

# Terminal 2
cd frontend && npm start
```

### Option 3: Build and Run JAR (Production-like)

```bash
# Build backend JAR
cd backend
mvn clean package
cd ..

# Run JAR in background
java -jar backend/target/backend-1.0.0.jar &

# Build and serve frontend
cd frontend
npm run build
npx http-server dist/financial-planner -p 4200 &
```

---

## API Testing

### Using curl

#### Get All Transactions
```bash
curl http://localhost:8080/api/transactions
```

#### Create a Transaction
```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-03-11",
    "amount": 50.00,
    "category": "Food",
    "type": "EXPENSE",
    "description": "Lunch at cafe"
  }'
```

#### Get Monthly Summary
```bash
curl "http://localhost:8080/api/transactions/summary?year=2024&month=3"
```

### Using Postman

1. Import the collection (create a `.postman_collection.json` or manually add requests)
2. Set base URL: `http://localhost:8080/api`
3. Test endpoints under "Transactions" folder

#### Sample Request
- **Method**: POST
- **URL**: `http://localhost:8080/api/transactions`
- **Body** (JSON):
  ```json
  {
    "date": "2024-03-11",
    "amount": 150.75,
    "category": "Salary",
    "type": "INCOME",
    "description": "Monthly salary deposit"
  }
  ```

---

## Testing

### Run Backend Tests

```bash
cd backend

# Run all tests with output
mvn test

# Run specific test class
mvn test -Dtest=TransactionServiceTest

# Generate coverage report
mvn test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

### Run Frontend Tests

```bash
cd frontend

# Run tests once
npm test -- --no-watch --browsers=ChromeHeadless

# Run tests in watch mode
npm test

# Generate coverage report
ng test --code-coverage
```

---

## Sample Data

### Insert Sample Transactions via API

```bash
# Income
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-03-01",
    "amount": 5000,
    "category": "Salary",
    "type": "INCOME",
    "description": "Monthly salary"
  }'

# Expense 1
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-03-05",
    "amount": 45.50,
    "category": "Food",
    "type": "EXPENSE",
    "description": "Groceries"
  }'

# Expense 2
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-03-07",
    "amount": 25.00,
    "category": "Transport",
    "type": "EXPENSE",
    "description": "Uber ride"
  }'

# Check summary
curl "http://localhost:8080/api/transactions/summary?year=2024&month=3"
```

---

## Development Workflow

### Frontend Development

```bash
cd frontend

# Start dev server with hot reload
npm start

# Build for production
npm run build

# Run linting
ng lint
```

### Backend Development

```bash
cd backend

# Start with auto-reload (requires spring-boot-devtools)
mvn spring-boot:run

# Package and test
mvn clean package

# View Java docs
mvn javadoc:javadoc
```

---

## Debugging

### Backend Debugging

Enable debug logs by adding to `backend/src/main/resources/application.properties`:
```properties
logging.level.com.financialplanner=DEBUG
spring.jpa.show-sql=true
```

### Frontend Debugging

Use Chrome DevTools:
1. Open `http://localhost:4200`
2. Press `F12` to open DevTools
3. Go to "Sources" tab to debug TypeScript

---

## Troubleshooting

### Port 8080 Already in Use

```bash
# Kill process using port 8080
lsof -ti :8080 | xargs kill -9

# Or use specific process ID
kill -9 <PID>
```

### Port 4200 Already in Use

```bash
# Run Angular on different port
ng serve --port 4300
```

### Maven Build Fails

```bash
# Clear cache
rm -rf ~/.m2/repository

# Try again
mvn clean install
```

### npm Install Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Backend Not Responding

```bash
# Check logs
curl http://localhost:8080/api/transactions

# If connection refused, restart backend
mvn spring-boot:run
```

### CORS Errors

Verify backend `application.properties` includes:
```properties
spring.web.cors.allowed-origins=*
spring.web.cors.allowed-methods=*
spring.web.cors.allowed-headers=*
```

---

## Production Deployment

### Build Artifacts

```bash
# Backend JAR
mvn clean package
# Output: backend/target/backend-1.0.0.jar

# Frontend bundle
npm run build
# Output: frontend/dist/financial-planner/
```

### Deploy Backend (Example: Heroku)

```bash
# Requires Procfile with:
# web: java -jar backend/target/backend-1.0.0.jar -Dserver.port=$PORT
```

### Deploy Frontend (Example: Netlify)

```bash
# Set build command: npm run build
# Set publish directory: frontend/dist/financial-planner
```

---

## Performance Tips

1. **Build Optimization:**
   - Use `mvn clean package -DskipTests` to skip tests during builds
   - Use `npm run build` for production Angular builds

2. **Development Environment:**
   - Keep dev servers running in background
   - Use VS Code Live Server for static file serving
   - Enable HMR (Hot Module Replacement) in Angular

3. **Memory:**
   - Backend: Default 1GB heap is usually sufficient
   - Frontend: Monitor node_modules size (~1GB uncompressed)

---

## Next Steps

### Unit Tests (Phase 3)
- Create test suites for all services and controllers
- Aim for >90% code coverage
- Use Copilot to generate boilerplate tests

### AI Integration (Phase 3)
- Implement `/analysis` endpoint with AI backend
- Create `AiClient` interface for provider abstraction
- Integrate with OpenAI or similar service

### Production Features (Phase 4)
- Add Spring Security for authentication
- Implement database persistence (PostgreSQL)
- Deploy to cloud platform

---

## Quick Reference Commands

```bash
# Backend
cd backend
mvn clean compile      # Compile only
mvn test              # Run tests
mvn clean package     # Build JAR
mvn spring-boot:run   # Run with hot reload
mvn -DskipTests clean package  # Build without tests

# Frontend
cd frontend
npm install           # Install dependencies
npm start             # Dev server (localhost:4200)
npm test              # Run tests
npm run build         # Production build
ng generate component components/my-component  # Generate component

# Both
cd && docker-compose up  # If docker-compose.yml exists
```

---

## Support & Documentation

- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **Angular Docs**: https://angular.io
- **Maven Docs**: https://maven.apache.org/
- **GitHub Copilot**: Ask in VS Code chat for code help

---

**Last Updated**: March 11, 2024
**Status**: Development Phase 1-2 Complete ✅
