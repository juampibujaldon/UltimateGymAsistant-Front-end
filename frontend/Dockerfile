# Build stage
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# The Railway builder will automatically supply VITE_API_URL via --build-arg
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_ENABLE_DEMO_AUTH=false
ENV VITE_ENABLE_DEMO_AUTH=$VITE_ENABLE_DEMO_AUTH
ARG VITE_ENABLE_NUTRITION=true
ENV VITE_ENABLE_NUTRITION=$VITE_ENABLE_NUTRITION
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage

RUN apk add --no-cache bash sed

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
