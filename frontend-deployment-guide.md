# Frontend Deployment Guide for AWS Elastic Beanstalk

This document provides step-by-step instructions for deploying the React frontend application on AWS Elastic Beanstalk.

## Prerequisites

1. AWS CLI installed and configured with appropriate permissions
2. Node.js and npm installed
3. EB CLI installed (`pip install awsebcli`)
4. Git installed

## Preparation Steps

1. Update your API endpoint in the configuration file:

```javascript
// client/src/utils/config.js
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'https://your-backend-url.amazonaws.com',
  // other config properties
};
```

2. Build the React application:

```bash
cd client
npm install
npm run build
```

3. Create a `package.json` file in the root of the client directory if not already present:

```json
{
  "name": "contacts-frontend",
  "version": "1.0.0",
  "description": "React frontend for Contacts Application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "compression": "^1.7.4"
  }
}
```

4. Create a simple Express server to serve the static files:

```javascript
// client/server.js
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

// Send all requests to the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

5. Create a `.ebignore` file to exclude unnecessary files:

```
node_modules
npm-debug.log
.git
.gitignore
```

6. Create a `Procfile` for Elastic Beanstalk:

```
web: npm start
```

## Deployment Steps

1. Initialize Elastic Beanstalk in your client directory:

```bash
cd client
eb init

# Follow the prompts:
# - Select your region
# - Create a new application or select existing
# - Choose Node.js platform
# - Set up SSH if needed
```

2. Create an Elastic Beanstalk environment:

```bash
eb create production-environment --single --instance-type t2.micro
```

3. Set environment variables (if necessary):

```bash
eb setenv REACT_APP_API_URL=https://your-backend-url.amazonaws.com
```

4. Deploy your application:

```bash
eb deploy
```

5. Open your deployed application:

```bash
eb open
```

## Post-Deployment

1. Monitor your application:

```bash
eb health
eb logs
```

2. Scale your environment if needed:

```bash
eb scale 2
```

3. Terminate environment when no longer needed (be careful!):

```bash
eb terminate
```

## Troubleshooting

1. If you encounter issues with the build process, check the Elastic Beanstalk logs:

```bash
eb logs
```

2. For deployment issues, verify your IAM permissions

3. If the application fails to start, check the application logs:

```bash
eb ssh
cd /var/log/eb-nodejs
cat out.log
```

4. For CORS issues, ensure your backend allows requests from your Elastic Beanstalk domain

## Additional Resources

- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
- [React Deployment Best Practices](https://create-react-app.dev/docs/deployment/)
- [Express.js Documentation](https://expressjs.com/)
