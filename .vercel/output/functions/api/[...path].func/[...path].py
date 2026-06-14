"""
Función serverless Vercel: atiende todas las rutas /api/* (login, comandas, etc.).
El runtime Python de Vercel expone `app` (ASGI) directamente.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.main import app
