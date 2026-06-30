@echo off
echo ====================================================
echo Agri AI - Frontend Builder ^& Deployer
echo ====================================================
echo.
echo Building the React Frontend...
cd frontend
call "C:\Program Files\nodejs\npm.cmd" run build

echo.
echo Deploying to Firebase Hosting...
call "C:\Program Files\nodejs\npx.cmd" firebase-tools deploy --only hosting

echo.
echo ====================================================
echo Deployment complete! Your site is live at:
echo https://agri-ai-kavitha.web.app/
echo ====================================================
pause
