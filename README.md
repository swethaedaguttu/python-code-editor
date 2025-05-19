# Python Code Editor with Integrated Terminal

A modern, feature-rich online Python code editor designed for young coders learning to program. Built with React, FastAPI, and WebSocket technology.

## 🌟 Features

### Core Features
- **Real-time Code Execution**: Execute Python code directly in the browser
- **Integrated Terminal**: Interactive terminal for input/output operations
- **Code Highlighting**: Syntax highlighting using Monaco Editor
- **File Management**: Create, edit, save, and organize multiple Python files
- **Theme Support**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Advanced Features
- **Secure WebSocket Communication**: All connections are secured with WSS
- **Docker-based Code Execution**: Code runs in isolated containers for security
- **Real-time Output**: Instant feedback for code execution
- **File System**: Create and manage multiple files and folders
- **Undo/Redo Support**: Full history of code changes
- **Auto-save**: Automatic saving of code changes
- **Customizable Settings**: Adjust font size, tab size, and more

## 🛠️ Technical Implementation

### Frontend
- React.js for the user interface
- Monaco Editor for code editing
- Xterm.js for terminal emulation
- Styled Components for styling
- WebSocket for real-time communication

### Backend
- FastAPI for the server
- WebSocket for real-time communication
- Docker for code execution isolation
- Python subprocess management
- Secure file handling

### Security Features
- HTTPS/WSS for secure communication
- CORS protection
- Input sanitization
- Container isolation
- Security headers implementation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- Docker

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Backend
cp .env.example .env
# Edit .env with your configuration
```

5. Start the development servers:
```bash
# Frontend
cd frontend
npm start

# Backend
cd backend
python main.py
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 8000)
- `SSL_KEYFILE`: Path to SSL key file
- `SSL_CERTFILE`: Path to SSL certificate file

### Docker Configuration
- Container isolation for code execution
- Resource limits for security
- Network isolation

## 🎯 Usage

1. Open the editor in your browser
2. Write or paste your Python code
3. Click "Run" to execute the code
4. Use the terminal for input/output operations
5. Save your code using Ctrl+S or the save button

## 🔒 Security Considerations

- All code execution is isolated in Docker containers
- WebSocket connections are secured with WSS
- Input validation and sanitization
- Resource limits on code execution
- Secure file handling

## 🚀 Deployment

The application is deployed on Render.com with the following configuration:
- HTTPS enabled
- WebSocket support
- Automatic SSL certificate management
- Container-based deployment

## 🎨 Customization

### Themes
- Light and dark mode support
- Customizable editor settings
- Terminal color schemes

### Editor Settings
- Font size adjustment
- Tab size configuration
- Line number toggle
- Word wrap options

## 📝 License

MIT License

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- Live Demo: [https://python-code-editor-1-bhs7.onrender.com/](https://python-code-editor-1-bhs7.onrender.com/)
- GitHub Repository: [Repository URL]

## 🙏 Acknowledgments

- Monaco Editor for the code editor
- Xterm.js for the terminal emulation
- FastAPI for the backend framework
- React for the frontend framework 