// Pruebas automáticas del módulo de carrito (B).
// Se ejecutan con: node --test

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  anadir, actualizarCantidad, eliminar, vaciar, contarUnidades,
  calcularTotales, obtenerLineas, _resetearParaPruebas, UMBRAL_ENVIO_GRATIS, COSTE_ENVIO_ESTANDAR
} from '../proyecto/assets/js/carrito.js';
import { productos } from '../proyecto/assets/js/datos/productos.js';

describe('Módulo de Carrito (assets/js/carrito.js)', () => {
  beforeEach(() => {
    _resetearParaPruebas();
  });

  test('anadir: añade productos válidos y acumula unidades', () => {
    const res1 = anadir(1, 2);
    assert.deepEqual(res1, { ok: true });
    assert.equal(contarUnidades(), 2);

    const res2 = anadir(1, 3);
    assert.deepEqual(res2, { ok: true });
    assert.equal(contarUnidades(), 5);

    const lineas = obtenerLineas();
    assert.equal(lineas.length, 1);
    assert.equal(lineas[0].productoId, 1);
    assert.equal(lineas[0].cantidad, 5);
  });

  test('anadir: rechaza cantidades menores que 1, decimales o no numéricas (CLI-01)', () => {
    assert.equal(anadir(1, 0).ok, false);
    assert.equal(anadir(1, -2).ok, false);
    assert.equal(anadir(1, 1.5).ok, false);
    assert.equal(anadir(1, 'tres').ok, false);
    assert.equal(contarUnidades(), 0);
  });

  test('anadir: rechaza productos inactivos o que no existen', () => {
    // Producto id 20 está inactivo en datos/productos.js
    const prodInactivo = productos.find((p) => p.id === 20);
    assert.equal(prodInactivo.activo, false);

    const resInactivo = anadir(20, 1);
    assert.equal(resInactivo.ok, false);
    assert.equal(resInactivo.mensaje, 'Este aceite ya no está a la venta.');

    const resInexistente = anadir(9999, 1);
    assert.equal(resInexistente.ok, false);
  });

  test('anadir: no permite superar el stock disponible (regla 3.3)', () => {
    const prod1 = productos.find((p) => p.id === 1);
    const stock = prod1.stock;

    // Intentar añadir más que el stock directo
    const resExceso = anadir(1, stock + 1);
    assert.equal(resExceso.ok, false);
    assert.match(resExceso.mensaje, /quedan \d+ unidades/);

    // Añadir hasta el límite
    assert.equal(anadir(1, stock).ok, true);

    // Intentar añadir 1 más cuando ya está al límite
    const resTope = anadir(1, 1);
    assert.equal(resTope.ok, false);
    assert.match(resTope.mensaje, /Ya tienes/);
  });

  test('actualizarCantidad: modifica la cantidad dentro del stock disponible (CLI-03)', () => {
    anadir(1, 2);
    assert.equal(actualizarCantidad(1, 5).ok, true);
    assert.equal(contarUnidades(), 5);

    const prod1 = productos.find((p) => p.id === 1);
    const resSobreStock = actualizarCantidad(1, prod1.stock + 10);
    assert.equal(resSobreStock.ok, false);
    assert.equal(contarUnidades(), 5); // no varió
  });

  test('actualizarCantidad: cantidad 0 o negativa elimina el artículo del carrito', () => {
    anadir(1, 2);
    assert.equal(actualizarCantidad(1, 0).ok, true);
    assert.equal(contarUnidades(), 0);
    assert.equal(obtenerLineas().length, 0);
  });

  test('eliminar y vaciar: retiran artículos del carrito (CLI-04)', () => {
    anadir(1, 2);
    anadir(2, 1);
    assert.equal(contarUnidades(), 3);

    eliminar(1);
    assert.equal(contarUnidades(), 1);
    assert.equal(obtenerLineas()[0].productoId, 2);

    vaciar();
    assert.equal(contarUnidades(), 0);
    assert.equal(obtenerLineas().length, 0);
  });

  test('calcularTotales: calcula subtotal y gastos de envío según umbral', () => {
    // Vacío
    assert.deepEqual(calcularTotales(), {
      subtotal: 0,
      gastosEnvio: 0,
      total: 0,
      envioGratisRestante: 0,
      esEnvioGratis: false
    });

    // Añadimos 1 unidad de producto 1 (18.95 €) -> inferior a 50 €, aplica 4.95 €
    const prod1 = productos.find((p) => p.id === 1);
    anadir(1, 1);
    const tot1 = calcularTotales();
    assert.equal(tot1.subtotal, prod1.precio);
    assert.equal(tot1.gastosEnvio, COSTE_ENVIO_ESTANDAR);
    assert.equal(tot1.total, Number((prod1.precio + COSTE_ENVIO_ESTANDAR).toFixed(2)));
    assert.equal(tot1.esEnvioGratis, false);
    assert.equal(tot1.envioGratisRestante, Number((UMBRAL_ENVIO_GRATIS - prod1.precio).toFixed(2)));

    // Añadimos 3 unidades de prod 1 (total 4 * 18.95 = 75.80 €) -> superior a 50 €, envío gratis
    anadir(1, 3);
    const tot2 = calcularTotales();
    assert.equal(tot2.subtotal, 75.8);
    assert.equal(tot2.gastosEnvio, 0);
    assert.equal(tot2.total, 75.8);
    assert.equal(tot2.esEnvioGratis, true);
    assert.equal(tot2.envioGratisRestante, 0);
  });
});
