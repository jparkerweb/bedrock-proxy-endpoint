# Use the official Node.js 18 LTS (Alpine) image as base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies (skip prepare scripts to avoid husky issues in container)
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create logs directory and set permissions
RUN mkdir -p logs && \
    chown -R nodejs:nodejs /app

# Set default environment variables (can be overridden at runtime)
ENV HTTP_ENABLED=true \
    HTTP_PORT=88 \
    CONSOLE_LOGGING=false \
    HTTPS_ENABLED=false \
    IP_RATE_LIMIT_ENABLED=true \
    IP_RATE_LIMIT_WINDOW_MS=60000 \
    IP_RATE_LIMIT_MAX_REQUESTS=100 \
    MAX_REQUEST_BODY_SIZE=50mb

# Switch to non-root user
USER nodejs

# Expose the default HTTP port (can be overridden via environment variables)
EXPOSE 88

# Health check to ensure the server is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { \
        host: 'localhost', \
        port: process.env.HTTP_PORT || 88, \
        timeout: 2000 \
    }; \
    const request = http.request(options, (res) => { \
        console.log('STATUS: ' + res.statusCode); \
        process.exit(res.statusCode == 200 ? 0 : 1); \
    }); \
    request.on('error', function(err) { \
        console.log('ERROR'); \
        process.exit(1); \
    }); \
    request.end();"

# Start the application
CMD ["npm", "start"]
