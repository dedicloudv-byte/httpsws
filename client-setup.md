# V2Ray Client Setup Guide

This guide will help you set up V2Ray clients to work with your Cloudflare Workers proxy.

## Supported Clients

### Windows
- [V2RayN](https://github.com/2dust/v2rayN/releases)
- [Qv2ray](https://github.com/Qv2ray/Qv2ray/releases)

### macOS
- [V2RayX](https://github.com/Cenmrev/V2RayX/releases)
- [ClashX](https://github.com/yichengchen/clashX/releases)

### Android
- [V2RayNG](https://github.com/2dust/v2rayNG/releases)
- [Clash for Android](https://github.com/Kr328/ClashForAndroid/releases)

### iOS
- [Shadowrocket](https://apps.apple.com/us/app/shadowrocket/id932747118)
- [Quantumult X](https://apps.apple.com/us/app/quantumult-x/id1443988620)

## General Setup Steps

1. Install the appropriate client for your platform
2. Generate your proxy configuration using the Cloudflare Worker
3. Import the configuration into your client

## Detailed Setup Instructions

### V2RayN (Windows)

1. Download and install V2RayN from the [official GitHub repository](https://github.com/2dust/v2rayN/releases)
2. Launch V2RayN
3. Right-click the V2RayN icon in the system tray and select "Import from clipboard"
4. Paste your generated VMess/VLESS/Trojan URL
5. Right-click the newly added server and select "Set as active server"
6. Right-click the V2RayN icon again and select "System proxy" → "Automatic configure system proxy"

### Qv2ray (Windows/macOS/Linux)

1. Download and install Qv2ray from the [official GitHub repository](https://github.com/Qv2ray/Qv2ray/releases)
2. Launch Qv2ray
3. Click "Import" → "Import from clipboard"
4. Paste your generated VMess/VLESS/Trojan URL
5. Select the imported configuration and click "Connect"

### V2RayX (macOS)

1. Download and install V2RayX from the [official GitHub repository](https://github.com/Cenmrev/V2RayX/releases)
2. Launch V2RayX
3. Click on the V2RayX icon in the menu bar and select "Configure"
4. Click "Import" and paste your generated VMess/VLESS/Trojan URL
5. Click "OK" to save
6. Click on the V2RayX icon again and select "V2Ray: On"
7. Select "Proxy Mode" → "PAC Mode" or "Global Mode"

### ClashX (macOS)

1. Download and install ClashX from the [official GitHub repository](https://github.com/yichengchen/clashX/releases)
2. Launch ClashX
3. Click on the ClashX icon in the menu bar
4. Select "Config" → "Remote Config" → "Manage"
5. Add a new configuration with your generated URL
6. Click "Update" to download the configuration
7. Select "Global" or "Rule" mode

### V2RayNG (Android)

1. Download and install V2RayNG from the [official GitHub repository](https://github.com/2dust/v2rayNG/releases) or Google Play Store
2. Launch V2RayNG
3. Tap the "+" button in the bottom right
4. Select "Import config from clipboard"
5. Paste your generated VMess/VLESS/Trojan URL
6. Tap the newly added server to select it
7. Tap the "V" button at the bottom to connect

### Clash for Android

1. Download and install Clash for Android from the [official GitHub repository](https://github.com/Kr328/ClashForAndroid/releases)
2. Launch Clash for Android
3. Tap "Profiles"
4. Tap the "+" button
5. Select "URL" and enter your configuration URL
6. Tap "Save"
7. Select the profile and tap "Start"

### Shadowrocket (iOS)

1. Download and install Shadowrocket from the App Store
2. Launch Shadowrocket
3. Tap the "+" button in the top right
4. Paste your generated VMess/VLESS/Trojan URL
5. Tap "Done"
6. Toggle the switch next to the newly added server to connect

### Quantumult X (iOS)

1. Download and install Quantumult X from the App Store
2. Launch Quantumult X
3. Tap the "Settings" icon at the bottom
4. Tap "Import" and paste your configuration URL
5. Return to the main screen and tap the connection button to connect

## Troubleshooting

### Connection Issues

If you're having trouble connecting:

1. **Check your configuration**: Ensure the generated configuration was imported correctly
2. **Try a different Clean IP**: Some Cloudflare IPs may be blocked in your region
3. **Check your network**: Some networks may block WebSocket connections
4. **Update your client**: Make sure you're using the latest version of your V2Ray client

### Performance Issues

If your connection is slow:

1. **Try different Cloudflare IPs**: Test multiple IPs to find the fastest one for your location
2. **Change server location**: If possible, use a V2Ray server that's geographically closer to you
3. **Check server load**: High server load can cause slowdowns
4. **Try different protocols**: Some protocols may work better in certain network environments

## Advanced Configuration

For advanced users who want to customize their client settings:

### Routing Rules

You can set up routing rules to:
- Bypass proxy for certain websites
- Force certain traffic through the proxy
- Block specific domains

Each client has different methods for configuring routing rules. Consult your client's documentation for specific instructions.

### Split Tunneling

Some clients support split tunneling, which allows you to choose which apps use the proxy:

- **V2RayN**: Settings → Routing → Add rules
- **Clash for Windows/Android**: Settings → Proxies → Mode → Rule
- **Shadowrocket**: Config → Rule

### Multiple Servers

For better reliability, you can set up multiple server configurations and:
- Use load balancing between servers
- Set up automatic failover
- Create different profiles for different use cases