from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from routes import chat, risk, agents, safety, schemes, auth, family, meds, profiles, checkins, extract
from rag.embedder import build_index
import os
import logging
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup lifespan event:
    1. Run RAG indexing (builds FAISS index if not on disk)
    2. Log startup complete
    """
    logger.info("Starting Swasthya AI Backend...")
    try:
        # Run indexing
        build_index()
        logger.info("RAG Index check/initialization complete.")
    except Exception as e:
        logger.error(f"Failed to initialize RAG index: {e}")
        
    yield
    logger.info("Shutting down Swasthya AI Backend...")

app = FastAPI(
    title="Swasthya AI Backend",
    description="Python FastAPI backend for AI-driven health insights, clinical validation, and risk assessment.",
    version="1.0.0",
    lifespan=lifespan
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mounting Routers
app.include_router(chat.router)
app.include_router(risk.router)
app.include_router(agents.router)
app.include_router(safety.router)
app.include_router(schemes.router)
app.include_router(auth.router)
app.include_router(family.router)
app.include_router(meds.router)
app.include_router(profiles.router)
app.include_router(checkins.router)
app.include_router(extract.router, prefix="/extract", tags=["Extraction"])

@app.get("/")
async def root():
    return {
        "app": "Swasthya AI",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
