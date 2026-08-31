import uvicorn
import os
from dotenv import load_dotenv

# Load configuration from .env file
load_dotenv()

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting EV Route Optimizer Server on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
