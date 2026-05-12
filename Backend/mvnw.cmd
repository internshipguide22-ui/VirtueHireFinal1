@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Windows Batch Script
@REM ----------------------------------------------------------------------------

@REM Begin all REM lines with '@' in case MAVEN_BATCH_ECHO is 'on'
@echo off
@REM set title of command window
title %0
@REM enable echoing by setting MAVEN_BATCH_ECHO to 'on'
@if "%MAVEN_BATCH_ECHO%" == "on" echo %MAVEN_BATCH_ECHO%

@REM set %HOME% to equivalent of $HOME
if "%HOME%" == "" (set "HOME=%HOMEDRIVE%%HOMEPATH%")

@REM Execute a user defined script before this one
if not "%MAVEN_SKIP_RC%" == "" goto skipRcPre
@REM check for pre script, once with legacy .bat ending and once with .cmd ending
if exist "%USERPROFILE%\mavenrc_pre.bat" call "%USERPROFILE%\mavenrc_pre.bat" %*
if exist "%USERPROFILE%\mavenrc_pre.cmd" call "%USERPROFILE%\mavenrc_pre.cmd" %*
:skipRcPre

@setlocal

set ERROR_CODE=0

@REM To isolate internal variables from possible post scripts, we use another setlocal
@setlocal

@REM ==== START VALIDATION ====
if not "%JAVA_HOME%" == "" goto OkJHome

for %%i in (java.exe) do set "JAVACMD=%%~$PATH:i"
goto checkJCmd

:OkJHome
set "JAVACMD=%JAVA_HOME%\bin\java.exe"

:checkJCmd
if exist "%JAVACMD%" goto chkMHome

echo The JAVA_HOME environment variable is not defined correctly >&2
echo This environment variable is needed to run this program >&2
echo NB: JAVA_HOME should point to a JDK not a JRE >&2
goto error

:chkMHome
if not "%MAVEN_HOME%" == "" goto checkMCmd

set "MAVEN_HOME=%~dp0\.mvn\wrapper\dist"
if exist "%MAVEN_HOME%" goto checkMCmd

echo Maven installation not found. Please install Maven or set MAVEN_HOME >&2
goto error

:checkMCmd
if exist "%MAVEN_HOME%\bin\mvn.cmd" goto init

echo Maven installation not found at %MAVEN_HOME% >&2
goto error

:error
set ERROR_CODE=1

@REM ==== END VALIDATION ====

:init
@REM Fallback to system mvn if no wrapper distribution found
if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    for %%i in (mvn.cmd) do (
        if "%%~$PATH:i" == "" (
            echo Maven not found. Please install Maven and add to PATH >&2
            goto end
        )
        set "MAVEN_EXE=%%~$PATH:i"
    )
) else (
    set "MAVEN_EXE=%MAVEN_HOME%\bin\mvn.cmd"
)

@REM Provide a "standardized" way to retrieve the CLI args that will
@REM work with both Windows and non-Windows executions.
set MAVEN_CMD_LINE_ARGS=%*

%MAVEN_EXE% %MAVEN_CMD_LINE_ARGS%
if ERRORLEVEL 1 goto error

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_SKIP_RC%" == "" goto skipRcPost
@REM check for post script, once with legacy .bat ending and once with .cmd ending
if exist "%USERPROFILE%\mavenrc_post.bat" call "%USERPROFILE%\mavenrc_post.bat" %*
if exist "%USERPROFILE%\mavenrc_post.cmd" call "%USERPROFILE%\mavenrc_post.cmd" %*
:skipRcPost

@REM pause the script if MAVEN_BATCH_PAUSE is set to 'on'
if "%MAVEN_BATCH_PAUSE%" == "on" pause

if "%MAVEN_TERMINATE_CMD%" == "on" exit %ERROR_CODE%

exit /B %ERROR_CODE%
