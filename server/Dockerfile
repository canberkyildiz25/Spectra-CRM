# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build. This must fail loudly: `|| true` used to swallow tsc errors, which
# produced an image that built fine and then died at startup on a missing
# dist/index.js — and a crashed container is exactly what makes Railway answer
# every path with its fallback 404, which is very hard to read backwards.
RUN npm run build

# Fail here rather than at runtime if the compile somehow emitted nothing
RUN test -f dist/index.js

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "dist/index.js"]
