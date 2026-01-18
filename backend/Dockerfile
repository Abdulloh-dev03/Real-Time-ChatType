# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependency files first
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build TypeScript (if using)
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/dist ./dist/

# Expose backend port
EXPOSE 5000

# Optional healthcheck (you can keep or remove)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the app
CMD ["node", "dist/server.js"]
