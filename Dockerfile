# build stage
FROM node:lts-alpine AS build-stage
RUN corepack enable
WORKDIR /app
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_API_TOKEN
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_TOKEN=$VITE_API_TOKEN
RUN yarn install
RUN yarn build

# production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
