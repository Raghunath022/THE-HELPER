@echo off
echo ========================================================
echo   Agri AI SaaS Platform - Firebase Deployment Tool
echo ========================================================
echo.
echo [1/3] Building the production assets...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Production build failed. Please resolve compilation issues first.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Authenticating with Google Firebase...
echo A browser window will open. Please log in with your Google account.
call npx firebase login

echo.
echo [3/3] Deploying to Google Firebase Hosting...
call npx firebase deploy

echo.
echo ========================================================
echo   Deployment Process Completed!
echo ========================================================
pause
