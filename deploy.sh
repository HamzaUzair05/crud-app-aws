#!/bin/bash
# Deployment script for CRUD App AWS Infrastructure

# Check for AWS CLI
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found. Please install it first."
    exit 1
fi

# Check for required environment variables
if [ -z "$AWS_PROFILE" ]; then
    echo "AWS_PROFILE environment variable is not set."
    echo "Please set it to the AWS CLI profile you want to use."
    exit 1
fi

# Set default region if not specified
AWS_REGION=${AWS_REGION:-"us-east-1"}

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display banner
echo -e "${GREEN}"
echo "==============================================="
echo "   CRUD App AWS Infrastructure Deployment"
echo "==============================================="
echo -e "${NC}"

# Ask for a unique project name (used for resource naming)
read -p "Enter a unique project name (lowercase, no spaces): " PROJECT_NAME
PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr -d ' ')

# Generate a random suffix for globally unique resource names
SUFFIX=$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 8 | head -n 1)

# Ask for the database password
read -s -p "Enter the database password: " DB_PASSWORD
echo
read -s -p "Confirm the database password: " DB_PASSWORD_CONFIRM
echo

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}Passwords do not match. Exiting.${NC}"
    exit 1
fi

# Ask for confirmation
echo
echo -e "${YELLOW}You are about to deploy the following resources to AWS:${NC}"
echo "- VPC with public and private subnets"
echo "- RDS MySQL database"
echo "- S3 bucket for file storage"
echo "- EC2 instances with Docker"
echo "- Application Load Balancer"
echo "- Elastic Beanstalk environment"
echo
echo -e "${YELLOW}This will create resources in your AWS account that may incur charges.${NC}"
read -p "Do you want to continue? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Deployment canceled."
    exit 0
fi

# Create S3 bucket for CloudFormation templates and files
echo -e "${GREEN}Creating S3 bucket for deployment artifacts...${NC}"
DEPLOY_BUCKET="$PROJECT_NAME-deploy-$SUFFIX"
aws s3 mb "s3://$DEPLOY_BUCKET" --region "$AWS_REGION"

# Upload CloudFormation templates to S3
echo -e "${GREEN}Uploading CloudFormation templates...${NC}"
aws s3 cp cloudformation/ "s3://$DEPLOY_BUCKET/cloudformation/" --recursive

# Deploy VPC and networking stack
echo -e "${GREEN}Deploying VPC and networking...${NC}"
aws cloudformation create-stack \
    --stack-name "$PROJECT_NAME-vpc" \
    --template-url "https://$DEPLOY_BUCKET.s3.$AWS_REGION.amazonaws.com/cloudformation/cluster-ec2-vpc.yml" \
    --capabilities CAPABILITY_IAM \
    --region "$AWS_REGION"

echo -e "${YELLOW}Waiting for VPC deployment to complete...${NC}"
aws cloudformation wait stack-create-complete \
    --stack-name "$PROJECT_NAME-vpc" \
    --region "$AWS_REGION"

