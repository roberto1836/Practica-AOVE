// =============================================================================
// comun/cabecera.js · Inicialización y reactividad de la cabecera común (B & C)
// Coordina el contador de cesta y la adaptación dinámica del menú para:
//   - Visitante: catálogo, carrito, iniciar sesión y crear cuenta.
//   - Cliente: catálogo, carrito, mis pedidos, mi cuenta y cerrar sesión.
//   - Administrador: catálogo, administración y cerrar sesión.
// =============================================================================

import { contarUnidades } from '../carrito.js';
import { usuarioActual, cerrarSesion } from '../sesion.js';

export function actualizarContadorCarrito() {
  const contador = document.getElementById('contador-carrito');
  if (!contador) return;

  const unidades = contarUnidades();
  contador.textContent = String(unidades);
  contador.setAttribute('data-unidades', String(unidades));
  const etiqueta = unidades === 1 ? '1 artículo en el carrito' : `${unidades} artículos en el carrito`;
  contador.setAttribute('aria-label', etiqueta);
}

function asegurarElementosSesionEnMenu(menu) {
  if (!menu) return;

  const enAdmin = window.location.pathname.includes('/admin/');
  const prefijo = enAdmin ? '../' : '';

  // Elemento: Iniciar sesión
  if (!document.getElementById('menu-login-item') && !document.getElementById('item-nav-login')) {
    const liLogin = document.createElement('li');
    liLogin.className = 'menu__elemento';
    liLogin.id = 'menu-login-item';
    const aLogin = document.createElement('a');
    aLogin.className = 'menu__enlace';
    aLogin.href = `${prefijo}login.html`;
    aLogin.textContent = 'Iniciar sesión';
    liLogin.appendChild(aLogin);
    menu.appendChild(liLogin);
  }

  // Elemento: Crear cuenta
  if (!document.getElementById('menu-registro-item') && !document.getElementById('item-nav-registro')) {
    const liReg = document.createElement('li');
    liReg.className = 'menu__elemento';
    liReg.id = 'menu-registro-item';
    const aReg = document.createElement('a');
    aReg.className = 'menu__enlace';
    aReg.href = `${prefijo}registro.html`;
    aReg.textContent = 'Crear cuenta';
    liReg.appendChild(aReg);
    menu.appendChild(liReg);
  }

  // Elemento: Mis pedidos
  if (!document.getElementById('menu-pedidos-item') && !document.getElementById('item-nav-pedidos')) {
    const liPed = document.createElement('li');
    liPed.className = 'menu__elemento';
    liPed.id = 'menu-pedidos-item';
    liPed.hidden = true;
    const aPed = document.createElement('a');
    aPed.className = 'menu__enlace';
    aPed.href = `${prefijo}mis-pedidos.html`;
    aPed.textContent = 'Mis pedidos';
    liPed.appendChild(aPed);
    menu.appendChild(liPed);
  }

  // Elemento: Cerrar sesión y usuario activo
  if (!document.getElementById('menu-logout-item') && !document.getElementById('item-nav-logout')) {
    const liLogout = document.createElement('li');
    liLogout.className = 'menu__elemento';
    liLogout.id = 'menu-logout-item';
    liLogout.hidden = true;

    const spanUser = document.createElement('span');
    spanUser.id = 'nombre-usuario-sesion';
    spanUser.className = 'cabecera__usuario';
    spanUser.hidden = true;

    const btnLogout = document.createElement('button');
    btnLogout.type = 'button';
    btnLogout.className = 'boton boton--secundario';
    btnLogout.id = 'boton-cerrar-sesion';
    btnLogout.textContent = 'Cerrar sesión';

    liLogout.appendChild(spanUser);
    liLogout.appendChild(btnLogout);
    menu.appendChild(liLogout);
  }
}

export function sincronizarMenuUsuario() {
  const menuNavegacion = document.getElementById('menu-navegacion');
  const menuPrincipal = document.getElementById('menu-principal');
  const menuActivo = menuNavegacion || menuPrincipal;

  if (menuActivo) {
    asegurarElementosSesionEnMenu(menuActivo);
  }

  const usuario = usuarioActual();

  const elementoAdmin = document.getElementById('menu-admin-item') || document.getElementById('item-nav-admin');
  const elementoPedidos = document.getElementById('menu-pedidos-item') || document.getElementById('item-nav-pedidos');
  const elementoPerfil = document.getElementById('menu-cuenta-item') || document.getElementById('item-nav-perfil');
  const elementoLogin = document.getElementById('menu-login-item') || document.getElementById('item-nav-login');
  const elementoRegistro = document.getElementById('menu-registro-item') || document.getElementById('item-nav-registro');
  const elementoLogout = document.getElementById('menu-logout-item') || document.getElementById('item-nav-logout');
  const etiquetaUsuario = document.getElementById('nombre-usuario-sesion');
  const botonLogout = document.getElementById('boton-cerrar-sesion');

  // Ajustar visibilidad según el rol
  if (usuario) {
    // Sesión iniciada (Cliente o Administrador)
    if (elementoLogin) elementoLogin.hidden = true;
    if (elementoRegistro) elementoRegistro.hidden = true;
    if (elementoLogout) elementoLogout.hidden = false;

    if (etiquetaUsuario) {
      etiquetaUsuario.textContent = `${usuario.nombre} (${usuario.rol})`;
      etiquetaUsuario.hidden = false;
    }

    if (usuario.rol === 'admin') {
      if (elementoAdmin) elementoAdmin.hidden = false;
      if (elementoPedidos) elementoPedidos.hidden = true;
      if (elementoPerfil) elementoPerfil.hidden = true;
    } else {
      // Cliente
      if (elementoAdmin) elementoAdmin.hidden = true;
      if (elementoPedidos) elementoPedidos.hidden = false;
      if (elementoPerfil) elementoPerfil.hidden = false;
    }
  } else {
    // Visitante sin sesión
    if (elementoLogin) elementoLogin.hidden = false;
    if (elementoRegistro) elementoRegistro.hidden = false;
    if (elementoAdmin) elementoAdmin.hidden = true;
    if (elementoPedidos) elementoPedidos.hidden = true;
    if (elementoPerfil) elementoPerfil.hidden = true;
    if (elementoLogout) elementoLogout.hidden = true;

    if (etiquetaUsuario) {
      etiquetaUsuario.textContent = '';
      etiquetaUsuario.hidden = true;
    }
  }

  if (botonLogout && !botonLogout.dataset.escuchando) {
    botonLogout.dataset.escuchando = 'true';
    botonLogout.addEventListener('click', () => {
      cerrarSesion();
      const enAdmin = window.location.pathname.includes('/admin/');
      window.location.href = enAdmin ? '../index.html' : 'index.html';
    });
  }
}

export function iniciarCabecera() {
  actualizarContadorCarrito();
  sincronizarMenuUsuario();

  window.addEventListener('carrito:actualizado', () => {
    actualizarContadorCarrito();
  });

  window.addEventListener('sesion:cambio', () => {
    sincronizarMenuUsuario();
  });

  window.addEventListener('storage', (evento) => {
    if (evento.key === 'oleum_carrito_v1') {
      actualizarContadorCarrito();
    }
    if (evento.key === 'oleum_sesion_actual') {
      sincronizarMenuUsuario();
    }
  });
}

// Inicialización automática si el DOM ya está listo o al cargarse
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarCabecera);
} else {
  iniciarCabecera();
}
