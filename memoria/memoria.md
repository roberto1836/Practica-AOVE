# 1. Introducción

Oleum es una tienda online de aceite de oliva virgen extra (AOVE). Permite consultar un catálogo con búsqueda y filtros, ver la ficha de cada aceite, comprarlo con un pago simulado y seguir los pedidos. Un administrador mantiene los productos y el estado de los pedidos.

La práctica tiene dos partes. Esta memoria describe la **Parte 1: la experiencia de usuario y el prototipo de la interfaz** con HTML5, CSS3 y JavaScript, desplegado en Apache Tomcat. En la Parte 2 la misma interfaz se conectará a Servlets, JSP/JSTL y JDBC con una arquitectura MVC, así que el prototipo se ha diseñado desde el principio para ese paso: los datos usan los nombres de las columnas de la base de datos, las URLs son las de los Servlets y el código separa modelo, lógica, vista y control.

## 1.1 Tecnologías y restricciones

| Ámbito | Elección |
| --- | --- |
| Estructura | HTML5 semántico, `lang="es"`, plantillas con `<template>` |
| Presentación | CSS3 en hojas externas, variables (*custom properties*), Flexbox y Grid, diseño adaptable primero para móvil |
| Comportamiento | JavaScript con módulos ES (`import`/`export` con nombre), sin frameworks, sin librerías y sin CDNs |
| Servidor | Apache Tomcat 10.1 sobre JDK 23 |
| Calidad | Validadores del W3C, Lighthouse, pruebas automáticas con `node --test` |
| Trabajo en grupo | Git y GitHub, con una rama por integrante |

## 1.2 Cómo ejecutarlo

Las páginas usan módulos de JavaScript, así que se abren siempre desde un servidor, nunca con doble clic (el navegador bloquea los módulos cargados desde `file://`).

1. Copiar el contenido de `proyecto/` en `webapps/oleum/` dentro de la carpeta de Tomcat. En Windows lo hace el script `herramientas/desplegar-tomcat.ps1`, y en Linux o macOS, `desplegar-tomcat.sh` (en la raíz del repositorio).
2. Arrancar Tomcat (`bin/startup.bat` o `bin/startup.sh`).
3. Abrir `http://localhost:8080/oleum/`.

Las pruebas automáticas se ejecutan desde la raíz con `node --test`.

# 2. Organización del grupo

## 2.1 Reparto

El trabajo se repartió por **flujos de usuario completos**, de modo que cada integrante es dueño de unas páginas, de sus estilos y de su lógica, y además mantiene algunos ficheros compartidos. Cada fichero tiene un único dueño; si alguien necesita un cambio en un fichero ajeno, lo pide al grupo y lo hace su dueño.

| | Integrante | Páginas | Ficheros compartidos |
| --- | --- | --- | --- |
| **A** | Noe López García | Inicio, catálogo y ficha de producto | Datos de productos y categorías, formato de precios, ilustraciones, análisis del grupo (inventario y mapa), propuesta de `base.css` |
| **B** | Roberto Riofrío Ortega | Carrito, confirmación de pedido, perfil, mis pedidos y detalle de pedido | `base.css` definitivo, cabecera y pie, `carrito.js`, datos de pedidos |
| **C** | Carlos Hernán Sánchez | Registro, inicio de sesión y las tres páginas de administración | Validación de formularios, sesión simulada, datos de usuarios |

## 2.2 Acuerdos comunes

Antes de programar, el grupo cerró un documento de acuerdos (anexo A) para que las tres partes encajasen sin esperar unas a otras:

- **Modelo de datos** con los nombres de columna de la Parte 2 (`categoria`, `producto`, `usuario`, `pedido` y sus líneas). Así, pasar de los datos simulados a SQL es casi directo.
- **Contrato de URLs.** El catálogo usa `productos.html?q=…&categoria=…&variedad=…&min=…&max=…&orden=…&pagina=…`, que en la Parte 2 será `GET /productos` con los mismos parámetros. La ficha es `producto.html?id=N`, y el login vuelve a la página de origen con `login.html?volver=…`.
- **Interfaces entre módulos.** `anadir(productoId, cantidad)` devuelve `{ ok: true }` o `{ ok: false, mensaje }`; `usuarioActual()` devuelve `{ id, nombre, rol }` o `null`. Mientras un módulo ajeno no existía, cada uno trabajaba con un **sustituto** con la misma interfaz, e integrar fue cambiar un `import`.
- **Normas técnicas comunes:** HTML válido, CSS solo con las variables de `base.css`, nunca `innerHTML` con datos, rutas siempre relativas y accesibilidad WCAG 2.1 AA.

