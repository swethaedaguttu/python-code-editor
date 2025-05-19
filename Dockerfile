FROM python:3.9-slim

# Create a non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install system dependencies and Node.js
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

# Copy frontend files and build
COPY frontend/ ./frontend/
WORKDIR /app/frontend

# Fix permissions and install frontend dependencies
RUN chown -R appuser:appuser /app && \
    chmod -R 755 /app && \
    npm cache clean --force && \
    npm install --legacy-peer-deps && \
    npm install -g serve && \
    chmod +x node_modules/.bin/react-scripts

# Build frontend
USER appuser
RUN CI=false GENERATE_SOURCEMAP=false npm run build

# Switch back to root for final setup
USER root
WORKDIR /app
COPY backend/ ./backend/

# Move frontend build to backend static
RUN mkdir -p backend/static && \
    cp -r frontend/build/* backend/static/ && \
    chown -R appuser:appuser /app

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