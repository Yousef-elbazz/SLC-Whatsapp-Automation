@echo off
chcp 65001 >nul
title نظام أتمتة WhatsApp - SLC - القائمة الرئيسية
color 0B

:menu
cls
echo ===============================================================
echo                نظام أتمتة WhatsApp - SLC
echo                    القائمة الرئيسية
echo ===============================================================
echo.
echo [1] تشغيل النظام المجدول (إرسال يومي في 9 مساءً)
echo [2] إرسال فوري الآن
echo [3] استخراج قائمة المجموعات
echo [4] تغيير وقت الإرسال المجدول
echo [5] تعديل الرسالة
echo [6] تعديل قائمة المجموعات
echo [7] تثبيت التبعيات
echo [0] خروج
echo.
echo ===============================================================

set /p choice="اختر رقم من القائمة: "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto sendnow
if "%choice%"=="3" goto extractgroups
if "%choice%"=="4" goto changetime
if "%choice%"=="5" goto editmessage
if "%choice%"=="6" goto editgroups
if "%choice%"=="7" goto setup
if "%choice%"=="0" goto exit

echo.
echo خيار غير صحيح! يرجى اختيار رقم من 0 إلى 7
pause
goto menu

:start
echo.
echo جاري تشغيل النظام المجدول...
call start.bat
goto menu

:sendnow
echo.
echo جاري الإرسال الفوري...
call send-now.bat
goto menu

:extractgroups
echo.
echo جاري استخراج المجموعات...
call extract-groups.bat
goto menu

:changetime
echo.
echo فتح نافذة تغيير الوقت...
call CHANGE-TIME.bat
goto menu

:editmessage
echo.
echo فتح ملف الرسالة للتعديل...
notepad message.txt
goto menu

:editgroups
echo.
echo فتح ملف المجموعات للتعديل...
notepad groups.txt
goto menu

:setup
echo.
echo جاري تثبيت التبعيات...
npm install
echo.
echo تم تثبيت التبعيات بنجاح!
pause
goto menu

:exit
echo.
echo شكراً لاستخدام نظام أتمتة SLC!
pause
exit