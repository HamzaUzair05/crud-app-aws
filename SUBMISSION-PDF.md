# CRUD Application with AWS Cloud Architecture
## Cloud Computing Course Project Submission

### Student Information
- **Name:** [Your Name]
- **Student ID:** [Your ID]
- **Date:** [Current Date]
- **GitHub Repository:** [https://github.com/your-username/crud-app-aws](https://github.com/your-username/crud-app-aws)

### Live Demo URLs
- **Frontend Application:** [https://your-eb-environment-url.elasticbeanstalk.com](https://your-eb-environment-url.elasticbeanstalk.com)
- **Backend API:** [http://your-alb-endpoint.region.elb.amazonaws.com](http://your-alb-endpoint.region.elb.amazonaws.com)

## 1. Architecture Diagram

![Architecture Diagram](docs/images/architecture-diagram.png)

The application implements a cloud-native architecture with:
- React frontend deployed on AWS Elastic Beanstalk
- Node.js backend in Docker containers on EC2 instances with an Application Load Balancer
- MySQL database on Amazon RDS in a private subnet
- Amazon S3 for file storage
- Custom VPC with public and private subnets for security isolation

## 2. IAM Policies and Security Configuration

### EC2 Instance Role Policy
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

### S3 Bucket CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## 3. AWS Resources Screenshots

### IAM Roles
![IAM Roles](docs/images/ec2-iam-role.png)

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

## 4. Application Screenshots

### Login Page
![Login Page](docs/images/login-page.png)

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Contact Management
![Contact Management](docs/images/contacts.png)

### File Upload
![File Upload](docs/images/file-upload.png)

## 5. Technologies Used

### Frontend
- React.js for the user interface
- Axios for API requests
- React Router for navigation
- CSS for styling

### Backend
- Node.js with Express.js
- JWT for authentication
- MySQL for database
- AWS SDK for S3 integration
- Docker for containerization

### AWS Services
- EC2 for compute
- RDS for database
- S3 for storage
- VPC for networking
- IAM for security
- Elastic Beanstalk for frontend hosting
- ECR for container registry
- CloudFormation for infrastructure as code

## 6. Implementation Details

### Authentication Flow
1. User registers or logs in
2. Backend validates credentials and issues JWT
3. JWT is stored in localStorage
4. Token is sent with subsequent requests

### File Upload Process
1. User selects file in the frontend
2. File is sent to the backend API
3. Backend uses AWS SDK to upload to S3
4. S3 URL is stored in the database
5. Files can be viewed and downloaded from the application

### Database Schema
- Users table with authentication information
- Contacts table with user_id foreign key
- File metadata linked to users

## 7. Challenges and Solutions

### Challenge 1: AWS Credential Management
**Problem:** Securely managing AWS credentials across different environments.

**Solution:** Implemented a credential provider chain that supports:
- IAM roles for production EC2 instances
- Environment variables for local development
- AWS profiles for deployment scripts

### Challenge 2: Cross-Origin Resource Sharing (CORS)
**Problem:** Frontend couldn't access S3 resources directly.

**Solution:** Configured proper CORS settings on the S3 bucket to allow requests from the application domain.

### Challenge 3: Database Connectivity
**Problem:** Containerized application had issues connecting to RDS.

**Solution:** Configured security groups to allow traffic from EC2 instances to RDS on the MySQL port and used environment variables for connection parameters.

## 8. Future Enhancements

1. Add HTTPS with AWS Certificate Manager
2. Implement CloudFront CDN for frontend assets
3. Set up CI/CD pipeline with GitHub Actions
4. Add CloudWatch monitoring and alerting
5. Implement disaster recovery strategy with database backups
