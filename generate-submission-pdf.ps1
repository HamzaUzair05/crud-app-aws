# PowerShell script to generate submission PDF

# Check if Markdown PDF extension is installed in VSCode
Write-Host "=============================================" -ForegroundColor Green
Write-Host "      Submission PDF Generation Helper       " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Verify docs/images directory exists
if (-not (Test-Path -Path "docs\images")) {
    Write-Host "Creating docs/images directory..." -ForegroundColor Yellow
    New-Item -Path "docs\images" -ItemType Directory -Force | Out-Null
}

# List of required screenshots
$requiredScreenshots = @(
    "architecture-diagram.png",
    "ec2-iam-role.png",
    "vpc-config.png",
    "ec2-instances.png",
    "rds-database.png",
    "s3-bucket.png",
    "security-groups.png",
    "login-page.png",
    "dashboard.png",
    "contacts.png",
    "file-upload.png"
)

# Check for missing screenshots
$missingScreenshots = @()
foreach ($screenshot in $requiredScreenshots) {
    if (-not (Test-Path -Path "docs\images\$screenshot")) {
        $missingScreenshots += $screenshot
    }
}

if ($missingScreenshots.Count -gt 0) {
    Write-Host "The following required screenshots are missing:" -ForegroundColor Red
    foreach ($screenshot in $missingScreenshots) {
        Write-Host "  - $screenshot" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please add these screenshots to the docs/images directory before generating the PDF." -ForegroundColor Yellow
}
else {
    Write-Host "All required screenshots are present." -ForegroundColor Green
}

Write-Host ""
Write-Host "To generate the submission PDF:" -ForegroundColor Cyan
Write-Host "1. Install the 'Markdown PDF' extension in Visual Studio Code" -ForegroundColor White
Write-Host "2. Open SUBMISSION-PDF.md in VS Code" -ForegroundColor White
Write-Host "3. Right-click and select 'Markdown PDF: Export (pdf)'" -ForegroundColor White
Write-Host "4. The PDF will be created in the same directory" -ForegroundColor White
Write-Host ""
Write-Host "Before generating the final PDF, make sure to:" -ForegroundColor Yellow
Write-Host "- Update your name and student ID" -ForegroundColor White
Write-Host "- Update GitHub repository URL" -ForegroundColor White
Write-Host "- Update the Live Demo URLs with your actual deployed URLs" -ForegroundColor White
Write-Host "- Check that all images are displayed correctly in the preview" -ForegroundColor White