## 2.3 Flujo de trabajo con Git

- Repositorio en GitHub con una rama por integrante (`parte-a`, `parte-b`, `parte-c`). Cada rama conserva todo su historial, de modo que se ve el trabajo de cada uno.
- Las ramas se integran en `main` con un *merge commit* (sin *squash*), para que la historia muestre qué entró de cada parte y cuándo.
- Mensajes de commit en español y en presente, y un `.gitattributes` con `eol=lf` para que los saltos de línea de Windows no ensucien los cambios.

# 3. Análisis y navegación

## 3.1 Actores

Los actores se identificaron con el criterio del enunciado: quién usa el sistema y con qué permisos. Se ordenan de menor a mayor privilegio.

| Actor | Qué puede hacer |
| --- | --- |
| Visitante | Consultar el catálogo y las fichas, buscar, filtrar, registrarse e iniciar sesión. |
| Cliente | Lo mismo, y además mantener su carrito, confirmar pedidos, consultar su historial y editar su perfil. |
| Administrador | Mantener productos y categorías, controlar existencias y actualizar el estado de los pedidos. |

El visitante es un actor propio porque no está identificado: solo accede a lo público. Al iniciar sesión pasa a ser cliente, y entonces puede tener carrito y pedidos, que siempre pertenecen a un usuario. Que compre o no es su comportamiento, no su rol.

## 3.2 Historias de usuario

Cada historia sigue el formato «Como [actor], quiero [acción], para [objetivo]». Tiene criterios de aceptación verificables con un sí o un no, y al menos un caso de error por cada camino feliz. Los criterios completos están en los anexos B, C y D, y cada criterio tiene su caso en las matrices de pruebas (anexos D, E y F).

**Visitante** (Parte A)

| Id | Como visitante, quiero… | para… | Página |
| --- | --- | --- | --- |
| VIS-01 | ver en la portada qué ofrece la tienda y algunos destacados | empezar a explorar sin buscar | Inicio |
| VIS-02 | ver los aceites en un listado | hacerme una idea de lo que vende la tienda | Catálogo |
| VIS-03 | buscar escribiendo una palabra | encontrar rápido un aceite que ya conozco | Catálogo |
| VIS-04 | filtrar por una o varias categorías | ver solo el tipo de aceite que me interesa | Catálogo |
| VIS-05 | filtrar por variedad de aceituna | comparar aceites de la variedad que prefiero | Catálogo |
| VIS-06 | indicar un precio mínimo y uno máximo | ver solo lo que encaja en mi presupuesto | Catálogo |
| VIS-07 | ver qué filtros tengo aplicados y quitarlos | no perderme al combinarlos | Catálogo |
| VIS-08 | moverme entre páginas del catálogo | ver todo sin una lista interminable | Catálogo |
| VIS-09 | que al volver de una ficha el catálogo siga como lo dejé | no repetir la búsqueda | Catálogo |
| VIS-10 | ordenar por precio o por nombre | comparar con más facilidad | Catálogo |
| VIS-11 | ver la ficha completa de un aceite | decidir si lo compro | Ficha |
| VIS-12 | que al intentar comprar se me pida iniciar sesión y luego vuelva a la ficha | no perder lo que estaba mirando | Ficha |
| VIS-13 | usar la portada, el catálogo y la ficha solo con teclado | poder comprar igual que cualquiera | Las tres |

**Cliente** (Parte B; la CLI-01 se resuelve en la ficha de producto, de la Parte A)

| Id | Historia | Página |
| --- | --- | --- |
| CLI-01 | Seleccionar unidades y añadir al carrito desde la ficha | Ficha |
| CLI-02 | Consultar el contenido de la cesta y el desglose de costes | Carrito |
| CLI-03 | Modificar las unidades de un artículo en el carrito | Carrito |
| CLI-04 | Eliminar productos y gestionar el carrito vacío | Carrito |
| CLI-05 | Iniciar la confirmación del pedido | Confirmación |
| CLI-06 | Introducir y validar la dirección de entrega | Confirmación |
| CLI-07 | Revisar el resumen completo antes de formalizar | Confirmación |
| CLI-08 | Seleccionar un método de pago ficticio | Confirmación |
| CLI-09 | Recibir la confirmación y la referencia del pedido | Confirmación |
| CLI-10 | Consultar mi historial de pedidos | Mis pedidos |
| CLI-11 | Ver el detalle completo de un pedido anterior | Detalle de pedido |
| CLI-12 | Editar mi perfil y mis datos predeterminados | Mi perfil |

