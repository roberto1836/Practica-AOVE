// assets/js/paginas/confirmacion.js · Controlador de Checkout multi-paso (B)
import { obtenerLineas, calcularTotales, vaciar, contarUnidades } from '../carrito.js';
import { crearPedido } from '../datos/pedidos.js';
import { usuarioActual } from '../sesion.js';
import { formatearPrecio, formatearVolumen } from '../util/formato.js';
import { mostrarErrorCampo, limpiarErrorCampo } from '../validacion.js';
import '../comun/cabecera.js';

// Elementos de la interfaz
const bloquePaso1 = document.getElementById('paso-1');
const bloquePaso2 = document.getElementById('paso-2');
const bloquePaso3 = document.getElementById('paso-3');
const bloquePaso4 = document.getElementById('paso-4');

const indPaso1 = document.getElementById('indicador-paso-1');
const indPaso2 = document.getElementById('indicador-paso-2');
const indPaso3 = document.getElementById('indicador-paso-3');
const indPaso4 = document.getElementById('indicador-paso-4');

const avisoVacio = document.getElementById('contenedor-aviso-carrito-vacio');
const formEnvio = document.getElementById('form-envio');
const formPago = document.getElementById('form-pago');

// Estado interno del asistente de compra
let datosEnvioGuardados = null;
let pedidoFinalizado = null;

function comprobarAutenticacion() {
  const usuario = usuarioActual();
  if (usuario === null) {
    // Redirigir al login recordando volver tras autenticarse (ACUERDOS.md sección 6)
    window.location.href = `login.html?volver=${encodeURIComponent('confirmacion.html')}`;
    return false;
  }
  return true;
}

