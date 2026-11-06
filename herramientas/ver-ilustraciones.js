// Pinta las ilustraciones de todos los productos (también los inactivos) para revisarlas de un vistazo.
// Herramienta temporal: lee los mismos datos que usará el catálogo, así se ve si alguna ruta falla.

import { productos } from '../proyecto/assets/js/datos/productos.js';

// Las rutas de `imagen` son relativas a proyecto/; esta página está en herramientas/.
const PREFIJO_PROYECTO = '../proyecto/';

function crearFicha(producto) {
  const elemento = document.createElement('li');
  const figura = document.createElement('figure');
  const imagen = document.createElement('img');
  imagen.src = PREFIJO_PROYECTO + producto.imagen;
  imagen.alt = producto.nombre;
  imagen.width = 400;
  imagen.height = 400;

  const pie = document.createElement('figcaption');
  const marcas = [producto.stock === 0 ? 'agotado' : '', producto.activo ? '' : 'inactivo'].filter(Boolean);
  pie.textContent = `${producto.id}. ${producto.nombre} · ${producto.formato_ml} ml`
    + (marcas.length > 0 ? ` (${marcas.join(', ')})` : '');

  // Marca las rutas rotas en el propio pie para no tener que mirar la consola.
  imagen.addEventListener('error', () => {
    pie.textContent += ' · ¡NO SE ENCUENTRA LA IMAGEN!';
  });

  figura.append(imagen, pie);
  elemento.append(figura);
  return elemento;
}

function pintarRejilla() {
  const rejilla = document.getElementById('rejilla');
  rejilla.append(...productos.map(crearFicha));
  document.getElementById('resumen').textContent = `${productos.length} productos.`;
}

pintarRejilla();
