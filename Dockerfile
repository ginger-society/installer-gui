# Base image with a more recent version of Rust
FROM rust:1.78-slim-bullseye

# Install system dependencies for Tauri
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install a more recent version of Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verify Rust version
RUN rustc --version

# Install a specific version of pnpm that's compatible
RUN npm install -g pnpm@7.18.0

# Set up working directory
WORKDIR /app

# Copy just the package files first
COPY package.json pnpm-lock.yaml ./

# If you have a Cargo.toml file, copy it too
COPY src-tauri/Cargo.toml src-tauri/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the files (excluding those in .dockerignore)
COPY . .

# Set the default command to run when the container starts
CMD ["pnpm", "build"]