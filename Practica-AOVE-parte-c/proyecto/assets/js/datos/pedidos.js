// assets/js/datos/pedidos.js · Modelo y persistencia de pedidos (B).
// Cumple el modelo relacional del enunciado (apartado 6.1) y persiste en localStorage ('oleum_pedidos_v1').
// Cada línea conserva el precio unitario del momento de compra (regla 3.3 y 7.1).

export const CLAVE_LOCALSTORAGE_PEDIDOS = 'oleum_pedidos_v1';

export const ESTADOS_PEDIDO = [
  'recibido',
  'en_preparacion',
  'enviado',
  'entregado',
  'cancelado'
];

export const ETIQUETAS_ESTADO = {
  recibido: 'Recibido',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

// Pedidos iniciales de prueba en los 5 estados exigidos por el enunciado (apartado 6.3)
export const PEDIDOS_SEMILLA = [
  {
    id: 1001,
    usuario_id: 1,
    fecha: '2026-10-15T10:14:00Z',
    estado: 'entregado',
    direccion_envio: {
      nombre_completo: 'Laura Gómez Ruiz',
      telefono: '612345678',
      calle: 'Calle Mayor 14, 2º B',
      codigo_postal: '28801',
      ciudad: 'Alcalá de Henares',
      provincia: 'Madrid',
      observaciones: 'Dejar en conserjería si no estoy.'
    },
    metodo_pago: 'Tarjeta bancaria (simulada)',
    lineas: [
      { producto_id: 1, cantidad: 2, precio_unitario: 18.95 },
      { producto_id: 16, cantidad: 1, precio_unitario: 4.50 }
    ],
    gastos_envio: 4.95,
    subtotal: 42.40,
    total: 47.35
  },
  {
    id: 1002,
    usuario_id: 1,
    fecha: '2026-11-02T16:45:00Z',
    estado: 'enviado',
    direccion_envio: {
      nombre_completo: 'Laura Gómez Ruiz',
      telefono: '612345678',
      calle: 'Calle Mayor 14, 2º B',
      codigo_postal: '28801',
      ciudad: 'Alcalá de Henares',
      provincia: 'Madrid',
      observaciones: 'Llamar antes de entregar.'
    },
    metodo_pago: 'Bizum (simulado)',
    lineas: [
      { producto_id: 5, cantidad: 1, precio_unitario: 48.00 },
      { producto_id: 17, cantidad: 1, precio_unitario: 3.90 }
    ],
    gastos_envio: 0,
    subtotal: 51.90,
    total: 51.90
  },
  {
    id: 1003,
    usuario_id: 1,
    fecha: '2026-11-05T09:20:00Z',
    estado: 'en_preparacion',
    direccion_envio: {
      nombre_completo: 'Laura Gómez Ruiz',
      telefono: '612345678',
      calle: 'Calle Libreros 22, 1º Izq',
      codigo_postal: '28801',
      ciudad: 'Alcalá de Henares',
      provincia: 'Madrid',
      observaciones: ''
    },
    metodo_pago: 'Tarjeta bancaria (simulada)',
    lineas: [
      { producto_id: 7, cantidad: 2, precio_unitario: 16.50 }
    ],
    gastos_envio: 4.95,
    subtotal: 33.00,
    total: 37.95
  },
  {
    id: 1004,
    usuario_id: 1,
    fecha: '2026-11-07T18:05:00Z',
    estado: 'recibido',
    direccion_envio: {
      nombre_completo: 'Laura Gómez Ruiz',
      telefono: '612345678',
      calle: 'Calle Mayor 14, 2º B',
      codigo_postal: '28801',
      ciudad: 'Alcalá de Henares',
      provincia: 'Madrid',
      observaciones: 'Por las tardes a partir de las 18h.'
    },
    metodo_pago: 'Tarjeta bancaria (simulada)',
    lineas: [
      { producto_id: 15, cantidad: 1, precio_unitario: 14.50 }
    ],
    gastos_envio: 4.95,
    subtotal: 14.50,
    total: 19.45
  },
  {
    id: 1005,
    usuario_id: 1,
    fecha: '2026-10-01T12:00:00Z',
    estado: 'cancelado',
    direccion_envio: {
      nombre_completo: 'Laura Gómez Ruiz',
      telefono: '612345678',
      calle: 'Calle Mayor 14, 2º B',
      codigo_postal: '28801',
      ciudad: 'Alcalá de Henares',
      provincia: 'Madrid',
      observaciones: ''
    },
    metodo_pago: 'Transferencia bancaria (simulada)',
    lineas: [
      { producto_id: 3, cantidad: 1, precio_unitario: 12.85 }
    ],
    gastos_envio: 4.95,
    subtotal: 12.85,
    total: 17.80
  },
  {
    // Pedido perteneciente a otro cliente (usuario 2) para verificar el aislamiento de acceso
    id: 1006,
    usuario_id: 2,
    fecha: '2026-11-06T11:00:00Z',
    estado: 'en_preparacion',
    direccion_envio: {
      nombre_completo: 'Carlos Sánchez Gil',
      telefono: '699887766',
      calle: 'Paseo de la Estación 5',
      codigo_postal: '28807',
      ciudad: 'Alcalá de Henares',
      provincia: 'Madrid',
      observaciones: ''
    },
    metodo_pago: 'Tarjeta bancaria (simulada)',
    lineas: [
      { producto_id: 9, cantidad: 2, precio_unitario: 9.50 }
    ],
    gastos_envio: 4.95,
    subtotal: 19.00,
    total: 23.95
  }
];

// Soporte isomórfico para entorno de pruebas Node.js
let memoriaPedidos = null;

function clonar(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

function cargarTodosLosPedidos() {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(CLAVE_LOCALSTORAGE_PEDIDOS);
      if (raw) {
        return JSON.parse(raw);
      }
      // Inicializar semilla si aún no existe
      const inicial = clonar(PEDIDOS_SEMILLA);
      localStorage.setItem(CLAVE_LOCALSTORAGE_PEDIDOS, JSON.stringify(inicial));
      return inicial;
    } catch {
      // Si falla localStorage, usamos memoria
    }
  }

  if (memoriaPedidos === null) {
    memoriaPedidos = clonar(PEDIDOS_SEMILLA);
  }
  return memoriaPedidos;
}

