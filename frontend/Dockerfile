# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

# Use npm ci for consistent builds
RUN npm ci

COPY . .

# Build arg for API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Custom nginx config for React Router
RUN echo 'server { \n\
    listen 80; \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html; \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
