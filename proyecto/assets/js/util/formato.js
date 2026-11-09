// Formato de precios y volúmenes para mostrarlos en español. Lo comparten todas las páginas
// (también las de B y C), así que un precio se escribe igual en el catálogo, el carrito y los pedidos.

// Se crean una sola vez: construir un Intl.NumberFormat en cada llamada es más lento y no aporta nada.
const formateadorEuros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const formateadorLitros = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });

const MILILITROS_POR_LITRO = 1000;

// "12,50 €". Intl pone la coma decimal y un espacio que no se parte entre el número y el símbolo.
export function formatearPrecio(euros) {
  return formateadorEuros.format(euros);
}

// "750 ml" por debajo del litro; a partir de ahí "1 L", "1,5 L" o "5 L", que es como se leen en una etiqueta.
export function formatearVolumen(ml) {
  if (ml < MILILITROS_POR_LITRO) {
    return `${ml} ml`;
  }
  return `${formateadorLitros.format(ml / MILILITROS_POR_LITRO)} L`;
}

// Devuelve un número (sin redondear) para poder compararlo u ordenar por él; el redondeo es cosa del formato.
export function precioPorLitro(euros, ml) {
  return (euros * MILILITROS_POR_LITRO) / ml;
}

// "25,00 € por litro": un lector de pantalla lee "€/L" de forma confusa, "por litro" se entiende siempre.
export function formatearPrecioPorLitro(euros, ml) {
  return `${formatearPrecio(precioPorLitro(euros, ml))} por litro`;
}
