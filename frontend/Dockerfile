# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Railway provides variables at build time. We must declare them here:
ARG VITE_API_URL
ARG NODE_ENV=production

# This makes them available to the 'npm run build' command
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=$NODE_ENV

RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# 1. Manually set a default or ensure the ENV is recognized
ENV VITE_API_URL=${VITE_API_URL}

COPY --from=builder /app/dist /usr/share/nginx/html

# 2. Copy the template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# 3. Explicitly run envsubst before starting Nginx to be 100% sure
CMD ["/bin/sh", "-c", "envsubst '${VITE_API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]