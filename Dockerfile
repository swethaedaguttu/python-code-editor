FROM python:3.9-slim

WORKDIR /app

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first to leverage Docker cache
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend files and build
COPY frontend/ ./frontend/
WORKDIR /app/frontend

# Install frontend dependencies and build
RUN npm install --legacy-peer-deps && \
    npm install -g serve && \
    GENERATE_SOURCEMAP=false npm run build

# Go back to app directory and copy backend code
WORKDIR /app
COPY backend/ ./backend/

# Move frontend build to backend static
RUN mkdir -p backend/static && \
    cp -r frontend/build/* backend/static/

# Set environment variables
ENV PYTHONPATH=/app/backend
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"] 