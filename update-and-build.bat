@echo off
chcp 65001 >nul
echo ========================================
echo   🎵 Music Landing - Full Update
echo ========================================
echo.

cd /d "d:\PDF Editor\music-landing"

echo 🔨 Building releases from JSON...
node build-releases.js
if errorlevel 1 (
    echo.
    echo ❌ Build failed! Make sure Node.js is installed.
    echo    Download from: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo 📁 Adding all changes...
git add .

echo.
set /p msg="📝 Enter update message (or press Enter for default): "
if "%msg%"=="" set msg=Update: New release added

echo.
echo 💾 Committing changes...
git commit -m "%msg%"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo ✅ Done! Your site will update in ~1 min
echo 🔗 https://gabiaharon.github.io/music-landing
echo ========================================
echo.
pause
