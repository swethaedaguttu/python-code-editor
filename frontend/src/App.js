import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import styled, { ThemeProvider } from 'styled-components';
import { FaFolder, FaFile, FaFolderOpen, FaSave, FaUndo, FaRedo, FaCog, FaSun, FaMoon, FaPlay, FaPlus, FaChevronRight, FaChevronDown, FaTrash, FaEdit, FaChevronRight as FaChevronRightSmall, FaTimes } from 'react-icons/fa';

// Theme configuration
const themes = {
  dark: {
    background: '#1e1e1e',
    foreground: '#ffffff',
    editorBg: '#1e1e1e',
    headerBg: '#252526',
    border: '#333333',
    tabBg: '#2d2d2d',
    tabActive: '#1e1e1e',
    tabInactive: 'transparent',
    tabHover: '#3c3c3c',
    buttonBg: '#4CAF50',
    buttonHover: '#45a049',
    iconColor: '#888888',
    iconHover: '#ffffff',
    inputBg: '#333333',
    inputBorder: '#555555',
    terminalBg: '#1e1e1e',
    terminalForeground: '#ffffff',
    terminalCursor: '#ffffff',
    terminalSelection: '#264f78',
    terminalBlack: '#000000',
    terminalRed: '#cd3131',
    terminalGreen: '#0dbc79',
    terminalYellow: '#e5e510',
    terminalBlue: '#2472c8',
    terminalMagenta: '#bc3fbc',
    terminalCyan: '#11a8cd',
    terminalWhite: '#e5e5e5',
    terminalBrightBlack: '#666666',
    terminalBrightRed: '#f14c4c',
    terminalBrightGreen: '#23d18b',
    terminalBrightYellow: '#f5f543',
    terminalBrightBlue: '#3b8eea',
    terminalBrightMagenta: '#d670d6',
    terminalBrightCyan: '#29b8db',
    terminalBrightWhite: '#ffffff'
  },
  light: {
    background: '#ffffff',
    foreground: '#000000',
    editorBg: '#ffffff',
    headerBg: '#f3f3f3',
    border: '#e0e0e0',
    tabBg: '#f8f8f8',
    tabActive: '#ffffff',
    tabInactive: 'transparent',
    tabHover: '#e8e8e8',
    buttonBg: '#4CAF50',
    buttonHover: '#45a049',
    iconColor: '#666666',
    iconHover: '#000000',
    inputBg: '#ffffff',
    inputBorder: '#cccccc',
    terminalBg: '#ffffff',
    terminalForeground: '#000000',
    terminalCursor: '#000000',
    terminalSelection: '#add6ff',
    terminalBlack: '#000000',
    terminalRed: '#cd3131',
    terminalGreen: '#008000',
    terminalYellow: '#795e26',
    terminalBlue: '#0000ff',
    terminalMagenta: '#af00db',
    terminalCyan: '#098658',
    terminalWhite: '#e5e5e5',
    terminalBrightBlack: '#666666',
    terminalBrightRed: '#cd3131',
    terminalBrightGreen: '#008000',
    terminalBrightYellow: '#795e26',
    terminalBrightBlue: '#0000ff',
    terminalBrightMagenta: '#af00db',
    terminalBrightCyan: '#098658',
    terminalBrightWhite: '#ffffff'
  }
};

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.foreground};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  background-color: ${props => props.theme.headerBg};
  border-bottom: 1px solid ${props => props.theme.border};
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
`;

const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  overflow: hidden;
`;

const TerminalContainer = styled.div`
  height: 40vh;
  background-color: ${props => props.theme.terminalBg};
  padding: 10px;
  flex-shrink: 0;
  overflow: hidden;
  border-top: 1px solid ${props => props.theme.border};
  position: relative;
  display: flex;
  flex-direction: column;
`;

const Button = styled.button`
  background-color: ${props => props.theme.buttonBg};
  color: white;
  padding: 5px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
  font-size: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${props => props.theme.buttonHover};
  }
`;

const ToolbarIcon = styled.div`
  padding: 5px;
  cursor: pointer;
  color: ${props => props.theme.iconColor};
  margin: 0 5px;

  &:hover {
    color: ${props => props.theme.iconHover};
  }
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: ${props => props.theme.headerBg};
  border-right: 1px solid ${props => props.theme.border};
  display: flex;
  flex-direction: column;
`;

