#!/usr/bin/env powershell
# iOS TestFlight Submission Script

$appleId = "princeanilgupta7@gmail.com"
$applePassword = "Avyu@1203"

Write-Host "Starting iOS TestFlight submission process..." -ForegroundColor Green
Write-Host "Apple ID: $appleId" -ForegroundColor Yellow

# Step 1: Build for production
Write-Host "`nStep 1: Building iOS production build..." -ForegroundColor Cyan
eas build --platform ios --profile production

# Check if build succeeded
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nStep 2: Submitting to TestFlight..." -ForegroundColor Cyan
    eas submit --platform ios --profile production --latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nTestFlight submission completed successfully!" -ForegroundColor Green
        Write-Host "Check App Store Connect at: https://appstoreconnect.apple.com" -ForegroundColor Green
    } else {
        Write-Host "`nTestFlight submission failed!" -ForegroundColor Red
    }
} else {
    Write-Host "`niOS build failed!" -ForegroundColor Red
}
