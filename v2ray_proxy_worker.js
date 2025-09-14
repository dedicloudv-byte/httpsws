// V2Ray Proxy with Cloudflare Workers
// This script creates a proxy that connects to a V2Ray server with WebSocket + TLS

export default {
  async fetch(request) {
    return handleRequest(request);
  }
};

async function handleRequest(request) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle WebSocket connections
  if (request.headers.get("Upgrade") === "websocket") {
    return handleWebSocket(request);
  }

  // Handle OPTIONS request (preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers,
      status: 204
    });
  }

  // Handle GET request - serve the configuration UI
  if (request.method === "GET") {
    return new Response(renderHTML(), {
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
  } 
  // Handle POST request - process the config generation
  else if (request.method === "POST") {
    const formData = await request.formData();
    const config = formData.get("config");
    const cleanIp = formData.get("cleanIp");
    const workerHost = new URL(request.url).hostname;

    try {
      const refinedConfig = await refineConfig(config, cleanIp, workerHost);
      return new Response(JSON.stringify({ refinedConfig }), {
        headers: { "content-type": "application/json", ...headers }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { "content-type": "application/json", ...headers },
        status: 400
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}

// Handle WebSocket connections by forwarding them to the V2Ray server
async function handleWebSocket(request) {
  const url = new URL(request.url);
  // Extract the target hostname from the path
  const targetHost = url.pathname.replace(/^\/|\/$/, "");
  
  if (!targetHost) {
    return new Response("Invalid WebSocket request", { status: 400 });
  }
  
  // Create a new URL to the target V2Ray server
  const newUrl = new URL(`wss://${targetHost}`);
  
  // Forward the WebSocket connection
  return fetch(new Request(newUrl, request));
}

// UI for configuring the proxy
function renderHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>V2Ray WebSocket+TLS Proxy</title>
  <style>
    :root {
      --primary-color: #4a6cf7;
      --secondary-color: #6c757d;
      --success-color: #28a745;
      --danger-color: #dc3545;
      --background-color: #f8f9fa;
      --card-color: #ffffff;
      --text-color: #212529;
      --border-color: #dee2e6;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: var(--background-color);
      color: var(--text-color);
      line-height: 1.6;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: var(--card-color);
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 30px;
      margin-top: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    h1 {
      color: var(--primary-color);
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .subtitle {
      color: var(--secondary-color);
      font-size: 16px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--text-color);
    }
    
    input, textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 16px;
      background: var(--background-color);
      transition: all 0.3s ease;
    }
    
    input:focus, textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
    }
    
    textarea {
      resize: vertical;
      min-height: 120px;
      font-family: monospace;
    }
    
    .btn {
      display: inline-block;
      font-weight: 600;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      user-select: none;
      border: 1px solid transparent;
      padding: 12px 20px;
      font-size: 16px;
      line-height: 1.5;
      border-radius: 6px;
      transition: all 0.15s ease-in-out;
      cursor: pointer;
      width: 100%;
    }
    
    .btn-primary {
      color: #fff;
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    .btn-primary:hover {
      background-color: #3a5bd9;
      border-color: #3a5bd9;
    }
    
    .btn-success {
      color: #fff;
      background-color: var(--success-color);
      border-color: var(--success-color);
    }
    
    .btn-success:hover {
      background-color: #218838;
      border-color: #1e7e34;
    }
    
    .result-container {
      margin-top: 30px;
    }
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .result-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-color);
    }
    
    .result-box {
      position: relative;
      margin-bottom: 20px;
    }
    
    .config-display {
      background-color: #f8f9fa;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 15px;
      font-family: monospace;
      white-space: nowrap;
      overflow-x: auto;
      margin-bottom: 10px;
      word-break: break-all;
    }
    
    .copy-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .copy-btn:hover {
      background-color: #3a5bd9;
    }
    
    .alert {
      padding: 12px 20px;
      margin-bottom: 20px;
      border: 1px solid transparent;
      border-radius: 6px;
    }
    
    .alert-danger {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
    
    .alert-success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;
    }
    
    .hidden {
      display: none;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }
      
      h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>V2Ray WebSocket+TLS Proxy</h1>
      <p class="subtitle">Generate proxy configurations for bypassing firewalls</p>
    </div>
    
    <div class="form-group">
      <label for="config">V2Ray Configuration (VMess/VLESS/Trojan):</label>
      <textarea id="config" placeholder="Paste your V2Ray configuration here (vmess://..., vless://..., or trojan://...)"></textarea>
    </div>
    
    <div class="form-group">
      <label for="clean-ip">Cloudflare Clean IP:</label>
      <input type="text" id="clean-ip" value="104.18.6.41" placeholder="Enter a Cloudflare clean IP">
    </div>
    
    <button id="generate-btn" class="btn btn-primary">Generate Proxy Configuration</button>
    
    <div id="alert" class="alert hidden"></div>
    
    <div id="result-container" class="result-container hidden">
      <div class="result-header">
        <div class="result-title">Your Proxy Configuration:</div>
      </div>
      
      <div class="result-box">
        <div id="config-display" class="config-display"></div>
        <button id="copy-btn" class="copy-btn">Copy</button>
      </div>
      
      <button id="copy-full-btn" class="btn btn-success">Copy Configuration</button>
    </div>
  </div>
  
  <script>
    document.getElementById('generate-btn').addEventListener('click', async () => {
      const config = document.getElementById('config').value.trim();
      const cleanIp = document.getElementById('clean-ip').value.trim();
      const alertElement = document.getElementById('alert');
      const resultContainer = document.getElementById('result-container');
      const configDisplay = document.getElementById('config-display');
      
      // Reset UI
      alertElement.className = 'alert hidden';
      resultContainer.className = 'result-container hidden';
      
      if (!config) {
        alertElement.className = 'alert alert-danger';
        alertElement.textContent = 'Please enter a V2Ray configuration.';
        return;
      }
      
      if (!cleanIp) {
        alertElement.className = 'alert alert-danger';
        alertElement.textContent = 'Please enter a Cloudflare clean IP.';
        return;
      }
      
      try {
        const formData = new FormData();
        formData.append('config', config);
        formData.append('cleanIp', cleanIp);
        
        const response = await fetch(window.location.href, {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
          resultContainer.className = 'result-container';
          configDisplay.textContent = result.refinedConfig;
        } else {
          alertElement.className = 'alert alert-danger';
          alertElement.textContent = result.error || 'An error occurred while generating the configuration.';
        }
      } catch (error) {
        alertElement.className = 'alert alert-danger';
        alertElement.textContent = 'An error occurred: ' + error.message;
      }
    });
    
    document.getElementById('copy-btn').addEventListener('click', () => {
      copyToClipboard(document.getElementById('config-display').textContent);
    });
    
    document.getElementById('copy-full-btn').addEventListener('click', () => {
      copyToClipboard(document.getElementById('config-display').textContent);
    });
    
    function copyToClipboard(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      const alertElement = document.getElementById('alert');
      alertElement.className = 'alert alert-success';
      alertElement.textContent = 'Configuration copied to clipboard!';
      
      setTimeout(() => {
        alertElement.className = 'alert hidden';
      }, 3000);
    }
  </script>
</body>
</html>
  `;
}

// Process and refine the V2Ray configuration
async function refineConfig(config, cleanIp, workerHost) {
  const allowedPorts = ['443', '8443', '2053', '2083', '2087', '2096'];
  
  if (config.startsWith('vmess://')) {
    return refineVmess(config, cleanIp, workerHost, allowedPorts);
  } else if (config.startsWith('vless://')) {
    return refineVless(config, cleanIp, workerHost, allowedPorts);
  } else if (config.startsWith('trojan://')) {
    return refineTrojan(config, cleanIp, workerHost, allowedPorts);
  } else {
    throw new Error("Invalid config format. Please enter a valid VMess, VLESS, or Trojan config with WebSocket+TLS.");
  }
}

// Process VMess configuration
function refineVmess(config, cleanIp, workerHost, allowedPorts) {
  const base64Data = config.slice(8); // Remove 'vmess://'
  let decodedString;
  
  try {
    decodedString = atob(base64Data); // Decode base64 string
  } catch (e) {
    throw new Error("Invalid VMess config: Base64 decoding failed.");
  }
  
  let decoded;
  try {
    decoded = JSON.parse(decodedString);
  } catch (e) {
    throw new Error("Invalid VMess config: JSON parsing failed.");
  }
  
  if (decoded.net !== 'ws') throw new Error('Network must be WebSocket (ws)');
  if (decoded.tls !== 'tls') throw new Error('Security must be TLS');
  
  // Check if the input port is allowed
  if (!allowedPorts.includes(String(decoded.port))) {
    throw new Error('Config must use a Cloudflare TLS Port (443, 8443, 2053, 2083, 2087, or 2096)');
  }
  
  // Preserve the original "host" and "sni" values
  const originalHost = decoded.host || '';
  const originalSni = decoded.sni || decoded.host || '';
  const originalPath = decoded.path || '';
  const remark = decoded.ps || 'V2Ray_Proxy';
  
  // Set the port to 443 regardless of input config
  decoded.port = 443;
  
  decoded.add = cleanIp; // Set clean IP for "address"
  decoded.host = workerHost; // New worker host
  decoded.sni = workerHost; // New worker SNI
  
  decoded.path = `/${originalSni}${originalPath}`; // Concatenated path with original SNI
  decoded.ps = `${remark}_WorkerProxy`; // Append to the remark
  
  const newConfig = 'vmess://' + btoa(JSON.stringify(decoded));
  return newConfig;
}

// Process VLESS configuration
function refineVless(config, cleanIp, workerHost, allowedPorts) {
  // Parse the VLESS URL
  let url;
  try {
    url = new URL(config);
  } catch (e) {
    throw new Error("Invalid VLESS config: URL parsing failed.");
  }
  
  // Extract components
  const uuid = url.username;
  const remark = url.hash ? decodeURIComponent(url.hash.substring(1)) : 'VLESS_Proxy';
  
  if (url.searchParams.get('type') !== 'ws') throw new Error('Network must be WebSocket (ws)');
  if (url.searchParams.get('security') !== 'tls') throw new Error('Security must be TLS');
  
  // Check if the input port is allowed
  if (!allowedPorts.includes(url.port)) {
    throw new Error('Config must use a Cloudflare TLS Port (443, 8443, 2053, 2083, 2087, or 2096)');
  }
  
  // Get original values
  const originalHost = url.searchParams.get('host') || url.hostname;
  const originalPath = url.searchParams.get('path') || '/';
  
  // Create new configuration
  const newConfig = `vless://${uuid}@${cleanIp}:443?encryption=none&security=tls&sni=${workerHost}&type=ws&host=${workerHost}&path=/${originalHost}${originalPath}#${remark}_WorkerProxy`;
  
  return newConfig;
}

// Process Trojan configuration
function refineTrojan(config, cleanIp, workerHost, allowedPorts) {
  // Parse the Trojan URL
  let url;
  try {
    url = new URL(config);
  } catch (e) {
    throw new Error("Invalid Trojan config: URL parsing failed.");
  }
  
  // Extract components
  const password = url.username;
  const remark = url.hash ? decodeURIComponent(url.hash.substring(1)) : 'Trojan_Proxy';
  
  if (url.searchParams.get('type') !== 'ws') throw new Error('Network must be WebSocket (ws)');
  if (url.searchParams.get('security') !== 'tls') throw new Error('Security must be TLS');
  
  // Check if the input port is allowed
  if (!allowedPorts.includes(url.port)) {
    throw new Error('Config must use a Cloudflare TLS Port (443, 8443, 2053, 2083, 2087, or 2096)');
  }
  
  // Get original values
  const originalHost = url.searchParams.get('host') || url.hostname;
  const originalPath = url.searchParams.get('path') || '/';
  
  // Create new configuration
  const newConfig = `trojan://${password}@${cleanIp}:443?security=tls&sni=${workerHost}&type=ws&host=${workerHost}&path=/${originalHost}${originalPath}#${remark}_WorkerProxy`;
  
  return newConfig;
}
