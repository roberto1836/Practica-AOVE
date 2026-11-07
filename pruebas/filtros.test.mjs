// Pruebas automáticas de la lógica del catálogo (A). Se ejecutan desde la raíz del repo con: node --test
// Solo prueban las funciones puras de filtros.js, así que no necesitan navegador ni servidor.
// En la Parte 2, su equivalente serán las pruebas JUnit del servicio de productos, en src/test.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { categorias, productos } from '../proyecto/assets/js/datos/productos.js';
import {
  PRODUCTOS_POR_PAGINA, buscarProducto, criteriosAParametros, elegirDestacados, filtrarProductos,
  leerCriterios, normalizarTexto, ordenarProductos, paginar, validarCantidad, variedadesDelCatalogo
} from '../proyecto/assets/js/catalogo/filtros.js';

const variedades = variedadesDelCatalogo(productos);
const contexto = { categorias, variedades };
const activos = productos.filter((producto) => producto.activo);

// Atajo: los criterios tal y como los leería el catálogo a partir de una URL.
const criterios = (consulta) => leerCriterios(new URLSearchParams(consulta), contexto);

describe('normalizarTexto', () => {
  test('quita tildes, eñes y mayúsculas para comparar', () => {
    assert.equal(normalizarTexto('Jaén'), 'jaen');
    assert.equal(normalizarTexto('Manzanilla Cacereña'), 'manzanilla cacerena');
  });
});

describe('leerCriterios: una URL rara nunca rompe el catálogo', () => {
  test('sin parámetros, todo por defecto', () => {
    assert.deepEqual(criterios(''), {
      q: '', categorias: [], variedades: [], min: null, max: null,
      errorPrecio: null, orden: 'relevancia', pagina: 1
    });
  });

  test('categorías que no existen, repetidas o no numéricas se ignoran', () => {
    assert.deepEqual(criterios('categoria=1&categoria=99&categoria=1&categoria=abc').categorias, [1]);
  });

  test('la variedad se reconoce sin tildes ni mayúsculas y se guarda con su nombre oficial', () => {
    assert.deepEqual(criterios('variedad=manzanilla%20cacerena').variedades, ['Manzanilla Cacereña']);
    assert.deepEqual(criterios('variedad=inventada').variedades, []);
  });

  test('precios no numéricos o negativos se ignoran', () => {
    const { min, max } = criterios('min=abc&max=-5');
    assert.equal(min, null);
    assert.equal(max, null);
  });

  test('mínimo mayor que máximo: error, pero se conservan los dos valores (VIS-06)', () => {
    const resultado = criterios('min=30&max=10');
    assert.equal(resultado.min, 30);
    assert.equal(resultado.max, 10);
    assert.ok(resultado.errorPrecio);
  });

  test('orden desconocido → relevancia; página no válida → 1', () => {
    assert.equal(criterios('orden=al-reves').orden, 'relevancia');
    for (const pagina of ['0', '-3', '2.5', 'abc']) {
      assert.equal(criterios(`pagina=${pagina}`).pagina, 1, `pagina=${pagina}`);
    }
  });
});

describe('criteriosAParametros', () => {
  test('ida y vuelta: los criterios vuelven a dar la misma URL', () => {
    const consulta = 'q=picual&categoria=2&orden=nombre&pagina=2';
    assert.equal(criteriosAParametros(criterios(consulta)).toString(), consulta);
  });

  test('omite los valores por defecto para que la URL sea corta', () => {
    assert.equal(criteriosAParametros(criterios('orden=relevancia&pagina=1')).toString(), '');
  });
});

