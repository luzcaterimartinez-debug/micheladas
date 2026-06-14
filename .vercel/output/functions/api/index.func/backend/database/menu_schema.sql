USE michelada;

CREATE TABLE IF NOT EXISTS menu_productos (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  descripcion VARCHAR(500) NOT NULL DEFAULT '',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  orden INT NOT NULL DEFAULT 0,
  pasos JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_toppings (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_producto_topping (
  producto_id VARCHAR(50) NOT NULL,
  topping_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (producto_id, topping_id),
  CONSTRAINT fk_pt_producto FOREIGN KEY (producto_id) REFERENCES menu_productos (id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_topping FOREIGN KEY (topping_id) REFERENCES menu_toppings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_adiciones (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock_key VARCHAR(50) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  orden INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
