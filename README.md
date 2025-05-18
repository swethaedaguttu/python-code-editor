# Online Python Code Editor

A web-based Python code editor with integrated terminal output, similar to online-python.com. Built with React, FastAPI, and Docker.

## Features

- Real-time code editing with syntax highlighting
- Integrated terminal output
- Secure code execution in Docker containers
- WebSocket-based real-time communication
- Modern, responsive UI

## Prerequisites

- Node.js (v14 or higher)
- Python 3.9 or higher
- Docker
- npm or yarn

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

### Docker Setup

1. Build the backend Docker image:
```bash
docker build -t code-editor-backend .
```

2. Run the backend container:
```bash
docker run -p 8000:8000 code-editor-backend
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Write your Python code in the editor
3. Click "Run Code" to execute your code
4. View the output in the integrated terminal

## Security Features

- Code execution is sandboxed in Docker containers
- Each execution runs in a fresh container
- Containers are automatically cleaned up after execution
- Input validation and sanitization

## Contributing

Feel free to submit issues and enhancement requests! 