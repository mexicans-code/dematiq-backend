#!/bin/sh
set -e

ROOT_DIR=$(pwd)

echo "Installing root dependencies..."
npm install

for dir in common gateway services/auth services/users services/products services/orders; do
  echo "Installing dependencies in $dir..."
  cd "$ROOT_DIR/$dir"
  npm install
done

cd "$ROOT_DIR"
echo "Setup complete!"
