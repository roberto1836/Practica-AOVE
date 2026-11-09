// Modelo de datos del catálogo: categorías y productos de Oleum.
// Solo datos, sin lógica. Los campos se llaman igual que las columnas de la base
// de datos de la Parte 2, para que el paso a JDBC sea un cambio de origen y no de forma.

export const categorias = [
  {
    id: 1,
    nombre: 'Cosecha temprana',
    descripcion: 'Aceites de los primeros días de campaña, verdes e intensos.'
  },
  {
    id: 2,
    nombre: 'Ecológico',
    descripcion: 'Aceites con certificación de agricultura ecológica.'
  },
  {
    id: 3,
    nombre: 'Uso diario',
    descripcion: 'Formatos grandes con el mejor precio por litro.'
  },
  {
    id: 4,
    nombre: 'Regalo y degustación',
    descripcion: 'Estuches, botellines y formatos pequeños para regalar o descubrir variedades.'
  }
];

// Productores inventados; orígenes (DOP) y variedades reales.
// El nombre del fichero de la imagen sale del nombre del producto, que es único,
// para que nunca haya dos productos apuntando a la misma ilustración.
export const productos = [
  // --- Cosecha temprana (categoría 1) ---
  {
    id: 1,
    categoria_id: 1,
    nombre: 'Primer Día Picual',
    productor: 'Almazara Cerro del Aguilón',
    origen: 'DOP Sierra Mágina',
    variedad: 'Picual',
    formato_ml: 500,
    precio: 18.95,
    stock: 34,
    imagen: 'assets/img/productos/primer-dia-picual.svg',
    activo: true,
    descripcion: 'Picual recogido en los primeros días de campaña, cuando la aceituna aún está verde. Huele a hierba recién cortada y hoja de tomate, con un amargor y un picor marcados. Para tostadas, ensaladas y para terminar platos en crudo.'
  },
  {
    id: 2,
    categoria_id: 1,
    nombre: 'Verde Temprano Cornicabra',
    productor: 'Molino del Tajuelo',
    origen: 'DOP Montes de Toledo',
    variedad: 'Cornicabra',
    formato_ml: 500,
    precio: 16.45,
    stock: 22,
    imagen: 'assets/img/productos/verde-temprano-cornicabra.svg',
    activo: true,
    descripcion: 'Cornicabra de cosecha temprana de los Montes de Toledo. Aroma a almendra verde y manzana, con un final picante y persistente. Va bien con gazpacho, legumbres y verduras a la plancha.'
  },
  {
    id: 3,
    categoria_id: 1,
    nombre: 'Envero Picudo',
    productor: 'Cortijo La Hoya del Almendro',
    origen: 'DOP Priego de Córdoba',
    variedad: 'Picudo',
    formato_ml: 750,
    precio: 24.90,
    stock: 15,
    imagen: 'assets/img/productos/envero-picudo.svg',
    activo: true,
    descripcion: 'Picudo recogido en envero, cuando la aceituna empieza a cambiar de color. Es frutado y suave, con notas de manzana y plátano verde y un amargor ligero. Adecuado para pescados, repostería y para quien empieza con los aceites tempranos.'
  },
  {
    id: 4,
    categoria_id: 1,
    nombre: 'Alba Royal',
    productor: 'Cortijo Navalcerrado',
    origen: 'DOP Sierra de Cazorla',
    variedad: 'Royal',
    formato_ml: 500,
    precio: 27.80,
    stock: 0, // Agotado: sirve para probar la etiqueta «Agotado» y el botón desactivado.
    imagen: 'assets/img/productos/alba-royal.svg',
    activo: true,
    descripcion: 'Aceite de la variedad Royal, poco común y propia de la Sierra de Cazorla. Frutado verde con recuerdos a alcachofa y hierba, y un picor equilibrado. Recomendado en crudo, sobre quesos frescos, carpaccios o pan.'
  },
  {
    id: 5,
    categoria_id: 1,
    nombre: 'Cosecha Nueva Hojiblanca',
    productor: 'Hacienda Cerro Gordillo',
    origen: 'DOP Estepa',
    variedad: 'Hojiblanca',
    formato_ml: 750,
    precio: 21.35,
    stock: 40,
    imagen: 'assets/img/productos/cosecha-nueva-hojiblanca.svg',
    activo: true,
    descripcion: 'Hojiblanca de primera cosecha de la comarca de Estepa. Aroma a hierba y alcachofa, con una entrada dulce y un final ligeramente amargo. Versátil: ensaladas, salmorejo y pescados al horno.'
  },

  // --- Ecológico (categoría 2) ---
  {
    id: 6,
    categoria_id: 2,
    nombre: 'Eco Arbequina Coll de Ginesta',
    productor: 'Masía Coll de Ginesta',
    origen: 'DOP Les Garrigues',
    variedad: 'Arbequina',
    formato_ml: 500,
    precio: 14.75,
    stock: 28,
    imagen: 'assets/img/productos/eco-arbequina-coll-de-ginesta.svg',
    activo: true,
    descripcion: 'Arbequina de cultivo ecológico certificado de Les Garrigues. Suave y afrutado, con notas de manzana madura y almendra y casi sin amargor. Ideal para mayonesas, repostería y platos delicados.'
  },
  {
    id: 7,
    categoria_id: 2,
    nombre: 'Eco Empeltre Val Alta',
    productor: 'Molino de la Val Alta',
    origen: 'DOP Aceite del Bajo Aragón',
    variedad: 'Empeltre',
    formato_ml: 750,
    precio: 19.60,
    stock: 18,
    imagen: 'assets/img/productos/eco-empeltre-val-alta.svg',
    activo: true,
    descripcion: 'Empeltre ecológico del Bajo Aragón, de color dorado y sabor dulce. Recuerda a fruta madura y frutos secos, con un picor muy suave. Para verduras asadas, pescados blancos y bizcochos.'
  },
  {
    id: 8,
    categoria_id: 2,
    nombre: 'Eco Manzanilla Cacereña',
    productor: 'Lagar Peña Canchera',
    origen: 'DOP Gata-Hurdes',
    variedad: 'Manzanilla Cacereña',
    formato_ml: 500,
    precio: 17.25,
    stock: 12,
    imagen: 'assets/img/productos/eco-manzanilla-cacerena.svg',
    activo: true,
    descripcion: 'Manzanilla Cacereña de olivares ecológicos de la Sierra de Gata. Frutado medio con aroma a hierba y manzana, y un amargor y un picor equilibrados. Buena opción para ensaladas, tostadas y guisos suaves.'
  },
  {
    id: 9,
    categoria_id: 2,
    nombre: 'Eco Picual Tres Fuentes',
    productor: 'Cortijo Las Tres Fuentes',
    origen: 'DOP Sierra Mágina',
    variedad: 'Picual',
    formato_ml: 1000,
    precio: 23.40,
    stock: 9,
    imagen: 'assets/img/productos/eco-picual-tres-fuentes.svg',
    activo: true,
    descripcion: 'Picual ecológico de Sierra Mágina en lata de un litro, que protege el aceite de la luz. Intenso y herbáceo, con el amargor propio de la variedad. Aguanta bien el calor, así que sirve también para guisar y freír.'
  },
  {
    id: 10,
    categoria_id: 2,
    nombre: 'Eco Coupage Campo Alto',
    productor: 'Almazara Campo Alto',
    origen: 'DOP Baena',
    variedad: 'Coupage',
    formato_ml: 750,
    precio: 15.90,
    stock: 25,
    imagen: 'assets/img/productos/eco-coupage-campo-alto.svg',
    activo: true,
    descripcion: 'Coupage ecológico de Picual y Hojiblanca de la DOP Baena. La Picual aporta cuerpo y la Hojiblanca un punto dulce, con un resultado equilibrado. Un aceite para todo: en crudo, en guisos y en asados.'
  },

  // --- Uso diario (categoría 3): de 1000 a 5000 ml ---
  {
    id: 11,
    categoria_id: 3,
    nombre: 'Diario Picual 1 L',
    productor: 'Almazara Cerro del Aguilón',
    origen: 'DOP Sierra Mágina',
    variedad: 'Picual',
    formato_ml: 1000,
    precio: 11.95,
    stock: 60,
    imagen: 'assets/img/productos/diario-picual-1-l.svg',
    activo: true,
    descripcion: 'Picual de Sierra Mágina en lata de un litro para el uso de cada día. Frutado intenso y estable al calor. Para cocinar, guisar y freír con un virgen extra.'
  },
  {
    id: 12,
    categoria_id: 3,
    nombre: 'Garrafa Hojiblanca 3 L',
    productor: 'Hacienda Cerro Gordillo',
    origen: 'DOP Estepa',
    variedad: 'Hojiblanca',
    formato_ml: 3000,
    precio: 32.70,
    stock: 45,
    imagen: 'assets/img/productos/garrafa-hojiblanca-3-l.svg',
    activo: true,
    descripcion: 'Hojiblanca de Estepa en garrafa de tres litros. Sabor suave y ligeramente dulce, que no tapa el de los alimentos. Pensado para la cocina diaria de una familia.'
  },
  {
    id: 13,
    categoria_id: 3,
    nombre: 'Garrafa Picual 5 L',
    productor: 'Cortijo Las Tres Fuentes',
    origen: 'DOP Sierra Mágina',
    variedad: 'Picual',
    formato_ml: 5000,
    precio: 44.45,
    stock: 30,
    imagen: 'assets/img/productos/garrafa-picual-5-l.svg',
    activo: true,
    descripcion: 'Picual de Sierra Mágina en garrafa de cinco litros. Aroma a hoja de olivo y sabor con cuerpo. Soporta bien las temperaturas altas, por lo que es una buena elección para freír.'
  },
  {
    id: 14,
    categoria_id: 3,
    nombre: 'Garrafa Coupage 5 L',
    productor: 'Almazara Campo Alto',
    origen: 'DOP Baena',
    variedad: 'Coupage',
    formato_ml: 5000,
    precio: 39.95,
    stock: 0, // Segundo agotado, en otra categoría, para verlo también en la rejilla de «Uso diario».
    imagen: 'assets/img/productos/garrafa-coupage-5-l.svg',
    activo: true,
    descripcion: 'Coupage de Picual y Hojiblanca de la DOP Baena en garrafa de cinco litros. Equilibrado, con un amargor y un picor moderados. Para guisos, frituras y aliños de todos los días.'
  },
  {
    id: 15,
    categoria_id: 3,
    nombre: 'Garrafa Arbequina 5 L',
    productor: 'Masía Coll de Ginesta',
    origen: 'DOP Les Garrigues',
    variedad: 'Arbequina',
    formato_ml: 5000,
    precio: 57.90,
    stock: 14,
    imagen: 'assets/img/productos/garrafa-arbequina-5-l.svg',
    activo: true,
    descripcion: 'Arbequina de Les Garrigues en garrafa de cinco litros. Suave y afrutado, con un sabor que gusta a casi todos. Para aliñar, hornear y preparar salsas.'
  },

  // --- Regalo y degustación (categoría 4): de 100 a 500 ml ---
  {
    id: 16,
    categoria_id: 4,
    nombre: 'Botellín Degustación Royal',
    productor: 'Cortijo Navalcerrado',
    origen: 'DOP Sierra de Cazorla',
    variedad: 'Royal',
    formato_ml: 100,
    precio: 5.95,
    stock: 50,
    imagen: 'assets/img/productos/botellin-degustacion-royal.svg',
    activo: true,
    descripcion: 'Botellín de 100 ml para probar la variedad Royal de la Sierra de Cazorla. Frutado verde, con notas de alcachofa y un picor equilibrado. Un buen detalle para regalar o para catar junto a otros aceites.'
  },
  {
    id: 17,
    categoria_id: 4,
    nombre: 'Botellín Empeltre 250 ml',
    productor: 'Molino de la Val Alta',
    origen: 'DOP Aceite del Bajo Aragón',
    variedad: 'Empeltre',
    formato_ml: 250,
    precio: 8.40,
    stock: 36,
    imagen: 'assets/img/productos/botellin-empeltre-250-ml.svg',
    activo: true,
    descripcion: 'Empeltre del Bajo Aragón en botellín de 250 ml. Dulce y suave, con recuerdos a frutos secos. Pensado como regalo o para descubrir una variedad poco conocida.'
  },
  {
    id: 18,
    categoria_id: 4,
    nombre: 'Estuche Picudo 250 ml',
    productor: 'Cortijo La Hoya del Almendro',
    origen: 'DOP Priego de Córdoba',
    variedad: 'Picudo',
    formato_ml: 250,
    precio: 12.85,
    stock: 24,
    imagen: 'assets/img/productos/estuche-picudo-250-ml.svg',
    activo: true,
    descripcion: 'Estuche con una botella de 250 ml de Picudo de Priego de Córdoba. Afrutado, con notas de manzana y hierba y un amargor ligero. Una presentación cuidada para regalar.'
  },
  {
    id: 19,
    categoria_id: 4,
    nombre: 'Botella Regalo Manzanilla Cacereña',
    productor: 'Lagar Peña Canchera',
    origen: 'DOP Gata-Hurdes',
    variedad: 'Manzanilla Cacereña',
    formato_ml: 500,
    precio: 13.60,
    stock: 16,
    imagen: 'assets/img/productos/botella-regalo-manzanilla-cacerena.svg',
    activo: true,
    descripcion: 'Manzanilla Cacereña de la Sierra de Gata en botella de 500 ml con presentación de regalo. Frutado medio, con aroma a hierba y un picor equilibrado. Acompaña bien a quesos, embutidos y pan.'
  },
  {
    id: 20,
    categoria_id: 4,
    nombre: 'Botellín Cornicabra 100 ml',
    productor: 'Molino del Tajuelo',
    origen: 'DOP Montes de Toledo',
    variedad: 'Cornicabra',
    formato_ml: 100,
    precio: 6.75,
    stock: 10,
    imagen: 'assets/img/productos/botellin-cornicabra-100-ml.svg',
    // Baja lógica: no se muestra en el catálogo, pero se conserva porque en la Parte 2
    // puede haber pedidos antiguos que lo referencian (borrarlo rompería esas filas).
    activo: false,
    descripcion: 'Botellín de 100 ml de Cornicabra de los Montes de Toledo. Aroma a almendra verde y un final picante. Pensado para catas y para regalar.'
  }
];

// Sincronización en tiempo de ejecución con las modificaciones del panel de administración
if (typeof sessionStorage !== 'undefined') {
  try {
    const modificado = sessionStorage.getItem('oleum_productos_admin');
    if (modificado) {
      const listaAdmin = JSON.parse(modificado);
      if (Array.isArray(listaAdmin) && listaAdmin.length > 0) {
        productos.length = 0;
        productos.push(...listaAdmin);
      }
    }
  } catch {
    // Si falla el acceso a sessionStorage se mantiene la semilla original
  }
}

export function obtenerTodosLosProductos() {
  return productos;
}

