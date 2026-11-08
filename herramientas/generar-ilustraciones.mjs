// Genera una ilustración SVG propia por producto a partir de proyecto/assets/js/datos/productos.js,
// y la imagen de reserva producto-sin-imagen.svg. Es una herramienta de desarrollo (no se despliega):
// si cambian los datos, se vuelve a ejecutar. Uso, desde la raíz: node herramientas/generar-ilustraciones.mjs

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { productos } from '../proyecto/assets/js/datos/productos.js';

// Las rutas de `imagen` son relativas a proyecto/, igual que las usan las páginas.
const CARPETA_PROYECTO = fileURLToPath(new URL('../proyecto/', import.meta.url));
const RUTA_SIN_IMAGEN = 'assets/img/producto-sin-imagen.svg';

// --- Lienzo ---
// Todas las ilustraciones comparten viewBox de 400 × 400 y la misma línea de suelo,
// para que en la rejilla los envases queden alineados y se compare su tamaño de un vistazo.
const CENTRO_X = 200;
const SUELO_Y = 372;
const TECHO_Y = 40;
const ALTURA_UTIL = SUELO_Y - TECHO_Y; // 332 px: el espacio vertical que puede ocupar un envase.
const RADIO_FONDO = 160; // Diámetro 320 = 80 % del cuadrado.
const OPACIDAD_FONDO = 0.13;

// Fracción de la altura útil que ocupa cada formato. El más pequeño no baja del 55 %
// para que no quede diminuto en la rejilla, pero se mantiene el orden de tamaños.
// Lata y garrafa son más bajas que la botella de 750 ml porque son más anchas, como en la realidad.
const ALTURA_POR_FORMATO = {
  100: 0.58,
  250: 0.67,
  500: 0.84,
  750: 0.94,
  1000: 0.76,
  3000: 0.8,
  5000: 0.9
};

const COLOR_CLARO = '#FFFDF5';

// Colores del envase según el material; la etiqueta y el fondo son lo único que cambia por variedad.
const COLORES_ENVASE = {
  vidrio: '#2E3A24',
  tapon: '#1E1E1C',
  metal: '#B9BDB8',
  metalOscuro: '#8E938D',
  plastico: '#C8B45A',
  plasticoOscuro: '#A8943E'
};

// Colores de la imagen de reserva: grises neutros, para que no se confunda con ningún producto.
const COLORES_SIN_IMAGEN = {
  envase: '#9A9C98',
  tapon: '#6E706C',
  etiqueta: '#C9CAC6',
  fondo: '#9A9C98'
};

// Paleta fija: una variedad siempre tiene el mismo color, así se reconoce en la rejilla.
const PALETA_POR_VARIEDAD = {
  'Picual': '#3F5A2A',
  'Cornicabra': '#6A4A1F',
  'Arbequina': '#7A5C12',
  'Picudo': '#4E3B63',
  'Hojiblanca': '#2F5552',
  'Empeltre': '#8A3B2B',
  'Manzanilla Cacereña': '#2F4B70',
  'Royal': '#6E2A3E',
  'Coupage': '#44443E'
};

// Ya no hay texto en la etiqueta, pero se mantiene el 4,5:1 entre el emblema claro y la etiqueta:
// es más exigente que el 3:1 que pide WCAG para gráficos, y así sirve también si un día vuelve el texto.
const CONTRASTE_MINIMO = 4.5;

// --- Contraste (fórmula de WCAG 2.1) ---

function luminanciaRelativa(colorHex) {
  const canales = [1, 3, 5].map((inicio) => parseInt(colorHex.slice(inicio, inicio + 2), 16) / 255);
  const lineales = canales.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lineales[0] + 0.7152 * lineales[1] + 0.0722 * lineales[2];
}

function contraste(colorA, colorB) {
  const [clara, oscura] = [luminanciaRelativa(colorA), luminanciaRelativa(colorB)].sort((a, b) => b - a);
  return (clara + 0.05) / (oscura + 0.05);
}