const FileTree = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const FileLocation = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background-color: ${props => props.theme.headerBg};
  border-bottom: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.foreground};
  font-size: 12px;
`;

const LocationItem = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme.iconColor};
  
  &:hover {
    color: ${props => props.theme.iconHover};
  }
`;

const LocationSeparator = styled.div`
  margin: 0 5px;
  color: ${props => props.theme.iconColor};
`;

const FileTreeItem = styled.div`
  display: flex;
  align-items: center;
  padding: 5px;
  cursor: pointer;
  color: ${props => props.theme.foreground};
  padding-left: ${props => props.depth * 20}px;
  
  &:hover {
    background-color: ${props => props.theme.tabHover};
  }
`;

const FileTreeContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const FileTreeIcon = styled.div`
  margin-right: 5px;
  display: flex;
  align-items: center;
  width: 16px;
`;

const FileTreeName = styled.span`
  flex: 1;
`;

const FileTreeActions = styled.div`
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${FileTreeItem}:hover & {
    opacity: 1;
  }
`;

const FileTreeAction = styled.div`
  padding: 2px;
  margin-left: 4px;
  cursor: pointer;
  color: ${props => props.theme.iconColor};
  
  &:hover {
    color: ${props => props.theme.iconHover};
  }
`;

const SettingsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 999;
`;

const SettingsPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background-color: ${props => props.theme.headerBg};
  border-left: 1px solid ${props => props.theme.border};
  padding: 20px;
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1000;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const SettingsTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.foreground};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.iconColor};
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${props => props.theme.iconHover};
  }
`;

const SettingsItem = styled.div`
  margin-bottom: 15px;
`;

const SettingsLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  color: ${props => props.theme.foreground};
`;

const SettingsInput = styled.input`
  width: 100%;
  padding: 5px;
  background-color: ${props => props.theme.inputBg};
  border: 1px solid ${props => props.theme.inputBorder};
  color: ${props => props.theme.foreground};
  border-radius: 4px;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const defaultCode = `# Simple Calculator Program
# This program adds two numbers entered by the user

def sum(a, b):
    return (a + b)

# Get input from user
a = int(input('Enter 1st number: '))
b = int(input('Enter 2nd number: '))

# Calculate and display the result
print(f'Sum of {a} and {b} is {sum(a, b)}')
`;

