# PowerShell deployment script for CRUD App AWS Infrastructure

# Check for AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "AWS CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check for AWS profile
if (-not $env:AWS_PROFILE) {
    Write-Host "AWS_PROFILE environment variable is not set." -ForegroundColor Yellow
    
    # Try to list available profiles
    try {
        $awsProfiles = aws configure list-profiles
        
        if ($awsProfiles.Count -gt 0) {
            Write-Host "Available AWS profiles:" -ForegroundColor Green
            for ($i = 0; $i -lt $awsProfiles.Count; $i++) {
                Write-Host "  $($i+1). $($awsProfiles[$i])"
            }
            
            $profileChoice = Read-Host -Prompt "Enter the number of the profile you want to use (or press Enter to exit)"
            
            if ($profileChoice -match '^\d+$' -and [int]$profileChoice -ge 1 -and [int]$profileChoice -le $awsProfiles.Count) {
                $selectedProfile = $awsProfiles[[int]$profileChoice-1]
                Write-Host "Setting AWS_PROFILE to '$selectedProfile'" -ForegroundColor Green
                $env:AWS_PROFILE = $selectedProfile
            } else {
                Write-Host "No valid profile selected. Exiting." -ForegroundColor Red
                Write-Host "You can set the AWS_PROFILE environment variable with:" -ForegroundColor Yellow
                Write-Host "  `$env:AWS_PROFILE = 'your-profile-name'" -ForegroundColor Yellow
                exit 1
            }
        } else {
            Write-Host "No AWS profiles found." -ForegroundColor Red
            Write-Host "Please configure AWS CLI with:" -ForegroundColor Yellow
            Write-Host "  aws configure --profile your-profile-name" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "Error accessing AWS profiles. Please make sure AWS CLI is properly configured." -ForegroundColor Red
        Write-Host "Run 'aws configure --profile your-profile-name' to set up a profile." -ForegroundColor Yellow
        exit 1
    }
}

# Validate that the profile exists and is valid
try {
    Write-Host "Validating AWS profile '$env:AWS_PROFILE'..." -ForegroundColor Green
    $callerIdentity = aws sts get-caller-identity --profile $env:AWS_PROFILE | ConvertFrom-Json
    Write-Host "Using AWS account: $($callerIdentity.Account)" -ForegroundColor Green
    Write-Host "Using IAM identity: $($callerIdentity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "Invalid or unauthorized AWS profile. Please check your credentials." -ForegroundColor Red
    Write-Host "If you need to update your credentials, run:" -ForegroundColor Yellow
    Write-Host "  aws configure --profile $env:AWS_PROFILE" -ForegroundColor Yellow
    exit 1
}

# Set default region if not specified
if (-not $env:AWS_REGION) {
    # Try to get the region from the profile
    try {
        $configRegion = aws configure get region --profile $env:AWS_PROFILE
        if ($configRegion) {
            $env:AWS_REGION = $configRegion
            Write-Host "Using region '$env:AWS_REGION' from profile '$env:AWS_PROFILE'" -ForegroundColor Green
        } else {
            $env:AWS_REGION = "us-east-1"
            Write-Host "No region found in profile. Using default region: $env:AWS_REGION" -ForegroundColor Yellow
        }
    } catch {
        $env:AWS_REGION = "us-east-1"
        Write-Host "Unable to determine region from profile. Using default: $env:AWS_REGION" -ForegroundColor Yellow
    }
}

# Display banner
Write-Host "===============================================" -ForegroundColor Green
Write-Host "   CRUD App AWS Infrastructure Deployment" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "AWS Profile: $env:AWS_PROFILE" -ForegroundColor Green
Write-Host "AWS Region:  $env:AWS_REGION" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Ask for a unique project name (used for resource naming)
$PROJECT_NAME = Read-Host -Prompt "Enter a unique project name (lowercase, no spaces)"
$PROJECT_NAME = $PROJECT_NAME.ToLower() -replace '\s+', ''

# Generate a random suffix for globally unique resource names
$SUFFIX = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 8 | ForEach-Object {[char]$_})

# Ask for the database password
$DB_PASSWORD = Read-Host -Prompt "Enter the database password" -AsSecureString
$DB_PASSWORD_TEXT = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

$DB_PASSWORD_CONFIRM = Read-Host -Prompt "Confirm the database password" -AsSecureString
$DB_PASSWORD_CONFIRM_TEXT = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD_CONFIRM))

if ($DB_PASSWORD_TEXT -ne $DB_PASSWORD_CONFIRM_TEXT) {
    Write-Host "Passwords do not match. Exiting." -ForegroundColor Red
    exit 1
}

# Ask for confirmation
Write-Host ""
Write-Host "You are about to deploy the following resources to AWS:" -ForegroundColor Yellow
Write-Host "- VPC with public and private subnets"
Write-Host "- RDS MySQL database"
Write-Host "- S3 bucket for file storage"
Write-Host "- EC2 instances with Docker"
Write-Host "- Application Load Balancer"
Write-Host "- Elastic Beanstalk environment"
Write-Host ""
Write-Host "This will create resources in your AWS account that may incur charges." -ForegroundColor Yellow

