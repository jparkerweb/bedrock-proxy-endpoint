FROM node:22.14.0

# Create and change to the app directory
WORKDIR /app

# Copy package files to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy remaining project files
COPY . .

# Define the command to run your app using npm
ENTRYPOINT ["npm", "run", "start"]
