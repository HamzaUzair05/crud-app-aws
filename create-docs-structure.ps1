# Create documentation folder structure for submission

# Create main docs directory if it doesn't exist
if (-not (Test-Path -Path "docs")) {
    New-Item -Path "docs" -ItemType Directory
}

# Create subdirectories for images
if (-not (Test-Path -Path "docs\images")) {
    New-Item -Path "docs\images" -ItemType Directory
}

Write-Host "Created documentation folder structure" -ForegroundColor Green
Write-Host "Please add your screenshots to the docs/images folder" -ForegroundColor Yellow
Write-Host "Required screenshots:" -ForegroundColor Cyan
Write-Host "  - architecture-diagram.png (your AWS architecture diagram)" -ForegroundColor Cyan
Write-Host "  - ec2-iam-role.png (IAM role for EC2)" -ForegroundColor Cyan
Write-Host "  - s3-bucket-policy.png (S3 bucket policy)" -ForegroundColor Cyan
Write-Host "  - vpc-config.png (VPC configuration)" -ForegroundColor Cyan
Write-Host "  - ec2-instances.png (EC2 instances)" -ForegroundColor Cyan
Write-Host "  - rds-database.png (RDS database)" -ForegroundColor Cyan
Write-Host "  - s3-bucket.png (S3 bucket)" -ForegroundColor Cyan
Write-Host "  - security-groups.png (Security groups)" -ForegroundColor Cyan
Write-Host "  - login-page.png (Application login page)" -ForegroundColor Cyan
Write-Host "  - dashboard.png (Application dashboard)" -ForegroundColor Cyan
Write-Host "  - contacts.png (Contact management page)" -ForegroundColor Cyan
Write-Host "  - file-upload.png (File upload feature)" -ForegroundColor Cyan
