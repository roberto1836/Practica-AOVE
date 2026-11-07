# Historias de usuario · Visitante (Parte A)

Formato: «Como [actor], quiero [acción], para [objetivo]». Cada criterio de aceptación se puede comprobar con un sí o un no. Los marcados como **(error)** cubren el camino triste. Los identificadores siguen el esquema del grupo: `VIS` visitante, `CLI` cliente, `ADM` administrador.

## VIS-01 · Ver la portada

Como visitante, quiero ver en la portada qué ofrece la tienda y algunos aceites destacados, para empezar a explorar sin tener que buscar.

- La portada muestra un aceite destacado de cada categoría, siempre con stock.
- Cada categoría tiene un acceso que abre el catálogo ya filtrado por ella.
- Desde la portada se llega al catálogo completo con un clic.

## VIS-02 · Ver el catálogo

Como visitante, quiero ver los aceites de la tienda en un listado, para hacerme una idea de lo que vende.

- Cada producto muestra imagen, nombre, variedad, formato, precio y disponibilidad.
- Se muestran como máximo 9 productos por página.
- Los productos dados de baja no aparecen.
- Los productos agotados aparecen con la etiqueta «Agotado».

## VIS-03 · Buscar por texto

Como visitante, quiero buscar escribiendo una palabra, para encontrar rápido un aceite que ya conozco.

- La búsqueda encuentra coincidencias en el nombre, el productor, el origen y la variedad.
- No distingue mayúsculas ni tildes: «jaen» encuentra «Jaén».
- El texto buscado sigue escrito en el buscador después de buscar.
- **(error)** Si no hay resultados, aparece un mensaje que lo explica y propone quitar filtros, en lugar de una lista vacía.

## VIS-04 · Filtrar por categoría

Como visitante, quiero filtrar por una o varias categorías, para ver solo el tipo de aceite que me interesa.

- Aparecen todas las categorías de la tienda.
- Se pueden marcar varias a la vez.
- El listado y el contador se actualizan sin recargar la página.

## VIS-05 · Filtrar por variedad

Como visitante, quiero filtrar por variedad de aceituna, para comparar aceites de la variedad que prefiero.

- Aparecen todas las variedades presentes en el catálogo.
- Se pueden marcar varias a la vez.
- El listado y el contador se actualizan sin recargar la página.

## VIS-06 · Filtrar por precio

Como visitante, quiero indicar un precio mínimo y uno máximo, para ver solo lo que encaja en mi presupuesto.

- Solo aparecen los productos con precio entre los dos valores, ambos incluidos.
- Se puede indicar solo el mínimo o solo el máximo.
- **(error)** Si el mínimo es mayor que el máximo, aparece un mensaje junto a los campos, el filtro de precio no se aplica y los valores escritos no se borran.

## VIS-07 · Ver y quitar los filtros aplicados

Como visitante, quiero ver qué filtros tengo aplicados y quitarlos, para no perderme al combinarlos.

- Cada filtro aplicado aparece como una etiqueta con un botón para quitarlo.
- «Limpiar filtros» los quita todos de una vez.
- El contador indica cuántos aceites hay, por ejemplo «Mostrando 7 aceites».
- Los lectores de pantalla anuncian el nuevo número de resultados cuando cambia.

## VIS-08 · Pasar de página

Como visitante, quiero moverme entre páginas del catálogo, para ver todos los productos sin una lista interminable.

- Hay enlaces a la página anterior, a la siguiente y a cada número de página.
- La página actual se distingue, también para los lectores de pantalla.
- Al cambiar cualquier filtro se vuelve a la página 1.
- **(error)** Si la URL pide una página que no existe, se muestra la última página válida.

## VIS-09 · Conservar la búsqueda al volver

Como visitante, quiero que al volver de la ficha de un producto el catálogo siga como lo dejé, para no repetir la búsqueda.

- Al pulsar «Atrás» desde la ficha se conservan la búsqueda, los filtros, el orden y la página.
- Un enlace copiado del catálogo filtrado abre la misma selección.

## VIS-10 · Ordenar el catálogo *(si da tiempo)*

Como visitante, quiero ordenar los aceites por precio o por nombre, para compararlos con más facilidad.

- Se puede ordenar por relevancia, por precio de menor a mayor, por precio de mayor a menor y por nombre.
- El orden elegido se conserva al cambiar de página.

## VIS-11 · Ver la ficha de un producto

Como visitante, quiero ver la ficha completa de un aceite, para decidir si lo compro.

- La ficha muestra descripción, productor, origen, variedad, formato, precio, precio por litro y existencias.
- Las migas de pan permiten volver al inicio y al catálogo.
- **(error)** Si el producto no existe o está dado de baja, aparece «Producto no encontrado» con un enlace al catálogo.

## VIS-12 · Que me pidan iniciar sesión al comprar

Como visitante, quiero que al intentar añadir un aceite al carrito se me pida iniciar sesión y luego vuelva a la ficha, para no perder lo que estaba mirando.

- Sin sesión iniciada, «Añadir al carrito» lleva a la página de inicio de sesión.
- Después de iniciar sesión, se vuelve a la misma ficha.

## VIS-13 · Usar el catálogo solo con teclado

Como visitante que navega con teclado, quiero usar la portada, el catálogo y la ficha sin ratón, para poder comprar igual que cualquiera.

- Se llega a todos los enlaces, campos y botones con el tabulador, en un orden lógico.
- El elemento que tiene el foco siempre se ve.
- Un enlace «Saltar al contenido» permite saltarse el menú.

## CLI-01 · Elegir cuántas unidades añado

*Historia de cliente que se resuelve en la ficha de producto (Parte A). Avisar a B para no duplicarla.*

Como cliente, quiero elegir cuántas unidades de un aceite añado al carrito, para comprar varias de una vez.

- La cantidad empieza en 1 y se puede cambiar con los botones − y + o escribiéndola.
- Al añadir, aparece una confirmación y el contador del carrito de la cabecera se actualiza.
- **(error)** Una cantidad menor que 1 o mayor que las existencias muestra un mensaje junto al campo y no se añade nada.
- **(error)** Si el producto está agotado, el botón «Añadir al carrito» está desactivado.

## Trazabilidad: historia → página

| Página | Historias |
| --- | --- |
| Inicio (`index.html`) | VIS-01, VIS-13 |
| Catálogo (`productos.html`) | VIS-02 a VIS-10, VIS-13 |
| Ficha de producto (`producto.html`) | VIS-11, VIS-12, VIS-13, CLI-01 |
