@echo off
chcp 65001 >nul
cls
echo ========================================
echo    🎵 הוספת סינגל חדש
echo ========================================
echo.

cd /d "d:\PDF Editor\music-landing"

echo מה שם השיר?
set /p title=^> 

echo.
echo מי האמן?
echo   [1] Gabi Aharon (מסיבות/קלאבים)
echo   [2] Gabriel Aharon (שירים מקוריים)
set /p artist_choice=בחר 1 או 2: 

if "%artist_choice%"=="1" (
    set "artist=Gabi Aharon"
) else (
    set "artist=Gabriel Aharon"
)

echo.
echo מה שם קובץ התמונה?
echo (לדוגמה: my-song.jpg)
set /p image=^> 

echo.
echo ========================================
echo    📋 סיכום:
echo    שיר: %title%
echo    אמן: %artist%
echo    תמונה: %image%
echo ========================================
echo.

:: Create temporary Node.js script to add the release
echo const fs = require('fs'); > temp_add.js
echo const data = JSON.parse(fs.readFileSync('releases.json', 'utf8')); >> temp_add.js
echo data.unshift({ title: '%title%', artist: '%artist%', image: '%image%' }); >> temp_add.js
echo fs.writeFileSync('releases.json', JSON.stringify(data, null, 4), 'utf8'); >> temp_add.js
echo console.log('✅ נוסף ל-releases.json'); >> temp_add.js

node temp_add.js
del temp_add.js

echo.
echo 🔨 מעדכן את האתר...
node build-releases.js

echo.
echo 📁 מוסיף לגיט...
git add .

echo.
echo 💾 שומר שינויים...
git commit -m "New release: %title%"

echo.
echo 🚀 מעלה לגיטהאב...
git push origin main

echo.
echo ========================================
echo ✅ סיימנו! האתר יתעדכן תוך דקה
echo 🔗 https://gabiaharon.github.io/music-landing
echo ========================================
echo.
echo ⚠️  אל תשכח להעתיק את התמונה %image% לתיקייה!
echo.
pause
