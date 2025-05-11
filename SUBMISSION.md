# Cloud Project Submission

## Project Information
- **Student Name**: [Your Name]
- **GitHub Repository**: [https://github.com/your-username/crud-app-aws](https://github.com/your-username/crud-app-aws)
- **Date**: [Current Date]

## Live Demo URLs
- **Frontend Application**: [https://your-eb-environment-url.elasticbeanstalk.com](https://your-eb-environment-url.elasticbeanstalk.com)
- **Backend API**: [http://your-alb-endpoint.region.elb.amazonaws.com](http://your-alb-endpoint.region.elb.amazonaws.com)

## Project Overview
This project implements a cloud-based web application that demonstrates modern cloud-native architecture principles. The application provides user authentication, CRUD operations for contact management, and file upload capabilities integrated with AWS services.

## Architecture Diagram
![Architecture Diagram](docs/images/architecture-diagram.png)

## AWS Services Used
- **Amazon EC2**: Hosting containerized Node.js backend
- **Elastic Beanstalk**: Hosting React frontend
- **Amazon RDS**: MySQL database for storing user and contact data
- **Amazon S3**: Storage for file uploads
- **Elastic Container Registry**: Storing Docker images
- **Virtual Private Cloud**: Network isolation and security
- **Application Load Balancer**: Traffic distribution
- **IAM**: Access management and security
- **CloudFormation**: Infrastructure as Code deployment

## Security Implementation
- VPC with private and public subnets
- Security groups restricting access
- IAM roles with least privilege
- Encrypted database connections
- JWT-based authentication
- Secure credential management

## IAM Policies and Screenshots

### EC2 Instance Role
![EC2 IAM Role](docs/images/ec2-iam-role.png)

Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetAuthorizationToken"
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
        "arn:aws:s3:::your-s3-bucket-name",
        "arn:aws:s3:::your-s3-bucket-name/*"
      ]
    }
  ]
}
```

### S3 Bucket Policy
![S3 Bucket Policy](docs/images/s3-bucket-policy.png)

## AWS Configuration Screenshots

### VPC Configuration
![VPC Configuration](docs/images/vpc-config.png)

### EC2 Instances
![EC2 Instances](docs/images/ec2-instances.png)

### RDS Database
![RDS Database](docs/images/rds-database.png)

### S3 Bucket
![S3 Bucket](docs/images/s3-bucket.png)

### Security Groups
![Security Groups](docs/images/security-groups.png)

## Application Screenshots

### Login Page
![Login Page](docs/images/login-page.png)

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Contact Management
![Contact Management](docs/images/contacts.png)

### File Upload
![File Upload](docs/images/file-upload.png)

## Challenges and Solutions
1. **Challenge**: Configuring AWS credentials securely
   **Solution**: Implemented IAM roles for EC2 instances and used environment variables for local development

2. **Challenge**: Database connectivity from containerized application
   **Solution**: Configured proper security groups and used environment variables for connection parameters

3. **Challenge**: S3 integration for file uploads
   **Solution**: Implemented proper IAM policies and used the AWS SDK with credentials provider chain

## Future Enhancements
1. Implement HTTPS with AWS Certificate Manager
2. Add CloudFront CDN for frontend assets
3. Implement CI/CD pipeline with GitHub Actions
4. Add CloudWatch monitoring and alarms
5. Implement backup and disaster recovery strategy
