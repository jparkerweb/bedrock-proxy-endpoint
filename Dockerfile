# Use a builder image to install dependencies and compile the application
FROM node:22.14.0 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Use a smaller runtime image to run the application
FROM node:22.14.0-slim
WORKDIR /app
COPY --from=builder /app .

# Define the command to run your app using npm
ENTRYPOINT ["npm", "run", "start"]