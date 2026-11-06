// Genera una ilustración SVG propia por producto a partir de proyecto/assets/js/datos/productos.js.
// Es una herramienta de desarrollo (no se despliega): si cambian los datos, se vuelve a ejecutar
// y salen las mismas imágenes. Uso, desde la raíz del repo: node herramientas/generar-ilustraciones.mjs

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { productos } from '../proyecto/assets/js/datos/productos.js';

// Las rutas de `imagen` son relativas a proyecto/, igual que las usan las páginas.
const CARPETA_PROYECTO = fileURLToPath(new URL('../proyecto/', import.meta.url));

const COLOR_TEXTO_ETIQUETA = '#FFFDF5';
const FUENTE = "Georgia, 'Times New Roman', serif"; // Fuentes del sistema: nada externo.

// Colores del envase según el material; la etiqueta es la única parte que cambia por variedad.
const COLORES_ENVASE = {
  vidrio: '#2E3A24',
  tapon: '#1E1E1C',
  metal: '#B9BDB8',
  metalOscuro: '#8E938D',
  plastico: '#C8B45A',
  plasticoOscuro: '#A8943E'
};

// Paleta fija: una variedad siempre tiene el mismo color, así se reconoce en la rejilla.
// Todos son oscuros para que el texto claro cumpla el contraste AA (se comprueba abajo).
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

