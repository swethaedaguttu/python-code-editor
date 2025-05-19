from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import asyncio
import json
import os
import sys
import tempfile
import subprocess
import threading
from queue import Queue
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Optional
import uuid
import io
import traceback
import logging
import platform
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Set the event loop policy for Windows
if platform.system() == 'Windows':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Root endpoint
@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

# Store active connections
active_connections: Dict[str, 'ProcessManager'] = {}

class ProcessManager:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.process = None
        self.is_running = False
        self.stdin_buffer = asyncio.Queue()
        self.output_task = None
        self.input_task = None
        self.temp_file = None

    async def start_process(self, code: str, args: str = ""):
        try:
            # Create a temporary file to store the code
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
                f.write(code)
                self.temp_file = f.name

            # Prepare the command
            cmd = [sys.executable, "-u", self.temp_file]  # Add -u for unbuffered output
            if args:
                cmd.extend(args.split())

            # Set up environment variables for Python process
            env = os.environ.copy()
            env.update({
                'PYTHONIOENCODING': 'utf-8',
                'PYTHONUNBUFFERED': '1'
            })

            # Start the process using subprocess.Popen for Windows compatibility
            self.process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                bufsize=0,  # No buffering
                text=True,
                encoding='utf-8',
                universal_newlines=True
            )

            self.is_running = True
            logger.info(f"Started process with PID: {self.process.pid}")

            # Start input and output handlers
            self.output_task = asyncio.create_task(self.handle_output())
            self.input_task = asyncio.create_task(self.handle_input())

            return True
        except Exception as e:
            logger.error(f"Error starting process: {str(e)}")
            logger.error(traceback.format_exc())
            if self.websocket:
                try:
                    await self.websocket.send_text(f"\nError starting process: {str(e)}\n")
                except:
                    pass
            return False

    async def handle_output(self):
        if not self.process:
            return

        try:
            while self.is_running and self.process.poll() is None:
                # Read stdout
                if self.process.stdout:
                    try:
                        # Read all available output
                        output = self.process.stdout.read(1)
                        if output:
                            # Send the output immediately
                            await self.websocket.send_text(output)
                            # Force flush the output
                            await self.websocket.send_text("")
                    except Exception as e:
                        logger.error(f"Error reading stdout: {str(e)}")
                        await self.websocket.send_text(f"\nError reading output: {str(e)}\n")

                # Read stderr
                if self.process.stderr:
                    try:
                        # Read all available error output
                        error = self.process.stderr.read(1)
                        if error:
                            # Send the error immediately
                            await self.websocket.send_text(error)
                            # Force flush the error output
                            await self.websocket.send_text("")
                    except Exception as e:
                        logger.error(f"Error reading stderr: {str(e)}")
                        await self.websocket.send_text(f"\nError reading error output: {str(e)}\n")

                # Small delay to prevent CPU spinning
                await asyncio.sleep(0.01)

        except asyncio.CancelledError:
            logger.info("Output handler cancelled")
            raise
        except Exception as e:
            logger.error(f"Error in handle_output: {str(e)}")
            if self.websocket:
                await self.websocket.send_text(f"\nError in output handler: {str(e)}\n")
        finally:
            if self.websocket:
                await self.websocket.send_text("\n** Process exited **\n")
            self.is_running = False

    async def handle_input(self):
        if not self.process or not self.process.stdin:
            return

        try:
            while self.is_running and self.process.poll() is None:
                try:
                    # Get input from the queue
                    input_data = await self.stdin_buffer.get()
                    
                    # Write to stdin
                    if not input_data.endswith("\n"):
                        input_data += "\n"
                    
                    self.process.stdin.write(input_data)
                    self.process.stdin.flush()
                    
                except asyncio.CancelledError:
                    raise
                except Exception as e:
                    logger.error(f"Error writing to stdin: {str(e)}")
                    if self.websocket:
                        await self.websocket.send_text(f"\nError writing input: {str(e)}\n")
                    break

        except asyncio.CancelledError:
            logger.info("Input handler cancelled")
            raise
        except Exception as e:
            logger.error(f"Error in handle_input: {str(e)}")
            if self.websocket:
                await self.websocket.send_text(f"\nError in input handler: {str(e)}\n")

    async def send_input(self, input_data: str):
        if self.is_running and self.process and self.process.stdin:
            try:
                await self.stdin_buffer.put(input_data)
            except Exception as e:
                logger.error(f"Error queueing input: {str(e)}")
                if self.websocket:
                    await self.websocket.send_text(f"\nError sending input: {str(e)}\n")

    async def stop_process(self):
        if self.process:
            try:
                # Cancel input/output tasks
                if self.output_task:
                    self.output_task.cancel()
                if self.input_task:
                    self.input_task.cancel()

                # Terminate the process
                self.process.terminate()
                try:
                    self.process.wait(timeout=2.0)
                except subprocess.TimeoutExpired:
                    self.process.kill()
                    self.process.wait()

                self.is_running = False
                logger.info("Process stopped")
            except Exception as e:
                logger.error(f"Error stopping process: {str(e)}")
                if self.websocket:
                    try:
                        await self.websocket.send_text(f"\nError stopping process: {str(e)}\n")
                    except:
                        pass

    async def cleanup(self):
        await self.stop_process()
        if self.process:
            try:
                if self.process.stdout:
                    self.process.stdout.close()
                if self.process.stderr:
                    self.process.stderr.close()
                if self.process.stdin:
                    self.process.stdin.close()
            except Exception as e:
                logger.error(f"Error during cleanup: {str(e)}")
        
        # Clean up temporary file
        if self.temp_file and os.path.exists(self.temp_file):
            try:
                os.unlink(self.temp_file)
                self.temp_file = None
            except Exception as e:
                logger.error(f"Error removing temp file: {str(e)}")

