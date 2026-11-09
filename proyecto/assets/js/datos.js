// =============================================================================
// assets/js/datos.js · Re-exportación unificada de datos de prueba de Oleum
// Cumple el enunciado: usuarios de prueba (2 clientes y 1 admin), catálogo y pedidos.
// =============================================================================

import { usuariosIniciales } from './datos/usuarios.js';
import { productos, categorias, obtenerTodosLosProductos } from './datos/productos.js';
import {
  pedidos,
  PEDIDOS_SEMILLA,
  ESTADOS_PEDIDO,
  ETIQUETAS_ESTADO,
  obtenerTodosLosPedidos
} from './datos/pedidos.js';

export {
  usuariosIniciales,
  usuariosIniciales as usuarios,
  productos,
  categorias,
  obtenerTodosLosProductos,
  pedidos,
  PEDIDOS_SEMILLA,
  ESTADOS_PEDIDO,
  ETIQUETAS_ESTADO,
  obtenerTodosLosPedidos
};
