
# Dockerfile for the server
FROM node:18-alpine

# Create App Directory
WORKDIR /app

# Install Dependencies
COPY package.json .
RUN npm install

# Copy files to app folder
COPY . .

# Expose port
EXPOSE 3080