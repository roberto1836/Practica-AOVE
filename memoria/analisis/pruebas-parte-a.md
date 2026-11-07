# Pruebas y calidad · Parte A (inicio, catálogo y ficha)

La Parte A se ha probado en tres niveles: pruebas automáticas de la lógica, pruebas de cada criterio de aceptación en el navegador y auditorías de calidad (validadores del W3C, Lighthouse, contraste y teclado). Todas las pruebas dan el resultado esperado.

| Nivel | Herramienta | Resultado |
| --- | --- | --- |
| Lógica del catálogo (`filtros.js`) | `node --test` (27 pruebas, `pruebas/filtros.test.mjs`) | 27 de 27 correctas |
| Criterios de aceptación | Navegador Chromium, guion automático + repaso manual | 36 de 36 correctas, sin errores en consola |
| HTML | Validador del W3C (validator.w3.org/nu) | 0 errores y 0 avisos en las 3 páginas |
| CSS | Validador CSS del W3C (jigsaw.w3.org) | 0 errores; avisos justificados abajo |
| Accesibilidad, buenas prácticas y SEO | Lighthouse 12, móvil y escritorio | 100 en las tres categorías y en las 3 páginas |
| Contraste | Cálculo WCAG 2.1 de cada par de colores | Todos los textos ≥ 4,5:1 (el más justo, 5,97:1) |
| Teclado | Recorrido con Tab en las 3 páginas | Orden lógico y foco siempre visible |
| Anchos | 375, 600, 768 y 1280 px | Sin solapamientos ni desplazamiento horizontal |

## Matriz de casos de prueba

Datos de prueba: los 20 productos de `datos/productos.js` (19 activos, 2 agotados: ids 4 y 14, y 1 dado de baja: id 20). Sesión simulada con `sustitutos/sesion.js`.

| Id | Historia | Datos y pasos | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- | --- |
| P-01 | VIS-01 | Abrir `index.html` | 4 destacados, uno por categoría y todos con stock; 4 accesos por categoría | Correcto: Primer Día Picual, Eco Arbequina Coll de Ginesta, Diario Picual 1 L y Botellín Degustación Royal |
| P-02 | VIS-01 | Pulsar el acceso «Regalo y degustación» | Se abre `productos.html?categoria=4` con esa categoría marcada | Correcto |
| P-03 | VIS-02 | Abrir `productos.html` | 9 tarjetas con imagen, nombre, variedad, formato, precio y disponibilidad; «Mostrando 19 aceites · página 1 de 3» | Correcto |
| P-04 | VIS-02 | Abrir el catálogo y buscar el producto 20 | El producto dado de baja no aparece en ninguna página | Correcto |
| P-05 | VIS-02 | `productos.html?categoria=1` | Alba Royal aparece con «Agotado», en gris y al final | Correcto |
| P-06 | VIS-03 | Escribir «cacerena» en el buscador | Salen los 2 aceites de Manzanilla Cacereña; el texto sigue en el buscador | Correcto |
| P-07 | VIS-03 | Escribir «magina» | Salen los aceites de DOP Sierra Mágina (búsqueda sin tildes) | Correcto |
| P-08 | VIS-03 (error) | `productos.html?q=zzzz` | «Ningún aceite coincide con los filtros» y el mensaje que propone quitarlos; sin paginación | Correcto |
| P-09 | VIS-04 | Marcar «Cosecha temprana» y «Regalo y degustación» | Solo productos de esas 2 categorías; el listado cambia sin recargar | Correcto |
| P-10 | VIS-05 | `productos.html?variedad=royal` | Casilla «Royal» marcada aunque la URL no lleve mayúscula; solo aceites Royal | Correcto |
| P-11 | VIS-06 | `productos.html?min=10&max=15&orden=precio-desc` | Solo precios entre 10 y 15 €, ambos incluidos | Correcto: 14,75 €, 13,60 €, 12,85 € y 11,95 € |
| P-12 | VIS-06 (error) | `productos.html?min=30&max=10` | Error junto a los campos, los dos valores siguen escritos, no se filtra por precio | Correcto: «El precio «Desde» no puede ser mayor que el precio «Hasta».» y 19 aceites |
| P-13 | VIS-07 | Aplicar una búsqueda y una variedad | Una etiqueta por filtro con su botón «×» (`aria-label` «Quitar filtro: …») | Correcto |
| P-14 | VIS-07 | Quitar la última etiqueta con el teclado (Tab + Intro) | Se quita el filtro y el foco pasa al buscador | Correcto |
| P-15 | VIS-07 | Cambiar cualquier filtro | El contador se actualiza y se anuncia (`role="status"`, `aria-live`) | Correcto |
| P-16 | VIS-08 | Pulsar «Siguiente» | Página 2; enlace de la página actual con `aria-current="page"` | Correcto |
| P-17 | VIS-08 (error) | `productos.html?pagina=99` | Se muestra la página 3 (la última) y la URL se corrige | Correcto |
| P-18 | VIS-08 | Estando en la página 2, marcar un filtro | Se vuelve a la página 1 | Correcto |
| P-19 | VIS-09 | Filtrar por «Ecológico», abrir un producto y pulsar «Atrás» | El catálogo vuelve con el filtro y la misma URL | Correcto: `productos.html?categoria=2`, 5 aceites |
| P-20 | VIS-09 | Abrir la ficha desde el catálogo filtrado | La miga «Catálogo» apunta a la URL filtrada | Correcto |
| P-21 | VIS-10 | Ordenar por «Precio: de menor a mayor» y cambiar de página | Orden ascendente y se conserva en la URL al paginar | Correcto |
| P-22 | VIS-11 | `producto.html?id=1` | Ficha completa: 18,95 €, «37,90 € por litro», «Disponible · 34 unidades», migas y título «Primer Día Picual · Oleum» | Correcto |
| P-23 | VIS-11 (error) | `producto.html?id=20`, `?id=999`, `?id=abc` e `?id=` | «Producto no encontrado» con enlace al catálogo; un solo h1 | Correcto en los 4 casos |
| P-24 | VIS-12 | Sin sesión (`ROL_DE_PRUEBA = null`), pulsar «Añadir al carrito» | Ir a `login.html?volver=producto.html%3Fid%3D1` | Correcto |
| P-25 | CLI-01 | Cliente: cantidad 2 y «Añadir al carrito» | «Añadido al carrito: 2 × Primer Día Picual.» | Correcto |
| P-26 | CLI-01 (error) | Cantidad 0 | «La cantidad mínima es 1.» junto al campo, `aria-invalid` y foco en el campo | Correcto |
| P-27 | CLI-01 (error) | Cantidad 999 (stock 34) | «Solo quedan 34 unidades.»; no se añade nada | Correcto |
| P-28 | CLI-01 (error) | Tras añadir 2, intentar añadir 34 | El sustituto del carrito avisa de que se superaría el stock | Correcto: «Ya tienes 2 en el carrito y solo quedan 34 unidades.» |
| P-29 | CLI-01 | Botón − con la cantidad en 1; después + | El − explica el mínimo sin bajar de 1; el + sube a 2 | Correcto |
| P-30 | CLI-01 (error) | `producto.html?id=4` (agotado) | Controles desactivados y el botón dice «Agotado» | Correcto |
| P-31 | Rol admin | `ROL_DE_PRUEBA = 'admin'` y abrir una ficha | Sin formulario de compra; aviso de compra desactivada | Correcto |
| P-32 | VIS-13 | Recorrer las 3 páginas con Tab | «Saltar al contenido» primero, orden lógico y foco visible | Correcto |
| P-33 | VIS-13 | Desactivar JavaScript y abrir el catálogo | Aviso de `<noscript>`; los filtros siguen visibles y el botón «Filtros» se oculta | Correcto |
| P-34 | 5.3 | Abrir las 3 páginas a 375 y 1280 px | Sin solapamientos ni desplazamiento horizontal | Correcto (también a 600 y 768 px) |
| P-35 | 5.3 | Consola del navegador en todas las pruebas | Sin errores ni avisos | Correcto |
| P-36 | 3.3 | Precio, formato y precio por litro de todos los productos | Formato español («12,50 €», «750 ml», «5 L») | Correcto |

