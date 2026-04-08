@echo off
echo ========================================
echo   Database Migration Script
echo   Adding Workflow Features
echo ========================================
echo.

set /p DB_USER="Enter MySQL username (default: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASSWORD="Enter MySQL password: "

set DB_NAME=haramaya_pharmacy

echo.
echo Running migration...
echo.

mysql -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < migrations\add_workflow_features.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo Changes applied:
    echo   - Added refill columns to prescriptions table
    echo   - Added partial dispensing columns
    echo   - Created emergency_dispensing table
    echo   - Updated prescription status enum
    echo.
) else (
    echo.
    echo ========================================
    echo Migration failed!
    echo ========================================
    echo Please check the error messages above.
    echo.
)

pause
