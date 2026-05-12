@echo off
chcp 65001 >nul
echo ==========================================
echo    VirtueHire - Build Script
echo ==========================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java is not installed or not in PATH
    echo Please install Java 17 or higher
    exit /b 1
)

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 20 or higher
    exit /b 1
)

echo [1/4] Compiling Java Backend...
cd Backend

REM Check for Maven wrapper or use system Maven
if exist "mvnw.cmd" (
    call mvnw.cmd clean compile -B
) else (
    mvn clean compile -B
)

if errorlevel 1 (
    echo [ERROR] Backend compilation failed!
    cd ..
    exit /b 1
)

echo [SUCCESS] Backend compiled successfully!
echo.

cd ..

echo [2/4] Installing Frontend Dependencies...
cd Frontend

if not exist "node_modules" (
    npm ci
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        cd ..
        exit /b 1
    )
) else (
    echo node_modules already exists, skipping npm ci
)

echo [SUCCESS] Frontend dependencies installed!
echo.

echo [3/4] Building Frontend...
npm run build

if errorlevel 1 (
    echo [ERROR] Frontend build failed!
    cd ..
    exit /b 1
)

echo [SUCCESS] Frontend built successfully!
echo.

cd ..

echo [4/4] Running Backend Tests...
cd Backend

if exist "mvnw.cmd" (
    call mvnw.cmd test -B
) else (
    mvn test -B
)

if errorlevel 1 (
    echo [WARNING] Some tests failed, but build completed
) else (
    echo [SUCCESS] All tests passed!
)

cd ..

echo.
echo ==========================================
echo    BUILD COMPLETED SUCCESSFULLY!
echo ==========================================
echo.
echo Backend: ./Backend/target/classes
echo Frontend: ./Frontend/build
echo.
pause