// Falla antes de escribir nada: mejor no generar imágenes que generarlas con poco contraste.
function comprobarPaleta() {
  for (const [variedad, color] of Object.entries(PALETA_POR_VARIEDAD)) {
    const valor = contraste(color, COLOR_CLARO);
    if (valor < CONTRASTE_MINIMO) {
      throw new Error(`Contraste insuficiente en «${variedad}»: ${valor.toFixed(2)}:1`);
    }
  }
}

function colorDeVariedad(variedad) {
  const color = PALETA_POR_VARIEDAD[variedad];
  if (color === undefined) {
    throw new Error(`La variedad «${variedad}» no tiene color en la paleta.`);
  }
  return color;
}

function alturaDeFormato(formatoMl) {
  const fraccion = ALTURA_POR_FORMATO[formatoMl];
  if (fraccion === undefined) {
    throw new Error(`El formato de ${formatoMl} ml no tiene altura definida.`);
  }
  return ALTURA_UTIL * fraccion;
}

// Redondea a una décima: el SVG queda más legible y la diferencia no se ve.
function r(numero) {
  return Math.round(numero * 10) / 10;
}

// --- Siluetas ---
// Cada función recibe la altura del envase y devuelve su dibujo, su ancho (para la sombra)
// y el rectángulo de la etiqueta. Todas las medidas son proporciones de la altura,
// así un mismo envase se puede dibujar a cualquier tamaño sin retocar coordenadas.

// Botella y botellín comparten forma; el botellín es más ancho en proporción (más rechoncho).
function botellaGenerica(altura, proporcionAncho, colores) {
  const ancho = altura * proporcionAncho;
  const izquierda = CENTRO_X - ancho / 2;
  const derecha = CENTRO_X + ancho / 2;
  const anchoCuello = ancho * 0.36;
  const cuelloIzquierda = CENTRO_X - anchoCuello / 2;
  const cuelloDerecha = CENTRO_X + anchoCuello / 2;
  const hombroY = SUELO_Y - altura * 0.6;
  const cuelloY = SUELO_Y - altura * 0.74;
  const bocaY = SUELO_Y - altura * 0.9;
  const curva1 = cuelloY + (hombroY - cuelloY) * 0.33;
  const curva2 = cuelloY + (hombroY - cuelloY) * 0.47;
  const radio = ancho * 0.1;
  const anchoTapon = anchoCuello * 1.18;
  const anchoAnilla = anchoCuello * 1.3;

  const cuerpo = `M${r(cuelloIzquierda)} ${r(bocaY)} L${r(cuelloIzquierda)} ${r(cuelloY)} `
    + `C${r(cuelloIzquierda)} ${r(curva1)} ${r(izquierda)} ${r(curva2)} ${r(izquierda)} ${r(hombroY)} `
    + `L${r(izquierda)} ${r(SUELO_Y - radio)} Q${r(izquierda)} ${SUELO_Y} ${r(izquierda + radio)} ${SUELO_Y} `
    + `L${r(derecha - radio)} ${SUELO_Y} Q${r(derecha)} ${SUELO_Y} ${r(derecha)} ${r(SUELO_Y - radio)} `
    + `L${r(derecha)} ${r(hombroY)} C${r(derecha)} ${r(curva2)} ${r(cuelloDerecha)} ${r(curva1)} ${r(cuelloDerecha)} ${r(cuelloY)} `
    + `L${r(cuelloDerecha)} ${r(bocaY)} Z`;

  const altoEtiqueta = altura * 0.38;
  return {
    ancho,
    dibujo: `
  <path d="${cuerpo}" fill="${colores.envase}"/>
  <rect x="${r(CENTRO_X - anchoTapon / 2)}" y="${r(SUELO_Y - altura)}" width="${r(anchoTapon)}" height="${r(altura * 0.1)}" rx="3" fill="${colores.tapon}"/>
  <rect x="${r(CENTRO_X - anchoAnilla / 2)}" y="${r(bocaY - altura * 0.012)}" width="${r(anchoAnilla)}" height="${r(altura * 0.025)}" rx="2" fill="${colores.tapon}"/>`,
    etiqueta: {
      x: izquierda + ancho * 0.08,
      y: SUELO_Y - altura * 0.28 - altoEtiqueta / 2,
      ancho: ancho * 0.84,
      alto: altoEtiqueta
    },
    reflejo: {
      x: izquierda + ancho * 0.13,
      y: hombroY + altura * 0.03,
      ancho: ancho * 0.07,
      alto: SUELO_Y - hombroY - altura * 0.08
    }
  };
}