$CONFIRM = Read-Host -Prompt "Do you want to continue? (y/n)"

if ($CONFIRM -ne "y") {
    Write-Host "Deployment canceled."
    exit 0
}

# Create S3 bucket for CloudFormation templates and files
Write-Host "Creating S3 bucket for deployment artifacts..." -ForegroundColor Green
$DEPLOY_BUCKET = "$PROJECT_NAME-deploy-$SUFFIX"
aws s3 mb "s3://$DEPLOY_BUCKET" --region $env:AWS_REGION

# Upload CloudFormation templates to S3
Write-Host "Uploading CloudFormation templates..." -ForegroundColor Green
aws s3 cp cloudformation/ "s3://$DEPLOY_BUCKET/cloudformation/" --recursive

# Deploy VPC and networking stack
Write-Host "Deploying VPC and networking..." -ForegroundColor Green
aws cloudformation create-stack `
    --stack-name "$PROJECT_NAME-vpc" `
    --template-url "https://$DEPLOY_BUCKET.s3.$($env:AWS_REGION).amazonaws.com/cloudformation/cluster-ec2-vpc.yml" `
    --capabilities CAPABILITY_IAM `
    --region $env:AWS_REGION

Write-Host "Waiting for VPC deployment to complete..." -ForegroundColor Yellow
aws cloudformation wait stack-create-complete `
    --stack-name "$PROJECT_NAME-vpc" `
    --region $env:AWS_REGION

# Get VPC and subnet IDs
$VPC_ID = aws cloudformation describe-stacks `
    --stack-name "$PROJECT_NAME-vpc" `
    --query "Stacks[0].Outputs[?OutputKey=='VpcId'].OutputValue" `
    --output text `
    --region $env:AWS_REGION

$PUBLIC_SUBNET_1 = aws cloudformation describe-stacks `
    --stack-name "$PROJECT_NAME-vpc" `
    --query "Stacks[0].Outputs[?OutputKey=='PublicSubnet1'].OutputValue" `
    --output text `
    --region $env:AWS_REGION

$PUBLIC_SUBNET_2 = aws cloudformation describe-stacks `
    --stack-name "$PROJECT_NAME-vpc" `
    --query "Stacks[0].Outputs[?OutputKey=='PublicSubnet2'].OutputValue" `
    --output text `
    --region $env:AWS_REGION

$PRIVATE_SUBNET_1 = aws cloudformation describe-stacks `
    --stack-name "$PROJECT_NAME-vpc" `
    --query "Stacks[0].Outputs[?OutputKey=='PrivateSubnet1'].OutputValue" `
    --output text `
    --region $env:AWS_REGION

$PRIVATE_SUBNET_2 = aws cloudformation describe-stacks `
    --stack-name "$PROJECT_NAME-vpc" `
    --query "Stacks[0].Outputs[?OutputKey=='PrivateSubnet2'].OutputValue" `
    --output text `
    --region $env:AWS_REGION

# Deploy RDS database
Write-Host "Deploying RDS database..." -ForegroundColor Green
aws cloudformation create-stack `
    --stack-name "$PROJECT_NAME-rds" `
    --template-url "https://$DEPLOY_BUCKET.s3.$($env:AWS_REGION).amazonaws.com/cloudformation/rds.yml" `
    --parameters `
        ParameterKey=VpcId,ParameterValue=$VPC_ID `
        ParameterKey=SubnetIds,ParameterValue="$PRIVATE_SUBNET_1,$PRIVATE_SUBNET_2" `
        ParameterKey=DBName,ParameterValue=contactsdb `
        ParameterKey=DBUsername,ParameterValue=admin `
        ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD_TEXT `
    --region $env:AWS_REGION

Write-Host "Waiting for RDS deployment to complete (this may take 10-15 minutes)..." -ForegroundColor Yellow
aws cloudformation wait stack-create-complete `
    --stack-name "$PROJECT_NAME-rds" `
    --region $env:AWS_REGION

# Get RDS endpoint
$RDS_ENDPOINT = aws cloudformation describe-stacks `
    --stack-name "$PROJECT_NAME-rds" `
    --query "Stacks[0].Outputs[?OutputKey=='RDSEndpoint'].OutputValue" `
    --output text `
    --region $env:AWS_REGION

# Deploy S3 bucket
Write-Host "Deploying S3 bucket for file storage..." -ForegroundColor Green
$S3_BUCKET = "$PROJECT_NAME-storage-$SUFFIX"
aws cloudformation create-stack `
    --stack-name "$PROJECT_NAME-s3" `
    --template-url "https://$DEPLOY_BUCKET.s3.$($env:AWS_REGION).amazonaws.com/cloudformation/s3.yml" `
    --parameters `
        ParameterKey=BucketName,ParameterValue=$S3_BUCKET `
    --region $env:AWS_REGION

