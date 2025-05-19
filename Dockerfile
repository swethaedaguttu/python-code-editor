# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend code
COPY frontend/ ./

# Build the frontend
ENV CI=false
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Final stage
FROM python:3.9-slim

# Create a non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    gnupg \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first to leverage Docker cache
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend build from the builder stage
COPY --from=frontend-builder /app/frontend/build ./backend/static/

# Set environment variables
ENV PYTHONPATH=/app/backend
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production
ENV CI=false

# Expose the port
EXPOSE 8000

# Switch to non-root user for running the application
USER appuser

# Command to run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"] 