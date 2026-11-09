// =============================================================================
// sesion.js · Gestión de sesión simulada y control de acceso por rol (Parte 1)
// Mantenido por C. Usa sessionStorage para conservar el usuario y rol activos.
// =============================================================================

import { usuariosIniciales } from "./datos/usuarios.js";

const CLAVE_SESION = "oleum_sesion_actual";
const CLAVE_USUARIOS_EXTRA = "oleum_usuarios_registrados";

/**
 * Obtiene la lista completa de usuarios (los de datos/usuarios.js más los
 * dados de alta durante la sesión de demostración).
 * @returns {Array<Object>}
 */
export function obtenerTodosLosUsuarios() {
  let extras = [];
  try {
    const guardado = sessionStorage.getItem(CLAVE_USUARIOS_EXTRA);
    if (guardado) {
      extras = JSON.parse(guardado);
    }
  } catch {
    extras = [];
  }
  return [...usuariosIniciales, ...extras];
}

/**
 * Devuelve el usuario con sesión iniciada según el acuerdo 7 del grupo:
 * { id, nombre, rol } (más email, telefono y direccion para facilitar a B el perfil) o null.
 * @returns {{ id: number, nombre: string, rol: string, email: string, telefono?: string, direccion: string } | null}
 */
export function usuarioActual() {
  try {
    const datos = sessionStorage.getItem(CLAVE_SESION);
    if (!datos) return null;
    const usuario = JSON.parse(datos);
    if (!usuario || typeof usuario.id !== "number" || !usuario.rol) {
      return null;
    }
    return usuario;
  } catch {
    return null;
  }
}

/**
 * Verifica las credenciales e inicia sesión en sessionStorage.
 * @param {string} email
 * @param {string} password
 * @returns {{ ok: boolean, usuario?: Object, mensaje?: string }}
 */
export function iniciarSesion(email, password) {
  const emailLimpio = String(email || "").trim().toLowerCase();
  const clave = String(password || "");

  const usuario = obtenerTodosLosUsuarios().find(
    (u) => u.email.toLowerCase() === emailLimpio
  );

  if (!usuario || usuario.password !== clave) {
    return {
      ok: false,
      mensaje: "El correo electrónico o la contraseña no son correctos."
    };
  }

  if (!usuario.activo) {
    return {
      ok: false,
      mensaje: "Esta cuenta está desactivada. Contacta con administración."
    };
  }

  const datosSesion = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    telefono: usuario.telefono || "",
    rol: usuario.rol,
    direccion: usuario.direccion
  };

  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(datosSesion));
  return { ok: true, usuario: datosSesion };
}

/**
 * Cierra la sesión actual invalidando los datos de sesión en sessionStorage.
 */
export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}

/**
 * Registra un nuevo cliente comprobando que el email no esté duplicado (Caso 7.1).
 * @param {{ nombre: string, email: string, telefono?: string, password: string, direccion: string }} datos
 * @returns {{ ok: boolean, usuario?: Object, mensaje?: string, campo?: string }}
 */
export function registrarUsuario({ nombre, email, telefono, password, direccion }) {
  const emailLimpio = String(email || "").trim().toLowerCase();
  const todos = obtenerTodosLosUsuarios();

  const existe = todos.some((u) => u.email.toLowerCase() === emailLimpio);
  if (existe) {
    return {
      ok: false,
      campo: "email",
      mensaje: "Ya existe una cuenta registrada con este correo electrónico."
    };
  }

  const nuevoId = todos.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const nuevoUsuario = {
    id: nuevoId,
    nombre: String(nombre || "").trim(),
    email: String(email || "").trim(),
    telefono: String(telefono || "").trim(),
    password: String(password || ""),
    rol: "cliente",
    activo: true,
    direccion: String(direccion || "").trim()
  };

  let extras = [];
  try {
    const guardado = sessionStorage.getItem(CLAVE_USUARIOS_EXTRA);
    if (guardado) extras = JSON.parse(guardado);
  } catch {
    extras = [];
  }

  extras.push(nuevoUsuario);
  sessionStorage.setItem(CLAVE_USUARIOS_EXTRA, JSON.stringify(extras));

  return { ok: true, usuario: nuevoUsuario };
}

/**
 * Valida el parámetro ?volver= para permitir únicamente rutas relativas del
 * propio sitio y evitar redirecciones abiertas (Acuerdo 6).
 * @param {string | null} rutaVolver
 * @param {string} porDefecto
 * @returns {string}
 */
export function obtenerRutaVolverSegura(rutaVolver, porDefecto = "index.html") {
  if (!rutaVolver || typeof rutaVolver !== "string") {
    return porDefecto;
  }
  const limpia = rutaVolver.trim();
  if (
    limpia === "" ||
    limpia.startsWith("/") ||
    limpia.startsWith("\\") ||
    limpia.includes("://") ||
    limpia.toLowerCase().startsWith("javascript:") ||
    limpia.includes("..")
  ) {
    return porDefecto;
  }
  return limpia;
}

/**
 * Comprueba si el usuario actual tiene el rol requerido.
 * @param {'admin' | 'cliente'} rolRequerido
 * @returns {{ autorizado: boolean, motivo: 'sin_sesion' | 'rol_insuficiente' | 'ok', usuario: Object | null }}
 */
export function verificarAcceso(rolRequerido) {
  const usuario = usuarioActual();
  if (!usuario) {
    return { autorizado: false, motivo: "sin_sesion", usuario: null };
  }
  if (rolRequerido === "admin" && usuario.rol !== "admin") {
    return { autorizado: false, motivo: "rol_insuficiente", usuario };
  }
  return { autorizado: true, motivo: "ok", usuario };
}