## Lighthouse

| Página | Rendimiento (móvil · escritorio) | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Inicio | 100 · 100 | 100 | 100 | 100 |
| Catálogo | 100 · 98 | 100 | 100 | 100 |
| Ficha | 100 · 100 | 100 | 100 | 100 |

El 98 del catálogo en escritorio se debe a un pequeño desplazamiento (CLS 0,09, por debajo del 0,1 que Lighthouse considera bueno): las casillas de categoría y variedad se pintan con JavaScript desde los datos. En la Parte 2 las genera la JSP en el servidor, así que desaparece.

Durante esta revisión, Lighthouse detectó dos «saltos» de la página al cargar (CLS de 0,67 en el catálogo y 0,43 en la ficha), que se corrigieron:

- Los filtros del móvil ya vienen plegados desde el HTML y el CSS, en vez de plegarlos el JavaScript al cargar. Sin JavaScript, `sin-js.css` (cargado desde un `<noscript>`) los muestra siempre.
- `main` tiene una altura mínima de una pantalla, así el pie no se mueve a la vista cuando el JavaScript pinta el contenido.

## Avisos del validador CSS (justificados)

- «Due to their dynamic nature, CSS variables are currently not statically checked» (113 avisos): el validador no comprueba los valores de las variables CSS porque se resuelven en el navegador. Usarlas es una decisión de diseño (el sistema visual común), así que el aviso es esperado.
- «Same color for background-color and border-color» (1 aviso, `.boton:disabled`): es intencionado; el botón desactivado no lleva borde visible.

## Evidencias

- Capturas en `memoria/evidencias/capturas/`: las 3 páginas en escritorio y móvil, y los estados probados (filtros aplicados, error de precio, sin resultados, paginación, agotado, no encontrado, error de cantidad, añadido al carrito, administrador y foco de teclado).
- Informes completos de Lighthouse en `memoria/evidencias/lighthouse/` (se abren con el navegador).
