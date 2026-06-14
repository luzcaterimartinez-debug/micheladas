"""
Función serverless Vercel: atiende todas las rutas /api/* (login, comandas, etc.).
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
