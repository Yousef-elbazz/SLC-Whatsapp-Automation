@echo off
title SLC WhatsApp Automation - Scheduled Mode

echo.
echo ============================================
echo      SLC WhatsApp Automation - Scheduled
echo ============================================
echo.
echo Starting system with daily scheduling...

:: Read and display current schedule time
for /f "tokens=2 delims==" %%a in ('findstr "CRON_SCHEDULE" .env') do set current_schedule=%%a
for /f "tokens=2" %%a in ("%current_schedule%") do set current_hour=%%a

if %current_hour% EQU 8 set display_time=8:00 AM
if %current_hour% EQU 12 set display_time=12:00 PM
if %current_hour% EQU 15 set display_time=3:00 PM
if %current_hour% EQU 17 set display_time=5:00 PM
if %current_hour% EQU 20 set display_time=8:00 PM
if %current_hour% EQU 21 set display_time=9:00 PM

echo Messages will be sent daily at %display_time%
echo Current schedule: %current_schedule%
echo.
echo To exit: Press Ctrl+C
echo.

npm start

echo.
echo Program stopped.
pause