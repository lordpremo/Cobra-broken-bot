#!/bin/bash

echo "🔧 Installing COBRA BROKEN WhatsApp Bot (CODE + QR MODE)..."

apt update -y
apt upgrade -y

pkg install nodejs -y
pkg install git -y
pkg install ffmpeg -y
pkg install imagemagick -y

npm install

echo "✅ Installation complete!"
echo "Run: node pair.js"
