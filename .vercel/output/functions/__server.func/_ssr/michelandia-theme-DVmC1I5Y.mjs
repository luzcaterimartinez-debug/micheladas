const THEMES = {
  tradicional: {
    border: "#1e88e5",
    title: "#1565c0",
    subtitle: "#42a5f5",
    ring: "rgba(30, 136, 229, 0.35)"
  },
  bombom_cereza: {
    border: "#e53935",
    title: "#c62828",
    subtitle: "#ef5350",
    ring: "rgba(229, 57, 53, 0.35)"
  },
  lulo: {
    border: "#fb8c00",
    title: "#ef6c00",
    subtitle: "#ffa726",
    ring: "rgba(251, 140, 0, 0.35)"
  },
  maracumazana: {
    border: "#43a047",
    title: "#2e7d32",
    subtitle: "#66bb6a",
    ring: "rgba(67, 160, 71, 0.35)"
  },
  maragumango: {
    border: "#f57c00",
    title: "#e65100",
    subtitle: "#ff9800",
    ring: "rgba(245, 124, 0, 0.35)"
  },
  manzana_verde: {
    border: "#7cb342",
    title: "#558b2f",
    subtitle: "#9ccc65",
    ring: "rgba(124, 179, 66, 0.35)"
  },
  frutos_rojos: {
    border: "#d32f2f",
    title: "#b71c1c",
    subtitle: "#e57373",
    ring: "rgba(211, 47, 47, 0.35)"
  },
  mango_biche: {
    border: "#fdd835",
    title: "#f9a825",
    subtitle: "#ffee58",
    ring: "rgba(253, 216, 53, 0.45)"
  },
  sandia: {
    border: "#ec407a",
    title: "#c2185b",
    subtitle: "#f06292",
    ring: "rgba(236, 64, 122, 0.35)"
  },
  tamarindo_mango: {
    border: "#ff7043",
    title: "#e64a19",
    subtitle: "#ff8a65",
    ring: "rgba(255, 112, 67, 0.35)"
  },
  maracubombom: {
    border: "#8e24aa",
    title: "#6a1b9a",
    subtitle: "#ab47bc",
    ring: "rgba(142, 36, 170, 0.35)"
  },
  blueberry_mango: {
    border: "#5e35b1",
    title: "#4527a0",
    subtitle: "#7e57c2",
    ring: "rgba(94, 53, 177, 0.35)"
  },
  especiales: {
    border: "#f9a825",
    title: "#e65100",
    subtitle: "#ffb300",
    ring: "rgba(249, 168, 37, 0.45)"
  },
  adiciones: {
    border: "#43a047",
    title: "#2e7d32",
    subtitle: "#66bb6a",
    ring: "rgba(67, 160, 71, 0.35)"
  }
};
const DEFAULT_THEME = {
  border: "#1e88e5",
  title: "#1565c0",
  subtitle: "#42a5f5",
  ring: "rgba(30, 136, 229, 0.35)"
};
function flavorTheme(categoriaId) {
  return THEMES[categoriaId] ?? DEFAULT_THEME;
}
function formatMenuPrice(value) {
  return `$${value.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
}
function productBaseLabel(productName, categoriaName) {
  const sep = " · ";
  if (productName.includes(sep)) {
    return productName.split(sep).pop()?.trim() ?? productName;
  }
  return productName.replace(categoriaName, "").trim() || productName;
}
export {
  formatMenuPrice as a,
  flavorTheme as f,
  productBaseLabel as p
};
