// Controlador de la ficha (producto.html?id=N): pone en <main> la plantilla de la ficha o la de
// «Producto no encontrado» (equivale al 404 de la Parte 2) y gestiona la cantidad y «Añadir al carrito».
// Como solo se clona una de las dos plantillas, la página tiene siempre un único h1.

import { productos } from '../datos/productos.js';
import { buscarProducto, validarCantidad } from '../catalogo/filtros.js';
import { clonarPlantilla, ponerImagen } from '../catalogo/vista.js';
import { formatearPrecio, formatearPrecioPorLitro, formatearVolumen } from '../util/formato.js';
// Integración con carrito.js definitivo (B) y sustituto de sesión (C).
import { anadir } from '../carrito.js';
import { usuarioActual } from '../sustitutos/sesion.js';

const AVISO_ADMINISTRADOR = 'Has iniciado sesión como administrador: la compra está desactivada.';

const principal = document.getElementById('contenido');
const migaProducto = document.getElementById('miga-producto');

// --- Cabecera de la página ---

function ponerTitulo(texto) {
  migaProducto.textContent = texto;
  document.title = `${texto} · Oleum`;
}

// Si se llega desde el catálogo de este mismo sitio, la miga «Catálogo» vuelve a esa URL con sus filtros (VIS-09).
// Se comprueba el origen para no copiar nunca una URL de otra web en un enlace propio.
function enlazarMigaAlCatalogo() {
  if (document.referrer === '') return;
  const anterior = new URL(document.referrer);
  if (anterior.origin === location.origin && anterior.pathname.endsWith('/productos.html')) {
    principal.querySelector('.migas__enlace[href="productos.html"]').href = `productos.html${anterior.search}`;
  }
}

// --- Ficha ---

function textoExistencias(stock) {
  if (stock === 0) return 'Agotado';
  return stock === 1 ? 'Disponible · 1 unidad' : `Disponible · ${stock} unidades`;
}

function rellenarFicha(ficha, producto) {
  const volumen = formatearVolumen(producto.formato_ml);
  // Igual que en la tarjeta: el CSS usa este atributo para pintar «Agotado» en gris y no en verde.
  ficha.dataset.disponible = producto.stock > 0 ? 'si' : 'no';
  ficha.querySelector('.ficha-producto__nombre').textContent = producto.nombre;
  const imagen = ficha.querySelector('.ficha-producto__imagen');
  ponerImagen(imagen, producto);
  // Aquí la imagen es el contenido principal, así que sí lleva un alt que la describe.
  imagen.alt = `Ilustración del envase de ${producto.nombre}, ${volumen}`;
  ficha.querySelector('.ficha-producto__productor').textContent = producto.productor;
  ficha.querySelector('.ficha-producto__origen').textContent = producto.origen;
  ficha.querySelector('.ficha-producto__variedad').textContent = producto.variedad;
  ficha.querySelector('.ficha-producto__formato').textContent = volumen;
  ficha.querySelector('.ficha-producto__precio').textContent = formatearPrecio(producto.precio);
  ficha.querySelector('.ficha-producto__precio-litro').textContent =
    formatearPrecioPorLitro(producto.precio, producto.formato_ml);
  ficha.querySelector('.ficha-producto__disponibilidad').textContent = textoExistencias(producto.stock);
  ficha.querySelector('.ficha-producto__descripcion').textContent = producto.descripcion;
}

// --- Compra ---

function mostrarError(campo, mensajeError, texto) {
  mensajeError.textContent = texto;
  campo.setAttribute('aria-invalid', 'true');
}

function limpiarError(campo, mensajeError) {
  mensajeError.textContent = '';
  campo.removeAttribute('aria-invalid');
}

function desactivarCompra(formularioCompra) {
  formularioCompra.querySelectorAll('input, button').forEach((control) => {
    control.disabled = true;
  });
  formularioCompra.querySelector('.formulario-compra__enviar').textContent = 'Agotado';
}

