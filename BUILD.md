# VirtueHire - Build Instructions

## Prerequisites

### Required Software
- **Java 21** or higher (JDK) - [Download](https://adoptium.net/)
- **Node.js 20** or higher - [Download](https://nodejs.org/)
- **Maven 3.8+** (optional, wrapper included) - [Download](https://maven.apache.org/)

### Verify Installation
```cmd
java -version
node -v
npm -v
mvn -version
```

---

## Quick Build (Windows)

Simply run the build script:

```cmd
build.bat
```

This will:
1. Compile the Java backend
2. Install frontend dependencies
3. Build the React frontend
4. Run backend tests

---

## Manual Build

### 1. Build Backend (Java Spring Boot)

```cmd
cd Backend

# Compile
mvn clean compile

# Run tests
mvn test

# Package into JAR
mvn package -DskipTests

# Run the application
mvn spring-boot:run
```

Backend will be available at: `http://localhost:8080`

### 2. Build Frontend (React)

```cmd
cd Frontend

# Install dependencies
npm ci

# Start development server
npm start

# OR build for production
npm run build
```

Frontend dev server: `http://localhost:3000`
Production build: `Frontend/build/`

---

## IDE Setup

### IntelliJ IDEA / Eclipse (Backend)
1. Open the `Backend` folder as a Maven project
2. Wait for Maven to download dependencies
3. Run `VirtueHireApplication.java` as Spring Boot

### VS Code (Frontend)
1. Open the `Frontend` folder
2. Install recommended extensions (ES7+ React snippets)
3. Run `npm start` in terminal

---

## CI/CD (GitHub Actions)

The project includes automatic build on every push:

- **Build Workflow**: `.github/workflows/build.yml`
- Builds both backend and frontend
- Runs tests
- Uploads build artifacts

To trigger a build, simply push to GitHub:
```bash
git push origin main
```

---

## Troubleshooting

### Backend won't compile
- Check Java version: `java -version` (should be 21+)
- Clear Maven cache: `mvn clean`
- Check for compilation errors in console

### Frontend build fails
- Delete `node_modules` and `package-lock.json`
- Run `npm cache clean --force`
- Run `npm ci` again

### Port conflicts
- Backend uses port 8080
- Frontend dev server uses port 3000
- Make sure these ports are free

---

## Judge0 Code Execution Setup

Judge0 is integrated for running code in assessments. It requires Docker to run.

### Quick Start with Docker

```cmd
# Start all infrastructure services
docker-compose up -d

# Or start individually:
docker-compose up -d mysql      # MySQL database
docker-compose up -d judge0     # Judge0 code execution engine
```

### Judge0 Configuration

The configuration is in `Backend/src/main/resources/application.properties`:

```properties
# Local Judge0 instance (default)
judge0.base-url=http://localhost:2358

# For production with RapidAPI:
# judge0.base-url=https://judge0-ce.p.rapidapi.com
# judge0.api-key=YOUR_RAPIDAPI_KEY
```

### Verify Judge0 is Running

1. Wait 2-3 minutes after starting Docker
2. Test at: http://localhost:2358
3. Check status: http://localhost:2358/status

### Judge0 Language IDs

Common languages supported:
- C (GCC 7.4.0): 4
- C++ (GCC 7.4.0): 10
- Java (OpenJDK 17): 91
- Python 3.11: 71
- JavaScript (Node.js 18): 93
- TypeScript: 94

See full list: https://api.judge0.com/languages/

---

## Production Deployment

### Prerequisites for Production
- Docker and Docker Compose installed
- MySQL database running
- Judge0 running (for code execution)

### Backend
```cmd
cd Backend
mvn clean package -DskipTests
# JAR file will be in target/ folder
java -jar target/virtuehire-backend-*.jar
```

### Frontend
```cmd
cd Frontend
npm run build
# Static files will be in build/ folder
# Serve with any static file server
```

### Using Docker Compose (Full Stack)

```cmd
# Start everything
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop everything
docker-compose down
```
