// Controlador de la portada (index.html): pinta un aceite destacado con stock por categoría (VIS-01)
// y los accesos que abren el catálogo ya filtrado por cada categoría.
// La elección la hace filtros.js y el pintado vista.js; aquí solo se coordina.

import { categorias, productos } from '../datos/productos.js';
import { elegirDestacados } from '../catalogo/filtros.js';
import { crearTarjetaCategoria, crearTarjetaProducto } from '../catalogo/vista.js';

function pintarDestacados() {
  const destacados = elegirDestacados(productos, categorias);
  document.getElementById('lista-destacados').replaceChildren(...destacados.map(crearTarjetaProducto));
}

function pintarCategorias() {
  document.getElementById('lista-categorias').replaceChildren(...categorias.map(crearTarjetaCategoria));
}

pintarDestacados();
pintarCategorias();
