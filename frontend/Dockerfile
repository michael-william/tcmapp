# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .

# Railway provides variables at build time. We must declare them here:
ARG VITE_API_URL
ARG NODE_ENV=production

# Debug: Print the value to build logs
RUN echo "Building with VITE_API_URL: $VITE_API_URL"

# This makes them available to the 'npm run build' command
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=$NODE_ENV

RUN npm run build

# Debug: Check if variable made it into the build
RUN echo "Build complete. VITE_API_URL was: $VITE_API_URL"

# Stage 2: Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the nginx config (no envsubst needed)
COPY frontend/nginx.conf.template /etc/nginx/conf.d/default.conf

# Start nginx
CMD ["nginx", "-g", "daemon off;"]