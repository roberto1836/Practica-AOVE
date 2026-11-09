# Oleum · Tienda de Aceite de Oliva Virgen Extra (Parte 1)

Prototipo navegable Front-End desarrollado para la asignatura **Arquitectura y Diseño de Sistemas Web y C/S** (Curso 2026/2027).

## 1. Integrantes y reparto inicial

| Área | Integrante | Páginas y módulos asignados |
| --- | --- | --- |
| **Parte A · Catálogo** | [Noé López García] | `index.html`, `productos.html`, `producto.html`, `datos/productos.js`, `util/formato.js`, `img/CREDITOS.md`, `img/favicon.svg`, análisis y mapa de navegación. |
| **Parte B · Compra, cliente y diseño** | [Roberto Riofrío Ortega] | `carrito.html`, `confirmacion.html`, `perfil.html`, `mis-pedidos.html`, `pedido.html`, `base.css`, plantillas de cabecera y pie, `carrito.js`, `datos/pedidos.js`. |
| **Parte C · Usuarios, admin y calidad** | [Carlos Hernán Sánchez] | `registro.html`, `login.html`, `admin/productos.html`, `admin/producto-form.html`, `admin/pedidos.html`, `validacion.js`, `sesion.js`, `datos/usuarios.js`, `admin.css`, despliegue en Tomcat, validación W3C y accesibilidad. |

## 2. Requisitos de ejecución y despliegue

Al emplear módulos nativos de JavaScript ES6 (`<script type="module">`), el prototipo **debe servirse siempre a través de un servidor HTTP** (con doble clic sobre `file://` el navegador bloquea la carga de módulos por política CORS).

### Opción 1 · Despliegue en Apache Tomcat 10.1+ (entorno oficial de la práctica)
1. Copiar el contenido de la carpeta `/proyecto` dentro de `webapps/oleum/` en el directorio de Apache Tomcat.
2. Arrancar Tomcat (`bin/startup.bat` en Windows o `bin/startup.sh` en Linux/macOS).
3. **URL de entrada:** `http://localhost:8080/oleum/index.html`

### Opción 2 · Ejecución local con Live Server (VS Code)
1. Abrir la carpeta en Visual Studio Code con la extensión **Live Server** instalada.
2. Hacer clic derecho sobre `proyecto/login.html` o `proyecto/index.html` y elegir **Open with Live Server**.

## 3. Credenciales de prueba (Parte 1)

| Rol | Correo electrónico | Contraseña | Estado | Uso en demostración |
| --- | --- | --- | --- | --- |
| Cliente | `elena@oleum.es` | `Cliente123!` | Activo (`true`) | Flujo de compra, historial y bloqueo de acceso a `/admin` (Caso 7.1). |
| Cliente | `javier@oleum.es` | `Cliente123!` | Activo (`true`) | Segundo cliente de prueba (Requisito 6.3.1). |
| Administrador | `admin@oleum.es` | `Admin123!` | Activo (`true`) | Gestión de productos, stock, bajas lógicas y estados de pedidos. |
| Cliente inactivo | `inactivo@oleum.es` | `Cliente123!` | Inactivo (`false`) | Prueba de denegación de acceso por baja lógica. |

---

# Acuerdos del grupo · Oleum (Parte 1)

> **Versión 2 · sábado 7 de noviembre.** Entregamos el lunes 9 a las 23:59 y defendemos el jueves 12 en el laboratorio. Este documento es la referencia común: cuando lo cerremos, va tal cual a la sección «Acuerdos» del README. Si algo cambia, se cambia aquí primero y se avisa por el grupo.

## 1. Actores

Ordenados de menor a mayor privilegio.

| Actor | Qué puede hacer |
| --- | --- |
| Visitante | Consultar el catálogo y el detalle, buscar, filtrar, registrarse e iniciar sesión. |
| Cliente | Lo mismo, y además mantener su carrito, confirmar pedidos, consultar su historial y editar su perfil. |
| Administrador | Mantener productos y categorías, controlar existencias y actualizar el estado de los pedidos. |

## 2. Reparto y propiedad de ficheros

Cada fichero tiene un único dueño. Si necesitas un cambio en un fichero que no es tuyo, se pide por el grupo y lo hace su dueño.

| | Páginas | Ficheros compartidos que mantiene |
| --- | --- | --- |
| **A** | `index.html`, `productos.html`, `producto.html` | `datos/productos.js`, `util/formato.js`, `img/CREDITOS.md`, `img/favicon.svg`, `memoria/analisis/` |
| **B** | `carrito.html`, `confirmacion.html`, `perfil.html`, `mis-pedidos.html`, `pedido.html` | `base.css` (parte de la propuesta de A), cabecera y pie, `carrito.js`, `datos/pedidos.js` |
| **C** | `registro.html`, `login.html`, `admin/productos.html`, `admin/producto-form.html`, `admin/pedidos.html` | `validacion.js`, `sesion.js`, `datos/usuarios.js`, `README.md`, Tomcat |

## 3. Normas comunes