**Registro, sesión y administrador** (Parte C)

| Id | Historia | Página |
| --- | --- | --- |
| HU-C01 | Como visitante, registrarme para obtener una cuenta de cliente | Registro |
| HU-C02 | Como visitante o usuario registrado, iniciar y cerrar sesión para acceder a las opciones de mi rol | Iniciar sesión y cabecera |
| HU-C03 | Como administrador, mantener el catálogo: alta, edición, stock y baja lógica | Productos (admin) y alta y edición |
| HU-C04 | Como administrador, consultar los pedidos y actualizar su estado | Pedidos (admin) |

## 3.3 Inventario de páginas

El inventario se obtuvo recorriendo las historias una a una y preguntando «¿en qué página ocurre esto?». Salen 13 páginas en tres niveles de acceso, cada una con un único dueño y su ruta equivalente en la Parte 2. Las rutas marcadas como *propuesta* no aparecen en el contrato del apartado 6.2 del enunciado, que admite variantes coherentes si se documentan: esta tabla es esa documentación.

| Página | Fichero (Parte 1) | Ruta en la Parte 2 | Acceso | Historias | Dueño |
| --- | --- | --- | --- | --- | --- |
| Inicio | `index.html` | `GET /` | Público | VIS-01, VIS-13 | A |
| Catálogo | `productos.html` | `GET /productos` | Público | VIS-02 a VIS-10, VIS-13 | A |
| Ficha de producto | `producto.html?id=N` | `GET /productos/{id}` (404 si no existe) | Público | VIS-11 a VIS-13, CLI-01 | A |
| Registro | `registro.html` | `GET/POST /registro` | Público | HU-C01 | C |
| Iniciar sesión | `login.html?volver=…` | `GET/POST /login` | Público | VIS-12, HU-C02 | C |
| Carrito | `carrito.html` | `GET /carrito` · `POST /carrito/items/{id}` | Cliente | CLI-01 a CLI-04 | B |
| Confirmar pedido | `confirmacion.html` | Formulario previo a `POST /pedidos` *(propuesta)* | Cliente | CLI-05 a CLI-09 | B |
| Detalle de pedido | `pedido.html?id=N` | `GET /mis-pedidos/{id}` *(propuesta)* | Cliente | CLI-11 | B |
| Mis pedidos | `mis-pedidos.html` | `GET /mis-pedidos` | Cliente | CLI-10 | B |
| Mi perfil | `perfil.html` | `GET/POST /perfil` *(propuesta)* | Cliente | CLI-12 | B |
| Productos (admin) | `admin/productos.html` | `GET /admin/productos` | Administrador | HU-C03 | C |
| Alta y edición de producto | `admin/producto-form.html` | `GET/POST /admin/productos/…` | Administrador | HU-C03 | C |
| Pedidos (admin) | `admin/pedidos.html` | `GET /admin/pedidos` · `POST /admin/pedidos/{id}/estado` | Administrador | HU-C04 | C |

## 3.4 Mapa de navegación

<figure class="figura-ancha">
<img src="img/mapa-navegacion.svg" alt="Mapa de navegación de Oleum con las 13 páginas en tres zonas de acceso">
<figcaption>Figura 1. Mapa de navegación. Las zonas son los niveles de acceso. La cabecera común, presente en todas las páginas, se dibuja una sola vez arriba, y sus destinos llevan la marca MENÚ. Las flechas continuas son enlaces o botones; las discontinuas, redirecciones automáticas (patrón Post/Redirect/Get). Las notas de las zonas de cliente y de administrador describen lo que harán los filtros de autorización de la Parte 2.</figcaption>
</figure>

El mapa cumple las comprobaciones del método visto en clase:

- La entrada es Inicio, y desde ahí se llega a cualquier página: a las del menú desde la cabecera, y al resto siguiendo flechas.
- No hay callejones sin salida, porque todas las páginas llevan la cabecera común.
- Solo se dibujan enlaces que existen o que el grupo ha acordado.
- Las páginas de cliente y de administrador están protegidas, y el mapa muestra a dónde se redirige si no hay permiso.

Tras «Añadir al carrito», la ficha redirige a `carrito.html`, como pide el apartado 6.2. «Cerrar sesión» será en la Parte 2 un `POST /logout`, nunca un `GET`, que redirige a Inicio.

# 4. Sistema visual

El sistema visual vive en un único `base.css` que enlazan todas las páginas antes de su hoja propia (`catalogo.css`, `compra.css`, `admin.css`). La Parte A hizo la propuesta inicial y la Parte B la consolidó con los componentes de compra. Las páginas solo usan sus variables, así que un cambio de marca se hace en un solo sitio.

