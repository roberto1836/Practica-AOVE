// Controlador del catálogo (productos.html): lee los criterios de la URL o del formulario,
// pide a filtros.js el resultado y a vista.js los elementos, y mantiene la URL al día con
// history.replaceState para que «Atrás» desde la ficha y los enlaces copiados conserven la selección (VIS-09).

import { categorias, productos } from '../datos/productos.js';
import {
  criteriosAParametros, filtrarProductos, leerCriterios, ordenarProductos, paginar, variedadesDelCatalogo
} from '../catalogo/filtros.js';
import {
  crearFiltroAplicado, crearOpcion, crearPaginacion, crearTarjetaProducto, textoContador
} from '../catalogo/vista.js';
import { formatearPrecio } from '../util/formato.js';

// Espera tras la última tecla en los campos de texto: filtrar con cada letra haría parpadear la lista
// y el lector de pantalla anunciaría el contador una y otra vez.
const ESPERA_AL_ESCRIBIR_MS = 250;

const variedades = variedadesDelCatalogo(productos);
const contexto = { categorias, variedades };

const formulario = document.querySelector('.filtros');
const campoBusqueda = document.getElementById('filtro-busqueda');
const campoMin = document.getElementById('filtro-precio-min');
const campoMax = document.getElementById('filtro-precio-max');
const selectorOrden = document.getElementById('filtro-orden');
const errorPrecio = document.getElementById('error-precio');
const listaFiltrosAplicados = document.getElementById('filtros-aplicados');
const listaProductos = document.getElementById('lista-productos');
const contador = document.getElementById('contador-resultados');
const mensajeSinResultados = document.getElementById('mensaje-sin-resultados');
const navegacionPaginas = document.querySelector('.paginacion');
const listaPaginas = document.getElementById('lista-paginacion');

let temporizadorEscritura = null;

// --- URL ---

// Ruta relativa: en Tomcat la aplicación vive bajo un context path (CLAUDE.md, «Rutas»).
function urlDelCatalogo(criterios) {
  const consulta = criteriosAParametros(criterios).toString();
  return consulta === '' ? 'productos.html' : `productos.html?${consulta}`;
}

// replaceState y no pushState: cada filtro no debe crear una entrada en el historial,
// o «Atrás» tendría que deshacer los filtros uno a uno antes de salir del catálogo.
function actualizarUrl(criterios) {
  history.replaceState(null, '', urlDelCatalogo(criterios));
}

// --- Formulario ---

function pintarOpciones() {
  const opcionesCategoria = categorias.map((categoria) => crearOpcion('plantilla-opcion-categoria', {
    valor: String(categoria.id), texto: categoria.nombre, marcada: false
  }));
  const opcionesVariedad = variedades.map((variedad) => crearOpcion('plantilla-opcion-variedad', {
    valor: variedad, texto: variedad, marcada: false
  }));
  document.getElementById('opciones-categoria').replaceChildren(...opcionesCategoria);
  document.getElementById('opciones-variedad').replaceChildren(...opcionesVariedad);
}

// Pone en el formulario lo que dice la URL: así el texto buscado sigue en el buscador (VIS-03)
// y los precios erróneos no se borran (VIS-06).
function rellenarFormulario(criterios) {
  campoBusqueda.value = criterios.q;
  campoMin.value = criterios.min === null ? '' : String(criterios.min);
  campoMax.value = criterios.max === null ? '' : String(criterios.max);
  selectorOrden.value = criterios.orden;
  formulario.querySelectorAll('input[name="categoria"]').forEach((casilla) => {
    casilla.checked = criterios.categorias.includes(Number(casilla.value));
  });
  formulario.querySelectorAll('input[name="variedad"]').forEach((casilla) => {
    casilla.checked = criterios.variedades.includes(casilla.value);
  });
}

// El formulario no tiene campo «pagina», así que cualquier cambio vuelve a la página 1 (VIS-08).
function criteriosDelFormulario() {
  return leerCriterios(new URLSearchParams(new FormData(formulario)), contexto);
}

// --- Pintado ---

function pintarErrorPrecio(criterios) {
  errorPrecio.textContent = criterios.errorPrecio ?? '';
  [campoMin, campoMax].forEach((campo) => {
    if (criterios.errorPrecio === null) {
      campo.removeAttribute('aria-invalid');
    } else {
      campo.setAttribute('aria-invalid', 'true');
    }
  });
}