- HTML5 semántico (`header`, `nav`, `main`, `section`, `article`, `footer`), `lang="es"`, sin estilos en línea. Cada página pasa el validador del W3C sin errores.
- CSS solo en hojas externas y usando las variables de `base.css`. Mobile-first, con el punto de corte principal en 768 px.
- JavaScript con ES Modules y `export` con nombre. Nunca `innerHTML` con datos: se pinta con `<template>`, `createElement` y `textContent`.
- Sin frameworks ni librerías (ni React ni Bootstrap) y sin CDNs.
- Rutas siempre relativas, nunca empezando por `/` (en Tomcat la aplicación vive bajo un context path).
- Siempre se prueba con servidor (Live Server o Tomcat), nunca con doble clic.
- Imágenes propias o con licencia; cada una con su fuente en `img/CREDITOS.md`.
- Accesibilidad WCAG 2.1 AA: todo usable con teclado, foco visible, contraste 4,5:1, `label` en cada campo y `alt` en cada imagen.
- Todas las páginas llevan el icono en el `<head>`: `<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">` (desde `admin/`, con `../`).

## 4. Estructura de carpetas

```
/README.md
/memoria/                      PDF de la memoria y fuentes (cada uno su sección)
/plantillas/                   cabecera.html y pie.html buenos (B); no se despliegan
/proyecto/                     en la Parte 2 será src/main/webapp
  *.html                       páginas de A y B
  admin/*.html                 páginas de administración (C)
  assets/css/                  base.css (B) y una hoja por dueño (catalogo.css, compra.css, admin.css)
  assets/js/datos/             productos.js (A), pedidos.js (B), usuarios.js (C)
  assets/js/util/              formato.js (A)
  assets/js/                   carrito.js (B), sesion.js y validacion.js (C), y una carpeta por dueño
  assets/img/                  imágenes, favicon.svg y CREDITOS.md
/database/                     schema.sql y data.sql (Parte 2)
```

## 5. Modelo de datos

Los campos se llaman igual que las columnas de la base de datos de la Parte 2 (apartado 6.1 del enunciado), para que pasar de los datos simulados a SQL sea casi directo.

```js
// categoria (A)
{ id, nombre, descripcion }

// producto (A)
{ id, categoria_id, nombre, productor, origen, variedad, formato_ml,
  precio, stock, imagen, activo, descripcion }

// usuario (C) — en la Parte 2, la contraseña será hash_password
{ id, nombre, email, rol, activo, direccion }       // rol: 'cliente' | 'admin'

// pedido (B)
{ id, usuario_id, fecha, estado, direccion_envio, total,
  lineas: [ { producto_id, cantidad, precio_unitario } ] }
// estado: 'recibido' | 'en_preparacion' | 'enviado' | 'entregado' | 'cancelado'
```

- `precio`, `total` y `precio_unitario` son números en euros (`12.5`); `formato_ml` es un entero (`750`).
- `activo: false` es una baja lógica: no se muestra, pero no se borra.
- **Aviso para la Parte 2:** la ficha de producto exige descripción y el modelo mínimo no la tiene. La tabla `producto` necesita la columna `descripcion`.

## 6. URLs

**Catálogo:** formulario `<form method="get" action="productos.html">`. En la Parte 2 será `GET /productos` con los mismos parámetros.

| Parámetro | Valor | Ejemplo |
| --- | --- | --- |
| `q` | texto libre | `q=picual` |
| `categoria` | id de categoría, repetible | `categoria=1&categoria=3` |
| `variedad` | nombre de la variedad, repetible | `variedad=Arbequina` |
| `min`, `max` | precio en euros | `min=10&max=30` |
| `orden` | `relevancia` (por defecto), `precio-asc`, `precio-desc` o `nombre` | `orden=precio-asc` |
| `pagina` | número desde 1 | `pagina=2` |

**Detalle:** `producto.html?id=N`. Si el id no existe o el producto está inactivo, se muestra «producto no encontrado» (el equivalente al 404 de la Parte 2).

**Volver tras iniciar sesión:** `login.html?volver=<ruta relativa codificada>`, por ejemplo `login.html?volver=producto.html%3Fid%3D3`. El login solo acepta rutas relativas del propio sitio, para evitar redirecciones abiertas.

## 7. Interfaces JS compartidas

```js
// util/formato.js (A)
export function formatearPrecio(euros)         // 12.5 → "12,50 €"
export function formatearVolumen(ml)           // 750 → "750 ml" · 5000 → "5 L"
export function precioPorLitro(euros, ml)      // 12.5, 500 → 25
export function formatearPrecioPorLitro(euros, ml)  // 12.5, 500 → "25,00 € por litro"

// carrito.js (B) — mínimo que necesita A; B define el resto
export function anadir(productoId, cantidad)   // → { ok: true } o { ok: false, mensaje }
export function contarUnidades()               // para el contador de la cabecera

// sesion.js (C)
export function usuarioActual()                // → { id, nombre, rol } o null

// validacion.js (C) — C propone su interfaz
```

