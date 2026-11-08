// assets/js/carrito.js · Módulo de gestión del carrito de compras (B).
// Persiste en localStorage ('oleum_carrito_v1'), respeta el stock del catálogo y emite eventos reactivos.

import { productos } from './datos/productos.js';

export const CLAVE_LOCALSTORAGE = 'oleum_carrito_v1';
export const UMBRAL_ENVIO_GRATIS = 50; // euros
export const COSTE_ENVIO_ESTANDAR = 4.95; // euros

// Soporte isomórfico para entorno de pruebas (Node.js sin navegador) o navegador real
let almacenamientoEnMemoria = new Map();

function leerAlmacenamientoBruto() {
  try {
    if (typeof localStorage !== 'undefined') {
      const datos = localStorage.getItem(CLAVE_LOCALSTORAGE);
      return datos ? JSON.parse(datos) : [];
    }
  } catch {
    // Si localStorage está bloqueado o da error de cuota, usamos memoria
  }
  return Array.from(almacenamientoEnMemoria.entries()).map(([productoId, cantidad]) => ({
    productoId,
    cantidad
  }));
}

function guardarAlmacenamientoBruto(items) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(items));
    }
  } catch {
    // En caso de error en localStorage, respaldamos en memoria
  }
  almacenamientoEnMemoria = new Map(items.map((item) => [item.productoId, item.cantidad]));
  notificarCambio();
}

function notificarCambio() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('carrito:actualizado', {
      detail: { unidades: contarUnidades() }
    }));
  }
}

// Devuelve las líneas del carrito con los productos completos del catálogo
export function obtenerLineas() {
  const items = leerAlmacenamientoBruto();
  const lineas = [];

  for (const item of items) {
    const producto = productos.find((p) => p.id === item.productoId && p.activo);
    if (!producto) {
      continue; // Producto descatalogado o no existente
    }
    // Si el stock actual es menor que lo que había guardado, ajustamos
    const cantidadAjustada = Math.min(item.cantidad, producto.stock);
    if (cantidadAjustada <= 0) {
      continue;
    }

    lineas.push({
      productoId: producto.id,
      cantidad: cantidadAjustada,
      producto,
      precioUnitario: producto.precio,
      subtotal: Number((cantidadAjustada * producto.precio).toFixed(2))
    });
  }

  return lineas;
}

// Añade unidades de un producto respetando existencias (CLI-01 y regla 3.3)
export function anadir(productoId, cantidad) {
  const producto = productos.find((candidato) => candidato.id === productoId && candidato.activo);
  if (producto === undefined) {
    return { ok: false, mensaje: 'Este aceite ya no está a la venta.' };
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return { ok: false, mensaje: 'La cantidad mínima es 1.' };
  }

  const items = leerAlmacenamientoBruto();
  const itemExistente = items.find((it) => it.productoId === productoId);
  const yaEnCarrito = itemExistente ? itemExistente.cantidad : 0;

  if (yaEnCarrito + cantidad > producto.stock) {
    return {
      ok: false,
      mensaje: `Ya tienes ${yaEnCarrito} en el carrito y solo quedan ${producto.stock} unidades.`
    };
  }

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    items.push({ productoId, cantidad });
  }

  guardarAlmacenamientoBruto(items);
  return { ok: true };
}

// Modifica la cantidad de un artículo existente en el carrito (CLI-03)
export function actualizarCantidad(productoId, nuevaCantidad) {
  if (!Number.isInteger(nuevaCantidad)) {
    return { ok: false, mensaje: 'La cantidad debe ser un número entero.' };
  }

  if (nuevaCantidad <= 0) {
    return eliminar(productoId);
  }

  const producto = productos.find((p) => p.id === productoId && p.activo);
  if (!producto) {
    eliminar(productoId);
    return { ok: false, mensaje: 'El producto ya no está disponible.' };
  }

  if (nuevaCantidad > producto.stock) {
    return {
      ok: false,
      mensaje: `Solo quedan ${producto.stock} unidades disponibles de este aceite.`
    };
  }

  const items = leerAlmacenamientoBruto();
  const item = items.find((it) => it.productoId === productoId);
  if (item) {
    item.cantidad = nuevaCantidad;
    guardarAlmacenamientoBruto(items);
  }

  return { ok: true };
}

// Elimina un producto del carrito (CLI-04)
export function eliminar(productoId) {
  const items = leerAlmacenamientoBruto().filter((it) => it.productoId !== productoId);
  guardarAlmacenamientoBruto(items);
  return { ok: true };
}

// Vacía por completo el carrito (por ejemplo al finalizar la compra)
export function vaciar() {
  guardarAlmacenamientoBruto([]);
  return { ok: true };
}

// Cuenta el total de unidades acumuladas en el carrito (para el badge de cabecera)
export function contarUnidades() {
  const items = leerAlmacenamientoBruto();
  return items.reduce((total, item) => total + item.cantidad, 0);
}

// Calcula los importes de subtotal, gastos de envío y total final
export function calcularTotales() {
  const lineas = obtenerLineas();
  const subtotal = Number(
    lineas.reduce((acc, linea) => acc + linea.cantidad * linea.producto.precio, 0).toFixed(2)
  );

  const gastosEnvio = (subtotal >= UMBRAL_ENVIO_GRATIS || subtotal === 0) ? 0 : COSTE_ENVIO_ESTANDAR;
  const total = Number((subtotal + gastosEnvio).toFixed(2));
  const envioGratisRestante = subtotal > 0 && subtotal < UMBRAL_ENVIO_GRATIS
    ? Number((UMBRAL_ENVIO_GRATIS - subtotal).toFixed(2))
    : 0;

  return {
    subtotal,
    gastosEnvio,
    total,
    envioGratisRestante,
    esEnvioGratis: gastosEnvio === 0 && subtotal > 0
  };
}

// Limpieza para tests automáticos
export function _resetearParaPruebas() {
  almacenamientoEnMemoria.clear();
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CLAVE_LOCALSTORAGE);
    }
  } catch {
    // ignorar
  }
}
