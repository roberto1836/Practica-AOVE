// Inicialización y reactividad de la cabecera común (B).
// Actualiza el contador del carrito y comprueba el rol del usuario para mostrar el enlace de Administración.

import { contarUnidades } from '../carrito.js';
import { usuarioActual } from '../sesion.js';

export function actualizarContadorCarrito() {
  const contador = document.getElementById('contador-carrito');
  if (!contador) return;

  const unidades = contarUnidades();
  contador.textContent = String(unidades);
  contador.setAttribute('data-unidades', String(unidades));
  const etiqueta = unidades === 1 ? '1 artículo en el carrito' : `${unidades} artículos en el carrito`;
  contador.setAttribute('aria-label', etiqueta);
}

export function sincronizarMenuUsuario() {
  const elementoAdmin = document.getElementById('menu-admin-item');
  if (!elementoAdmin) return;

  const usuario = usuarioActual();
  if (usuario && usuario.rol === 'admin') {
    elementoAdmin.removeAttribute('hidden');
  } else {
    elementoAdmin.setAttribute('hidden', '');
  }
}

export function iniciarCabecera() {
  actualizarContadorCarrito();
  sincronizarMenuUsuario();

  window.addEventListener('carrito:actualizado', () => {
    actualizarContadorCarrito();
  });

  window.addEventListener('storage', (evento) => {
    if (evento.key === 'oleum_carrito_v1') {
      actualizarContadorCarrito();
    }
  });
}

// Inicialización automática si el DOM ya está listo o al cargarse
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarCabecera);
} else {
  iniciarCabecera();
}
