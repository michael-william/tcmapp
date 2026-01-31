# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /backend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "dev"]