const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/ws/terminal`;
};

function App() {
  const [code, setCode] = useState(defaultCode);
  const [editorMounted, setEditorMounted] = useState(false);
  const [commandLineArgs] = useState('');
  const [theme, setTheme] = useState('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState({
    id: 'main',
    name: 'main.py',
    type: 'file',
    content: defaultCode
  });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const terminalRef = useRef(null);
  const wsRef = useRef(null);
  const terminalInstanceRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const inputBufferRef = useRef('');
  const isProgramRunning = useRef(false);
  const editorContainerRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [fileTree, setFileTree] = useState([
    {
      id: 'root',
      name: 'Project',
      type: 'folder',
      isOpen: true,
      children: [
        {
          id: 'main',
          name: 'main.py',
          type: 'file',
          content: defaultCode
        }
      ]
    }
  ]);
  const [currentPath, setCurrentPath] = useState(['Project', 'main.py']);
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState(null);
  const [programState, setProgramState] = useState('idle');
  const [output, setOutput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);
  const [connectionId] = useState(() => Date.now().toString());

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setEditorMounted(true);
    
    // Set initial layout
    const container = editor.getContainerDomNode();
    if (container) {
        const { width, height } = container.getBoundingClientRect();
        editor.layout({ width, height });
    }
    
    // Add resize observer
    const resizeObserver = new ResizeObserver(entries => {
        if (editorRef.current) {
            try {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    editorRef.current.layout({ width, height });
                }
            } catch (error) {
                console.error('Error in resize observer:', error);
            }
        }
    });
    
    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;

    // Add undo/redo handlers
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
        handleUndo();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
        handleRedo();
    });
  };

  // Cleanup function for editor
  const cleanupEditor = useCallback(() => {
    if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
    }
    
    if (editorRef.current) {
        try {
            editorRef.current.dispose();
        } catch (error) {
            console.error('Error disposing editor:', error);
        }
        editorRef.current = null;
    }
    
    if (monacoRef.current) {
        monacoRef.current = null;
    }
  }, []);

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, code]);
      setCode(previousState);
      setUndoStack(undoStack.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, code]);
      setCode(nextState);
      setRedoStack(redoStack.slice(0, -1));
    }
  };

  const getItemPath = (itemId) => {
    const findPath = (items, targetId, currentPath = []) => {
      for (const item of items) {
        if (item.id === targetId) {
          return [...currentPath, item.name];
        }
        if (item.children) {
          const path = findPath(item.children, targetId, [...currentPath, item.name]);
          if (path) return path;
        }
      }
      return null;
    };
    return findPath(fileTree, itemId);
  };

  const handleFileClick = (file) => {
    if (file.type === 'folder') {
      setFileTree(prevTree => {
        const updateFolder = (items) => {
          return items.map(item => {
            if (item.id === file.id) {
              return { ...item, isOpen: !item.isOpen };
            }
            if (item.children) {
              return { ...item, children: updateFolder(item.children) };
            }
            return item;
          });
        };
        return updateFolder(prevTree);
      });
    } else {
      setCurrentFile(file);
      setCode(file.content);
      setCurrentPath(getItemPath(file.id));
    }
  };

  const handleNewFile = (parentId) => {
    const newFile = {
      id: Date.now().toString(),
      name: 'untitled.py',
      type: 'file',
      content: defaultCode
    };

    setFileTree(prevTree => {
      const addFile = (items) => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newFile]
            };
          }
          if (item.children) {
            return { ...item, children: addFile(item.children) };
          }
          return item;
        });
      };
      return addFile(prevTree);
    });
  };

  const handleNewFolder = (parentId) => {
    const newFolder = {
      id: Date.now().toString(),
      name: 'New Folder',
      type: 'folder',
      isOpen: true,
      children: []
    };

    setFileTree(prevTree => {
      const addFolder = (items) => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newFolder]
            };
          }
          if (item.children) {
            return { ...item, children: addFolder(item.children) };
          }
          return item;
        });
      };
      return addFolder(prevTree);
    });
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = useCallback(() => {
    if (currentFile) {
      // Update file content in the tree
      setFileTree(prevTree => {
        const updateFile = (items) => {
          return items.map(item => {
            if (item.id === currentFile.id) {
              return { ...item, content: code };
            }
            if (item.children) {
              return { ...item, children: updateFile(item.children) };
            }
            return item;
          });
        };
        return updateFile(prevTree);
      });

      // Update currentFile with new content
      setCurrentFile(prev => ({
        ...prev,
        content: code
      }));

      // Download the file
      downloadFile(code, currentFile.name);

      // Show save confirmation in terminal
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.write('\r\n\x1b[32mFile saved and downloaded successfully!\x1b[0m\r\n');
      }
    } else {
      // Create new file if no current file
      const newFile = {
        id: Date.now().toString(),
        name: 'untitled.py',
        type: 'file',
        content: code
      };

      setFileTree(prevTree => {
        const addFile = (items) => {
          return items.map(item => {
            if (item.id === 'root') {
              return {
                ...item,
                children: [...(item.children || []), newFile]
              };
            }
            if (item.children) {
              return { ...item, children: addFile(item.children) };
            }
            return item;
          });
        };
        return addFile(prevTree);
      });

      setCurrentFile(newFile);
      setCurrentPath(['Project', newFile.name]);

      // Download the new file
      downloadFile(code, newFile.name);

      // Show save confirmation in terminal
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.write('\r\n\x1b[32mNew file created, saved, and downloaded!\x1b[0m\r\n');
      }
    }
  }, [code, currentFile]);

  // Add keyboard shortcut for save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseSettings();
    }
  };

  const handleRename = (itemId, newName) => {
    // Prevent renaming main.py
    if (itemId === 'main') {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.write('\r\n\x1b[31mCannot rename main.py - it is a required file\x1b[0m\r\n');
      }
      return;
    }

    setFileTree(prevTree => {
      const renameItem = (items) => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, name: newName };
          }
          if (item.children) {
            return { ...item, children: renameItem(item.children) };
          }
          return item;
        });
      };
      return renameItem(prevTree);
    });
    setEditingItem(null);
    if (currentFile && currentFile.id === itemId) {
      setCurrentPath(getItemPath(itemId));
    }
  };

  const handleDelete = (itemId) => {
    // Prevent deletion of main.py
    if (itemId === 'main') {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.write('\r\n\x1b[31mCannot delete main.py - it is a required file\x1b[0m\r\n');
      }
      return;
    }

    setFileTree(prevTree => {
      const deleteItem = (items) => {
        return items.filter(item => {
          if (item.id === itemId) {
            return false;
          }
          if (item.children) {
            item.children = deleteItem(item.children);
          }
          return true;
        });
      };
      return deleteItem(prevTree);
    });
    if (currentFile && currentFile.id === itemId) {
      setCurrentFile(null);
      setCode(defaultCode);
      setCurrentPath(['Project']);
    }
  };

  const startEditing = (item, e) => {
    e.stopPropagation();
    setEditingItem(item.id);
    setEditName(item.name);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editName.trim()) {
      handleRename(editingItem, editName.trim());
    }
  };

  const handleRun = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to server");
      setProgramState('error');
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.write('\r\n\x1b[31mError: Not connected to server\x1b[0m\r\n');
      }
      return;
    }

    try {
      setError(null);
      setProgramState('running');
      
      // Clear terminal before running
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.clear();
        terminalInstanceRef.current.write('\r\n');
      }

      const message = {
        type: "execute",
        code: code,
        args: commandLineArgs
      };
      
      wsRef.current.send(JSON.stringify(message));
    } catch (err) {
      setError(`Error running code: ${err.message}`);
      setProgramState('error');
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.write(`\r\n\x1b[31mError: ${err.message}\x1b[0m\r\n`);
      }
    }
  };

  // Add error display in the UI
  useEffect(() => {
    if (error) {
      console.error('Error:', error);
    }
  }, [error]);

  // Add program state display in the UI
  useEffect(() => {
    if (programState === 'running') {
      console.log('Program is running...');
    } else if (programState === 'error') {
      console.error('Program encountered an error');
    }
  }, [programState]);

  useLayoutEffect(() => {
    if (!terminalRef.current) return;

    try {
      // Initialize terminal
    const terminal = new Terminal({
      cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        theme: {
          background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          foreground: theme === 'dark' ? '#ffffff' : '#000000',
          cursor: theme === 'dark' ? '#ffffff' : '#000000',
          selection: theme === 'dark' ? '#264f78' : '#add6ff',
          black: theme === 'dark' ? '#000000' : '#000000',
          red: theme === 'dark' ? '#cd3131' : '#cd3131',
          green: theme === 'dark' ? '#0dbc79' : '#008000',
          yellow: theme === 'dark' ? '#e5e510' : '#795e26',
          blue: theme === 'dark' ? '#2472c8' : '#0000ff',
          magenta: theme === 'dark' ? '#bc3fbc' : '#af00db',
          cyan: theme === 'dark' ? '#11a8cd' : '#098658',
          white: theme === 'dark' ? '#e5e5e5' : '#e5e5e5',
          brightBlack: theme === 'dark' ? '#666666' : '#666666',
          brightRed: theme === 'dark' ? '#f14c4c' : '#cd3131',
          brightGreen: theme === 'dark' ? '#23d18b' : '#008000',
          brightYellow: theme === 'dark' ? '#f5f543' : '#795e26',
          brightBlue: theme === 'dark' ? '#3b8eea' : '#0000ff',
          brightMagenta: theme === 'dark' ? '#d670d6' : '#af00db',
          brightCyan: theme === 'dark' ? '#29b8db' : '#098658',
          brightWhite: theme === 'dark' ? '#ffffff' : '#ffffff'
        },
        scrollback: 10000,
      convertEol: true,
        disableStdin: false,
        allowTransparency: true,
      rendererType: 'canvas',
      windowsMode: true,
        fastScrollModifier: 'alt',
        fastScrollSensitivity: 5,
        scrollSensitivity: 1,
        cursorStyle: 'block',
        rightClickSelectsWord: true
    });

    // Initialize and configure fit addon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    
    // Store refs
    fitAddonRef.current = fitAddon;
    terminalInstanceRef.current = terminal;

    // Initial fit
    requestAnimationFrame(() => {
      fitAddon.fit();
        terminal.focus();
      });

      // Add terminal input handler
      terminal.onData(handleTerminalInput);

      let reconnectAttempts = 0;
      const maxReconnectAttempts = 5;
      const reconnectDelay = 2000; // 2 seconds
      let reconnectTimeout = null;

      // Initialize WebSocket
      const connectWebSocket = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
      }

        // Clear any existing reconnect timeout
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }

        // Add connection ID to maintain session
        const connectionId = localStorage.getItem('connectionId') || Date.now().toString();
        localStorage.setItem('connectionId', connectionId);

        // Close existing connection if any
        if (wsRef.current) {
          wsRef.current.close();
        }

        try {
          wsRef.current = new WebSocket(`${getWebSocketUrl()}?connectionId=${connectionId}`);
          
          wsRef.current.onopen = () => {
            console.log('Connected to server');
            isProgramRunning.current = false;
          inputBufferRef.current = '';
            reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = event.data;
              
              if (!terminalInstanceRef.current) {
                console.error('Terminal instance not found');
                return;
              }

              // Only show actual program output, not connection messages
              if (!data.includes('Connected to server') && 
                  !data.includes('Connection error') && 
                  !data.includes('Connection closed') && 
                  !data.includes('Attempting to reconnect')) {
                terminalInstanceRef.current.write(data);
                terminalInstanceRef.current.scrollToBottom();
              }
        
        if (data.includes('** Process exited')) {
          isProgramRunning.current = false;
          inputBufferRef.current = '';
              } else if (data.includes('Enter')) {
                isProgramRunning.current = true;
                if (terminalRef.current) {
                  terminalRef.current.focus();
                }
                if (terminalInstanceRef.current) {
                  terminalInstanceRef.current.focus();
                }
        }
      } catch (error) {
              console.error('Error in WebSocket message handler:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      isProgramRunning.current = false;
      inputBufferRef.current = '';
    };

          wsRef.current.onclose = (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
      isProgramRunning.current = false;
      inputBufferRef.current = '';
            
            // Only attempt to reconnect if we haven't exceeded max attempts
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              reconnectTimeout = setTimeout(connectWebSocket, reconnectDelay);
            }
          };
        } catch (error) {
          console.error('Error creating WebSocket:', error);
        }
      };

      // Initial connection
      connectWebSocket();

      // Add connection status check
      const connectionCheckInterval = setInterval(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          if (reconnectAttempts < maxReconnectAttempts) {
            connectWebSocket();
          }
        }
      }, 5000);

    return () => {
        clearInterval(connectionCheckInterval);
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        if (wsRef.current) {
          wsRef.current.close(1000, 'Component unmount');
        }
        if (terminal) {
      terminal.dispose();
      }
    };
    } catch (error) {
      console.error('Error initializing terminal:', error);
    }
  }, [theme]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current && editorContainerRef.current) {
        try {
          const { width, height } = editorContainerRef.current.getBoundingClientRect();
          editorRef.current.layout({ width, height });
        } catch (error) {
          console.error('Error in resize handler:', error);
        }
      }
      if (fitAddonRef.current) {
        setTimeout(() => {
          try {
            fitAddonRef.current.fit();
          } catch (error) {
            console.error('Error fitting terminal:', error);
          }
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial layout

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [editorMounted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupEditor();
    };
  }, [cleanupEditor]);

  const renderFileTree = (items, depth = 0) => {
    return items.map(item => (
      <React.Fragment key={item.id}>
        <FileTreeItem 
          depth={depth} 
          onClick={() => handleFileClick(item)}
          style={{
            backgroundColor: currentFile && item.id === currentFile.id ? 
              (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)') : 
              'transparent'
          }}
        >
          <FileTreeContent>
            <FileTreeIcon>
              {item.type === 'folder' ? (
                item.isOpen ? <FaChevronDown /> : <FaChevronRight />
              ) : null}
            </FileTreeIcon>
            <FileTreeIcon>
              {item.type === 'folder' ? (
                item.isOpen ? <FaFolderOpen /> : <FaFolder />
              ) : (
                <FaFile />
              )}
            </FileTreeIcon>
            {editingItem === item.id ? (
              <form onSubmit={handleEditSubmit} onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={handleEditSubmit}
                  autoFocus
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </form>
            ) : (
              <FileTreeName style={{
                color: currentFile && item.id === currentFile.id ? 
                  (theme === 'dark' ? '#ffffff' : '#000000') : 
                  'inherit'
              }}>
                {item.name}
              </FileTreeName>
            )}
          </FileTreeContent>
          <FileTreeActions>
            {item.type === 'folder' ? (
              <>
                <FileTreeAction onClick={(e) => { e.stopPropagation(); handleNewFile(item.id); }}>
                  <FaPlus />
                </FileTreeAction>
                <FileTreeAction onClick={(e) => { e.stopPropagation(); handleNewFolder(item.id); }}>
                  <FaFolder />
                </FileTreeAction>
              </>
            ) : null}
            {item.id !== 'main' && (
              <>
                <FileTreeAction onClick={(e) => startEditing(item, e)}>
                  <FaEdit />
                </FileTreeAction>
                <FileTreeAction onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                  <FaTrash />
                </FileTreeAction>
              </>
            )}
          </FileTreeActions>
        </FileTreeItem>
        {item.type === 'folder' && item.isOpen && item.children && (
          renderFileTree(item.children, depth + 1)
        )}
      </React.Fragment>
    ));
  };

  const handleTerminalInput = (data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: "input",
        input: data
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return (
    <ThemeProvider theme={themes[theme]}>
    <AppContainer>
      <Header>
        <LeftControls>
            <ToolbarIcon onClick={handleSave} title="Save (Ctrl+S)">
              <FaSave />
            </ToolbarIcon>
            <ToolbarIcon onClick={handleUndo}>
              <FaUndo />
            </ToolbarIcon>
            <ToolbarIcon onClick={handleRedo}>
              <FaRedo />
            </ToolbarIcon>
            <Button onClick={handleRun}>
              <FaPlay style={{ marginRight: '5px' }} />
              Run
            </Button>
        </LeftControls>
        <RightControls>
            <ToolbarIcon onClick={handleThemeToggle}>
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </ToolbarIcon>
            <ToolbarIcon onClick={handleSettingsToggle}>
              <FaCog />
            </ToolbarIcon>
        </RightControls>
      </Header>
        
        <MainContent>
          <Sidebar>
            <FileTree>
              {renderFileTree(fileTree)}
            </FileTree>
          </Sidebar>
          
          <EditorWrapper>
            <FileLocation>
              {currentPath.map((item, index) => (
                <React.Fragment key={index}>
                  <LocationItem>{item}</LocationItem>
                  {index < currentPath.length - 1 && (
                    <LocationSeparator>
                      <FaChevronRightSmall size={10} />
                    </LocationSeparator>
                  )}
                </React.Fragment>
              ))}
            </FileLocation>
      <EditorContainer ref={editorContainerRef}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={newValue => {
            if (newValue !== undefined) {
              setUndoStack([...undoStack, code]);
              setCode(newValue);
            }
          }}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorDidMount}
          beforeMount={cleanupEditor}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderWhitespace: 'none',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10
            }
          }}
        />
      </EditorContainer>
          </EditorWrapper>
          
          <SettingsOverlay isOpen={isSettingsOpen} onClick={handleOverlayClick} />
          <SettingsPanel isOpen={isSettingsOpen}>
            <SettingsHeader>
              <SettingsTitle>Settings</SettingsTitle>
              <CloseButton onClick={handleCloseSettings} title="Close settings">
                <FaTimes />
              </CloseButton>
            </SettingsHeader>
            <SettingsItem>
              <SettingsLabel>Font Size</SettingsLabel>
              <SettingsInput
                type="number"
                min="8"
                max="24"
                defaultValue="14"
                onChange={e => {
                  if (editorRef.current) {
                    editorRef.current.updateOptions({ fontSize: parseInt(e.target.value) });
                  }
                }}
              />
            </SettingsItem>
            <SettingsItem>
              <SettingsLabel>Tab Size</SettingsLabel>
              <SettingsInput
                type="number"
                min="2"
                max="8"
                defaultValue="4"
                onChange={e => {
                  if (editorRef.current) {
                    editorRef.current.updateOptions({ tabSize: parseInt(e.target.value) });
                  }
                }}
        />
            </SettingsItem>
          </SettingsPanel>
        </MainContent>
        
      <TerminalContainer ref={terminalRef} />
    </AppContainer>
    </ThemeProvider>
  );
}

export default App;