# Get VPC and subnet IDs
VPC_ID=$(aws cloudformation describe-stacks \
    --stack-name "$PROJECT_NAME-vpc" \
    --query "Stacks[0].Outputs[?OutputKey=='VpcId'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

PUBLIC_SUBNET_1=$(aws cloudformation describe-stacks \
    --stack-name "$PROJECT_NAME-vpc" \
    --query "Stacks[0].Outputs[?OutputKey=='PublicSubnet1'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

PUBLIC_SUBNET_2=$(aws cloudformation describe-stacks \
    --stack-name "$PROJECT_NAME-vpc" \
    --query "Stacks[0].Outputs[?OutputKey=='PublicSubnet2'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

PRIVATE_SUBNET_1=$(aws cloudformation describe-stacks \
    --stack-name "$PROJECT_NAME-vpc" \
    --query "Stacks[0].Outputs[?OutputKey=='PrivateSubnet1'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

PRIVATE_SUBNET_2=$(aws cloudformation describe-stacks \
    --stack-name "$PROJECT_NAME-vpc" \
    --query "Stacks[0].Outputs[?OutputKey=='PrivateSubnet2'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

# Deploy RDS database
echo -e "${GREEN}Deploying RDS database...${NC}"
aws cloudformation create-stack \
    --stack-name "$PROJECT_NAME-rds" \
    --template-url "https://$DEPLOY_BUCKET.s3.$AWS_REGION.amazonaws.com/cloudformation/rds.yml" \
    --parameters \
        ParameterKey=VpcId,ParameterValue=$VPC_ID \
        ParameterKey=SubnetIds,ParameterValue=\"$PRIVATE_SUBNET_1,$PRIVATE_SUBNET_2\" \
        ParameterKey=DBName,ParameterValue=contactsdb \
        ParameterKey=DBUsername,ParameterValue=admin \
        ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD \
    --region "$AWS_REGION"

echo -e "${YELLOW}Waiting for RDS deployment to complete (this may take 10-15 minutes)...${NC}"
aws cloudformation wait stack-create-complete \
    --stack-name "$PROJECT_NAME-rds" \
    --region "$AWS_REGION"

# Get RDS endpoint
RDS_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$PROJECT_NAME-rds" \
    --query "Stacks[0].Outputs[?OutputKey=='RDSEndpoint'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

# Deploy S3 bucket
echo -e "${GREEN}Deploying S3 bucket for file storage...${NC}"
S3_BUCKET="$PROJECT_NAME-storage-$SUFFIX"
aws cloudformation create-stack \
    --stack-name "$PROJECT_NAME-s3" \
    --template-url "https://$DEPLOY_BUCKET.s3.$AWS_REGION.amazonaws.com/cloudformation/s3.yml" \
    --parameters \
        ParameterKey=BucketName,ParameterValue=$S3_BUCKET \
    --region "$AWS_REGION"

echo -e "${YELLOW}Waiting for S3 deployment to complete...${NC}"
aws cloudformation wait stack-create-complete \
    --stack-name "$PROJECT_NAME-s3" \
    --region "$AWS_REGION"

# Generate a random JWT secret
JWT_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

# Create ECR repository
echo -e "${GREEN}Creating ECR repository for Docker images...${NC}"
ECR_REPO="$PROJECT_NAME-backend"
aws ecr create-repository --repository-name "$ECR_REPO" --region "$AWS_REGION"

# Get the ECR repository URI
ECR_REPO_URI=$(aws ecr describe-repositories \
    --repository-names "$ECR_REPO" \
    --query "repositories[0].repositoryUri" \
    --output text \
    --region "$AWS_REGION")

# Build and push the Docker image
echo -e "${GREEN}Building and pushing Docker image...${NC}"
cd Server
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REPO_URI"
docker build -t "$ECR_REPO_URI:latest" .
docker push "$ECR_REPO_URI:latest"
cd ..

# Deploy EC2 instances
echo -e "${GREEN}Deploying EC2 instances...${NC}"
aws cloudformation create-stack \
    --stack-name "$PROJECT_NAME-ec2" \
    --template-url "https://$DEPLOY_BUCKET.s3.$AWS_REGION.amazonaws.com/cloudformation/ec2-deployment.yml" \
    --capabilities CAPABILITY_IAM \
    --parameters \
        ParameterKey=VPC,ParameterValue=$VPC_ID \
        ParameterKey=Subnets,ParameterValue=\"$PUBLIC_SUBNET_1,$PUBLIC_SUBNET_2\" \
        ParameterKey=DockerImage,ParameterValue=$ECR_REPO_URI:latest \
        ParameterKey=RDSEndpoint,ParameterValue=$RDS_ENDPOINT \
        ParameterKey=DBUser,ParameterValue=admin \
        ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD \
        ParameterKey=DBName,ParameterValue=contactsdb \
        ParameterKey=S3Bucket,ParameterValue=$S3_BUCKET \
        ParameterKey=JWTSecret,ParameterValue=$JWT_SECRET \
    --region "$AWS_REGION"

echo -e "${YELLOW}Waiting for EC2 deployment to complete...${NC}"
aws cloudformation wait stack-create-complete \
    --stack-name "$PROJECT_NAME-ec2" \
    --region "$AWS_REGION"

# Get the ALB endpoint
ALB_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$PROJECT_NAME-ec2" \
    --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

# Update frontend config with the backend URL
echo -e "${GREEN}Updating frontend configuration...${NC}"
sed -i "s|https://your-backend-url.amazonaws.com|http://$ALB_ENDPOINT|g" client/src/utils/config.js

# Build the frontend
echo -e "${GREEN}Building the frontend application...${NC}"
cd client
npm install
npm run build
cd ..

# Initialize Elastic Beanstalk
echo -e "${GREEN}Initializing Elastic Beanstalk...${NC}"
cd client
eb init "$PROJECT_NAME-frontend" --platform node.js --region "$AWS_REGION"

# Create Elastic Beanstalk environment
echo -e "${GREEN}Creating Elastic Beanstalk environment...${NC}"
eb create production --single --instance-type t2.micro

# Set environment variables
echo -e "${GREEN}Setting Elastic Beanstalk environment variables...${NC}"
eb setenv REACT_APP_API_URL="http://$ALB_ENDPOINT"

# Deploy the application
echo -e "${GREEN}Deploying the frontend application...${NC}"
eb deploy
cd ..

# Get the Elastic Beanstalk URL
EB_URL=$(aws elasticbeanstalk describe-environments \
    --environment-names production \
    --application-name "$PROJECT_NAME-frontend" \
    --query "Environments[0].CNAME" \
    --output text \
    --region "$AWS_REGION")

# Display the deployment results
echo -e "${GREEN}"
echo "==============================================="
echo "   Deployment Complete!"
echo "==============================================="
echo -e "${NC}"
echo "Backend API URL: http://$ALB_ENDPOINT"
echo "Frontend URL: http://$EB_URL"
echo
echo "Database Endpoint: $RDS_ENDPOINT"
echo "S3 Bucket: $S3_BUCKET"
echo
echo "Please save these details for future reference."
echo
echo -e "${YELLOW}NOTE: It may take a few minutes for the applications to fully initialize.${NC}"
