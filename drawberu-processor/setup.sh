#!/bin/bash
# Setup script for DrawBeru Processor on DigitalOcean
# Run as root: bash /opt/drawberu-processor/setup.sh

set -e

echo "=== DrawBeru Processor Setup ==="

# Install system deps for OpenCV
apt-get update
apt-get install -y python3 python3-venv python3-pip libgl1-mesa-glx libglib2.0-0

# Create venv
cd /opt/drawberu-processor
python3 -m venv venv
source venv/bin/activate

# Install Python deps
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Python deps installed ==="

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save

echo "=== DrawBeru Processor running on port 3006 ==="
echo "Test: curl http://localhost:3006/health"
