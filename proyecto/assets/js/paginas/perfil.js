// assets/js/paginas/perfil.js · Controlador del perfil de usuario (B)
import { usuarioActual } from '../sesion.js';
import '../comun/cabecera.js';

const formPerfil = document.getElementById('form-perfil');
const alertaPerfil = document.getElementById('alerta-perfil');

const inputNombre = document.getElementById('perfil-nombre');
const inputEmail = document.getElementById('perfil-email');
const inputTelefono = document.getElementById('perfil-telefono');
const inputCp = document.getElementById('perfil-cp');
const inputCalle = document.getElementById('perfil-calle');
const inputCiudad = document.getElementById('perfil-ciudad');
const inputProvincia = document.getElementById('perfil-provincia');

const errNombre = document.getElementById('error-perfil-nombre');
const errEmail = document.getElementById('error-perfil-email');
const errTelefono = document.getElementById('error-perfil-telefono');
const errCp = document.getElementById('error-perfil-cp');
const errCalle = document.getElementById('error-perfil-calle');
const errCiudad = document.getElementById('error-perfil-ciudad');
const errProvincia = document.getElementById('error-perfil-provincia');

const CLAVE_PERFIL_LOCAL = 'oleum_perfil_cliente_v1';

function comprobarSesion() {
  const usuario = usuarioActual();
  if (usuario === null) {
    window.location.href = `login.html?volver=${encodeURIComponent('perfil.html')}`;
    return false;
  }
  return true;
}

function cargarDatosIniciales() {
  const usuario = usuarioActual();
  if (!usuario) return;

  // Cargar posible perfil guardado localmente
  let perfilGuardado = null;
  try {
    const raw = localStorage.getItem(CLAVE_PERFIL_LOCAL);
    if (raw) perfilGuardado = JSON.parse(raw);
  } catch {
    // ignorar
  }

  const datos = perfilGuardado || {
    nombre: usuario.nombre || 'Laura Gómez Ruiz',
    email: usuario.email || 'laura.gomez@example.com',
    telefono: '612345678',
    cp: '28801',
    calle: 'Calle Mayor 14, 2º B',
    ciudad: 'Alcalá de Henares',
    provincia: 'Madrid'
  };

  inputNombre.value = datos.nombre || '';
  inputEmail.value = datos.email || '';
  inputTelefono.value = datos.telefono || '';
  inputCp.value = datos.cp || '';
  inputCalle.value = datos.calle || '';
  inputCiudad.value = datos.ciudad || '';
  inputProvincia.value = datos.provincia || '';
}

function mostrarError(input, errElem, mensaje) {
  input.setAttribute('aria-invalid', 'true');
  errElem.textContent = mensaje;
}

function limpiarError(input, errElem) {
  input.removeAttribute('aria-invalid');
  errElem.textContent = '';
}

function validarYGuardar(e) {
  e.preventDefault();
  alertaPerfil.setAttribute('hidden', '');

  let valido = true;
  let primerFallo = null;

  // Nombre
  if (!inputNombre.value.trim()) {
    mostrarError(inputNombre, errNombre, 'El nombre no puede quedar vacío.');
    valido = false;
    primerFallo = primerFallo || inputNombre;
  } else {
    limpiarError(inputNombre, errNombre);
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!inputEmail.value.trim()) {
    mostrarError(inputEmail, errEmail, 'El correo electrónico es obligatorio.');
    valido = false;
    primerFallo = primerFallo || inputEmail;
  } else if (!emailRegex.test(inputEmail.value.trim())) {
    mostrarError(inputEmail, errEmail, 'Introduce un formato de correo válido (ej. usuario@dominio.com).');
    valido = false;
    primerFallo = primerFallo || inputEmail;
  } else {
    limpiarError(inputEmail, errEmail);
  }

  // Teléfono
  const telRegex = /^[6789]\d{8}$/;
  const telLimpio = inputTelefono.value.trim().replace(/\s+/g, '');
  if (!telLimpio) {
    mostrarError(inputTelefono, errTelefono, 'El teléfono es obligatorio.');
    valido = false;
    primerFallo = primerFallo || inputTelefono;
  } else if (!telRegex.test(telLimpio)) {
    mostrarError(inputTelefono, errTelefono, 'Introduce un teléfono de 9 dígitos válido.');
    valido = false;
    primerFallo = primerFallo || inputTelefono;
  } else {
    limpiarError(inputTelefono, errTelefono);
  }

  // Código postal
  const cpRegex = /^\d{5}$/;
  if (!inputCp.value.trim() || !cpRegex.test(inputCp.value.trim())) {
    mostrarError(inputCp, errCp, 'Introduce un código postal de 5 dígitos.');
    valido = false;
    primerFallo = primerFallo || inputCp;
  } else {
    limpiarError(inputCp, errCp);
  }

  // Calle
  if (!inputCalle.value.trim()) {
    mostrarError(inputCalle, errCalle, 'Introduce tu dirección habitual.');
    valido = false;
    primerFallo = primerFallo || inputCalle;
  } else {
    limpiarError(inputCalle, errCalle);
  }

  // Ciudad
  if (!inputCiudad.value.trim()) {
    mostrarError(inputCiudad, errCiudad, 'Introduce la ciudad.');
    valido = false;
    primerFallo = primerFallo || inputCiudad;
  } else {
    limpiarError(inputCiudad, errCiudad);
  }

  // Provincia
  if (!inputProvincia.value.trim()) {
    mostrarError(inputProvincia, errProvincia, 'Introduce la provincia.');
    valido = false;
    primerFallo = primerFallo || inputProvincia;
  } else {
    limpiarError(inputProvincia, errProvincia);
  }

  if (!valido && primerFallo) {
    primerFallo.focus();
    return;
  }

  // Guardar datos
  const nuevoPerfil = {
    nombre: inputNombre.value.trim(),
    email: inputEmail.value.trim(),
    telefono: telLimpio,
    cp: inputCp.value.trim(),
    calle: inputCalle.value.trim(),
    ciudad: inputCiudad.value.trim(),
    provincia: inputProvincia.value.trim()
  };

  try {
    localStorage.setItem(CLAVE_PERFIL_LOCAL, JSON.stringify(nuevoPerfil));
  } catch {
    // ignorar
  }

  alertaPerfil.textContent = '¡Datos actualizados correctamente!';
  alertaPerfil.removeAttribute('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function iniciar() {
  if (!comprobarSesion()) return;
  cargarDatosIniciales();
  formPerfil.addEventListener('submit', validarYGuardar);
}

iniciar();
