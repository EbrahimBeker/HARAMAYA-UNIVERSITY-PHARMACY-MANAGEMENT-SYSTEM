# PowerShell script to run database migration
# Usage: .\run-migration.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Migration Script" -ForegroundColor Cyan
Write-Host "  Adding Workflow Features" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get database credentials
$dbName = "haramaya_pharmacy"
$dbUser = Read-Host "Enter MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "root"
}

$dbPassword = Read-Host "Enter MySQL password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Running migration..." -ForegroundColor Yellow

# Run the migration
$migrationFile = "add_workflow_features.sql"
$command = "mysql -u $dbUser -p$plainPassword $dbName"

try {
    Get-Content $migrationFile | & mysql -u $dbUser "-p$plainPassword" $dbName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Changes applied:" -ForegroundColor Cyan
        Write-Host "  - Added refill columns to prescriptions table" -ForegroundColor White
        Write-Host "  - Added partial dispensing columns" -ForegroundColor White
        Write-Host "  - Created emergency_dispensing table" -ForegroundColor White
        Write-Host "  - Updated prescription status enum" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ Migration failed!" -ForegroundColor Red
        Write-Host "Please check the error messages above." -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error running migration: $_" -ForegroundColor Red
    Write-Host ""
}
