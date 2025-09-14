# V2Ray Server Setup Guide

This guide will help you set up a V2Ray server that works with the Cloudflare Workers proxy.

## Prerequisites

- A server with a public IP address
- Basic knowledge of Linux commands
- Domain name (optional but recommended)

## 1. Install V2Ray on Your Server

### For Debian/Ubuntu:

```bash
# Install curl if not already installed
apt update
apt install -y curl

# Download and run the V2Ray installation script
bash <(curl -L https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)
```

### For CentOS/RHEL:

```bash
# Install curl if not already installed
yum install -y curl

# Download and run the V2Ray installation script
bash <(curl -L https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)
```

## 2. Configure V2Ray Server

Create a configuration file at `/usr/local/etc/v2ray/config.json`:

```bash
nano /usr/local/etc/v2ray/config.json
```

Paste the following configuration, replacing the placeholders:

```json
{
  "inbounds": [
    {
      "port": 10000,
      "listen": "127.0.0.1",
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "YOUR_UUID_HERE",
            "alterId": 0
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "wsSettings": {
          "path": "/YOUR_PATH_HERE"
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
```

Replace:
- `YOUR_UUID_HERE` with a generated UUID (use `uuidgen` command or an online UUID generator)
- `YOUR_PATH_HERE` with a random path (e.g., `/ws-path`)

## 3. Generate a UUID

If you don't have a UUID, generate one:

```bash
apt install -y uuid-runtime
uuidgen
```

Use the generated UUID in your V2Ray configuration.

## 4. Set Up Nginx as a Reverse Proxy

### Install Nginx:

```bash
# For Debian/Ubuntu
apt install -y nginx

# For CentOS/RHEL
yum install -y nginx
```

### Create an Nginx configuration:

```bash
nano /etc/nginx/conf.d/v2ray.conf
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location /YOUR_PATH_HERE {  # Must match the path in V2Ray config
        proxy_redirect off;
        proxy_pass http://127.0.0.1:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Replace:
- `your-domain.com` with your domain name
- `YOUR_PATH_HERE` with the same path you used in the V2Ray configuration

### Test and restart Nginx:

```bash
nginx -t
systemctl restart nginx
```

## 5. Start V2Ray

```bash
systemctl enable v2ray
systemctl start v2ray
```

## 6. Get Your V2Ray Configuration

Your V2Ray configuration will look like this:

```
vmess://base64-encoded-configuration
```

You can generate this using the following format:

```json
{
  "v": "2",
  "ps": "Your Server Name",
  "add": "your-domain.com",
  "port": "80",
  "id": "YOUR_UUID_HERE",
  "aid": "0",
  "net": "ws",
  "type": "none",
  "host": "your-domain.com",
  "path": "/YOUR_PATH_HERE",
  "tls": ""
}
```

Convert this JSON to base64, then prepend `vmess://` to get your full configuration.

## 7. Use with Cloudflare Workers Proxy

1. Copy your V2Ray configuration string (the `vmess://...` format)
2. Go to your deployed Cloudflare Worker URL
3. Paste your configuration in the input field
4. Enter a Cloudflare Clean IP
5. Click "Generate Proxy Config"
6. Use the generated configuration in your V2Ray client

## Optional: Set Up TLS with Certbot

For added security, you can set up TLS:

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get a certificate
certbot --nginx -d your-domain.com

# Certbot will modify your Nginx configuration automatically
```

After setting up TLS, update your V2Ray client configuration to use port 443 and enable TLS.

## Troubleshooting

- Check V2Ray logs: `journalctl -u v2ray`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Ensure firewall allows traffic on ports 80 and 443:
  ```bash
  # For UFW (Ubuntu)
  ufw allow 80/tcp
  ufw allow 443/tcp
  
  # For firewalld (CentOS)
  firewall-cmd --permanent --add-port=80/tcp
  firewall-cmd --permanent --add-port=443/tcp
  firewall-cmd --reload
  ```