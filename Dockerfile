# Stage 1: Build the app
FROM node:24 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY .env.production .env
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy build to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: If using React Router, include custom nginx.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]