<div class="pareja">
<figure><img src="img/inicio-escritorio.png" alt="Portada de Oleum en escritorio"><figcaption>Figura 2. Portada en escritorio (1280 px).</figcaption></figure>
<figure class="estrecha"><img src="img/inicio-movil.png" alt="Portada de Oleum en móvil"><figcaption>Figura 3. Portada en móvil (375 px).</figcaption></figure>
</div>

## 4.1 Identidad y variables

- **Paleta:** el verde oliva del vidrio de las botellas (`--color-primario: #3b4a2c`), crema de fondo (`--color-fondo: #faf7ef`), blanco para las tarjetas y un oro viejo de acento (`--color-acento: #8c6a1f`) para el foco y el contador del carrito. Todos los textos cumplen el contraste AA; el par más justo da 5,89:1, por encima del 4,5:1 exigido.
- **Tipografías del sistema:** Palatino Linotype para los títulos en Windows y la fuente del sistema para el texto. No se descarga ninguna fuente, así que la web se ve igual con o sin red.
- **Escalas en variables:** cinco tamaños de texto (`--texto-sm` a `--texto-2xl`), ocho espaciados (`--espacio-1` a `--espacio-8`, de 4 a 64 px), radios, sombra, ancho máximo del contenido y tamaño táctil mínimo.

## 4.2 Diseño adaptable

Todo se escribe primero para móvil y se amplía con dos puntos de corte: **768 px** (catálogo y ficha a dos columnas) y **1024 px** (rejilla de 3 productos en el catálogo y de 4 en la portada). En el móvil, los filtros del catálogo se pliegan tras un botón y las tablas de pedidos se desplazan dentro de su propio contenedor, de modo que a 375 px nunca aparece desplazamiento horizontal en la página.

## 4.3 Componentes

| Componente | Dónde se usa | Detalle |
| --- | --- | --- |
| Cabecera y pie comunes | Todas las páginas | Menú con la página actual marcada (`aria-current="page"`), contador del carrito y enlace de administración solo para el rol admin |
| Botones | Todas | Principal y secundario, con estado desactivado y foco visible |
| Tarjeta de producto | Inicio y catálogo | Toda la tarjeta es clicable con un único enlace (el nombre, estirado con `::after`), así el lector de pantalla oye un solo enlace por producto |
| Etiquetas de filtro y paginación | Catálogo | Cada filtro aplicado se quita con su botón |
| Campos de formulario | Ficha, compra y perfil | Etiqueta, ayuda y error asociado; el error se marca con `aria-invalid="true"` |
| Tablas de datos | Mis pedidos y detalle | Contenedor con desplazamiento propio y foco de teclado |
| Insignias de estado | Pedidos | Un color por estado (recibido, en preparación, enviado, entregado, cancelado), siempre acompañado del texto |
| Pasos | Confirmación | Envío, resumen, pago y confirmación, con el paso actual marcado (`aria-current="step"`) |
| Mensajes | Todas | Éxito, aviso y error; también los estados vacíos (sin resultados, carrito vacío, producto no encontrado) |

# 5. Prototipo HTML y CSS

## 5.1 Estructura de las páginas

Todas las páginas comparten el mismo esqueleto semántico: enlace «Saltar al contenido», `header` con el `nav` principal, un único `main` y `footer`. Dentro de `main`, cada bloque es una `section` con su título, y cada producto o pedido es un `article`. Los formularios agrupan sus opciones con `fieldset` y `legend`, y cada campo tiene su `label`.

La cabecera y el pie se copian en cada página entre dos comentarios (`<!-- cabecera-comun: inicio (B) -->` y `<!-- cabecera-comun: fin -->`). La versión buena vive en `plantillas/`, y cuando cambia, cada dueño actualiza sus páginas. En la Parte 2 esa copia se sustituye por un `<jsp:include>`.

Los fragmentos que se repiten con datos (tarjetas, casillas de filtro, líneas del carrito, filas de pedidos) se escriben una sola vez en un `<template>` dentro del HTML. El JavaScript los clona y rellena, así el marcado sigue estando en el HTML y no en cadenas de texto.

## 5.2 Organización de los ficheros

