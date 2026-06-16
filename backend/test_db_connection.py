import sys
import os

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import get_connection

try:
    print("Intentando conectar a la base de datos...")
    conn = get_connection()
    print("✅ Conexión exitosa a la base de datos")
    
    cursor = conn.cursor()
    cursor.execute("SELECT VERSION()")
    version = cursor.fetchone()
    print(f"Versión de MySQL: {version[0]}")
    
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"Tablas encontradas: {len(tables)}")
    for table in tables:
        print(f"  - {table[0]}")
    
    cursor.close()
    conn.close()
    print("✅ Conexión cerrada correctamente")
    
except Exception as e:
    print(f"❌ Error de conexión: {e}")
    sys.exit(1)
