
FROM node:22-bookworm-slim

# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Verify FFmpeg
RUN ffmpeg -version

WORKDIR /app

# Copy backend dependencies from root
COPY package*.json ./

RUN npm ci --omit=dev

# Copy backend source
COPY backend ./backend

# Create upload directory
RUN mkdir -p /app/backend/public/uploads

# Start backend
CMD ["node", "backend/src/server.js"]
