# CRUD Application with AWS Deployment

This project is a cloud-based web application built with React, Node.js, and MySQL that follows modern cloud-native architecture principles. It demonstrates a complete system with user authentication, CRUD operations, database integration, and secure file uploads.

## Architecture Overview

![Architecture Diagram](https://i.imgur.com/RFFuGLl.png)

The application consists of:
- **Frontend**: React SPA hosted on AWS Elastic Beanstalk
- **Backend**: Node.js API in Docker container running on EC2
- **Database**: MySQL on Amazon RDS
- **Storage**: Amazon S3 for file/image uploads
- **Network**: VPC with proper security groups and subnets

## Application Features

1. **User Authentication**
   - Secure registration and login
   - JWT-based authentication
   - Password hashing with bcrypt

2. **CRUD Operations**
   - Create, read, update, and delete contacts
   - User-specific data isolation

3. **Database Integration**
   - MySQL on RDS for persistent storage
   - Proper schema design with foreign keys

4. **File Upload**
   - Store files in S3 bucket
   - Secure access controls
   - Support for multiple file formats

## Deployment Guide

### Prerequisites

- AWS CLI installed and configured with appropriate permissions
- Docker installed locally
- Node.js and npm installed
- AWS account with access to required services

### 1. Database Setup (RDS)

1. Create an RDS MySQL instance using CloudFormation:
   ```bash
   aws cloudformation deploy --template-file cloudformation/rds.yml --stack-name your-name-contacts-rds --parameter-overrides DBName=contacts_db DBUsername=admin DBPassword=your-secure-password
   ```

2. Get your RDS endpoint from the AWS Console or CLI:
   ```bash
   aws rds describe-db-instances --query 'DBInstances[*].Endpoint.Address' --output text
   ```

3. Connect to your database and run the setup script:
   ```bash
   mysql -h <your-rds-endpoint> -u admin -p < Server/setup.sql
   ```

### 2. S3 Bucket Setup

1. Create an S3 bucket with your name:
   ```bash
   aws s3api create-bucket --bucket your-name-contacts-bucket --region us-east-1
   ```

2. Configure CORS for your S3 bucket:
   ```bash
   aws s3api put-bucket-cors --bucket your-name-contacts-bucket --cors-configuration '{
     "CORSRules": [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedOrigins": ["*"],
         "ExposeHeaders": []
       }
     ]
   }'
   ```

### 3. Backend Deployment

1. Update environment variables:
   - Copy `.env.sample` to `.env`
   - Update database and S3 settings

2. Build and push Docker image to ECR:
   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name your-name-contacts-backend
   
   # Get login command
   aws ecr get-login-password | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.<region>.amazonaws.com
   
   # Build and tag the image
   cd Server
   docker build -t contacts-backend .
   docker tag contacts-backend:latest <your-account-id>.dkr.ecr.<region>.amazonaws.com/your-name-contacts-backend:latest
   
   # Push the image
   docker push <your-account-id>.dkr.ecr.<region>.amazonaws.com/your-name-contacts-backend:latest
   ```

3. Create EC2 instance and deploy container:
   ```bash
   aws cloudformation deploy --template-file cloudformation/service-ec2-public-lb.yml --stack-name your-name-contacts-service --parameter-overrides ImageUrl=<your-account-id>.dkr.ecr.<region>.amazonaws.com/your-name-contacts-backend:latest
   ```

### 4. Frontend Deployment to Elastic Beanstalk

1. Update API endpoint in the React code:
   - Edit `client/src/utils/config.js` with your backend URL

2. Build the frontend:
   ```bash
   cd client
   npm install
   npm run build
   ```

3. Initialize Elastic Beanstalk application:
   ```bash
   eb init your-name-contacts-frontend --platform node.js --region <your-region>
   ```

4. Create and deploy to EB environment:
   ```bash
   eb create production
   eb deploy
   ```

5. Get your application URL:
   ```bash
   eb status
   ```

## Security Configuration

### IAM Roles and Policies

1. EC2 Instance Role:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ecr:GetAuthorizationToken",
           "ecr:BatchCheckLayerAvailability",
           "ecr:GetDownloadUrlForLayer",
           "ecr:BatchGetImage"
         ],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::your-name-contacts-bucket",
           "arn:aws:s3:::your-name-contacts-bucket/*"
         ]
       }
     ]
   }
   ```

2. Elastic Beanstalk Role:
   - Use the `aws-elasticbeanstalk-service-role` for the service role
   - Use `aws-elasticbeanstalk-ec2-role` for the EC2 instance profile

### Security Groups

1. EC2 Security Group:
   - Inbound: 
     - HTTP (80) from Load Balancer SG
     - SSH (22) from your IP only

2. RDS Security Group:
   - Inbound: MySQL (3306) from EC2 SG only

3. Load Balancer Security Group:
   - Inbound: HTTP (80) from 0.0.0.0/0 (public)

## Monitoring and Debugging

1. View EC2 logs:
   ```bash
   aws logs get-log-events --log-group-name /aws/ec2/your-name-contacts-app --log-stream-name application
   ```

2. Check RDS metrics:
   ```bash
   aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name CPUUtilization --dimensions Name=DBInstanceIdentifier,Value=your-rds-instance --start-time 2020-01-01T00:00:00Z --end-time 2020-01-02T00:00:00Z --period 3600 --statistics Average
   ```

3. S3 bucket monitoring:
   ```bash
   aws s3api get-bucket-metrics-configuration --bucket your-name-contacts-bucket
   ```

## Submission Checklist

- [x] GitHub Repository
- [x] API Documentation
- [x] AWS Architecture Diagram
- [x] Deployment Instructions
- [x] IAM Policy Screenshots
- [x] Security Group Configuration
- [x] Live Demo URLs
- [x] Project Documentation
