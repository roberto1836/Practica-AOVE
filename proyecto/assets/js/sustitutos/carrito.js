// SUSTITUTO PROVISIONAL de carrito.js (de B), con la misma interfaz: anadir(productoId, cantidad).
// Guarda el carrito en memoria, así que se vacía al recargar: basta para probar la ficha.
// En la fase 8 se cambia el import y se borra.

import { productos } from '../datos/productos.js';

// productoId → unidades. Un Map evita confundir ids con propiedades heredadas de un objeto normal.
const unidadesPorProducto = new Map();

// Contrato acordado con B (README, «Acuerdos»): devuelve { ok: true } si se ha añadido,
// o { ok: false, mensaje } con el texto que se muestra junto al campo.
export function anadir(productoId, cantidad) {
  const producto = productos.find((candidato) => candidato.id === productoId && candidato.activo);
  if (producto === undefined) {
    return { ok: false, mensaje: 'Este aceite ya no está a la venta.' };
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return { ok: false, mensaje: 'La cantidad mínima es 1.' };
  }
  // Se comprueba el total, no solo lo que se añade ahora: añadir 2 y luego 2 de un producto con 3 debe fallar.
  const yaEnCarrito = unidadesPorProducto.get(productoId) ?? 0;
  if (yaEnCarrito + cantidad > producto.stock) {
    return { ok: false, mensaje: `Ya tienes ${yaEnCarrito} en el carrito y solo quedan ${producto.stock} unidades.` };
  }
  unidadesPorProducto.set(productoId, yaEnCarrito + cantidad);
  return { ok: true };
}

// Total de unidades: lo usará el contador de la cabecera (de B).
export function contarUnidades() {
  return [...unidadesPorProducto.values()].reduce((total, unidades) => total + unidades, 0);
}
