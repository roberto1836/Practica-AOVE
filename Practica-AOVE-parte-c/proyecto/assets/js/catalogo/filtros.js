// Lógica del catálogo: leer criterios de la URL, filtrar, ordenar, paginar y validar.
// Son funciones puras, sin DOM: reciben datos y devuelven datos, así se pueden probar con Node
// y en la Parte 2 se traducen casi línea a línea al Servlet (o a la consulta SQL).

export const PRODUCTOS_POR_PAGINA = 9;
export const ORDEN_POR_DEFECTO = 'relevancia';
const ORDENES_VALIDOS = ['relevancia', 'precio-asc', 'precio-desc', 'nombre'];

// Collator ordena como un diccionario español (Á junto a A, Ñ después de N), cosa que el < de JS no hace.
const comparadorDeTextos = new Intl.Collator('es');

// --- Texto ---

// "Jaén" → "jaen". NFD separa la letra de su tilde y luego se borran las tildes sueltas (U+0300-U+036F).
// Así «magina» encuentra «Mágina» (VIS-03). La ñ también pasa a n: «cacerena» encuentra «Cacereña».
export function normalizarTexto(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// --- Lectura de criterios (URL o formulario) ---

// Solo enteros escritos con dígitos: "2.5", "-1" o "abc" no son ids ni páginas válidas.
function leerEnteroPositivo(texto) {
  if (texto === null || !/^\d+$/.test(texto.trim())) {
    return null;
  }
  const numero = Number(texto);
  return numero >= 1 ? numero : null;
}

// Precio no numérico, vacío o negativo → null (se ignora). Acepta coma decimal por si alguien escribe la URL a mano.
function leerPrecio(texto) {
  if (texto === null || texto.trim() === '') {
    return null;
  }
  const numero = Number(texto.trim().replace(',', '.'));
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

// Ids repetidos o que no existen se descartan (regla «Valores raros en la URL» de CLAUDE.md).
function leerCategorias(parametros, categorias) {
  const idsExistentes = new Set(categorias.map((categoria) => categoria.id));
  const ids = parametros.getAll('categoria')
    .map(leerEnteroPositivo)
    .filter((id) => id !== null && idsExistentes.has(id));
  return [...new Set(ids)];
}

// La variedad se compara sin tildes ni mayúsculas, pero se guarda con su nombre oficial
// («royal» → «Royal»), para marcar bien la casilla y mostrar bien la etiqueta.
function leerVariedades(parametros, variedades) {
  const oficialPorNormalizada = new Map(variedades.map((variedad) => [normalizarTexto(variedad), variedad]));
  const encontradas = parametros.getAll('variedad')
    .map((texto) => oficialPorNormalizada.get(normalizarTexto(texto.trim())))
    .filter((variedad) => variedad !== undefined);
  return [...new Set(encontradas)];
}

function leerOrden(texto) {
  return ORDENES_VALIDOS.includes(texto) ? texto : ORDEN_POR_DEFECTO;
}

// Con min > max no se borra nada: los valores se quedan (para mostrarlos en los campos)
// y el error hace que cumplePrecio no filtre (VIS-06).
function errorDePrecio(min, max) {
  if (min !== null && max !== null && min > max) {
    return 'El precio «Desde» no puede ser mayor que el precio «Hasta».';
  }
  return null;
}

// Sirve igual para location.search que para new URLSearchParams(new FormData(formulario)):
// el formulario usa los mismos nombres que la URL, que son los mismos que tendrá GET /productos.
export function leerCriterios(parametros, { categorias, variedades }) {
  const min = leerPrecio(parametros.get('min'));
  const max = leerPrecio(parametros.get('max'));
  return {
    q: (parametros.get('q') ?? '').trim(),
    categorias: leerCategorias(parametros, categorias),
    variedades: leerVariedades(parametros, variedades),
    min,
    max,
    errorPrecio: errorDePrecio(min, max),
    orden: leerOrden(parametros.get('orden')),
    // La página que no es un entero positivo pasa a 1; si es mayor que el total, la corrige paginar().
    pagina: leerEnteroPositivo(parametros.get('pagina')) ?? 1
  };
}

// Lo contrario de leerCriterios. Se omiten los valores por defecto para que las URL sean cortas
// y una misma selección tenga siempre la misma URL.
export function criteriosAParametros(criterios) {
  const parametros = new URLSearchParams();
  if (criterios.q !== '') parametros.set('q', criterios.q);
  criterios.categorias.forEach((id) => parametros.append('categoria', String(id)));
  criterios.variedades.forEach((variedad) => parametros.append('variedad', variedad));
  if (criterios.min !== null) parametros.set('min', String(criterios.min));
  if (criterios.max !== null) parametros.set('max', String(criterios.max));
  if (criterios.orden !== ORDEN_POR_DEFECTO) parametros.set('orden', criterios.orden);
  if (criterios.pagina > 1) parametros.set('pagina', String(criterios.pagina));
  return parametros;
}

// --- Filtros ---
// Cada filtro es una función (producto, criterios) → true si el producto pasa.
// Un criterio vacío deja pasar a todos. Añadir un filtro nuevo es escribir una función y añadirla a FILTROS.

function estaActivo(producto) {
  return producto.activo;
}

function cumpleBusqueda(producto, { q }) {
  if (q === '') return true;
  const buscado = normalizarTexto(q);
  return [producto.nombre, producto.productor, producto.origen, producto.variedad]
    .some((campo) => normalizarTexto(campo).includes(buscado));
}

function cumpleCategoria(producto, { categorias }) {
  return categorias.length === 0 || categorias.includes(producto.categoria_id);
}

function cumpleVariedad(producto, { variedades }) {
  return variedades.length === 0 || variedades.includes(producto.variedad);
}

// Ambos extremos incluidos (VIS-06). Con error de precio no se filtra por precio.
function cumplePrecio(producto, { min, max, errorPrecio }) {
  if (errorPrecio !== null) return true;
  return (min === null || producto.precio >= min) && (max === null || producto.precio <= max);
}

const FILTROS = [estaActivo, cumpleBusqueda, cumpleCategoria, cumpleVariedad, cumplePrecio];

export function filtrarProductos(productos, criterios) {
  return productos.filter((producto) => FILTROS.every((filtro) => filtro(producto, criterios)));
}

// --- Orden ---

function porNombre(a, b) {
  return comparadorDeTextos.compare(a.nombre, b.nombre);
}

// Relevancia sin búsqueda: primero los disponibles y después por nombre.
function porDisponibilidadYNombre(a, b) {
  const disponibleA = a.stock > 0 ? 0 : 1;
  const disponibleB = b.stock > 0 ? 0 : 1;
  return disponibleA - disponibleB || porNombre(a, b);
}

// Relevancia con búsqueda: primero los que tienen el texto en el nombre; dentro de cada grupo, el orden anterior.
function porRelevanciaDeBusqueda(q) {
  const buscado = normalizarTexto(q);
  const grupo = (producto) => (normalizarTexto(producto.nombre).includes(buscado) ? 0 : 1);
  return (a, b) => grupo(a) - grupo(b) || porDisponibilidadYNombre(a, b);
}

function comparadorSegunOrden(orden, q) {
  switch (orden) {
    case 'precio-asc': return (a, b) => a.precio - b.precio || porNombre(a, b);
    case 'precio-desc': return (a, b) => b.precio - a.precio || porNombre(a, b);
    case 'nombre': return porNombre;
    default: return q === '' ? porDisponibilidadYNombre : porRelevanciaDeBusqueda(q);
  }
}

// Ordena una copia: sort() cambia el array original, y el original son los datos del catálogo.
export function ordenarProductos(productos, orden, q = '') {
  return [...productos].sort(comparadorSegunOrden(orden, q));
}

// --- Paginación ---

// Una página fuera de rango da la última (VIS-08); con 0 resultados hay 1 página, vacía.
export function paginar(lista, pagina, porPagina = PRODUCTOS_POR_PAGINA) {
  const total = lista.length;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const paginaValida = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (paginaValida - 1) * porPagina;
  return {
    elementos: lista.slice(inicio, inicio + porPagina),
    pagina: paginaValida,
    totalPaginas,
    total
  };
}

// --- Consultas sobre los datos ---

// Solo las de productos activos: una casilla que no puede dar resultados confunde (VIS-05).
export function variedadesDelCatalogo(productos) {
  const variedades = new Set(productos.filter(estaActivo).map((producto) => producto.variedad));
  return [...variedades].sort(comparadorDeTextos.compare);
}

// Un destacado por categoría, siempre activo y con stock (VIS-01). Si una categoría no tiene ninguno, se omite.
export function elegirDestacados(productos, categorias) {
  return categorias
    .map((categoria) => productos.find((producto) =>
      producto.categoria_id === categoria.id && producto.activo && producto.stock > 0))
    .filter((producto) => producto !== undefined);
}

// Solo ids enteros positivos de productos activos; cualquier otra cosa equivale al 404 de la Parte 2.
export function buscarProducto(productos, textoId) {
  const id = leerEnteroPositivo(textoId);
  if (id === null) return null;
  return productos.find((producto) => producto.id === id && producto.activo) ?? null;
}

// Devuelve el mensaje que se muestra junto al campo, o null si la cantidad es válida (CLI-01).
export function validarCantidad(texto, stock) {
  const limpio = String(texto ?? '').trim();
  if (stock <= 0) return 'Este aceite está agotado.';
  if (limpio === '') return 'Indica cuántas unidades quieres.';
  if (!/^-?\d+$/.test(limpio)) return 'La cantidad debe ser un número entero.';
  const cantidad = Number(limpio);
  if (cantidad < 1) return 'La cantidad mínima es 1.';
  if (cantidad > stock) return stock === 1 ? 'Solo queda 1 unidad.' : `Solo quedan ${stock} unidades.`;
  return null;
}