```
proyecto/                     en la Parte 2 será src/main/webapp
  index.html, productos.html, producto.html                    (A)
  carrito.html, confirmacion.html, perfil.html,
  mis-pedidos.html, pedido.html                                (B)
  registro.html, login.html, admin/*.html                      (C)
  assets/css/   base.css (común), catalogo.css, compra.css, sin-js.css
  assets/js/    datos/ (modelo), catalogo/ (lógica y vista de A),
                paginas/ (un controlador por página), comun/, util/,
                carrito.js (B), sesion.js y validacion.js (C)
  assets/img/   favicon, ilustraciones de producto y CREDITOS.md
```

- **Rutas siempre relativas** (`productos.html`, nunca `/productos.html`), porque en Tomcat la aplicación vive bajo un *context path* (apartado 8).
- **CSS solo en hojas externas**, sin estilos en línea.
- **Imágenes propias.** Las 20 ilustraciones de botella son SVG generados por un script a partir de los datos de cada producto (variedad, formato y categoría). Comparten estilo, pesan menos de 2 KB y no tienen problemas de licencia.

# 6. Interacción con JavaScript

## 6.1 MVC también en el navegador

El código separa las mismas capas que el enunciado pide para la Parte 2. Cada módulo tiene una sola responsabilidad y un equivalente directo en el servidor.

| Capa | Parte A (catálogo) | Parte B (compra) | Parte 2 |
| --- | --- | --- | --- |
| Modelo | `datos/productos.js` | `datos/pedidos.js`, `carrito.js` | Tablas y DAO (`ProductoDAO`, `PedidoDAO`) |
| Lógica | `catalogo/filtros.js`: leer criterios, filtrar, ordenar, paginar y validar, con funciones puras sin DOM | Validación de cantidades, congelación de precios y cálculo del envío | Servicios (`PedidoService`, `CarritoService`) |
| Vista | `catalogo/vista.js` y los `<template>` | Las páginas de compra con sus `<template>` | JSP con JSTL (`<c:forEach>`, `<c:out>`) |
| Controlador | `paginas/inicio.js`, `catalogo.js` y `detalle.js` | `paginas/carrito.js`, `confirmacion.js`, `perfil.js`, `mis-pedidos.js` y `pedido.js` | Servlets |

El recorrido al marcar un filtro es el mismo que hará un Servlet: evento → criterios → URL → filtrar, ordenar y paginar → pintar.

## 6.2 Catálogo y ficha (Parte A)

<figure class="figura-media">
<img src="img/catalogo-filtros-aplicados.png" alt="Catálogo con filtros aplicados y sus etiquetas para quitarlos">
<figcaption>Figura 4. Catálogo con búsqueda, filtros aplicados y orden. El estado está en la URL.</figcaption>
</figure>

| Decisión | Por qué | En la Parte 2 |
| --- | --- | --- |
| Los filtros son un `<form method="get">` y su estado vive en la URL | «Atrás» desde la ficha conserva la selección (VIS-09), un enlace filtrado se puede compartir y la portada enlaza a cada categoría. Al filtrar, la URL se actualiza con `history.replaceState`, para no llenar el historial | Es literalmente `GET /productos` con los mismos parámetros |
| Una sola función, `leerCriterios`, lee la URL y el formulario (`new URLSearchParams(new FormData(form))`) | Un único punto valida todo. Los valores raros de la URL (página 99, precio negativo, categoría inexistente) se ignoran o se corrigen y la página nunca falla | El Servlet leyendo `request.getParameter` |
| Cada filtro es una función pequeña dentro de una lista | Añadir un filtro es añadir una función, sin tocar el resto | Cada filtro, un trozo del `WHERE` con `?` en un `PreparedStatement` |
| Las tarjetas se crean desde un `<template>` y se rellenan con `textContent`; nunca `innerHTML` con datos | El marcado queda en el HTML y se evita el XSS | `<c:out>`, que escapa |
| Baja lógica con `activo: false` | Un producto con pedidos no puede desaparecer de la base de datos | Lo pide el apartado 3.3 |
| Si el producto no existe, está inactivo o el id no es válido, se muestra «Producto no encontrado» | Nunca se ve una ficha vacía o rota | Respuesta 404 |
| Precios y volúmenes con `Intl.NumberFormat('es-ES')`, más el precio por litro | «12,50 €» y «5 L», como en cualquier tienda; el precio por litro permite comparar formatos | `<fmt:formatNumber>` |
| La cantidad se valida antes de llamar al carrito, y sin sesión se va al login con `volver` | El error aparece junto al campo sin perder lo escrito (CLI-01), y tras iniciar sesión se vuelve a la ficha (VIS-12) | La misma validación, repetida en el servidor |

## 6.3 Carrito, confirmación y pedidos (Parte B)

