# V2Ray WebSocket+TLS Proxy with Cloudflare Workers

This project provides a Cloudflare Workers-based proxy for V2Ray servers using WebSocket+TLS. It helps bypass firewalls by routing traffic through Cloudflare's global network.

## Features

- Proxies WebSocket+TLS connections to your V2Ray server
- Supports VMess, VLESS, and Trojan protocols
- Easy configuration through a web interface
- Generates shareable configuration links
- Uses Cloudflare's global network for improved connectivity and reduced latency

## How It Works

This solution uses Cloudflare Workers to act as a proxy between clients and your V2Ray server:

1. The client connects to the Cloudflare Worker using WebSocket+TLS
2. The Worker forwards the WebSocket connection to your V2Ray server
3. The V2Ray server processes the connection and routes traffic accordingly

This approach has several benefits:
- Bypasses network restrictions that block direct connections to your server
- Leverages Cloudflare's global network for improved performance
- Adds an additional layer of obfuscation to your traffic

## Setup Instructions

### 1. Set Up Your V2Ray Server

First, ensure your V2Ray server is properly configured with WebSocket+TLS:

```json
{
  "inbounds": [
    {
      "port": 443,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "your-uuid-here",
            "alterId": 0
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "wsSettings": {
          "path": "/your-path"
        },
        "security": "tls",
        "tlsSettings": {
          "certificates": [
            {
              "certificateFile": "/path/to/certificate.crt",
              "keyFile": "/path/to/private.key"
            }
          ]
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

### 2. Deploy the Worker to Cloudflare

1. Sign up or log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to "Workers & Pages"
3. Click "Create Application" and select "Create Worker"
4. Give your worker a name (e.g., `v2ray-proxy`)
5. In the editor, delete all existing code and paste the contents of `v2ray_proxy_worker.js`
6. Click "Save and Deploy"

### 3. Generate Your Proxy Configuration

1. Visit your deployed Worker URL (e.g., `https://v2ray-proxy.your-username.workers.dev`)
2. Enter your existing V2Ray configuration (VMess, VLESS, or Trojan)
3. Enter a Cloudflare Clean IP (you can use the default or find one that works well in your region)
4. Click "Generate Proxy Config"
5. Copy the generated configuration

### 4. Use the Generated Configuration

Import the generated configuration into your V2Ray client:

- For Windows: V2RayN, Qv2ray
- For macOS: V2RayX, ClashX
- For Android: V2RayNG, Clash for Android
- For iOS: Shadowrocket, Quantumult X

## Finding Clean Cloudflare IPs

For optimal performance, you may want to find Cloudflare IPs that work well in your region:

1. Use tools like [CloudflareSpeedTest](https://github.com/XIU2/CloudflareSpeedTest) to test Cloudflare IP performance
2. Choose IPs with low latency and high stability
3. Enter these IPs in the "Clean IP" field when generating your configuration

## Troubleshooting

If you encounter issues:

1. **Connection Errors**: Ensure your V2Ray server is properly configured with WebSocket+TLS
2. **Performance Issues**: Try different Cloudflare Clean IPs
3. **Worker Errors**: Check the Cloudflare Workers logs in your dashboard

## Security Considerations

- This proxy adds an additional layer of obfuscation but is not a complete security solution
- Always use strong encryption and authentication in your V2Ray configuration
- Be aware of Cloudflare's terms of service regarding proxy usage

## Advanced Configuration

For advanced users, you can modify the Worker script to:

- Add custom path handling
- Implement additional authentication
- Customize the web interface
- Add support for additional protocols

## License

This project is released under the MIT License.