FROM node:14

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Expose the port
EXPOSE 9000

# Start the app
CMD ["npm", "start"]