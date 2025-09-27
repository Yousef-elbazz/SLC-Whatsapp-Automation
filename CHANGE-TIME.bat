@echo off
chcp 65001 >nul
title Change Schedule Time - SLC WhatsApp Automation

:menu
cls
echo ========================================
echo    Change Daily Schedule Time
echo ========================================
echo.

:: Read current schedule
for /f "tokens=2 delims==" %%a in ('findstr "CRON_SCHEDULE" .env') do set current_schedule=%%a

:: Parse current time from cron schedule
for /f "tokens=2" %%a in ("%current_schedule%") do set current_hour=%%a

:: Convert to 12-hour format for display
if %current_hour% EQU 0 set display_time=12:00 AM
if %current_hour% EQU 1 set display_time=1:00 AM
if %current_hour% EQU 2 set display_time=2:00 AM
if %current_hour% EQU 3 set display_time=3:00 AM
if %current_hour% EQU 4 set display_time=4:00 AM
if %current_hour% EQU 5 set display_time=5:00 AM
if %current_hour% EQU 6 set display_time=6:00 AM
if %current_hour% EQU 7 set display_time=7:00 AM
if %current_hour% EQU 8 set display_time=8:00 AM
if %current_hour% EQU 9 set display_time=9:00 AM
if %current_hour% EQU 10 set display_time=10:00 AM
if %current_hour% EQU 11 set display_time=11:00 AM
if %current_hour% EQU 12 set display_time=12:00 PM
if %current_hour% EQU 13 set display_time=1:00 PM
if %current_hour% EQU 14 set display_time=2:00 PM
if %current_hour% EQU 15 set display_time=3:00 PM
if %current_hour% EQU 16 set display_time=4:00 PM
if %current_hour% EQU 17 set display_time=5:00 PM
if %current_hour% EQU 18 set display_time=6:00 PM
if %current_hour% EQU 19 set display_time=7:00 PM
if %current_hour% EQU 20 set display_time=8:00 PM
if %current_hour% EQU 21 set display_time=9:00 PM
if %current_hour% EQU 22 set display_time=10:00 PM
if %current_hour% EQU 23 set display_time=11:00 PM

echo Current Schedule: %display_time% daily
echo Current CRON: %current_schedule%
echo.
echo Quick Time Options:
echo.
echo [1] 8:00 AM  (Morning)
echo [2] 12:00 PM (Noon)
echo [3] 3:00 PM  (Afternoon)
echo [4] 5:00 PM  (Evening)
echo [5] 8:00 PM  (Night)
echo [6] 9:00 PM  (Late Night)
echo [7] Custom Time
echo [8] Back to Main Menu
echo.
set /p choice="Choose option (1-8): "

if "%choice%"=="1" call :set_time 8 "8:00 AM" & goto success
if "%choice%"=="2" call :set_time 12 "12:00 PM" & goto success
if "%choice%"=="3" call :set_time 15 "3:00 PM" & goto success
if "%choice%"=="4" call :set_time 17 "5:00 PM" & goto success
if "%choice%"=="5" call :set_time 20 "8:00 PM" & goto success
if "%choice%"=="6" call :set_time 21 "9:00 PM" & goto success
if "%choice%"=="7" goto custom_time
if "%choice%"=="8" exit

echo Invalid option. Please try again.
timeout /t 2 >nul
goto menu

:custom_time
echo.
echo Enter custom time (24-hour format):
echo Examples: 07 (7 AM), 14 (2 PM), 19 (7 PM)
echo.
set /p custom_hour="Enter hour (0-23): "

:: Validate hour
if %custom_hour% LSS 0 goto invalid_hour
if %custom_hour% GTR 23 goto invalid_hour

call :set_time %custom_hour% "Custom Time"
goto success

:invalid_hour
echo.
echo Invalid hour! Please enter a number between 0-23.
pause
goto custom_time

:set_time
set new_hour=%1
set time_desc=%~2

:: Create backup of .env
copy .env .env.backup >nul

:: Update CRON_SCHEDULE in .env file
powershell -Command "(Get-Content '.env') -replace 'CRON_SCHEDULE=0 \d+ \* \* \*', 'CRON_SCHEDULE=0 %new_hour% * * *' | Set-Content '.env'"

echo.
echo ✅ Schedule updated successfully!
echo New time: %time_desc%
echo New CRON: 0 %new_hour% * * *
goto :eof

:success
echo.
echo ========================================
echo    Schedule Time Updated Successfully!
echo ========================================
echo.
echo Important Notes:
echo - If you're using start.bat, restart it to apply changes
echo - If you have Task Scheduler setup, update it manually
echo - The new schedule will take effect immediately
echo.
echo Next Steps:
echo 1. Test with send-now.bat first
echo 2. Then use start.bat for scheduled sending
echo.
pause
exit