// Falla antes de escribir nada: mejor no generar imágenes que generarlas ilegibles.
function comprobarPaleta() {
  for (const [variedad, color] of Object.entries(PALETA_POR_VARIEDAD)) {
    const valor = contraste(color, COLOR_TEXTO_ETIQUETA);
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

// --- Siluetas ---
// Todas apoyan en la misma línea de suelo (y = 380) dentro de un viewBox de 400 × 400,
// para que en la rejilla los envases queden alineados y se note la diferencia de tamaño.

function botellin() {
  return {
    dibujo: `
  <path d="M186 167 L186 195 C186 210 160 214 160 238 L160 370 Q160 380 170 380 L230 380 Q240 380 240 370 L240 238 C240 214 214 210 214 195 L214 167 Z" fill="${COLORES_ENVASE.vidrio}"/>
  <rect x="181" y="163" width="38" height="7" rx="3" fill="${COLORES_ENVASE.tapon}"/>
  <rect x="183" y="140" width="34" height="26" rx="3" fill="${COLORES_ENVASE.tapon}"/>`,
    etiqueta: { x: 166, y: 268, ancho: 68, alto: 86 }
  };
}

function botella() {
  return {
    dibujo: `
  <path d="M178 66 L178 100 C178 120 140 128 140 160 L140 368 Q140 380 152 380 L248 380 Q260 380 260 368 L260 160 C260 128 222 120 222 100 L222 66 Z" fill="${COLORES_ENVASE.vidrio}"/>
  <rect x="172" y="60" width="56" height="9" rx="3" fill="${COLORES_ENVASE.tapon}"/>
  <rect x="174" y="28" width="52" height="36" rx="4" fill="${COLORES_ENVASE.tapon}"/>`,
    etiqueta: { x: 150, y: 206, ancho: 100, alto: 124 }
  };
}

function lata() {
  return {
    dibujo: `
  <rect x="236" y="90" width="30" height="26" rx="4" fill="${COLORES_ENVASE.tapon}"/>
  <rect x="120" y="118" width="160" height="258" rx="8" fill="${COLORES_ENVASE.metal}"/>
  <rect x="116" y="110" width="168" height="14" rx="4" fill="${COLORES_ENVASE.metalOscuro}"/>
  <rect x="116" y="370" width="168" height="10" rx="4" fill="${COLORES_ENVASE.metalOscuro}"/>`,
    etiqueta: { x: 132, y: 168, ancho: 136, alto: 170 }
  };
}

function garrafa() {
  return {
    dibujo: `
  <path d="M206 152 L206 114 Q206 100 220 100 L256 100 Q270 100 270 114 L270 152" fill="none" stroke="${COLORES_ENVASE.plasticoOscuro}" stroke-width="16" stroke-linejoin="round"/>
  <rect x="136" y="112" width="40" height="44" rx="4" fill="${COLORES_ENVASE.plasticoOscuro}"/>
  <rect x="130" y="88" width="52" height="28" rx="4" fill="${COLORES_ENVASE.tapon}"/>
  <path d="M140 150 L260 150 Q295 150 295 185 L295 356 Q295 380 271 380 L129 380 Q105 380 105 356 L105 185 Q105 150 140 150 Z" fill="${COLORES_ENVASE.plastico}"/>`,
    etiqueta: { x: 132, y: 212, ancho: 136, alto: 124 }
  };
}

// Los rangos son los del encargo: botellín 100-250, botella 500-750, lata 1000, garrafa 3000-5000.
function siluetaSegunFormato(formatoMl) {
  if (formatoMl <= 250) return botellin();
  if (formatoMl <= 750) return botella();
  if (formatoMl <= 1000) return lata();
  return garrafa();
}

// --- Etiqueta ---

// Escapa los caracteres especiales de XML: el texto viene de los datos y no debe romper el SVG.
function escaparXml(texto) {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Los nombres de dos palabras (Manzanilla Cacereña) van en dos líneas para que quepan sin encoger demasiado.
function lineasDeTexto(variedad) {
  return variedad.split(' ');
}

// Calcula el tamaño de letra para que la línea más larga quepa en el ancho de la etiqueta.
// 0,6 es una aproximación del ancho medio de una letra serif respecto a su tamaño.
function tamanoDeLetra(lineas, ancho, alto) {
  const caracteresMaximos = Math.max(...lineas.map((linea) => linea.length));
  const porAncho = (ancho * 0.82) / (caracteresMaximos * 0.6);
  const porAlto = (alto * 0.5) / (lineas.length * 1.25);
  return Math.min(porAncho, porAlto, 26);
}

function dibujarEtiqueta(variedad, { x, y, ancho, alto }) {
  const lineas = lineasDeTexto(variedad);
  const tamano = tamanoDeLetra(lineas, ancho, alto);
  const interlineado = tamano * 1.25;
  const centroX = x + ancho / 2;
  const centroY = y + alto / 2;
  // 0,35 × tamaño baja la línea base para que el texto quede centrado a ojo en vertical.
  const primeraLineaY = centroY - ((lineas.length - 1) * interlineado) / 2 + tamano * 0.35;
  const margen = Math.round(ancho * 0.1);

  const textos = lineas
    .map((linea, indice) => {
      const lineaY = (primeraLineaY + indice * interlineado).toFixed(1);
      return `<text x="${centroX}" y="${lineaY}" text-anchor="middle" font-family="${FUENTE}" font-size="${tamano.toFixed(1)}" fill="${COLOR_TEXTO_ETIQUETA}">${escaparXml(linea)}</text>`;
    })
    .join('\n  ');

  return `
  <rect x="${x}" y="${y}" width="${ancho}" height="${alto}" rx="4" fill="${colorDeVariedad(variedad)}"/>
  <line x1="${x + margen}" y1="${y + 10}" x2="${x + ancho - margen}" y2="${y + 10}" stroke="${COLOR_TEXTO_ETIQUETA}" stroke-width="1" stroke-opacity="0.7"/>
  <line x1="${x + margen}" y1="${y + alto - 10}" x2="${x + ancho - margen}" y2="${y + alto - 10}" stroke="${COLOR_TEXTO_ETIQUETA}" stroke-width="1" stroke-opacity="0.7"/>
  ${textos}`;
}

// --- Montaje y escritura ---

function svgDeProducto(producto) {
  const silueta = siluetaSegunFormato(producto.formato_ml);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img">
  <title>${escaparXml(producto.nombre)}</title>${silueta.dibujo}${dibujarEtiqueta(producto.variedad, silueta.etiqueta)}
</svg>
`;
}

async function escribirIlustracion(producto) {
  const ruta = path.join(CARPETA_PROYECTO, producto.imagen);
  await mkdir(path.dirname(ruta), { recursive: true });
  await writeFile(ruta, svgDeProducto(producto), 'utf8');
  return ruta;
}

async function generarTodas() {
  comprobarPaleta();
  for (const producto of productos) {
    const ruta = await escribirIlustracion(producto);
    console.log(`✓ ${producto.id}. ${path.relative(CARPETA_PROYECTO, ruta)}`);
  }
  console.log(`Generadas ${productos.length} ilustraciones.`);
}

await generarTodas();