function botella(altura, colores) {
  return botellaGenerica(altura, 0.36, colores);
}

function botellin(altura, colores) {
  return botellaGenerica(altura, 0.44, colores);
}

function lata(altura, colores) {
  const ancho = altura * 0.66;
  const izquierda = CENTRO_X - ancho / 2;
  const tapaY = SUELO_Y - altura * 0.9;
  const altoTapa = altura * 0.05;
  const anchoTapon = ancho * 0.18;
  const altoEtiqueta = altura * 0.56;
  return {
    ancho,
    dibujo: `
  <rect x="${r(izquierda + ancho * 0.66)}" y="${r(SUELO_Y - altura)}" width="${r(anchoTapon)}" height="${r(altura * 0.12)}" rx="3" fill="${colores.tapon}"/>
  <rect x="${r(izquierda)}" y="${r(tapaY)}" width="${r(ancho)}" height="${r(SUELO_Y - tapaY)}" rx="6" fill="${colores.envase}"/>
  <rect x="${r(izquierda - 4)}" y="${r(tapaY - altoTapa / 2)}" width="${r(ancho + 8)}" height="${r(altoTapa)}" rx="3" fill="${colores.borde}"/>
  <rect x="${r(izquierda - 4)}" y="${r(SUELO_Y - altoTapa * 0.8)}" width="${r(ancho + 8)}" height="${r(altoTapa * 0.8)}" rx="3" fill="${colores.borde}"/>`,
    etiqueta: {
      x: izquierda + ancho * 0.1,
      y: SUELO_Y - altura * 0.44 - altoEtiqueta / 2,
      ancho: ancho * 0.8,
      alto: altoEtiqueta
    },
    reflejo: {
      x: izquierda + ancho * 0.05,
      y: tapaY + altoTapa,
      ancho: ancho * 0.05,
      alto: SUELO_Y - tapaY - altoTapa * 2
    }
  };
}

function garrafa(altura, colores) {
  const ancho = altura * 0.9;
  const izquierda = CENTRO_X - ancho / 2;
  const derecha = CENTRO_X + ancho / 2;
  const hombroY = SUELO_Y - altura * 0.72;
  const radio = ancho * 0.13;
  const cuelloX = izquierda + ancho * 0.16;
  const anchoCuello = ancho * 0.2;
  const anchoTapon = ancho * 0.26;
  const asaIzquierda = CENTRO_X + ancho * 0.04;
  const asaDerecha = derecha - ancho * 0.16;
  const asaArriba = SUELO_Y - altura * 0.92;
  const curvaAsa = ancho * 0.07;
  const grosorAsa = ancho * 0.07;
  const altoEtiqueta = altura * 0.42;

  const cuerpo = `M${r(izquierda + radio)} ${r(hombroY)} L${r(derecha - radio)} ${r(hombroY)} `
    + `Q${r(derecha)} ${r(hombroY)} ${r(derecha)} ${r(hombroY + radio)} `
    + `L${r(derecha)} ${r(SUELO_Y - radio)} Q${r(derecha)} ${SUELO_Y} ${r(derecha - radio)} ${SUELO_Y} `
    + `L${r(izquierda + radio)} ${SUELO_Y} Q${r(izquierda)} ${SUELO_Y} ${r(izquierda)} ${r(SUELO_Y - radio)} `
    + `L${r(izquierda)} ${r(hombroY + radio)} Q${r(izquierda)} ${r(hombroY)} ${r(izquierda + radio)} ${r(hombroY)} Z`;

  const asa = `M${r(asaIzquierda)} ${r(hombroY + 2)} L${r(asaIzquierda)} ${r(asaArriba + curvaAsa)} `
    + `Q${r(asaIzquierda)} ${r(asaArriba)} ${r(asaIzquierda + curvaAsa)} ${r(asaArriba)} `
    + `L${r(asaDerecha - curvaAsa)} ${r(asaArriba)} Q${r(asaDerecha)} ${r(asaArriba)} ${r(asaDerecha)} ${r(asaArriba + curvaAsa)} `
    + `L${r(asaDerecha)} ${r(hombroY + 2)}`;

  return {
    ancho,
    dibujo: `
  <path d="${asa}" fill="none" stroke="${colores.borde}" stroke-width="${r(grosorAsa)}" stroke-linejoin="round"/>
  <rect x="${r(cuelloX)}" y="${r(SUELO_Y - altura * 0.86)}" width="${r(anchoCuello)}" height="${r(altura * 0.16)}" rx="3" fill="${colores.borde}"/>
  <rect x="${r(cuelloX + anchoCuello / 2 - anchoTapon / 2)}" y="${r(SUELO_Y - altura)}" width="${r(anchoTapon)}" height="${r(altura * 0.16)}" rx="4" fill="${colores.tapon}"/>
  <path d="${cuerpo}" fill="${colores.envase}"/>`,
    etiqueta: {
      x: izquierda + ancho * 0.15,
      y: SUELO_Y - altura * 0.36 - altoEtiqueta / 2,
      ancho: ancho * 0.7,
      alto: altoEtiqueta
    },
    reflejo: {
      x: izquierda + ancho * 0.06,
      y: hombroY + radio,
      ancho: ancho * 0.04,
      alto: SUELO_Y - hombroY - radio * 2
    }
  };
}

