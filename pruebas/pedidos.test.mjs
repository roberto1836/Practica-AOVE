// Pruebas automáticas del modelo y persistencia de pedidos (B).
// Se ejecutan con: node --test

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  obtenerPedidosCliente, obtenerPedidoPorId, crearPedido,
  _resetearPedidosParaPruebas, ESTADOS_PEDIDO
} from '../proyecto/assets/js/datos/pedidos.js';
import { productos } from '../proyecto/assets/js/datos/productos.js';

describe('Modelo de Pedidos (assets/js/datos/pedidos.js)', () => {
  beforeEach(() => {
    _resetearPedidosParaPruebas();
  });

  test('semilla inicial: contiene pedidos en los 5 estados exigidos', () => {
    const pedidos = obtenerPedidosCliente(1);
    assert.ok(pedidos.length >= 5);

    const estadosPresentes = new Set(pedidos.map((p) => p.estado));
    for (const estado of ESTADOS_PEDIDO) {
      assert.ok(estadosPresentes.has(estado), `El estado ${estado} debe estar presente en los pedidos de prueba`);
    }
  });

  test('obtenerPedidosCliente: ordena por fecha de más reciente a más antiguo', () => {
    const pedidos = obtenerPedidosCliente(1);
    for (let i = 0; i < pedidos.length - 1; i++) {
      const fechaActual = new Date(pedidos[i].fecha).getTime();
      const fechaSiguiente = new Date(pedidos[i + 1].fecha).getTime();
      assert.ok(fechaActual >= fechaSiguiente, 'Los pedidos deben estar en orden cronológico inverso');
    }
  });

  test('obtenerPedidoPorId: aísla los pedidos de otros clientes (seguridad 3.2 y 7.1)', () => {
    // Pedido 1001 pertenece a usuario 1
    const p1 = obtenerPedidoPorId(1001, 1);
    assert.ok(p1 !== null);
    assert.equal(p1.id, 1001);

    // Pedido 1006 pertenece a usuario 2: usuario 1 NO debe poder consultarlo
    const pAjeno = obtenerPedidoPorId(1006, 1);
    assert.equal(pAjeno, null, 'Un cliente no puede acceder a un pedido ajeno');

    // Pedido inexistente
    assert.equal(obtenerPedidoPorId(99999, 1), null);
  });

  test('crearPedido: rechaza carritos vacíos o sin usuario autenticado', () => {
    const resSinUsuario = crearPedido({
      usuarioId: null,
      direccionEnvio: {},
      lineas: [{ producto_id: 1, cantidad: 1, precio_unitario: 10 }]
    });
    assert.equal(resSinUsuario.ok, false);

    const resVacio = crearPedido({
      usuarioId: 1,
      direccionEnvio: {},
      lineas: []
    });
    assert.equal(resVacio.ok, false);
  });

  test('crearPedido: congela el precio unitario y garantiza coherencia aunque el catálogo varíe (regla 3.3 y 7.1)', () => {
    const prod = productos.find((p) => p.id === 1);
    const precioOriginal = prod.precio; // 18.95

    const direccion = {
      nombre_completo: 'Prueba Freeze',
      telefono: '600111222',
      calle: 'C/ Test 1',
      codigo_postal: '28801',
      ciudad: 'Alcalá',
      provincia: 'Madrid'
    };

    const res = crearPedido({
      usuarioId: 1,
      direccionEnvio: direccion,
      metodoPago: 'Tarjeta bancaria (simulada)',
      lineas: [{ productoId: 1, cantidad: 2, precioUnitario: precioOriginal }],
      gastosEnvio: 4.95,
      subtotal: precioOriginal * 2,
      total: precioOriginal * 2 + 4.95
    });

    assert.equal(res.ok, true);
    const nuevoPedido = res.pedido;
    assert.equal(nuevoPedido.estado, 'recibido');
    assert.equal(nuevoPedido.lineas[0].precio_unitario, precioOriginal);

    // Simulamos un cambio de precio en el catálogo del producto 1
    const precioViejo = prod.precio;
    prod.precio = 999.00;

    // Comprobamos que el pedido ya creado no se altera
    const pedidoRecuperado = obtenerPedidoPorId(nuevoPedido.id, 1);
    assert.equal(pedidoRecuperado.lineas[0].precio_unitario, precioOriginal);
    assert.equal(pedidoRecuperado.total, Number((precioOriginal * 2 + 4.95).toFixed(2)));

    // Restauramos el precio del catálogo
    prod.precio = precioViejo;
  });
});
