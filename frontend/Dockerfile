# Stage 1: Build the Angular app
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve static files with nginx
FROM nginx:alpine AS final
ARG VERSION=dev
ARG COMMIT_SHA=local
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN printf '{"version":"%s","commitSha":"%s"}\n' "$VERSION" "$COMMIT_SHA" > /usr/share/nginx/html/version.json
EXPOSE 8080
