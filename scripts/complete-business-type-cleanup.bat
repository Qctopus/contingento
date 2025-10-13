@echo off
echo.
echo ========================================
echo Business Type Cleanup - Final Steps
echo ========================================
echo.
echo This script will:
echo 1. Regenerate Prisma client
echo 2. Populate clean business types
echo.
echo IMPORTANT: Make sure your dev server is STOPPED first!
echo.
pause

echo.
echo [Step 1/2] Regenerating Prisma client...
echo.
call npx prisma generate
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to generate Prisma client!
    echo Make sure your dev server is stopped and try again.
    echo.
    pause
    exit /b 1
)

echo.
echo [Step 2/2] Populating Caribbean business types...
echo.
call node scripts/populate-caribbean-business-types-clean.js
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to populate business types!
    echo Check the error message above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✨ Success! Business types populated
echo ========================================
echo.
echo Next steps:
echo 1. Restart your dev server: npm run dev
echo 2. Check Admin2 panel Business Types tab
echo 3. Test the wizard flow
echo.
echo See BUSINESS_TYPE_CLEANUP_SUMMARY.md for full details
echo.
pause



