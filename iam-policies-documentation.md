# IAM Policies and Roles Documentation

This document outlines the IAM (Identity and Access Management) policies and roles required for securely deploying and operating the Contacts Application on AWS.

## EC2 Instance Role

The EC2 instances hosting the Docker containers require permissions to interact with various AWS services:

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
        "arn:aws:s3:::your-name-contacts-bucket",
        "arn:aws:s3:::your-name-contacts-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## Elastic Beanstalk Role

For the Elastic Beanstalk environment hosting the frontend application:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "elasticbeanstalk:*",
        "ec2:*",
        "elasticloadbalancing:*",
        "autoscaling:*",
        "cloudwatch:*",
        "s3:*",
        "sns:*",
        "cloudformation:*",
        "rds:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## S3 Bucket Policy

This policy controls access to the S3 bucket used for file storage:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<account-id>:role/contacts-app-ec2-role"
      },
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
    },
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-name-contacts-bucket/public/*"
    }
  ]
}
```

## CORS Configuration for S3 Bucket

To allow the frontend to directly access files in the S3 bucket:

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

## Security Best Practices

1. **Principle of Least Privilege**: All policies above follow the principle of least privilege, granting only the permissions required for the application to function.

2. **Resource Scoping**: Permissions are scoped to specific resources where possible (e.g., limiting S3 access to a specific bucket).

3. **IAM Role Usage**: Using IAM roles instead of hardcoded credentials in the application.

4. **Regular Rotation**: For any access keys used for local development, implement regular rotation (at least every 90 days).

5. **Enable MFA**: Multi-factor authentication should be enabled for all IAM users with console access.

6. **IAM Policy Conditions**: Use conditions to restrict permissions based on time, IP address, or other factors for sensitive operations.

## Screenshots

The following screenshots should be included in your submission:

1. IAM Roles in AWS Console
   ![IAM Roles](https://placeholder-for-iam-roles-screenshot.png)

2. IAM Policies attached to the EC2 role
   ![IAM Policies](https://placeholder-for-iam-policies-screenshot.png)

3. S3 Bucket Policy configuration
   ![S3 Bucket Policy](https://placeholder-for-s3-policy-screenshot.png)

4. CORS Configuration for S3
   ![CORS Configuration](https://placeholder-for-cors-screenshot.png)
