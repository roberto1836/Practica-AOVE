// SUSTITUTO PROVISIONAL de sesion.js (de C), con la misma interfaz: usuarioActual().
// Sirve para probar la ficha mientras C no entregue la sesión simulada; en la fase 8 se cambia el import y se borra.

// Cambia este valor para probar los tres casos de la ficha de producto:
//   'cliente' → puede añadir al carrito
//   'admin'   → la compra está desactivada y se muestra un aviso
//   null      → sin sesión: «Añadir al carrito» lleva a login.html?volver=...
const ROL_DE_PRUEBA = 'cliente';

export function usuarioActual() {
  if (ROL_DE_PRUEBA === null) {
    return null;
  }
  return { id: 1, nombre: 'Usuario de prueba', rol: ROL_DE_PRUEBA };
}
