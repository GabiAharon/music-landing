@echo off
chcp 65001 >nul
echo ========================================
echo    🎵 Music Landing - GitHub Update
echo ========================================
echo.

cd /d "d:\PDF Editor\music-landing"

echo 📁 Adding all changes...
git add .

echo.
set /p msg="📝 Enter update message (or press Enter for default): "

if "%msg%"=="" set msg=Update: New content added

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
