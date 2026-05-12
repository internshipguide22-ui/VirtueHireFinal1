@echo off
chcp 65001 >nul
echo ==========================================
echo    VirtueHire - Quick Compile Script
echo ==========================================
echo.

REM Check prerequisites
echo Checking prerequisites...

REM Check Java
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java is not installed!
    echo Please install Java 21 from: https://adoptium.net/
    pause
    exit /b 1
)
echo [OK] Java found

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 20 from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

REM Check Maven
set "MAVEN_CMD=mvn"
mvn -version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Maven not found in PATH
    echo Please install Maven from: https://maven.apache.org/download.cgi
    echo Or use your IDE's built-in Maven support
    pause
    exit /b 1
)
echo [OK] Maven found

echo.
echo ==========================================
echo Starting Build Process...
echo ==========================================
echo.

REM Compile Backend
echo [1/3] Compiling Java Backend...
cd Backend

call mvn clean compile -q

if errorlevel 1 (
    echo.
    echo [ERROR] Backend compilation failed!
    echo.
    echo Common fixes:
    echo - Check your internet connection (downloads dependencies)
    echo - Ensure JAVA_HOME is set correctly
    echo - Check pom.xml for syntax errors
    cd ..
    pause
    exit /b 1
)

echo [SUCCESS] Backend compiled!
echo.
cd ..

REM Compile Frontend
echo [2/3] Installing Frontend Dependencies...
cd Frontend

if not exist "node_modules" (
    call npm ci --silent
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        cd ..
        pause
        exit /b 1
    )
) else (
    echo node_modules already exists
)

echo [SUCCESS] Frontend dependencies ready!
echo.

echo [3/3] Building Frontend...
call npm run build 2>&1 | findstr /V /C:"Creating an optimized production build" /C:"Compiled successfully" /C:"File sizes after gzip"

if errorlevel 1 (
    echo [ERROR] Frontend build failed!
    cd ..
    pause
    exit /b 1
)

echo [SUCCESS] Frontend built!
echo.
cd ..

echo ==========================================
echo    BUILD COMPLETED SUCCESSFULLY!
echo ==========================================
echo.
echo Next steps:
echo 1. Start Backend:  cd Backend ^&^& mvn spring-boot:run
echo 2. Start Frontend: cd Frontend ^&^& npm start
echo.
echo Or use your IDE to run both.
echo.
pause
