// Vista del catálogo: crea elementos a partir de los <template> del HTML y los rellena.
// Solo usa textContent y atributos, nunca innerHTML con datos: así un nombre con "<script>" se muestra como texto (XSS).
// No decide qué se pinta (eso es del controlador); solo cómo.

import { formatearPrecio, formatearVolumen } from '../util/formato.js';

const IMAGEN_DE_RESERVA = 'assets/img/producto-sin-imagen.svg';

// Devuelve el primer elemento de la plantilla ya clonado, listo para rellenar y añadir.
export function clonarPlantilla(id) {
  return document.getElementById(id).content.firstElementChild.cloneNode(true);
}

// { once: true } hace que la reserva se ponga una sola vez: si también fallara, no habría un bucle de errores.
export function ponerImagen(imagen, producto) {
  imagen.addEventListener('error', () => {
    imagen.src = IMAGEN_DE_RESERVA;
  }, { once: true });
  imagen.src = producto.imagen;
}

export function textoDisponibilidad(producto) {
  return producto.stock > 0 ? 'Disponible' : 'Agotado';
}

export function crearTarjetaProducto(producto) {
  const tarjeta = clonarPlantilla('plantilla-tarjeta-producto');
  // data-disponible permite al CSS atenuar los agotados sin que la vista sepa nada de estilos.
  tarjeta.querySelector('.tarjeta-producto').dataset.disponible = producto.stock > 0 ? 'si' : 'no';
  ponerImagen(tarjeta.querySelector('.tarjeta-producto__imagen'), producto);
  const enlace = tarjeta.querySelector('.tarjeta-producto__enlace');
  enlace.href = `producto.html?id=${producto.id}`;
  enlace.textContent = producto.nombre;
  tarjeta.querySelector('.tarjeta-producto__variedad').textContent = producto.variedad;
  tarjeta.querySelector('.tarjeta-producto__formato').textContent = formatearVolumen(producto.formato_ml);
  tarjeta.querySelector('.tarjeta-producto__precio').textContent = formatearPrecio(producto.precio);
  tarjeta.querySelector('.tarjeta-producto__disponibilidad').textContent = textoDisponibilidad(producto);
  return tarjeta;
}

export function crearTarjetaCategoria(categoria) {
  const tarjeta = clonarPlantilla('plantilla-tarjeta-categoria');
  const enlace = tarjeta.querySelector('.tarjeta-categoria__enlace');
  enlace.href = `productos.html?categoria=${categoria.id}`;
  enlace.textContent = categoria.nombre;
  tarjeta.querySelector('.tarjeta-categoria__descripcion').textContent = categoria.descripcion;
  return tarjeta;
}

// Casilla de filtro (categoría o variedad): la plantilla ya trae el name, aquí solo se pone valor y texto.
export function crearOpcion(idPlantilla, { valor, texto, marcada }) {
  const opcion = clonarPlantilla(idPlantilla);
  const casilla = opcion.querySelector('input');
  casilla.value = valor;
  casilla.checked = marcada;
  opcion.querySelector('.filtros__texto-opcion').textContent = texto;
  return opcion;
}

// El botón solo muestra «×», así que el aria-label dice qué quita (VIS-07).
export function crearFiltroAplicado(texto, alQuitar) {
  const elemento = clonarPlantilla('plantilla-filtro-aplicado');
  elemento.querySelector('.filtros-aplicados__texto').textContent = texto;
  const boton = elemento.querySelector('.filtros-aplicados__quitar');
  boton.setAttribute('aria-label', `Quitar filtro: ${texto}`);
  boton.addEventListener('click', alQuitar);
  return elemento;
}

function crearEnlacePagina(texto, url, etiqueta) {
  const elemento = clonarPlantilla('plantilla-enlace-pagina');
  const enlace = elemento.querySelector('.paginacion__enlace');
  enlace.textContent = texto;
  enlace.href = url;
  enlace.setAttribute('aria-label', etiqueta);
  return { elemento, enlace };
}

// Devuelve los <li> de la paginación. «Anterior» y «Siguiente» solo aparecen si llevan a alguna parte:
// un enlace que no hace nada confunde más que su ausencia. crearUrl(n) da la URL completa de la página n.
export function crearPaginacion({ pagina, totalPaginas }, crearUrl) {
  const elementos = [];
  if (pagina > 1) {
    elementos.push(crearEnlacePagina('Anterior', crearUrl(pagina - 1), 'Página anterior').elemento);
  }
  for (let numero = 1; numero <= totalPaginas; numero += 1) {
    const { elemento, enlace } = crearEnlacePagina(String(numero), crearUrl(numero), `Página ${numero}`);
    // aria-current distingue la página actual también para los lectores de pantalla (VIS-08).
    if (numero === pagina) enlace.setAttribute('aria-current', 'page');
    elementos.push(elemento);
  }
  if (pagina < totalPaginas) {
    elementos.push(crearEnlacePagina('Siguiente', crearUrl(pagina + 1), 'Página siguiente').elemento);
  }
  return elementos;
}

export function textoContador(total, { pagina, totalPaginas }) {
  if (total === 0) return 'Ningún aceite coincide con los filtros';
  const texto = total === 1 ? 'Mostrando 1 aceite' : `Mostrando ${total} aceites`;
  return totalPaginas > 1 ? `${texto} · página ${pagina} de ${totalPaginas}` : texto;
}
