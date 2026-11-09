// =============================================================================
// admin/autenticacion.js · Lógica de login.html y registro.html (C)
// =============================================================================

import {
  iniciarSesion,
  registrarUsuario,
  obtenerRutaVolverSegura
} from "../sesion.js";
import {
  configurarValidacionEnVivo,
  validarFormulario,
  mostrarErrorCampo,
  limpiarErrorCampo
} from "../validacion.js";

function iniciarVistaLogin() {
  const formulario = document.getElementById("formulario-login");
  if (!formulario) return;

  const mensajeGlobal = document.getElementById("mensaje-global-login");
  const params = new URLSearchParams(window.location.search);

  if (params.get("registrado") === "1" && mensajeGlobal) {
    mensajeGlobal.textContent = "Cuenta creada correctamente. Ya puedes iniciar sesión.";
    mensajeGlobal.className = "alerta alerta--exito";
    mensajeGlobal.hidden = false;
  }

  configurarValidacionEnVivo(formulario);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (mensajeGlobal) mensajeGlobal.hidden = true;

    if (!validarFormulario(formulario)) return;

    const campoEmail = document.getElementById("login-email");
    const campoPass = document.getElementById("login-password");
    const resultado = iniciarSesion(campoEmail.value, campoPass.value);

    if (!resultado.ok) {
      if (mensajeGlobal) {
        mensajeGlobal.textContent = resultado.mensaje;
        mensajeGlobal.className = "alerta alerta--error";
        mensajeGlobal.hidden = false;
      }
      campoPass.setAttribute("aria-invalid", "true");
      campoPass.focus();
      return;
    }

    const destinoPorDefecto =
      resultado.usuario.rol === "admin" ? "admin/productos.html" : "index.html";
    const destino = obtenerRutaVolverSegura(params.get("volver"), destinoPorDefecto);
    window.location.href = destino;
  });

  const botonesDemo = document.querySelectorAll("[data-demo-email]");
  for (const boton of botonesDemo) {
    boton.addEventListener("click", () => {
      const campoEmail = document.getElementById("login-email");
      const campoPass = document.getElementById("login-password");
      campoEmail.value = boton.getAttribute("data-demo-email") || "";
      campoPass.value = boton.getAttribute("data-demo-pass") || "";
      limpiarErrorCampo(campoEmail);
      limpiarErrorCampo(campoPass);
      if (mensajeGlobal) mensajeGlobal.hidden = true;
    });
  }
}

function iniciarVistaRegistro() {
  const formulario = document.getElementById("formulario-registro");
  if (!formulario) return;

  const validadores = {
    passwordRepetir: (valor, form) => {
      const original = form.elements.namedItem("password")?.value || "";
      return valor !== original ? "Las contraseñas no coinciden." : null;
    }
  };

  configurarValidacionEnVivo(formulario, validadores);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario(formulario, validadores)) return;

    const campoNombre = document.getElementById("reg-nombre");
    const campoEmail = document.getElementById("reg-email");
    const campoTelefono = document.getElementById("reg-telefono");
    const campoDireccion = document.getElementById("reg-direccion");
    const campoPassword = document.getElementById("reg-password");

    const resultado = registrarUsuario({
      nombre: campoNombre.value,
      email: campoEmail.value,
      telefono: campoTelefono ? campoTelefono.value : "",
      direccion: campoDireccion.value,
      password: campoPassword.value
    });

    if (!resultado.ok) {
      mostrarErrorCampo(campoEmail, resultado.mensaje);
      campoEmail.focus();
      return;
    }

    window.location.href = "login.html?registrado=1";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarVistaLogin();
  iniciarVistaRegistro();
});