<div class="pareja">
<figure><img src="img/carrito-escritorio.png" alt="Carrito con líneas, cantidades y desglose de costes"><figcaption>Figura 5. Carrito con el desglose de costes.</figcaption></figure>
<figure><img src="img/confirmacion-escritorio.png" alt="Primer paso de la confirmación del pedido"><figcaption>Figura 6. Confirmación del pedido en cuatro pasos.</figcaption></figure>
</div>

- **Carrito persistente y reactivo.** El carrito (`oleum_carrito_v1`) y los pedidos (`oleum_pedidos_v1`) se guardan en `localStorage`. Cada cambio lanza el evento `carrito:actualizado`, y la cabecera actualiza su contador sin recargar. También se escucha el evento `storage`, para sincronizar varias pestañas abiertas.
- **Control de existencias.** `anadir` comprueba que la cantidad sea un entero mayor que 0 y que, sumada a lo que ya hay en el carrito, no supere el stock (regla 3.3).
- **Precio congelado en cada línea.** Al confirmar, cada línea guarda el `precio_unitario` de ese momento. Si después cambia el precio en el catálogo, los pedidos anteriores conservan su importe, y una prueba automática lo comprueba.
- **Confirmación en cuatro pasos** (envío, resumen, pago simulado y confirmación) sin perder lo escrito al volver atrás o al corregir un error.
- **Pago simulado.** La tienda nunca pide datos reales de tarjeta ni se conecta a pasarelas externas, y lo indica en pantalla.
- **Cada cliente solo ve sus pedidos.** Si alguien pide por URL el pedido de otro usuario, ve «Pedido no encontrado», el equivalente a un 403/404 de la Parte 2.

## 6.4 Registro, inicio de sesión y administración (Parte C)

- **Sesión simulada** (`sesion.js`). `iniciarSesion(email, password)` comprueba las credenciales contra `datos/usuarios.js` y guarda `{ id, nombre, rol }` en `sessionStorage`. `usuarioActual()` cumple la interfaz acordada, `cerrarSesion()` borra la sesión y `registrarUsuario(...)` da de alta clientes nuevos. Una cuenta con `activo: false` no puede entrar.
- **Vuelta segura tras el login.** `obtenerRutaVolverSegura()` solo acepta rutas relativas del propio sitio en `?volver=`; una URL externa (`https://…` o `//…`) se descarta y se va a la página por defecto, lo que evita las redirecciones abiertas.
- **Control de acceso.** Las páginas de administración llaman a `verificarAcceso('admin')`: un visitante o un cliente ve un aviso de acceso restringido y el panel no se muestra. En la Parte 2 lo hará un filtro sobre `/admin/*`.
- **Validación de formularios** (`validacion.js`). Se valida en el navegador sin borrar lo escrito: el campo erróneo recibe `aria-invalid="true"`, su mensaje se enlaza con `aria-describedby` y el foco va al primer error. Se cubren el correo duplicado, las contraseñas distintas, el precio no positivo y el stock negativo.
- **Administración.** Tabla de productos con el stock editable en la propia fila y baja lógica (el producto pasa a inactivo sin borrarse), formulario de alta y edición (con «producto no encontrado» si el id no existe) y tabla de pedidos con cambio de estado. Por debajo de 768 px, las tablas se convierten en tarjetas, así que no hay desplazamiento horizontal.

Usuarios de prueba para la demostración:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Cliente | `elena@oleum.es` | `Cliente123!` |
| Cliente | `javier@oleum.es` | `Cliente123!` |
| Administrador | `admin@oleum.es` | `Admin123!` |
| Cliente dado de baja | `inactivo@oleum.es` | `Cliente123!` (no puede entrar) |

## 6.5 Integración

Cada parte se programó contra las interfaces acordadas (apartado 2.2) usando sustitutos, así que integrar fue cambiar los `import` por los módulos reales, sin tocar nada más:

- `detalle.js` pasó de `sustitutos/carrito.js` al `carrito.js` de B, porque los dos devuelven `{ ok, mensaje }`. Desde entonces, «Añadir al carrito» redirige a `carrito.html`.
- La ficha, la cabecera y las páginas de compra pasaron de `sustitutos/sesion.js` al `sesion.js` de C, porque los dos ofrecen `usuarioActual()`. Con ello, sin sesión la ficha lleva al login y vuelve después, y el enlace «Administración» solo aparece al administrador.

# 7. Validación y accesibilidad

## 7.1 Accesibilidad

El objetivo es el nivel AA de WCAG 2.1, organizado según sus cuatro principios.

