@echo off
echo Opening Music Landing Page (cache-free)...

:: Kill Chrome cache for this page by opening with disable-cache flag
start "" chrome --disable-application-cache "file:///d:/PDF Editor/music-landing/index.html"

:: If Chrome doesn't work, try default browser
if errorlevel 1 (
    start "" "index.html"
)
