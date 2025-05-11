# Security Configuration Documentation

This document outlines the security configuration for the Contacts Application deployed on AWS, including security groups, VPC configuration, encryption settings, and other security best practices.

## VPC Configuration

The application is deployed in a custom VPC with the following structure:

```
VPC: 10.0.0.0/16
  |
  |-- Public Subnet 1: 10.0.1.0/24 (us-east-1a)
  |-- Public Subnet 2: 10.0.2.0/24 (us-east-1b)
  |-- Private Subnet 1: 10.0.3.0/24 (us-east-1a)
  |-- Private Subnet 2: 10.0.4.0/24 (us-east-1b)
```

- **Public Subnets**: Host the load balancers and NAT gateways
- **Private Subnets**: Host the EC2 instances and RDS database

## Security Groups

### Load Balancer Security Group

```
Inbound Rules:
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0

Outbound Rules:
  - All traffic to 0.0.0.0/0
```

### EC2 Instance Security Group

```
Inbound Rules:
  - HTTP (80) from Load Balancer Security Group
  - SSH (22) from [Your IP Address]/32

Outbound Rules:
  - All traffic to 0.0.0.0/0
```

### RDS Database Security Group

```
Inbound Rules:
  - MySQL (3306) from EC2 Instance Security Group

Outbound Rules:
  - All traffic to 0.0.0.0/0
```

### Elastic Beanstalk Security Group

```
Inbound Rules:
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0

Outbound Rules:
  - All traffic to 0.0.0.0/0
```

## Network ACLs

In addition to security groups, Network ACLs are configured for each subnet to provide an additional layer of security:

### Public Subnet NACLs

```
Inbound Rules:
  - Allow HTTP/HTTPS (80, 443) from 0.0.0.0/0
  - Allow ephemeral ports (1024-65535) from 0.0.0.0/0
  - Deny all other traffic

Outbound Rules:
  - Allow all traffic to 0.0.0.0/0
```

### Private Subnet NACLs

```
Inbound Rules:
  - Allow traffic from VPC CIDR
  - Allow ephemeral ports (1024-65535) from public subnets
  - Deny all other traffic

Outbound Rules:
  - Allow HTTP/HTTPS (80, 443) to 0.0.0.0/0
  - Allow MySQL (3306) to private subnets
  - Allow responses to public subnets
  - Deny all other traffic
```

## Data Encryption

### Data at Rest

- **RDS**: Enabled encryption using AWS KMS
- **S3**: Enabled default encryption for the S3 bucket
- **EC2 EBS Volumes**: Encrypted using AWS KMS

### Data in Transit

- **Application to RDS**: SSL/TLS encryption for database connections
- **Application to S3**: HTTPS for all S3 API calls
- **User to Application**: HTTPS using ACM certificate on the load balancer

## Authentication and Authorization

- **JWT-based authentication** for API calls with token expiration
- **bcrypt** for password hashing with appropriate work factor
- **Secure HTTP headers** including Content-Security-Policy, X-XSS-Protection, etc.
- **CORS** configured to allow only specified origins

## AWS WAF (Web Application Firewall)

AWS WAF is configured with the following rule sets:

- SQL Injection prevention
- Cross-site scripting (XSS) prevention
- Rate limiting to prevent brute force attacks
- IP-based blocking for known malicious sources

## Logging and Monitoring

- **CloudWatch Logs** for application and server logs
- **CloudTrail** for API call logging
- **RDS Enhanced Monitoring** for database performance and security
- **S3 Access Logging** to track S3 object access
- **CloudWatch Alarms** for security-related events

## Best Practices Implemented

1. **Principle of Least Privilege**: IAM roles and policies grant minimal permissions
2. **Defense in Depth**: Multiple security layers (VPC, NACL, Security Groups, WAF)
3. **Secure Password Management**: No hardcoded credentials, using Parameter Store
4. **Regular Updates**: Automated patching for EC2 instances
5. **Immutable Infrastructure**: New deployments create new instances rather than updating existing ones

## Screenshots

The following screenshots should be included in your submission:

1. VPC Configuration
   ![VPC Configuration](https://placeholder-for-vpc-screenshot.png)

2. Security Group Rules
   ![Security Groups](https://placeholder-for-sg-screenshot.png)

3. RDS Encryption Settings
   ![RDS Encryption](https://placeholder-for-rds-encryption-screenshot.png)

4. S3 Bucket Encryption
   ![S3 Encryption](https://placeholder-for-s3-encryption-screenshot.png)