function actualizarIndicadorPasos(pasoActivo) {
  const pasos = [
    { el: indPaso1, bloque: bloquePaso1, num: 1 },
    { el: indPaso2, bloque: bloquePaso2, num: 2 },
    { el: indPaso3, bloque: bloquePaso3, num: 3 },
    { el: indPaso4, bloque: bloquePaso4, num: 4 }
  ];

  for (const p of pasos) {
    p.bloque.classList.remove('bloque-paso--activo');
    p.el.classList.remove('pasos__item--activo', 'pasos__item--completado');
    p.el.removeAttribute('aria-current');

    if (p.num < pasoActivo) {
      p.el.classList.add('pasos__item--completado');
    } else if (p.num === pasoActivo) {
      p.el.classList.add('pasos__item--activo');
      p.el.setAttribute('aria-current', 'step');
      p.bloque.classList.add('bloque-paso--activo');
    }
  }

  // Scroll suave al inicio del contenido
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validarPasoEnvio() {
  const nombre = document.getElementById('envio-nombre');
  const telefono = document.getElementById('envio-telefono');
  const cp = document.getElementById('envio-cp');
  const calle = document.getElementById('envio-calle');
  const ciudad = document.getElementById('envio-ciudad');
  const provincia = document.getElementById('envio-provincia');
  const observaciones = document.getElementById('envio-observaciones');

  const errNombre = document.getElementById('error-envio-nombre');
  const errTel = document.getElementById('error-envio-telefono');
  const errCp = document.getElementById('error-envio-cp');
  const errCalle = document.getElementById('error-envio-calle');
  const errCiudad = document.getElementById('error-envio-ciudad');
  const errProv = document.getElementById('error-envio-provincia');

  let valido = true;
  let primerInvalido = null;

  // Validación Nombre
  if (!nombre.value.trim()) {
    mostrarErrorCampo(nombre, errNombre, 'Por favor, introduce tu nombre y apellidos.');
    valido = false;
    primerInvalido = primerInvalido || nombre;
  } else {
    limpiarErrorCampo(nombre, errNombre);
  }

  // Validación Teléfono
  const telLimpio = telefono.value.trim().replace(/\s+/g, '');
  const regexTel = /^[6789]\d{8}$/;
  if (!telLimpio) {
    mostrarErrorCampo(telefono, errTel, 'El teléfono es obligatorio para la entrega.');
    valido = false;
    primerInvalido = primerInvalido || telefono;
  } else if (!regexTel.test(telLimpio)) {
    mostrarErrorCampo(telefono, errTel, 'Introduce un teléfono español válido de 9 dígitos (ej. 612345678).');
    valido = false;
    primerInvalido = primerInvalido || telefono;
  } else {
    limpiarErrorCampo(telefono, errTel);
  }

  // Validación Código Postal
  const cpLimpio = cp.value.trim();
  const regexCp = /^\d{5}$/;
  if (!cpLimpio) {
    mostrarErrorCampo(cp, errCp, 'Introduce el código postal.');
    valido = false;
    primerInvalido = primerInvalido || cp;
  } else if (!regexCp.test(cpLimpio)) {
    mostrarErrorCampo(cp, errCp, 'El código postal debe constar exactamente de 5 dígitos.');
    valido = false;
    primerInvalido = primerInvalido || cp;
  } else {
    limpiarErrorCampo(cp, errCp);
  }

  // Validación Calle
  if (!calle.value.trim()) {
    mostrarErrorCampo(calle, errCalle, 'Introduce la dirección completa (calle, número, piso).');
    valido = false;
    primerInvalido = primerInvalido || calle;
  } else {
    limpiarErrorCampo(calle, errCalle);
  }

  // Validación Ciudad
  if (!ciudad.value.trim()) {
    mostrarErrorCampo(ciudad, errCiudad, 'Introduce la ciudad o localidad.');
    valido = false;
    primerInvalido = primerInvalido || ciudad;
  } else {
    limpiarErrorCampo(ciudad, errCiudad);
  }

  // Validación Provincia
  if (!provincia.value.trim()) {
    mostrarErrorCampo(provincia, errProv, 'Introduce la provincia.');
    valido = false;
    primerInvalido = primerInvalido || provincia;
  } else {
    limpiarErrorCampo(provincia, errProv);
  }

  if (!valido && primerInvalido) {
    primerInvalido.focus();
    return false;
  }

  datosEnvioGuardados = {
    nombre_completo: nombre.value.trim(),
    telefono: telLimpio,
    calle: calle.value.trim(),
    codigo_postal: cpLimpio,
    ciudad: ciudad.value.trim(),
    provincia: provincia.value.trim(),
    observaciones: observaciones.value.trim()
  };

  return true;
}

function rellenarResumenPaso2() {
  const dirTexto = document.getElementById('resumen-direccion-texto');
  if (datosEnvioGuardados && dirTexto) {
    dirTexto.innerHTML = `
      <strong>${datosEnvioGuardados.nombre_completo}</strong> · Tel. ${datosEnvioGuardados.telefono}<br>
      ${datosEnvioGuardados.calle}<br>
      ${datosEnvioGuardados.codigo_postal} ${datosEnvioGuardados.ciudad} (${datosEnvioGuardados.provincia})
      ${datosEnvioGuardados.observaciones ? `<br><em>Nota: ${datosEnvioGuardados.observaciones}</em>` : ''}
    `;
  }

  const tbody = document.getElementById('resumen-tabla-lineas');
  const lineas = obtenerLineas();
  tbody.replaceChildren();

  for (const item of lineas) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong>${item.producto.nombre}</strong><br>
        <small style="color:var(--color-texto-suave);">${item.producto.variedad} · ${formatearVolumen(item.producto.formato_ml)}</small>
      </td>
      <td class="tabla-datos__numero">${item.cantidad}</td>
      <td class="tabla-datos__numero">${formatearPrecio(item.producto.precio)}</td>
      <td class="tabla-datos__numero">${formatearPrecio(item.subtotal)}</td>
    `;
    tbody.appendChild(tr);
  }

  const totales = calcularTotales();
  document.getElementById('resumen-subtotal').textContent = formatearPrecio(totales.subtotal);
  document.getElementById('resumen-envio').textContent = totales.esEnvioGratis ? 'Gratis' : formatearPrecio(totales.gastosEnvio);
  document.getElementById('resumen-total').textContent = formatearPrecio(totales.total);
}

function inicializarPaso1ConDatosUsuario() {
  const usuario = usuarioActual();
  if (!usuario) return;

  const inputNombre = document.getElementById('envio-nombre');
  if (inputNombre && !inputNombre.value) {
    inputNombre.value = usuario.nombre || '';
  }

  // Si hay datos por defecto del usuario
  if (usuario.direccion) {
    const calle = document.getElementById('envio-calle');
    if (calle && !calle.value) calle.value = usuario.direccion.calle || '';
    const cp = document.getElementById('envio-cp');
    if (cp && !cp.value) cp.value = usuario.direccion.codigo_postal || '';
    const ciudad = document.getElementById('envio-ciudad');
    if (ciudad && !ciudad.value) ciudad.value = usuario.direccion.ciudad || '';
    const prov = document.getElementById('envio-provincia');
    if (prov && !prov.value) prov.value = usuario.direccion.provincia || '';
    const tel = document.getElementById('envio-telefono');
    if (tel && !tel.value) tel.value = usuario.telefono || '';
  }
}

function formalizarPedido() {
  const usuario = usuarioActual();
  if (!usuario) return;

  const metodoSeleccionado = document.querySelector('input[name="metodo_pago"]:checked')?.value || 'Tarjeta bancaria (simulada)';
  const lineas = obtenerLineas();
  const totales = calcularTotales();

  const resultado = crearPedido({
    usuarioId: usuario.id,
    direccionEnvio: datosEnvioGuardados,
    metodoPago: metodoSeleccionado,
    lineas,
    gastosEnvio: totales.gastosEnvio,
    subtotal: totales.subtotal,
    total: totales.total
  });

  if (!resultado.ok) {
    alert(resultado.mensaje);
    return;
  }

  pedidoFinalizado = resultado.pedido;
  // Vaciar el carrito de la compra tras el éxito
  vaciar();

  // Mostrar datos en el paso 4
  document.getElementById('exito-codigo-pedido').textContent = `OLEUM-${pedidoFinalizado.id}`;
  document.getElementById('exito-fecha-pedido').textContent = new Date(pedidoFinalizado.fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  document.getElementById('exito-total-pedido').textContent = formatearPrecio(pedidoFinalizado.total);
  document.getElementById('exito-direccion-pedido').textContent = `${pedidoFinalizado.direccion_envio.calle}, ${pedidoFinalizado.direccion_envio.codigo_postal} ${pedidoFinalizado.direccion_envio.ciudad}`;

  const btnDetalle = document.getElementById('btn-ver-detalle-pedido');
  if (btnDetalle) {
    btnDetalle.href = `pedido.html?id=${pedidoFinalizado.id}`;
  }

  // Ocultar el stepper de navegación para la pantalla final
  document.getElementById('navegacion-pasos').style.display = 'none';
  document.getElementById('titulo-checkout').textContent = 'Confirmación de compra';

  actualizarIndicadorPasos(4);
}

function iniciar() {
  if (!comprobarAutenticacion()) return;

  const unidades = contarUnidades();
  if (unidades === 0 && !pedidoFinalizado) {
    avisoVacio.removeAttribute('hidden');
    bloquePaso1.style.display = 'none';
    document.getElementById('navegacion-pasos').style.display = 'none';
    return;
  }

  inicializarPaso1ConDatosUsuario();

  // Paso 1 -> 2
  formEnvio.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validarPasoEnvio()) {
      rellenarResumenPaso2();
      actualizarIndicadorPasos(2);
    }
  });

  // Botón Modificar en Paso 2 y Botón Atrás
  document.getElementById('btn-modificar-direccion').addEventListener('click', () => {
    actualizarIndicadorPasos(1);
  });
  document.getElementById('btn-volver-paso-1').addEventListener('click', () => {
    actualizarIndicadorPasos(1);
  });

  // Paso 2 -> 3
  document.getElementById('btn-ir-paso-3').addEventListener('click', () => {
    actualizarIndicadorPasos(3);
  });

  // Paso 3 Atrás
  document.getElementById('btn-volver-paso-2').addEventListener('click', () => {
    actualizarIndicadorPasos(2);
  });

  // Paso 3 -> 4 (Submit Form Pago)
  formPago.addEventListener('submit', (e) => {
    e.preventDefault();
    formalizarPedido();
  });
}

iniciar();
