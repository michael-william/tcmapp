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

# Copy the build output
COPY --from=builder /app/dist /usr/share/nginx/html

# COPY TO TEMPLATES FOLDER INSTEAD
# The Nginx image will run envsubst on files in this folder
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]