// Los rangos son los del encargo: botellín 100-250, botella 500-750, lata 1000, garrafa 3000-5000.
function siluetaSegunFormato(formatoMl) {
  const altura = alturaDeFormato(formatoMl);
  if (formatoMl <= 250) return botellin(altura, { envase: COLORES_ENVASE.vidrio, tapon: COLORES_ENVASE.tapon });
  if (formatoMl <= 750) return botella(altura, { envase: COLORES_ENVASE.vidrio, tapon: COLORES_ENVASE.tapon });
  if (formatoMl <= 1000) {
    return lata(altura, { envase: COLORES_ENVASE.metal, borde: COLORES_ENVASE.metalOscuro, tapon: COLORES_ENVASE.tapon });
  }
  return garrafa(altura, { envase: COLORES_ENVASE.plastico, borde: COLORES_ENVASE.plasticoOscuro, tapon: COLORES_ENVASE.tapon });
}

// --- Piezas comunes ---

function dibujarFondo(color) {
  return `
  <circle cx="${CENTRO_X}" cy="200" r="${RADIO_FONDO}" fill="${color}" fill-opacity="${OPACIDAD_FONDO}"/>`;
}

// Sombra casi imperceptible: solo sirve para "posar" el envase en el suelo.
function dibujarSombra(anchoEnvase) {
  return `
  <ellipse cx="${CENTRO_X}" cy="${SUELO_Y}" rx="${r(anchoEnvase * 0.62)}" ry="7" fill="#000000" fill-opacity="0.1"/>`;
}

// Franja clara a baja opacidad: da volumen sin salir del estilo plano.
function dibujarReflejo({ x, y, ancho, alto }) {
  return `
  <rect x="${r(x)}" y="${r(y)}" width="${r(ancho)}" height="${r(alto)}" rx="${r(ancho / 2)}" fill="#FFFFFF" fill-opacity="0.16"/>`;
}

// Una hoja apuntando hacia +x, de longitud `largo`; el nervio central va en el color de la etiqueta.
function dibujarHoja(largo, colorNervio, angulo) {
  const media = largo * 0.22;
  return `<g transform="rotate(${angulo})">`
    + `<path d="M0 0 Q${r(largo / 2)} ${r(-media)} ${r(largo)} 0 Q${r(largo / 2)} ${r(media)} 0 0 Z" fill="${COLOR_CLARO}"/>`
    + `<line x1="${r(largo * 0.12)}" y1="0" x2="${r(largo * 0.82)}" y2="0" stroke="${colorNervio}" stroke-width="${r(Math.max(largo * 0.035, 0.6))}" stroke-linecap="round"/>`
    + `</g>`;
}