// Cada filtro aplicado se describe con su texto y con lo que hay que cambiar en el formulario para quitarlo.
function describirFiltrosAplicados(criterios) {
  const filtros = [];
  if (criterios.q !== '') {
    filtros.push({ texto: `Búsqueda: «${criterios.q}»`, quitar: () => { campoBusqueda.value = ''; } });
  }
  criterios.categorias.forEach((id) => {
    const categoria = categorias.find((candidata) => candidata.id === id);
    filtros.push({ texto: categoria.nombre, quitar: () => desmarcar('categoria', String(id)) });
  });
  criterios.variedades.forEach((variedad) => {
    filtros.push({ texto: variedad, quitar: () => desmarcar('variedad', variedad) });
  });
  // Con error de precio, el precio no se está aplicando, así que no se muestra como filtro.
  if (criterios.errorPrecio === null && criterios.min !== null) {
    filtros.push({ texto: `Desde ${formatearPrecio(criterios.min)}`, quitar: () => { campoMin.value = ''; } });
  }
  if (criterios.errorPrecio === null && criterios.max !== null) {
    filtros.push({ texto: `Hasta ${formatearPrecio(criterios.max)}`, quitar: () => { campoMax.value = ''; } });
  }
  return filtros;
}

function desmarcar(nombre, valor) {
  formulario.querySelectorAll(`input[name="${nombre}"]`).forEach((casilla) => {
    if (casilla.value === valor) casilla.checked = false;
  });
}

function pintarFiltrosAplicados(criterios) {
  const elementos = describirFiltrosAplicados(criterios).map(({ texto, quitar }, posicion) =>
    crearFiltroAplicado(texto, () => quitarFiltro(quitar, posicion)));
  listaFiltrosAplicados.replaceChildren(...elementos);
  // Una lista vacía con nombre («Filtros aplicados») la anunciaría el lector de pantalla sin motivo.
  listaFiltrosAplicados.hidden = elementos.length === 0;
}

function pintarPaginacion(paginacion, criterios) {
  navegacionPaginas.hidden = paginacion.totalPaginas <= 1;
  // Enlaces normales con la URL completa: se pueden abrir en otra pestaña o copiar (VIS-09).
  listaPaginas.replaceChildren(...crearPaginacion(paginacion, (numero) =>
    urlDelCatalogo({ ...criterios, pagina: numero })));
}

// Pinta todo a partir de unos criterios y devuelve la paginación, que lleva la página ya corregida.
function pintarResultados(criterios) {
  const encontrados = ordenarProductos(filtrarProductos(productos, criterios), criterios.orden, criterios.q);
  const paginacion = paginar(encontrados, criterios.pagina);
  pintarErrorPrecio(criterios);
  pintarFiltrosAplicados(criterios);
  listaProductos.replaceChildren(...paginacion.elementos.map(crearTarjetaProducto));
  contador.textContent = textoContador(paginacion.total, paginacion);
  mensajeSinResultados.hidden = paginacion.total > 0;
  pintarPaginacion(paginacion, criterios);
  return paginacion;
}

// --- Acciones ---

function aplicarFormulario() {
  clearTimeout(temporizadorEscritura);
  const criterios = criteriosDelFormulario();
  actualizarUrl(criterios);
  pintarResultados(criterios);
}

// El botón pulsado desaparece al repintar; si el foco se quedara en él, se perdería (volvería al <body>).
// Por eso va al filtro que ocupa ahora su sitio, al anterior si era el último, o al buscador si no queda ninguno.
function quitarFiltro(cambiarFormulario, posicion) {
  cambiarFormulario();
  aplicarFormulario();
  const botones = listaFiltrosAplicados.querySelectorAll('.filtros-aplicados__quitar');
  const destino = botones[posicion] ?? botones[botones.length - 1] ?? campoBusqueda;
  destino.focus();
}

function alCambiarFormulario(evento) {
  const esCampoDeTexto = evento.target === campoBusqueda || evento.target === campoMin || evento.target === campoMax;
  if (esCampoDeTexto) {
    clearTimeout(temporizadorEscritura);
    temporizadorEscritura = setTimeout(aplicarFormulario, ESPERA_AL_ESCRIBIR_MS);
  } else {
    aplicarFormulario();
  }
}

// Con JS, el envío no recarga la página; sin JS, el GET normal a productos.html sigue funcionando.
function alEnviarFormulario(evento) {
  evento.preventDefault();
  aplicarFormulario();
}

function iniciar() {
  const criterios = leerCriterios(new URLSearchParams(location.search), contexto);
  pintarOpciones();
  rellenarFormulario(criterios);
  const paginacion = pintarResultados(criterios);
  // Si la URL pedía una página que no existe, se muestra la última y la URL se corrige para que coincida.
  if (paginacion.pagina !== criterios.pagina) {
    actualizarUrl({ ...criterios, pagina: paginacion.pagina });
  }
  // Con JS, los valores raros de precio los trata leerCriterios (se ignoran o se explican);
  // el globo nativo del navegador bloquearía el envío sin decir nada junto a los campos.
  formulario.noValidate = true;
  formulario.addEventListener('input', alCambiarFormulario);
  formulario.addEventListener('submit', alEnviarFormulario);
}

iniciar();