// Sin sesión se va al login con la ficha como destino de vuelta (VIS-12). encodeURIComponent
// evita que el "?" y el "=" de la ficha se confundan con los parámetros de login.html.
function irAlLogin(producto) {
  location.href = `login.html?volver=${encodeURIComponent(`producto.html?id=${producto.id}`)}`;
}

function prepararCompra(formularioCompra, producto) {
  const campo = formularioCompra.querySelector('.formulario-compra__campo');
  const mensajeError = formularioCompra.querySelector('.formulario-compra__error');
  const [botonQuitar, botonAnadir] = formularioCompra.querySelectorAll('.formulario-compra__cambiar');

  formularioCompra.querySelector('input[name="productoId"]').value = String(producto.id);
  campo.max = String(producto.stock);
  // Sin esto, el navegador bloquea el envío con su globo nativo (por min y max) y nuestro mensaje
  // junto al campo no llega a salir. Se hace desde JS para que, sin JS, siga la validación nativa.
  formularioCompra.noValidate = true;

  if (producto.stock === 0) {
    desactivarCompra(formularioCompra);
    return;
  }

  // Los botones − y + no se desactivan en los límites: un botón desactivado pierde el foco
  // y el usuario de teclado no sabría qué ha pasado. En su lugar, se explica con el mensaje de error.
  function cambiarCantidad(diferencia) {
    const actual = Number.parseInt(campo.value, 10);
    const nueva = (Number.isNaN(actual) ? 1 : actual) + diferencia;
    const error = validarCantidad(String(nueva), producto.stock);
    if (error === null) {
      campo.value = String(nueva);
      limpiarError(campo, mensajeError);
    } else {
      mostrarError(campo, mensajeError, error);
    }
  }

  botonQuitar.addEventListener('click', () => cambiarCantidad(-1));
  botonAnadir.addEventListener('click', () => cambiarCantidad(1));
  // Al escribir se borra el error anterior, que ya no corresponde a lo que hay en el campo.
  campo.addEventListener('input', () => limpiarError(campo, mensajeError));

  formularioCompra.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const error = validarCantidad(campo.value, producto.stock);
    if (error !== null) {
      mostrarError(campo, mensajeError, error);
      campo.focus();
      return;
    }
    if (usuarioActual() === null) {
      irAlLogin(producto);
      return;
    }
    const cantidad = Number(campo.value.trim());
    const resultado = anadir(producto.id, cantidad);
    if (!resultado.ok) {
      mostrarError(campo, mensajeError, resultado.mensaje);
      campo.focus();
      return;
    }
    // Apartado 6.2: tras añadir se redirige al carrito, que muestra la línea, el total y el contador.
    location.href = 'carrito.html';
  });
}

// El administrador no compra: se sustituye el formulario por el aviso de CLAUDE.md.
function sustituirPorAvisoAdministrador(formularioCompra) {
  const aviso = document.createElement('p');
  aviso.className = 'formulario-compra__aviso';
  aviso.textContent = AVISO_ADMINISTRADOR;
  formularioCompra.replaceWith(aviso);
}

// --- Páginas posibles ---

function mostrarNoEncontrado() {
  ponerTitulo('Producto no encontrado');
  principal.append(clonarPlantilla('plantilla-producto-no-encontrado'));
}

function mostrarFicha(producto) {
  ponerTitulo(producto.nombre);
  enlazarMigaAlCatalogo();
  const ficha = clonarPlantilla('plantilla-ficha-producto');
  rellenarFicha(ficha, producto);
  const formularioCompra = ficha.querySelector('.formulario-compra');
  if (usuarioActual()?.rol === 'admin') {
    sustituirPorAvisoAdministrador(formularioCompra);
  } else {
    prepararCompra(formularioCompra, producto);
  }
  principal.append(ficha);
}

function iniciar() {
  const producto = buscarProducto(productos, new URLSearchParams(location.search).get('id'));
  if (producto === null) {
    mostrarNoEncontrado();
  } else {
    mostrarFicha(producto);
  }
}

iniciar();
