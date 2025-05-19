# Python Code Editor

A web-based Python code editor with real-time execution and output display.

## Features

- Real-time code execution
- Terminal output display
- File management
- Dark/Light theme support
- Responsive design

## Development

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Deployment

The application is deployed on Render. The deployment process is automated using GitHub Actions.

### Manual Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Copy the build files to the backend:
   ```bash
   mkdir -p backend/static
   cp -r frontend/build/* backend/static/
   ```

3. Deploy to Render:
   - Create a new Web Service on Render
   - Connect your GitHub repository
   - Set the build command: `cd backend && pip install -r requirements.txt`
   - Set the start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

## Environment Variables

- `PORT`: The port number for the server (default: 8000)
- `PYTHON_VERSION`: Python version (default: 3.9.0)

## License

MIT 