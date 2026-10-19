#!/usr/bin/env bash
# ==============================================================================
# OpenShelf - Amazon EC2 Automated Host Deployment Script
# Suitable for Amazon Linux 2023, Ubuntu 22.04/24.04, or Debian instances
# ==============================================================================
set -e

echo "=================================================="
echo " Starting OpenShelf Amazon EC2 Host Provisioning "
echo "=================================================="

# 1. Update OS packages
echo "--> Updating system packages..."
if command -v dnf &> /dev/null; then
    sudo dnf update -y
    sudo dnf install -y git curl gcc-c++ make
elif command -v apt-get &> /dev/null; then
    sudo apt-get update -y
    sudo apt-get install -y git curl build-essential
fi

# 2. Install Node.js 22 LTS
echo "--> Installing Node.js LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - || curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
    if command -v dnf &> /dev/null; then
        sudo dnf install -y nodejs
    else
        sudo apt-get install -y nodejs
    fi
fi
echo "Node.js version: $(node -v)"
echo "npm version:     $(npm -v)"

# 3. Create project directory if not existing
APP_DIR="/opt/openshelf"
echo "--> Application directory: $APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"

# 4. Clone or update repository
if [ ! -d "$APP_DIR/.git" ]; then
    echo "--> Cloning repository..."
    git clone https://github.com/enrico-07/OpenShelf.git "$APP_DIR"
else
    echo "--> Pulling latest code..."
    cd "$APP_DIR" && git pull origin main
fi

cd "$APP_DIR"

# 5. Install dependencies & build frontend assets
echo "--> Installing npm dependencies..."
npm install

echo "--> Building production Vite bundle..."
npm run build

# 6. Copy systemd service unit
echo "--> Installing systemd unit..."
sudo cp "$APP_DIR/deploy/openshelf.service" /etc/systemd/system/openshelf.service
sudo systemctl daemon-reload
sudo systemctl enable openshelf
sudo systemctl restart openshelf

echo "=================================================="
echo " OpenShelf is now RUNNING on Amazon EC2!          "
echo " Check status: sudo systemctl status openshelf    "
echo " Server logs:  sudo journalctl -u openshelf -f    "
echo "=================================================="