| Principio | Medidas aplicadas |
| --- | --- |
| **Perceptible** | `alt` descriptivo en la imagen de la ficha y vacío en las tarjetas, donde el nombre ya está al lado. Contraste mínimo de 5,89:1 en el texto. La disponibilidad y el estado de los pedidos se indican con texto, no solo con color. |
| **Operable** | Todo se usa con teclado y en orden lógico, incluida la compra completa. Enlace «Saltar al contenido». Foco siempre visible: anillo de oro viejo de 3 px. Objetivos táctiles de al menos 44 px en los botones «+» y «−». Al quitar un filtro, el foco no se pierde. Se respeta `prefers-reduced-motion`. |
| **Comprensible** | `lang="es"`, `label` en todos los campos y `fieldset` con `legend` en los grupos. Los errores se explican junto al campo (`aria-invalid` y `aria-describedby`), no borran lo escrito y el foco va al primer campo erróneo. Navegación idéntica en todas las páginas y migas de pan en la ficha. |
| **Robusto** | HTML válido. ARIA solo donde aporta: `aria-live` en contadores, errores y avisos; `aria-current` en el menú, la paginación y los pasos; `aria-expanded` en el botón de filtros. Mejora progresiva: sin JavaScript aparece un aviso y los filtros siguen visibles (`sin-js.css`). |

<figure class="figura-media">
<img src="img/foco-teclado-tarjeta.png" alt="Tarjeta de producto con el anillo de foco visible">
<figcaption>Figura 7. Foco de teclado visible en una tarjeta del catálogo.</figcaption>
</figure>

## 7.2 Validación y pruebas

| Comprobación | Resultado |
| --- | --- |
| Pruebas automáticas (`node --test`) | **40 de 40**: 27 de la lógica del catálogo (A), 8 del carrito y 5 de los pedidos (B) |
| Criterios de aceptación en el navegador | Parte A: 36 de 36 (anexo E). Parte B: anexo F. Parte C: 10 de 10 (anexo D) |
| Validador HTML del W3C | 0 errores en las 13 páginas. Queda un aviso informativo por el `aria-label` del contador del carrito de la cabecera |
| Validador CSS del W3C | 0 errores; avisos justificados en el anexo E |
| Lighthouse (Parte A): Accesibilidad, Buenas prácticas y SEO | 100 en las 3 páginas, en móvil y escritorio |
| Lighthouse (Parte A): Rendimiento | 100, salvo el catálogo en escritorio (98) |
| Anchos de 375, 768 y 1280 px | Sin solapamientos ni desplazamiento horizontal |

Las pruebas automáticas cubren las funciones puras, que no necesitan navegador: lectura de criterios con valores raros, filtros, orden, paginación, validación de cantidades, límites de stock del carrito, gastos de envío, congelación de precios y aislamiento de los pedidos de cada usuario. Las pruebas en el navegador recorren cada criterio de aceptación con sus datos, pasos, resultado esperado y resultado obtenido (anexos E y F).

La auditoría de Lighthouse detectó que la página «saltaba» al cargar (CLS de 0,67 en el catálogo y 0,43 en la ficha), y se corrigió. Los filtros del móvil ya vienen plegados desde el HTML y el CSS, y `main` ocupa como mínimo una pantalla para que el pie no se mueva a la vista. Queda un salto pequeño en el catálogo de escritorio (0,09, dentro de lo que Lighthouse considera bueno), porque las casillas de los filtros se pintan desde los datos. En la Parte 2 las genera el servidor, así que desaparece.

# 8. Despliegue en Tomcat

La aplicación se despliega copiando `proyecto/` en `webapps/oleum/` dentro de Tomcat. Cada carpeta de `webapps` es una aplicación web, y su nombre es el **context path**: la parte de la URL con la que Tomcat sabe a qué aplicación va cada petición. Por eso la entrada es `http://localhost:8080/oleum/` y, como no hay `web.xml` que diga otra cosa, Tomcat sirve `index.html` como página de bienvenida.

Ese context path es la razón de que todas las rutas sean relativas. Un enlace a `/productos.html` iría a `localhost:8080/productos.html`, fuera de la aplicación, y daría 404; en cambio `productos.html` se resuelve como `localhost:8080/oleum/productos.html`. En la Parte 2 las JSP construirán las rutas con `${pageContext.request.contextPath}`.

