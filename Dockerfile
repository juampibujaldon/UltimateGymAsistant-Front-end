FROM node:20-alpine AS build-stage

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./

ARG VITE_API_URL=__VITE_API_URL_PLACEHOLDER__
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_ENABLE_DEMO_AUTH=false
ENV VITE_ENABLE_DEMO_AUTH=$VITE_ENABLE_DEMO_AUTH
ARG VITE_ENABLE_NUTRITION=true
ENV VITE_ENABLE_NUTRITION=$VITE_ENABLE_NUTRITION
RUN npm run build

FROM nginx:stable-alpine AS production-stage

RUN apk add --no-cache bash sed

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
