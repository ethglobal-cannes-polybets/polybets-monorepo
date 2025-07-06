#!/bin/bash
# install-oasis-cli.sh - Install Oasis CLI for macOS
set -e

echo "🔧 Installing Oasis CLI for macOS..."

# Download Oasis CLI
OASIS_VERSION="v0.14.1"
CLI_FILENAME="oasis_cli_0.14.1_darwin_all.tar.gz"
DOWNLOAD_URL="https://github.com/oasisprotocol/cli/releases/download/${OASIS_VERSION}/${CLI_FILENAME}"

echo "Downloading Oasis CLI ${OASIS_VERSION}..."
curl -L -o "${CLI_FILENAME}" "${DOWNLOAD_URL}"

echo "Extracting..."
tar -xzf "${CLI_FILENAME}"

echo "Installing to /usr/local/bin/ (requires sudo)..."
sudo mv oasis_cli_0.14.1_darwin_all/oasis /usr/local/bin/

echo "Cleaning up..."
rm -rf "${CLI_FILENAME}" oasis_cli_0.14.1_darwin_all/

echo "✅ Oasis CLI installed successfully!"
echo "Verify installation:"
echo "  oasis --version"