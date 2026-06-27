#!/bin/bash

# Use Shared CPU + Location Frankfurt
# Smallest 2 CPUs & 4GB Ram - should be 20$
# Disable auto backups
# Marketplace App: Docker
# Add this script under cloud init

# Cloudflare add ip to dns type A with name vibezen
# Database: https://vibezen.rueberg.eu/db/ first-launch setup:
# - Set admin password on first launch
# - Add a connection: Host: database Port: 1433 Database: DemoDb User: sa Password: (see below)

# 1. Install host nginx (reverse proxy that never restarts during deploys)
apt-get update && apt-get install -y nginx

# 2. Write host nginx config - single entry point on port 80
# Proxies to containers by host port. Host nginx stays up during container restarts.
cat << 'NGINXEOF' > /etc/nginx/sites-available/vibezen
server {
    listen 80;
    server_name _;

    # Serve static Angular files from the frontend container
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy API calls to the backend container
    location /api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy Watchtower HTTP API (triggered by GitHub Actions after image push)
    location /redeploy/ {
        proxy_pass http://127.0.0.1:8082/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy CloudBeaver (web-based DB management UI)
    location /db/ {
        proxy_pass http://127.0.0.1:8083/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/vibezen /etc/nginx/sites-enabled/vibezen
rm -f /etc/nginx/sites-enabled/default
systemctl enable nginx
systemctl restart nginx

# 3. Create the workspace directory
mkdir -p /app
cd /app

# 4. Generate your docker-compose file
cat << 'EOF' > docker-compose.yml
version: '3.8'

services:
  frontend:
    image: fru0/vibezen-frontend:latest
    container_name: angular_frontend
    restart: always
    ports:
      - "8080:8080"
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    depends_on:
      - backend

  database:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: sql_server
    restart: always
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=YourStrong@CloudPassword123!
    ports:
      - "1433:1433"
    volumes:
      - mssql_data:/var/opt/mssql

  backend:
    image: fru0/vibezen-api:latest
    container_name: csharp_backend
    restart: always
    ports:
      - "8081:8080"
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=database;Database=DemoDb;User Id=sa;Password=YourStrong@CloudPassword123!;TrustServerCertificate=True;
    depends_on:
      - database

  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_HTTP_API_TOKEN=YourStrong@WatchtowerPassword123!
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_LABEL_ENABLE=true
      - DOCKER_API_VERSION=1.41
    ports:
      - "8082:8080"
    command: --interval 300 --cleanup --http-api-update

  cloudbeaver:
    image: dbeaver/cloudbeaver:latest
    container_name: cloudbeaver
    restart: always
    ports:
      - "8083:8978"
    volumes:
      - cloudbeaver_data:/opt/cloudbeaver/workspace
    depends_on:
      - database

volumes:
  mssql_data:
  cloudbeaver_data:
EOF

# 5. Launch the containers
docker compose up -d