describe('filtrarProductos', () => {
  test('nunca muestra productos dados de baja (baja lógica)', () => {
    const resultado = filtrarProductos(productos, criterios(''));
    assert.equal(resultado.length, activos.length);
    assert.ok(resultado.every((producto) => producto.activo));
  });

  test('busca en nombre, productor, origen y variedad, sin tildes (VIS-03)', () => {
    const resultado = filtrarProductos(productos, criterios('q=magina'));
    assert.ok(resultado.length > 0);
    assert.ok(resultado.every((producto) => normalizarTexto(producto.origen).includes('magina')));
  });

  test('varias categorías a la vez (VIS-04)', () => {
    const resultado = filtrarProductos(productos, criterios('categoria=1&categoria=4'));
    const esperados = activos.filter((producto) => [1, 4].includes(producto.categoria_id));
    assert.equal(resultado.length, esperados.length);
  });

  test('el rango de precio incluye los extremos (VIS-06)', () => {
    const { precio, id } = activos[0];
    const resultado = filtrarProductos(productos, criterios(`min=${precio}&max=${precio}`));
    assert.ok(resultado.some((producto) => producto.id === id));
    assert.ok(resultado.every((producto) => producto.precio === precio));
  });

  test('con error de precio no se filtra por precio', () => {
    assert.equal(filtrarProductos(productos, criterios('min=30&max=10')).length, activos.length);
  });

  test('una búsqueda sin coincidencias devuelve una lista vacía', () => {
    assert.deepEqual(filtrarProductos(productos, criterios('q=zzzz')), []);
  });
});

describe('ordenarProductos', () => {
  test('precio de menor a mayor y de mayor a menor', () => {
    const subiendo = ordenarProductos(activos, 'precio-asc').map((producto) => producto.precio);
    const bajando = ordenarProductos(activos, 'precio-desc').map((producto) => producto.precio);
    assert.deepEqual(subiendo, [...subiendo].sort((a, b) => a - b));
    assert.deepEqual(bajando, [...subiendo].reverse());
  });

  test('relevancia sin búsqueda: los agotados van al final', () => {
    const orden = ordenarProductos(activos, 'relevancia');
    const primerAgotado = orden.findIndex((producto) => producto.stock === 0);
    assert.ok(orden.slice(primerAgotado).every((producto) => producto.stock === 0));
  });

  test('no modifica la lista original (ordena una copia)', () => {
    const copia = [...activos];
    ordenarProductos(activos, 'precio-desc');
    assert.deepEqual(activos, copia);
  });
});

describe('paginar (VIS-08)', () => {
  test(`reparte los productos de ${PRODUCTOS_POR_PAGINA} en ${PRODUCTOS_POR_PAGINA}`, () => {
    const { totalPaginas, elementos } = paginar(activos, 1);
    assert.equal(totalPaginas, Math.ceil(activos.length / PRODUCTOS_POR_PAGINA));
    assert.equal(elementos.length, Math.min(PRODUCTOS_POR_PAGINA, activos.length));
  });

  test('una página que no existe muestra la última', () => {
    const ultima = Math.ceil(activos.length / PRODUCTOS_POR_PAGINA);
    assert.equal(paginar(activos, 99).pagina, ultima);
  });

  test('sin resultados hay una página, vacía', () => {
    assert.deepEqual(paginar([], 1), { elementos: [], pagina: 1, totalPaginas: 1, total: 0 });
  });
});

describe('buscarProducto (equivale al 404 de la Parte 2)', () => {
  test('un id válido de un producto activo lo encuentra', () => {
    assert.equal(buscarProducto(productos, String(activos[0].id))?.id, activos[0].id);
  });

  test('inactivo, inexistente o id no válido → null', () => {
    const inactivo = productos.find((producto) => !producto.activo);
    for (const id of [String(inactivo.id), '999', 'abc', '', null, '2.5', '-1']) {
      assert.equal(buscarProducto(productos, id), null, `id=${id}`);
    }
  });
});

describe('validarCantidad (regla 3.3 del enunciado y CLI-01)', () => {
  test('cantidades válidas → sin error', () => {
    assert.equal(validarCantidad('1', 5), null);
    assert.equal(validarCantidad('5', 5), null);
  });

  test('vacía, decimal, cero o más que el stock → mensaje de error', () => {
    assert.match(validarCantidad('', 5), /unidades/);
    assert.match(validarCantidad('2.5', 5), /entero/);
    assert.equal(validarCantidad('0', 5), 'La cantidad mínima es 1.');
    assert.equal(validarCantidad('6', 5), 'Solo quedan 5 unidades.');
  });

  test('producto agotado → siempre error', () => {
    assert.match(validarCantidad('1', 0), /agotado/);
  });
});

describe('elegirDestacados (VIS-01)', () => {
  test('uno por categoría, siempre activo y con stock', () => {
    const destacados = elegirDestacados(productos, categorias);
    assert.equal(new Set(destacados.map((producto) => producto.categoria_id)).size, destacados.length);
    assert.ok(destacados.every((producto) => producto.activo && producto.stock > 0));
  });
});
