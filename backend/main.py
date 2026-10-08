"""
Main ASGI entrypoint wrapper for HeartGuard backend service on Vercel.
Exposes the FastAPI application instance from app.main.
"""
from app.main import app

__all__ = ["app"]
