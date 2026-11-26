# Use official lightweight Node.js Alpine image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy server package manifest and install only server dependencies
COPY server/package.json ./
RUN npm install --omit=dev

# Copy server source code
COPY server/server.js ./

# Expose port 3000 for HTTP & WebSockets
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
