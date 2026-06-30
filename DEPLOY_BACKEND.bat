@echo off
echo ====================================================
echo Agri AI - Firebase Cloud Functions Deployer
echo ====================================================
echo.
echo Make sure you have upgraded your Firebase project to the Blaze plan.
echo Make sure you are logged into Firebase (run 'npx firebase-tools login' if needed).
echo.
echo Deploying backend to Firebase Cloud Functions...
cd frontend
call "C:\Program Files\nodejs\npx.cmd" firebase-tools deploy --only functions
echo.
echo Deployment finished!
pause
