#!/bin/bash

# Setup script for V2Ray WebSocket+TLS Proxy with Cloudflare Workers

echo "====================================================="
echo "V2Ray WebSocket+TLS Proxy with Cloudflare Workers Setup"
echo "====================================================="
echo

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    echo "Visit https://nodejs.org/ for installation instructions."
    exit 1
fi

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Wrangler CLI not found. Installing Wrangler..."
    npm install -g wrangler
fi

echo "Creating Wrangler configuration file..."

# Create wrangler.toml
cat > wrangler.toml << EOL
name = "v2ray-proxy"
main = "v2ray_proxy_worker.js"
compatibility_date = "2023-09-01"

[vars]
# You can add custom environment variables here if needed
# EXAMPLE_VAR = "example_value"

# Customize the following settings as needed
[triggers]
crons = []
EOL

echo "Wrangler configuration created."
echo

# Login to Cloudflare
echo "Please log in to your Cloudflare account..."
wrangler login

# Deploy the worker
echo
echo "Deploying the V2Ray proxy worker to Cloudflare..."
wrangler deploy

echo
echo "====================================================="
echo "Setup complete! Your V2Ray proxy worker is now deployed."
echo
echo "You can access your proxy at the URL shown above."
echo "Follow the instructions in README.md to configure your V2Ray clients."
echo "====================================================="