// Emblema: dos hojas en V que salen de un tallo corto. Su tamaño depende de la etiqueta,
// así se ve igual de equilibrado en un botellín que en una garrafa.
function dibujarEmblema({ x, y, ancho, alto }, colorEtiqueta) {
  const tamano = Math.min(ancho, alto) * 0.62;
  const largoHoja = tamano * 0.62;
  const alturaHojas = largoHoja * Math.sin((55 * Math.PI) / 180);
  const largoTallo = tamano * 0.14;
  // Centra en vertical el conjunto hojas + tallo dentro de la etiqueta.
  const baseX = x + ancho / 2;
  const baseY = y + alto / 2 + (alturaHojas - largoTallo) / 2;
  return `
  <g transform="translate(${r(baseX)} ${r(baseY)})">
    ${dibujarHoja(largoHoja, colorEtiqueta, -55)}
    ${dibujarHoja(largoHoja, colorEtiqueta, -125)}
    <line x1="0" y1="0" x2="0" y2="${r(largoTallo)}" stroke="${COLOR_CLARO}" stroke-width="${r(Math.max(largoHoja * 0.06, 1))}" stroke-linecap="round"/>
  </g>`;
}

function dibujarEtiqueta(rectangulo, color) {
  const { x, y, ancho, alto } = rectangulo;
  return `
  <rect x="${r(x)}" y="${r(y)}" width="${r(ancho)}" height="${r(alto)}" rx="3" fill="${color}"/>${dibujarEmblema(rectangulo, color)}`;
}

// Escapa los caracteres especiales de XML: el título viene de los datos y no debe romper el SVG.
function escaparXml(texto) {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function montarSvg(titulo, contenido) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img">
  <title>${escaparXml(titulo)}</title>${contenido}
</svg>
`;
}

// El orden de las capas importa: fondo, sombra, envase, etiqueta y, encima de todo, el reflejo.
function svgDeProducto(producto) {
  const color = colorDeVariedad(producto.variedad);
  const silueta = siluetaSegunFormato(producto.formato_ml);
  return montarSvg(
    producto.nombre,
    dibujarFondo(color) + dibujarSombra(silueta.ancho) + silueta.dibujo
      + dibujarEtiqueta(silueta.etiqueta, color) + dibujarReflejo(silueta.reflejo)
  );
}

// Imagen de reserva: una botella gris sin emblema, para que no parezca un producto concreto.
function svgSinImagen() {
  const silueta = botella(alturaDeFormato(750), { envase: COLORES_SIN_IMAGEN.envase, tapon: COLORES_SIN_IMAGEN.tapon });
  const { x, y, ancho, alto } = silueta.etiqueta;
  return montarSvg(
    'Imagen no disponible',
    dibujarFondo(COLORES_SIN_IMAGEN.fondo) + dibujarSombra(silueta.ancho) + silueta.dibujo
      + `
  <rect x="${r(x)}" y="${r(y)}" width="${r(ancho)}" height="${r(alto)}" rx="3" fill="${COLORES_SIN_IMAGEN.etiqueta}"/>`
      + dibujarReflejo(silueta.reflejo)
  );
}

// --- Escritura ---

async function escribirSvg(rutaRelativa, contenido) {
  const ruta = path.join(CARPETA_PROYECTO, rutaRelativa);
  await mkdir(path.dirname(ruta), { recursive: true });
  await writeFile(ruta, contenido, 'utf8');
  console.log(`✓ ${rutaRelativa}`);
}

async function generarTodas() {
  comprobarPaleta();
  for (const producto of productos) {
    await escribirSvg(producto.imagen, svgDeProducto(producto));
  }
  await escribirSvg(RUTA_SIN_IMAGEN, svgSinImagen());
  console.log(`Generadas ${productos.length} ilustraciones de producto y la imagen de reserva.`);
}

await generarTodas();
