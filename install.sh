#!/bin/bash

# V2Ray WebSocket+TLS Proxy with Cloudflare Workers Installation Script

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}V2Ray WebSocket+TLS Proxy with Cloudflare Workers${NC}"
echo -e "${BLUE}Complete Installation Script${NC}"
echo -e "${BLUE}====================================================${NC}"
echo

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Note: Some operations may require root privileges.${NC}"
  echo -e "${YELLOW}Consider running this script with sudo if you encounter permission issues.${NC}"
  echo
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to install packages based on the package manager
install_package() {
  if command_exists apt-get; then
    apt-get update
    apt-get install -y "$@"
  elif command_exists yum; then
    yum install -y "$@"
  elif command_exists dnf; then
    dnf install -y "$@"
  elif command_exists pacman; then
    pacman -Sy --noconfirm "$@"
  elif command_exists brew; then
    brew install "$@"
  else
    echo -e "${RED}Error: Package manager not found. Please install the following packages manually:${NC}"
    echo "$@"
    return 1
  fi
}

# Check and install required packages
echo -e "${YELLOW}Checking and installing required packages...${NC}"
REQUIRED_PACKAGES="curl wget unzip"

for package in $REQUIRED_PACKAGES; do
  if ! command_exists "$package"; then
    echo -e "Installing $package..."
    install_package "$package" || {
      echo -e "${RED}Failed to install $package. Please install it manually.${NC}"
    }
  fi
done

# Create project directory
echo -e "${YELLOW}Creating project directory...${NC}"
mkdir -p v2ray-proxy
cd v2ray-proxy || {
  echo -e "${RED}Failed to create and enter project directory.${NC}"
  exit 1
}

# Download project files
echo -e "${YELLOW}Downloading project files...${NC}"
curl -s -O https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh

# Make scripts executable
chmod +x *.sh

# Menu for installation options
echo -e "${GREEN}Installation options:${NC}"
echo "1. Install V2Ray server"
echo "2. Generate V2Ray configurations"
echo "3. Deploy Cloudflare Worker proxy"
echo "4. Complete setup (all of the above)"
echo "5. Exit"

read -p "Select an option (1-5): " option

case $option in
  1)
    echo -e "${YELLOW}Installing V2Ray server...${NC}"
    bash install-release.sh
    
    # Generate basic V2Ray configuration
    echo -e "${YELLOW}Generating basic V2Ray configuration...${NC}"
    bash generate-config.sh
    
    # Install Nginx if not already installed
    if ! command_exists nginx; then
      echo -e "${YELLOW}Installing Nginx...${NC}"
      install_package nginx
    fi
    
    # Copy Nginx configuration
    echo -e "${YELLOW}Configuring Nginx...${NC}"
    cp config/nginx_v2ray.conf /etc/nginx/conf.d/
    
    # Restart Nginx
    echo -e "${YELLOW}Restarting Nginx...${NC}"
    systemctl restart nginx
    
    # Start V2Ray
    echo -e "${YELLOW}Starting V2Ray...${NC}"
    systemctl enable v2ray
    systemctl restart v2ray
    
    echo -e "${GREEN}V2Ray server installation complete!${NC}"
    echo -e "Your client configuration is saved in ${BLUE}config/client_config.txt${NC}"
    ;;
    
  2)
    echo -e "${YELLOW}Generating V2Ray configurations...${NC}"
    bash generate-config.sh
    echo -e "${GREEN}Configuration generation complete!${NC}"
    ;;
    
  3)
    echo -e "${YELLOW}Deploying Cloudflare Worker proxy...${NC}"
    
    # Check if npm is installed
    if ! command_exists npm; then
      echo -e "${RED}Error: npm is not installed. Please install Node.js and npm first.${NC}"
      echo -e "Visit https://nodejs.org/ for installation instructions."
      exit 1
    fi
    
    # Install Wrangler if not already installed
    if ! command_exists wrangler; then
      echo -e "${YELLOW}Installing Wrangler...${NC}"
      npm install -g wrangler
    fi
    
    # Deploy the worker
    echo -e "${YELLOW}Deploying the worker...${NC}"
    bash setup.sh
    
    echo -e "${GREEN}Cloudflare Worker deployment complete!${NC}"
    ;;
    
  4)
    echo -e "${YELLOW}Performing complete setup...${NC}"
    
    # Install V2Ray
    echo -e "${YELLOW}Installing V2Ray server...${NC}"
    bash install-release.sh
    
    # Generate configurations
    echo -e "${YELLOW}Generating V2Ray configurations...${NC}"
    bash generate-config.sh
    
    # Install Nginx if not already installed
    if ! command_exists nginx; then
      echo -e "${YELLOW}Installing Nginx...${NC}"
      install_package nginx
    fi
    
    # Copy Nginx configuration
    echo -e "${YELLOW}Configuring Nginx...${NC}"
    cp config/nginx_v2ray.conf /etc/nginx/conf.d/
    
    # Restart Nginx
    echo -e "${YELLOW}Restarting Nginx...${NC}"
    systemctl restart nginx
    
    # Start V2Ray
    echo -e "${YELLOW}Starting V2Ray...${NC}"
    systemctl enable v2ray
    systemctl restart v2ray
    
    # Deploy Cloudflare Worker
    echo -e "${YELLOW}Deploying Cloudflare Worker proxy...${NC}"
    
    # Check if npm is installed
    if ! command_exists npm; then
      echo -e "${RED}Error: npm is not installed. Please install Node.js and npm first.${NC}"
      echo -e "Visit https://nodejs.org/ for installation instructions."
      exit 1
    fi
    
    # Install Wrangler if not already installed
    if ! command_exists wrangler; then
      echo -e "${YELLOW}Installing Wrangler...${NC}"
      npm install -g wrangler
    fi
    
    # Deploy the worker
    echo -e "${YELLOW}Deploying the worker...${NC}"
    bash setup.sh
    
    echo -e "${GREEN}Complete setup finished!${NC}"
    echo -e "Your client configuration is saved in ${BLUE}config/client_config.txt${NC}"
    echo -e "Use this configuration with your deployed Cloudflare Worker to generate the final proxy configuration."
    ;;
    
  5)
    echo -e "${YELLOW}Exiting installation.${NC}"
    exit 0
    ;;
    
  *)
    echo -e "${RED}Invalid option. Exiting.${NC}"
    exit 1
    ;;
esac

echo
echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}Installation process completed!${NC}"
echo -e "${BLUE}====================================================${NC}"
echo
echo -e "For more information, please refer to the documentation:"
echo -e "- ${BLUE}README.md${NC}: General information about the project"
echo -e "- ${BLUE}v2ray-server-setup.md${NC}: Detailed V2Ray server setup instructions"
echo -e "- ${BLUE}client-setup.md${NC}: Client configuration instructions"
echo
echo -e "${YELLOW}Thank you for using V2Ray WebSocket+TLS Proxy with Cloudflare Workers!${NC}"