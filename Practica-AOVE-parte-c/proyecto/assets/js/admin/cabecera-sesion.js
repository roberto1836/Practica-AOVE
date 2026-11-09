// =============================================================================
// admin/cabecera-sesion.js · Sincroniza el menú según el rol del usuario (C)
// =============================================================================

import { usuarioActual, cerrarSesion } from "../sesion.js";

export function inicializarCabeceraSesion() {
  const usuario = usuarioActual();
  const itemAdmin = document.getElementById("item-nav-admin");
  const itemPedidos = document.getElementById("item-nav-pedidos");
  const itemPerfil = document.getElementById("item-nav-perfil");
  const itemLogin = document.getElementById("item-nav-login");
  const itemRegistro = document.getElementById("item-nav-registro");
  const itemLogout = document.getElementById("item-nav-logout");
  const botonLogout = document.getElementById("boton-cerrar-sesion");
  const etiquetaUsuario = document.getElementById("nombre-usuario-sesion");

  if (usuario) {
    if (itemLogin) itemLogin.hidden = true;
    if (itemRegistro) itemRegistro.hidden = true;
    if (itemPerfil) itemPerfil.hidden = false;
    if (itemPedidos) itemPedidos.hidden = false;
    if (itemLogout) itemLogout.hidden = false;
    if (itemAdmin) itemAdmin.hidden = usuario.rol !== "admin";
    if (etiquetaUsuario) {
      etiquetaUsuario.textContent = `${usuario.nombre} (${usuario.rol})`;
      etiquetaUsuario.hidden = false;
    }
  } else {
    if (itemLogin) itemLogin.hidden = false;
    if (itemRegistro) itemRegistro.hidden = false;
    if (itemPerfil) itemPerfil.hidden = true;
    if (itemPedidos) itemPedidos.hidden = true;
    if (itemLogout) itemLogout.hidden = true;
    if (itemAdmin) itemAdmin.hidden = true;
    if (etiquetaUsuario) {
      etiquetaUsuario.textContent = "";
      etiquetaUsuario.hidden = true;
    }
  }

  if (botonLogout) {
    botonLogout.addEventListener("click", () => {
      cerrarSesion();
      const enAdmin = window.location.pathname.includes("/admin/");
      window.location.href = enAdmin ? "../login.html" : "login.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", inicializarCabeceraSesion);
