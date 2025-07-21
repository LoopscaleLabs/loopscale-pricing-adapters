FROM node:20.19.0-slim

WORKDIR /app

# Copy the entire workspace
COPY . .

# Install dependencies for the workspace
RUN yarn install

# Set environment variable for production
ENV NODE_ENV=production

# Build the project
RUN yarn build

# Start the application using Node directly with the compiled JavaScript
CMD ["yarn", "start"]