function guardarTodosLosPedidos(pedidos) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE_PEDIDOS, JSON.stringify(pedidos));
    } catch {
      // Ignorar errores de cuota en pruebas
    }
  }
  memoriaPedidos = clonar(pedidos);
}

// Devuelve los pedidos correspondientes a un usuario ordenados por fecha descendente
export function obtenerPedidosCliente(usuarioId) {
  if (!usuarioId) return [];
  const todos = cargarTodosLosPedidos();
  return todos
    .filter((p) => p.usuario_id === usuarioId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

// Recupera un pedido por su id, asegurando que pertenece al usuario autenticado (apartado 3.2 y 7.1)
export function obtenerPedidoPorId(pedidoId, usuarioId) {
  const idNumerico = Number(pedidoId);
  if (!idNumerico || !usuarioId) return null;

  const todos = cargarTodosLosPedidos();
  const pedido = todos.find((p) => p.id === idNumerico);

  if (!pedido) return null;
  // Aislamiento de seguridad: si el pedido no es del usuario, devuelve null
  if (pedido.usuario_id !== usuarioId) return null;

  return clonar(pedido);
}

// Formaliza y persiste un nuevo pedido congelando los precios históricos
export function crearPedido({ usuarioId, direccionEnvio, metodoPago, lineas, gastosEnvio, subtotal, total }) {
  if (!usuarioId) {
    return { ok: false, mensaje: 'Debes iniciar sesión para confirmar un pedido.' };
  }
  if (!lineas || lineas.length === 0) {
    return { ok: false, mensaje: 'El carrito no puede estar vacío para confirmar un pedido.' };
  }

  const todos = cargarTodosLosPedidos();
  const maxId = todos.reduce((max, p) => (p.id > max ? p.id : max), 1000);
  const nuevoId = maxId + 1;

  // Congelamos el precio unitario en cada línea
  const lineasCongeladas = lineas.map((linea) => ({
    producto_id: linea.productoId ?? linea.producto_id,
    cantidad: linea.cantidad,
    precio_unitario: linea.precioUnitario ?? linea.precio_unitario ?? linea.producto?.precio
  }));

  const nuevoPedido = {
    id: nuevoId,
    usuario_id: usuarioId,
    fecha: new Date().toISOString(),
    estado: 'recibido',
    direccion_envio: clonar(direccionEnvio),
    metodo_pago: metodoPago || 'Tarjeta bancaria (simulada)',
    lineas: lineasCongeladas,
    gastos_envio: Number(gastosEnvio.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    total: Number(total.toFixed(2))
  };

  todos.push(nuevoPedido);
  guardarTodosLosPedidos(todos);

  return { ok: true, pedido: nuevoPedido };
}

// Utilidad para limpiar en tests automáticos
export function _resetearPedidosParaPruebas() {
  memoriaPedidos = null;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(CLAVE_LOCALSTORAGE_PEDIDOS);
    } catch {
      // ignorar
    }
  }
}