| Paso | Windows (PowerShell) |
| --- | --- |
| Indicar el JDK y la carpeta de Tomcat | `$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"` y `$env:CATALINA_HOME = "…\apache-tomcat-10.1.61"` |
| Copiar la aplicación | `robocopy proyecto "$env:CATALINA_HOME\webapps\oleum" /MIR` |
| Arrancar y parar | `bin\startup.bat` y `bin\shutdown.bat` |
| Todo en un paso | `herramientas\desplegar-tomcat.ps1` (y `-Parar`) |

`CATALINA_HOME` hace falta porque `startup.bat`, si no la encuentra, deduce la carpeta de Tomcat a partir del directorio desde el que se lanza. `robocopy /MIR` deja `webapps/oleum` idéntica a `proyecto/`, así que volver a desplegar es repetir el mismo comando. Tomcat despliega solo la carpeta nueva (*autoDeploy*) y sirve los ficheros directamente desde ella, de modo que los cambios se ven al recargar. En la Parte 2, `proyecto/` pasará a ser `src/main/webapp` y la aplicación se podrá empaquetar como WAR.

El despliegue se probó de punta a punta en Tomcat 10.1.61: portada, catálogo con filtros, ficha, añadir al carrito con redirección al carrito y contador de la cabecera actualizado.

# 9. Limitaciones y preparación para la Parte 2

- **Datos.** Viven en módulos de JavaScript. En la Parte 2 los sirve el DAO con consultas parametrizadas: la búsqueda con `LIKE ?`, los filtros con `IN (?, ?)` y la paginación con `LIMIT ? OFFSET ?`. La búsqueda sin tildes se resolverá con una ordenación (*collation*) que ignore los acentos.
- **Estado.** El carrito y los pedidos están en `localStorage` y la sesión está simulada. En la Parte 2 el carrito pasa a la `HttpSession`, el usuario a la sesión creada al iniciar sesión y los pedidos a las tablas `pedido` y `linea_pedido`.
- **Validación.** Toda la validación del navegador se repetirá en el servidor, porque nunca se confía en lo que envía el navegador (apartado 7).
- **Modelo.** La ficha muestra una descripción que el modelo mínimo del enunciado no tiene, así que la tabla `producto` necesitará la columna `descripcion`.
- **Plantillas.** La cabecera y el pie copiados en cada página pasarán a un `<jsp:include>`.

# 10. Contribución de cada integrante

## 10.1 Parte A · Noe López García

- **Análisis:** actores, historias de usuario del visitante con sus criterios, inventario de páginas y mapa de navegación del grupo.
- **Datos:** 4 categorías y 20 productos con el modelo de la Parte 2, y 20 ilustraciones SVG propias con su script generador.
- **Páginas:** inicio, catálogo y ficha de producto, con HTML semántico, sus módulos JavaScript (modelo, lógica, vista y controladores) y sus estilos.
- **Sistema visual:** propuesta de `base.css` con las variables, la cabecera, el pie y los componentes comunes.
- **Calidad:** pruebas automáticas, matriz de pruebas, validación W3C, auditoría Lighthouse y capturas.
- **Coordinación e integración:** propuesta de acuerdos del grupo (modelo de datos, URLs, interfaces y Git), revisión de la rama de B, integración del carrito y de la sesión, despliegue en Tomcat y montaje de esta memoria.

## 10.2 Parte B · Roberto Riofrío Ortega

- **Páginas:** HTML semántico y controladores de carrito, confirmación en pasos, perfil, mis pedidos y detalle de pedido.
- **Sistema visual:** consolidación de `base.css` (tablas adaptables, tarjetas, insignias, alertas, pasos y formularios) y hoja `compra.css`.
- **Plantillas:** cabecera y pie definitivos en `plantillas/`, con el contador reactivo del carrito.
- **Módulos:** `carrito.js` y `datos/pedidos.js`.
- **Pruebas y documentación:** pruebas automáticas, matriz de pruebas, historias de usuario del cliente y su parte de la memoria.

## 10.3 Parte C · Carlos Hernán Sánchez

- **Páginas:** registro, inicio de sesión y las tres páginas de administración (productos, alta y edición de producto, y pedidos).
- **Módulos:** `sesion.js` (sesión simulada, registro, vuelta segura y control de acceso), `validacion.js`, `datos/usuarios.js` y los controladores de administración.
- **Estilos:** `admin.css`, con las tablas que pasan a tarjetas en el móvil.
- **Calidad y documentación:** historias de usuario de registro, sesión y administración, matriz de pruebas, README con los usuarios de prueba.

## 10.4 Uso de inteligencia artificial

Parte A: se ha usado un asistente de IA (Claude) como apoyo en la generación de código y documentación. Todo el contenido ha sido revisado, probado y entendido por el autor.
