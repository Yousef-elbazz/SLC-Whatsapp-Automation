@echo off
title SLC WhatsApp Groups Extractor

echo.
echo ============================================
echo      SLC WhatsApp Groups Extractor
echo ============================================
echo.
echo This tool extracts all your groups with names and IDs
echo.
echo Files that will be created:
echo - extracted-groups-detailed.txt (detailed list)
echo - extracted-groups-ids.txt     (IDs only)
echo - extracted-groups.json        (JSON format)
echo.
echo Scan QR Code when it appears...
echo.

npm run extract-groups

echo.
echo Groups extraction completed!
echo Check the created files in the folder.
pause