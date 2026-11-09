// =============================================================================
// pruebas/sesion.test.mjs · Pruebas unitarias de la Parte C (Usuarios y Admin)
// =============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

// Mock simple de sessionStorage para el entorno Node.js
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.sessionStorage = new MockStorage();
globalThis.localStorage = new MockStorage();

const {
  iniciarSesion,
  cerrarSesion,
  usuarioActual,
  registrarUsuario,
  obtenerRutaVolverSegura,
  verificarAcceso,
  obtenerTodosLosUsuarios
} = await import('../proyecto/assets/js/sesion.js');

const {
  obtenerTodosLosPedidos,
  actualizarEstadoPedido,
  ESTADOS_PEDIDO
} = await import('../proyecto/assets/js/datos/pedidos.js');

const {
  productos,
  obtenerTodosLosProductos
} = await import('../proyecto/assets/js/datos/productos.js');

test('Autenticación · Inicio de sesión de cliente válido (HU-C02, CP-C02)', () => {
  sessionStorage.clear();
  const resultado = iniciarSesion('elena@oleum.es', 'Cliente123!');
  assert.equal(resultado.ok, true);
  assert.equal(resultado.usuario.rol, 'cliente');
  assert.equal(resultado.usuario.nombre, 'Elena Martínez');

  const actual = usuarioActual();
  assert.ok(actual);
  assert.equal(actual.id, 1);
  assert.equal(actual.rol, 'cliente');
});

test('Autenticación · Inicio de sesión de administrador (HU-C02)', () => {
  sessionStorage.clear();
  const resultado = iniciarSesion('admin@oleum.es', 'Admin123!');
  assert.equal(resultado.ok, true);
  assert.equal(resultado.usuario.rol, 'admin');

  const actual = usuarioActual();
  assert.equal(actual.rol, 'admin');
  assert.equal(verificarAcceso('admin').autorizado, true);
});

test('Autenticación · Contraseña o correo erróneo no inicia sesión (Caso 7.1, CP-C02)', () => {
  sessionStorage.clear();
  const resClaveMal = iniciarSesion('elena@oleum.es', 'ClaveEquivocada123!');
  assert.equal(resClaveMal.ok, false);
  assert.equal(usuarioActual(), null);

  const resEmailInexistente = iniciarSesion('noexiste@oleum.es', 'Cliente123!');
  assert.equal(resEmailInexistente.ok, false);
  assert.equal(usuarioActual(), null);
});

test('Autenticación · Cuenta desactivada deniega el acceso (baja lógica de usuario, CP-C03)', () => {
  sessionStorage.clear();
  const res = iniciarSesion('inactivo@oleum.es', 'Cliente123!');
  assert.equal(res.ok, false);
  assert.match(res.mensaje, /desactivada/i);
  assert.equal(usuarioActual(), null);
});

test('Autenticación · Cierre de sesión invalida el usuario actual (HU-C02)', () => {
  sessionStorage.clear();
  iniciarSesion('elena@oleum.es', 'Cliente123!');
  assert.ok(usuarioActual());

  cerrarSesion();
  assert.equal(usuarioActual(), null);
});

test('Registro · Alta de nuevo usuario y acceso posterior (HU-C01)', () => {
  sessionStorage.clear();
  const res = registrarUsuario({
    nombre: 'Marta Pérez',
    email: 'marta@example.com',
    telefono: '677889900',
    password: 'MartaPassword123!',
    direccion: 'Calle Gran Vía 50, Madrid'
  });

  assert.equal(res.ok, true);
  assert.ok(res.usuario.id > 4);
  assert.equal(res.usuario.rol, 'cliente');
  assert.equal(res.usuario.activo, true);

  // Verificamos que ahora puede iniciar sesión
  const loginRes = iniciarSesion('marta@example.com', 'MartaPassword123!');
  assert.equal(loginRes.ok, true);
  assert.equal(loginRes.usuario.nombre, 'Marta Pérez');
});

test('Registro · Detección de correo duplicado insensible a mayúsculas (HU-C01, Caso 7.1)', () => {
  sessionStorage.clear();
  const res = registrarUsuario({
    nombre: 'Elena Copia',
    email: 'ELENA@OLEUM.ES',
    password: 'OtraClave123!',
    direccion: 'Calle Falsa 123'
  });

  assert.equal(res.ok, false);
  assert.equal(res.campo, 'email');
  assert.match(res.mensaje, /ya existe/i);
});

test('Seguridad · Prevención de redirección abierta en ?volver= (Acuerdo 6, CP-C10)', () => {
  assert.equal(obtenerRutaVolverSegura('https://sitio-malicioso.com', 'index.html'), 'index.html');
  assert.equal(obtenerRutaVolverSegura('//sitio-malicioso.com', 'index.html'), 'index.html');
  assert.equal(obtenerRutaVolverSegura('/ruta-absoluta', 'index.html'), 'index.html');
  assert.equal(obtenerRutaVolverSegura('javascript:alert(1)', 'index.html'), 'index.html');
  assert.equal(obtenerRutaVolverSegura('../admin/productos.html', 'index.html'), 'index.html');

  // Rutas relativas seguras permitidas
  assert.equal(obtenerRutaVolverSegura('perfil.html'), 'perfil.html');
  assert.equal(obtenerRutaVolverSegura('admin/productos.html'), 'admin/productos.html');
  assert.equal(obtenerRutaVolverSegura('producto.html?id=3'), 'producto.html?id=3');
});

test('Control de acceso · Cliente no puede acceder a rol admin (Caso 7.1, CP-C08)', () => {
  sessionStorage.clear();
  // Sin sesión
  assert.equal(verificarAcceso('admin').autorizado, false);
  assert.equal(verificarAcceso('admin').motivo, 'sin_sesion');

  // Como cliente
  iniciarSesion('elena@oleum.es', 'Cliente123!');
  const acceso = verificarAcceso('admin');
  assert.equal(acceso.autorizado, false);
  assert.equal(acceso.motivo, 'rol_insuficiente');
});

test('Admin Pedidos · Consulta y transición de estados (HU-C04, CP-C09)', () => {
  const lista = obtenerTodosLosPedidos();
  assert.ok(Array.isArray(lista) && lista.length >= 5);

  const primerPedido = lista[0];
  const estadoOriginal = primerPedido.estado;
  const nuevoEstado = estadoOriginal === 'enviado' ? 'entregado' : 'enviado';

  const res = actualizarEstadoPedido(primerPedido.id, nuevoEstado);
  assert.equal(res.ok, true);
  assert.equal(res.pedido.estado, nuevoEstado);

  // Comprobar que todos los estados requeridos están contemplados
  for (const est of ['recibido', 'en_preparacion', 'enviado', 'entregado', 'cancelado']) {
    assert.ok(ESTADOS_PEDIDO.includes(est));
  }
});

test('Admin Productos · Catálogo expone productos y baja lógica (HU-C03, CP-C07)', () => {
  const lista = obtenerTodosLosProductos();
  assert.ok(Array.isArray(lista) && lista.length >= 10);

  const productoActivo = lista.find(p => p.id === 1);
  assert.ok(productoActivo);
  assert.equal(typeof productoActivo.stock, 'number');
  assert.equal(typeof productoActivo.precio, 'number');
});
