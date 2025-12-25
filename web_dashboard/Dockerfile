# AOPTool Web Dashboard Dockerfile
# React + Next.js frontend

FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1000 aoptool && \
    adduser -D -u 1000 -G aoptool aoptool && \
    chown -R aoptool:aoptool /app

USER aoptool

# Expose port
EXPOSE 3000

# Development mode (hot reload)
CMD ["npm", "start"]

# Production build (uncomment for production)
# RUN npm run build
# CMD ["npm", "run", "start:prod"]
