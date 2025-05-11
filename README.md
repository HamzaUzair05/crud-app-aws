# CRUD Application with AWS Cloud Deployment

A full-stack application featuring React frontend and Node.js backend, deployed on AWS infrastructure with S3 storage integration.

## Live Demo URLs
- **Frontend**: [https://your-eb-environment-url.elasticbeanstalk.com](https://your-eb-environment-url.elasticbeanstalk.com)
- **Backend API**: [http://your-alb-endpoint.region.elb.amazonaws.com](http://your-alb-endpoint.region.elb.amazonaws.com)

## Architecture Overview

This application implements a modern cloud-native architecture with:

- **Frontend**: React SPA hosted on AWS Elastic Beanstalk
- **Backend**: Node.js API in Docker containers on EC2 with ALB
- **Database**: MySQL on Amazon RDS
- **Storage**: Amazon S3 for file uploads
- **Security**: VPC with public/private subnets, security groups, IAM roles

![Architecture Diagram](docs/images/architecture-diagram.png)

## Features

- User authentication with JWT
- Contact management (CRUD operations)
- File upload to S3
- Responsive UI
- Containerized backend
- Cloud-native deployment

## Deployment Guide

### Prerequisites
- AWS CLI installed and configured
- Node.js and npm
- Docker
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/crud-app-aws.git
cd crud-app-aws
```

### Step 2: Configure AWS Credentials
```bash
# Set your AWS profile
./set-aws-profile.ps1
```

### Step 3: Deploy the Infrastructure
```bash
# Run the deployment script
./deploy.ps1
```

The script will:
1. Create VPC, subnets, and security groups
2. Deploy RDS MySQL database
3. Create S3 bucket for file storage
4. Build and push Docker image to ECR
5. Deploy EC2 instances with ALB
6. Deploy frontend to Elastic Beanstalk

### Step 4: Verify Deployment
After deployment completes, verify all resources are working:

- Check EC2 instances health
- Verify RDS connection
- Test S3 bucket access
- Open the frontend URL in a browser
- Test API endpoints

## Project Structure