@app.websocket("/ws/terminal")
async def websocket_endpoint(websocket: WebSocket):
    connection_id = websocket.query_params.get("connectionId", str(uuid.uuid4()))
    
    try:
        await websocket.accept()
        logger.info(f"WebSocket connection accepted: {connection_id}")
        
        # Clean up old connection if it exists
        if connection_id in active_connections:
            old_manager = active_connections[connection_id]
            await old_manager.stop_process()
            del active_connections[connection_id]
        
        # Create new process manager
        manager = ProcessManager(websocket)
        active_connections[connection_id] = manager
        
        try:
            while True:
                try:
                    data = await websocket.receive_text()
                    message = json.loads(data)
                    
                    if message["type"] == "execute":
                        logger.info(f"Received execute request for connection {connection_id}")
                        success = await manager.start_process(message["code"], message.get("args", ""))
                        if not success:
                            await websocket.send_text("\nError: Failed to start process\n")
                    elif message["type"] == "input":
                        logger.info(f"Received input for connection {connection_id}")
                        await manager.send_input(message["input"])
                    else:
                        logger.warning(f"Unknown message type received: {message.get('type')}")
                        await websocket.send_text("\nError: Unknown message type\n")
                except json.JSONDecodeError as e:
                    logger.error(f"JSON decode error: {str(e)}")
                    try:
                        await websocket.send_text(f"\nError: Invalid message format - {str(e)}\n")
                    except:
                        pass
                except WebSocketDisconnect:
                    raise
                except Exception as e:
                    logger.error(f"Error processing message: {str(e)}")
                    logger.error(traceback.format_exc())
                    try:
                        await websocket.send_text(f"\nError: {str(e)}\n")
                    except:
                        pass
                    
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: {connection_id}")
        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}")
            logger.error(traceback.format_exc())
            try:
                await websocket.send_text(f"\nError: {str(e)}\n")
            except:
                pass
        finally:
            if connection_id in active_connections:
                await active_connections[connection_id].stop_process()
                del active_connections[connection_id]
                
    except Exception as e:
        logger.error(f"Error in websocket_endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        try:
            await websocket.close(code=1011, reason=str(e))
        except:
            pass

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down server, cleaning up connections...")
    for manager in active_connections.values():
        await manager.stop_process()
    active_connections.clear()
    logger.info("Server shutdown complete")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)