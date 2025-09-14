#!/bin/bash

# Script to generate V2Ray server and client configurations

# Function to generate a random UUID
generate_uuid() {
  if command -v uuidgen &> /dev/null; then
    uuidgen
  else
    # Fallback if uuidgen is not available
    python3 -c 'import uuid; print(uuid.uuid4())'
  fi
}

# Function to generate a random path
generate_path() {
  # Generate a random string of 8 characters
  cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1
}

# Function to base64 encode
base64_encode() {
  if [[ "$(uname)" == "Darwin" ]]; then
    # macOS
    echo -n "$1" | base64
  else
    # Linux
    echo -n "$1" | base64 -w 0
  fi
}

echo "====================================================="
echo "V2Ray Configuration Generator"
echo "====================================================="
echo

# Get or generate UUID
read -p "Enter UUID (leave blank to generate one): " UUID
if [ -z "$UUID" ]; then
  UUID=$(generate_uuid)
  echo "Generated UUID: $UUID"
fi

# Get or generate path
read -p "Enter WebSocket path (leave blank to generate one): " WS_PATH
if [ -z "$WS_PATH" ]; then
  WS_PATH="/$(generate_path)"
  echo "Generated path: $WS_PATH"
fi

# Get server domain or IP
read -p "Enter your server domain or IP: " SERVER_DOMAIN
if [ -z "$SERVER_DOMAIN" ]; then
  echo "Error: Server domain or IP is required."
  exit 1
fi

# Get server port
read -p "Enter server port (default: 10000): " SERVER_PORT
SERVER_PORT=${SERVER_PORT:-10000}

# Create server config directory if it doesn't exist
mkdir -p config

# Generate server configuration
cat > config/server_config.json << EOL
{
  "inbounds": [
    {
      "port": ${SERVER_PORT},
      "listen": "127.0.0.1",
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "${UUID}",
            "alterId": 0
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "wsSettings": {
          "path": "${WS_PATH}"
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    }
  ]
}
EOL

echo "Server configuration saved to config/server_config.json"

# Generate Nginx configuration
cat > config/nginx_v2ray.conf << EOL
server {
    listen 80;
    server_name ${SERVER_DOMAIN};

    location ${WS_PATH} {
        proxy_redirect off;
        proxy_pass http://127.0.0.1:${SERVER_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOL

echo "Nginx configuration saved to config/nginx_v2ray.conf"

# Generate client configuration
CLIENT_CONFIG='{
  "v": "2",
  "ps": "V2Ray Server",
  "add": "'${SERVER_DOMAIN}'",
  "port": "80",
  "id": "'${UUID}'",
  "aid": "0",
  "net": "ws",
  "type": "none",
  "host": "'${SERVER_DOMAIN}'",
  "path": "'${WS_PATH}'",
  "tls": ""
}'

# Base64 encode the client configuration
VMESS_LINK="vmess://$(base64_encode "$CLIENT_CONFIG")"

# Save client configuration
echo "$VMESS_LINK" > config/client_config.txt
echo "Client configuration saved to config/client_config.txt"

echo
echo "====================================================="
echo "Configuration Generation Complete!"
echo "====================================================="
echo
echo "Server Configuration: config/server_config.json"
echo "Nginx Configuration: config/nginx_v2ray.conf"
echo "Client Configuration: config/client_config.txt"
echo
echo "To use with Cloudflare Workers Proxy:"
echo "1. Install V2Ray on your server using the server configuration"
echo "2. Configure Nginx using the generated nginx configuration"
echo "3. Deploy the Cloudflare Workers proxy using setup.sh"
echo "4. Visit your Worker URL and paste the client configuration"
echo "5. Generate a proxied configuration and use it in your V2Ray client"
echo "====================================================="

# Make the script executable
chmod +x generate-config.sh