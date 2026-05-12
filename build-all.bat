@echo off
chcp 65001 >nul
echo ==========================================
echo    VirtueHire - Complete Build Script
echo    Includes Judge0 Code Execution Setup
echo ==========================================
echo.

REM Check prerequisites
echo [CHECK] Verifying prerequisites...

java -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java not found! Install Java 21 from https://adoptium.net/
    pause
    exit /b 1
)

node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Install from https://nodejs.org/
    pause
    exit /b 1
)

docker -v >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker not found. Judge0 will need manual setup.
    echo Download from: https://docs.docker.com/get-docker/
)

echo [OK] Prerequisites verified
echo.

REM Start infrastructure services
echo ==========================================
echo [1/5] Starting Infrastructure Services...
echo ==========================================
echo.

docker-compose -f "%~dp0docker-compose.yml" up -d mysql 2>nul
if errorlevel 1 (
    echo [WARNING] Could not start MySQL via Docker
    echo Ensure MySQL is running on port 3306
) else (
    echo [OK] MySQL container started
)

echo.
echo [INFO] Judge0 Setup Instructions:
echo 1. Install Docker Desktop
echo 2. Run: docker-compose up -d judge0
echo 3. Wait 2-3 minutes for Judge0 to initialize
echo 4. Test at: http://localhost:2358
echo.

REM Build Backend
echo ==========================================
echo [2/5] Building Java Backend...
echo ==========================================
echo.

cd "%~dp0Backend"

echo Cleaning previous builds...
call mvn clean -q 2>nul
if errorlevel 1 (
    echo [WARNING] Maven clean failed, continuing...
)

echo Compiling Java sources...
call mvn compile -q

if errorlevel 1 (
    echo.
    echo [ERROR] Backend compilation failed!
    echo.
    echo Common issues:
    echo - Check internet connection (downloads dependencies)
    echo - Verify JAVA_HOME environment variable
    echo - Check for syntax errors in recently modified files
    cd "%~dp0"
    pause
    exit /b 1
)

echo [SUCCESS] Backend compiled successfully!
echo.

REM Run Backend Tests
echo Running tests...
call mvn test -q

if errorlevel 1 (
    echo [WARNING] Some tests failed
) else (
    echo [SUCCESS] All tests passed!
)

echo.
cd "%~dp0"

REM Package Backend
echo ==========================================
echo [3/5] Packaging Backend JAR...
echo ==========================================
echo.

cd "%~dp0Backend"
call mvn package -DskipTests -q

if errorlevel 1 (
    echo [ERROR] Failed to package JAR
    cd "%~dp0"
    pause
    exit /b 1
)

echo [SUCCESS] JAR created: target\virtuehire-backend-*.jar
echo.
cd "%~dp0"

REM Build Frontend
echo ==========================================
echo [4/5] Building React Frontend...
echo ==========================================
echo.

cd "%~dp0Frontend"

if not exist "node_modules" (
    echo Installing dependencies (this may take a few minutes)...
    call npm ci --silent
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        cd "%~dp0"
        pause
        exit /b 1
    )
) else (
    echo [OK] node_modules already exists
)

echo Building production bundle...
call npm run build 2>&1 | findstr /V /C:"Creating an optimized production build" /C:"Compiled successfully"

if errorlevel 1 (
    echo [ERROR] Frontend build failed!
    cd "%~dp0"
    pause
    exit /b 1
)

echo [SUCCESS] Frontend built!
echo Output: build\
echo.
cd "%~dp0"

REM Summary
echo ==========================================
echo [5/5] Build Summary
echo ==========================================
echo.
echo [BACKEND]
echo   Compiled:  Backend/target/classes
echo   JAR:       Backend/target/virtuehire-backend-*.jar
echo.
echo [FRONTEND]
echo   Build:     Frontend/build
echo.
echo [INFRASTRUCTURE]
echo   MySQL:     docker-compose up -d mysql
echo   Judge0:    docker-compose up -d judge0 (separate terminal)
echo.
echo ==========================================
echo    BUILD COMPLETED SUCCESSFULLY!
echo ==========================================
echo.
echo Next Steps:
echo 1. Start MySQL:    docker-compose up -d mysql
echo 2. Start Judge0:   docker-compose up -d judge0
echo 3. Run Backend:    cd Backend ^&^& mvn spring-boot:run
echo 4. Run Frontend:   cd Frontend ^&^& npm start
echo.
echo Or open in IntelliJ IDEA / VS Code and run from there
echo.
pause
