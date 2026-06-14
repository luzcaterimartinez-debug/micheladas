import sys
import os

# Agregar el directorio backend al path para poder importar el módulo app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.main import app