Write-Host "Waiting for S3 deployment to complete..." -ForegroundColor Yellow
aws cloudformation wait stack-create-complete `
    --stack-name "$PROJECT_NAME-s3" `
    --region $env:AWS_REGION

# Generate a random JWT secret
$JWT_SECRET = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Create ECR repository
Write-Host "Creating ECR repository for Docker images..." -ForegroundColor Green
$ECR_REPO = "$PROJECT_NAME-backend"
aws ecr create-repository --repository-name $ECR_REPO --region $env:AWS_REGION

# Get the ECR repository URI
$ECR_REPO_URI = aws ecr describe-repositories `
    --repository-names $ECR_REPO `
    --query "repositories[0].repositoryUri" `
    --output text `
    --region $env:AWS_REGION

# Build and push the Docker image
Write-Host "Building and pushing Docker image..." -ForegroundColor Green
Set-Location Server
aws ecr get-login-password --region $env:AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URI
docker build -t "$ECR_REPO_URI`:latest" .
docker push "$ECR_REPO_URI`:latest"
Set-Location ..

# Deploy EC2 instances
Write-Host "Deploying EC2 instances..." -ForegroundColor Green
aws cloudformation create-stack `
    --stack-name "$PROJECT_NAME-ec2" `
    --template-url "https://$DEPLOY_BUCKET.s3.$($env:AWS_REGION).amazonaws.com/cloudformation/ec2-deployment.yml" `
    --capabilities CAPABILITY_IAM `
    --parameters `
        ParameterKey=VPC,ParameterValue=$VPC_ID `
        ParameterKey=Subnets,ParameterValue="$PUBLIC_SUBNET_1,$PUBLIC_SUBNET_2" `
        ParameterKey=DockerImage,ParameterValue="$ECR_REPO_URI`:latest" `
        ParameterKey=RDSEndpoint,ParameterValue=$RDS_ENDPOINT `
        ParameterKey=DBUser,ParameterValue=admin `
        ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD_TEXT `
        ParameterKey=DBName,ParameterValue=contactsdb `
        ParameterKey=S3Bucket,ParameterValue=$S3_BUCKET `
        ParameterKey=JWTSecret,ParameterValue=$JWT_SECRET `
    --region $env:AWS_REGION

Write-Host "Waiting for EC2 deployment to complete..." -ForegroundColor Yellow
aws cloudformation wait stack-create-complete `
    --stack-name "$PROJECT_NAME-ec2" `
    --region $env:AWS_REGION

# Get the ALB endpoint
$ALB_ENDPOINT = aws cloudformation describe-stacks `
    --stack-name "$PROJECT_NAME-ec2" `
    --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" `
    --output text `
    --region $env:AWS_REGION

# Update frontend config with the backend URL
Write-Host "Updating frontend configuration..." -ForegroundColor Green
$ConfigContent = Get-Content -Path "client/src/utils/config.js"
$ConfigContent = $ConfigContent -replace "https://your-backend-url.amazonaws.com", "http://$ALB_ENDPOINT"
$ConfigContent | Set-Content -Path "client/src/utils/config.js"

# Build the frontend
Write-Host "Building the frontend application..." -ForegroundColor Green
Set-Location client
npm install
npm run build
Set-Location ..

# Initialize Elastic Beanstalk
Write-Host "Initializing Elastic Beanstalk..." -ForegroundColor Green
Set-Location client
eb init "$PROJECT_NAME-frontend" --platform node.js --region $env:AWS_REGION

# Create Elastic Beanstalk environment
Write-Host "Creating Elastic Beanstalk environment..." -ForegroundColor Green
eb create production --single --instance-type t2.micro

# Set environment variables
Write-Host "Setting Elastic Beanstalk environment variables..." -ForegroundColor Green
eb setenv REACT_APP_API_URL="http://$ALB_ENDPOINT"

# Deploy the application
Write-Host "Deploying the frontend application..." -ForegroundColor Green
eb deploy
Set-Location ..

# Get the Elastic Beanstalk URL
$EB_URL = aws elasticbeanstalk describe-environments `
    --environment-names production `
    --application-name "$PROJECT_NAME-frontend" `
    --query "Environments[0].CNAME" `
    --output text `
    --region $env:AWS_REGION

# Display the deployment results
Write-Host "===============================================" -ForegroundColor Green
Write-Host "   Deployment Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Backend API URL: http://$ALB_ENDPOINT"
Write-Host "Frontend URL: http://$EB_URL"
Write-Host ""
Write-Host "Database Endpoint: $RDS_ENDPOINT"
Write-Host "S3 Bucket: $S3_BUCKET"
Write-Host ""
Write-Host "Please save these details for future reference."
Write-Host ""
Write-Host "NOTE: It may take a few minutes for the applications to fully initialize." -ForegroundColor Yellow
