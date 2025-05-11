# Script to set AWS credentials for local development
# DO NOT commit this file to version control with real credentials

# AWS Credentials
$env:AWS_ACCESS_KEY_ID = "your-access-key-id"
$env:AWS_SECRET_ACCESS_KEY = "your-secret-access-key" 
$env:AWS_REGION = "us-east-1"
$env:S3_BUCKET = "your-bucket-name"

# Database credentials
$env:DB_HOST = "localhost"
$env:DB_USER = "root"
$env:DB_PASSWORD = "hamab034"
$env:DB_NAME = "users"

# JWT Secret
$env:JWT_SECRET = "your-jwt-secret"

Write-Host "AWS credentials and environment variables set for development" -ForegroundColor Green
Write-Host "Region: $env:AWS_REGION" -ForegroundColor Cyan
Write-Host "S3 Bucket: $env:S3_BUCKET" -ForegroundColor Cyan

# Run your development server or other commands
# For example:
# cd Server
# npm run dev