- `anadir` comprueba la regla del enunciado: cantidad entre 1 y el stock disponible.
- Sin sesión, «Añadir al carrito» lleva al login con `volver`. Un administrador no ve el botón de comprar.
- Tras añadir, en la integración se redirige a `carrito.html`, como pide el apartado 6.2.

## 8. Cabecera y pie

- La versión provisional ya está en las páginas de A (cópiala de `index.html`). B mantiene la buena en `plantillas/cabecera.html` y `plantillas/pie.html`.
- Cada página lleva su copia entre los comentarios `<!-- cabecera-comun: inicio (B) -->` y `<!-- cabecera-comun: fin -->` (y lo mismo con `pie-comun`). Cuando B la cambia, avisa y cada dueño actualiza sus páginas.
- El enlace «Administración» solo se muestra si `usuarioActual().rol` es `'admin'`.
- En la Parte 2 la copia se sustituye por un `<jsp:include>`.

## 9. Sistema visual: `base.css`

`base.css` va en `proyecto/assets/css/base.css` y se enlaza en todas las páginas antes de la hoja propia:

```html
<link rel="stylesheet" href="assets/css/base.css">     <!-- desde admin/: ../assets/css/base.css -->
<link rel="stylesheet" href="assets/css/compra.css">   <!-- la hoja de cada uno -->
```

**Variables** (cambiar un valor cambia toda la web; cambiar un nombre rompe las páginas que lo usan):

```css
--color-primario  --color-primario-oscuro  --color-primario-suave  --color-acento
--color-fondo  --color-superficie  --color-borde  --color-borde-campo
--color-texto  --color-texto-suave  --color-sobre-oscuro  --color-sobre-oscuro-suave
--color-desactivado  --color-exito  --color-aviso  --color-error

--fuente-titulos  --fuente-texto
--texto-sm  --texto-base  --texto-lg  --texto-xl  --texto-2xl

--espacio-1 … --espacio-8      /* 4, 8, 12, 16, 24, 32, 48, 64 px */
--radio  --radio-lg  --radio-pastilla  --sombra  --ancho-contenido  --tamano-tactil
```

**Lo que ya trae hecho** (no hace falta volver a escribirlo):

| Para… | Usa |
| --- | --- |
| Botón principal y secundario | `class="boton"` y `class="boton boton--secundario"` |
| Texto solo para lectores de pantalla | `class="visualmente-oculto"` |
| Mensaje destacado o de `<noscript>` | `class="aviso"` |
| Cabecera, menú y pie | Las clases de la cabecera provisional (`cabecera`, `menu`, `menu__enlace`, `pie`…); la página actual del menú, con `aria-current="page"` |
| Campos de formulario | Ya tienen estilo los `input`, `select` y `textarea`; un campo con error se marca solo con `aria-invalid="true"` |
| Foco de teclado, «Saltar al contenido» y `hidden` | Funcionan sin hacer nada |

Todos los colores de texto cumplen el contraste AA y las tipografías son del sistema, así que no se descarga nada.

## 10. Git

- `main` solo recibe cambios por pull request; nadie sube directamente.
- Una rama por persona: `parte-a`, `parte-b` y `parte-c`. Cada uno sube la suya **con todo su historial**: así se ve el trabajo de cada uno.
- Revisión cruzada de cada PR: A revisa a B, B revisa a C y C revisa a A.
- Mensajes de commit en español y en presente («Añade filtros por precio»).
- Un `.gitattributes` con `* text=auto eol=lf`, para que los saltos de línea de Windows no ensucien los cambios.

## 11. Plan hasta la defensa

| Cuándo | Qué tiene que estar hecho | Quién |
| --- | --- | --- |
| Sábado 7, noche | Acuerdos confirmados, repo creado, versión de Tomcat elegida e historias de B y C enviadas a A | Todos |
| Domingo 8, 14:00 | Cada uno con sus páginas funcionando en su rama, con `base.css` | Todos |
| Domingo 8, tarde | Todo fusionado en `main`, desplegado en Tomcat y probado de punta a punta (375/1280 px, W3C) | Todos |
| Domingo 8, noche | Cada uno su sección de la memoria | Todos |
| Lunes 9 | Vídeo (cada uno su tramo), memoria en PDF, README y ZIP | B el vídeo, A la memoria, C el README y el ZIP |
| Lunes 9, 21:00 | **Entregado**, con 3 horas de margen | C |
| Jueves 12 | **Defensa:** cualquiera puede tener que explicar cualquiera de las 6 tareas del apartado 5.1 (análisis, sistema visual, HTML/CSS, JavaScript, validación y accesibilidad, despliegue) | Todos |

## 12. Pendiente de decidir

- [ ] Quién crea el repo remoto (GitHub, privado, con los tres como colaboradores). Si nadie puede hoy, lo crea A.
- [ ] Versión de Tomcat y del JDK.
- [ ] Cómo simula C el login en la Parte 1 (usuarios y contraseñas de prueba).
