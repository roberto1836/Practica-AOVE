# Historias de usuario · Administrador y Autenticación (Parte C)

Formato: «Como [actor], quiero [acción], para [objetivo]». Cada criterio de aceptación se comprueba con un sí o un no. Los marcados como **(error)** cubren el camino alternativo o de validación según el apartado 7.1 del enunciado. Identificadores: `VIS` visitante, `ADM` administrador.

---

## VIS-13 · Registro de nuevo cliente (`registro.html`)

Como visitante, quiero registrarme con mis datos personales, dirección de entrega y contraseña, para obtener una cuenta de cliente y poder tramitar pedidos en Oleum.

- Formulario con campos semánticos: nombre, correo electrónico, teléfono, dirección y dos contraseñas.
- Si los datos son válidos, se crea el usuario con `rol: "cliente"` y `activo: true`, y se redirige a `login.html?registrado=1` mostrando mensaje de bienvenida.
- **(error · Obligatorio 7.1)** Si el correo ya existe en `usuarios.js` (ej. `elena@oleum.es`), se rechaza el registro, se marca el campo con `aria-invalid="true"`, se muestra el error junto al email y se conservan intactos todos los demás datos tecleados.
- **(error)** Si las dos contraseñas no coinciden, se señala el error en tiempo real junto al campo de confirmación sin borrar ninguna clave.
- **(error)** Si el teléfono no tiene 9 dígitos o comienza por un dígito distinto a 6, 7, 8 o 9, `validacion.js` muestra el mensaje en español y lleva el foco al campo.

---

## VIS-14 · Inicio y cierre de sesión (`login.html` y cabecera)

Como visitante o usuario registrado, quiero iniciar y cerrar sesión con mis credenciales, para acceder a las opciones de mi rol y proteger mi cuenta.

- Con credenciales correctas de un usuario activo, se guarda `{ id, nombre, rol, email, telefono, direccion }` en `sessionStorage`.
- La cabecera adapta dinámicamente sus opciones al rol activo (visitante, cliente o administrador).
- Admite el parámetro `?volver=` con rutas relativas internas para retomar la compra o la página solicitada.
- Permite cerrar sesión en un clic con `#boton-cerrar-sesion`, eliminando la información activa de `sessionStorage`.
- **(error · Obligatorio 7.1)** Si el correo o la contraseña son incorrectos, se deniega el acceso con un mensaje genérico sin revelar si falló el usuario o la contraseña.
- **(error)** Si la cuenta tiene `activo: false` (baja lógica de usuario), se informa de que la cuenta está desactivada.
- **(error · Acuerdo 6)** Si `?volver=` contiene una URL externa (`https://...` o `//...`), se ignora para prevenir redirecciones abiertas y se redirige a `index.html` o `admin/productos.html`.

---

## ADM-01 · Consultar catálogo y métricas de existencias (`admin/productos.html`)

Como administrador, quiero ver en una tabla todos los productos de la tienda junto con tarjetas de resumen, para tener una visión global del catálogo y del inventario.

- Tabla `<table>` accesible con encabezados `scope="col"`, con columnas para ID, producto, categoría, formato, precio, existencias, estado y acciones.
- Tarjetas superiores con métricas cuantitativas: total de productos registrados, productos activos en tienda y productos agotados (0 unidades).
- En pantallas móviles (375 px), la tabla reorganiza sus filas en tarjetas verticales legibles mediante atributos `data-etiqueta`, sin forzar barras de desplazamiento horizontal.

---

## ADM-02 · Modificar existencias (stock) en línea (`admin/productos.html`)

Como administrador, quiero actualizar el stock disponible de cualquier aceite directamente desde la tabla, para mantener las existencias al día de forma ágil.

- Cada fila incluye un control numérico con su stock actual y un botón «Guardar».
- Al confirmar el cambio, el nuevo stock se persiste en la sesión, se actualizan las métricas superiores y se muestra confirmación accesible en pantalla.
- El nuevo stock impacta de inmediato en la ficha pública del producto y en el límite de unidades que un cliente puede añadir a su carrito.
- **(error · Obligatorio 7.1)** Si se introduce un stock negativo o no entero, `validacion.js` impide el guardado, marca `aria-invalid="true"` y muestra el error junto al campo.

---

## ADM-03 · Alta y edición de productos (`admin/producto-form.html`)

Como administrador, quiero crear nuevos aceites y modificar los existentes a través de un formulario guiado, para enriquecer y mantener la oferta de la tienda.

- Modo alta (sin parámetro `?id=`): formulario en blanco con categorías reales y asignación automática de identificador secuencial.
- Modo edición (`?id=N`): precarga completa de los datos del producto (nombre, categoría, almazara, denominación de origen, variedad, formato en ml, precio, stock, imagen, descripción y casilla de activo).
- En escritorio (1280 px), la maquetación se distribuye en una rejilla CSS Grid de dos columnas con controles agrupados semánticamente.
- **(error · Obligatorio 7.1)** Si el precio es menor o igual a 0 €, o si algún campo obligatorio queda vacío, se bloquea el envío y se enfoca el primer error.
- **(error · Obligatorio 7.1)** Si se accede con un ID inexistente (`?id=999`), el formulario se oculta y se presenta una alerta clara informando de la ausencia del producto.

---

## ADM-04 · Baja lógica de productos (`admin/productos.html`)

Como administrador, quiero marcar un producto como inactivo sin eliminarlo de la base de datos, para retirarlo de la venta pública sin romper la integridad referencial de los pedidos históricos.

- Cada fila dispone de un botón «Desactivar» / «Reactivar».
- Al desactivar un producto, su estado pasa a «Inactivo (Baja)» y el botón cambia a «Reactivar».
- El producto deja de mostrarse en el catálogo público (`productos.html`) y en la portada (`index.html`), y su ficha directa muestra «Producto no encontrado (404)», pero su registro se mantiene intacto en los pedidos previos.

---

## ADM-05 · Gestión y actualización de estados de pedidos (`admin/pedidos.html`)

Como administrador, quiero revisar todos los pedidos realizados y actualizar su fase de tramitación, para coordinar el empaquetado y la entrega a los clientes.

- Tabla `<table>` con pedidos ordenados cronológicamente: identificador, cliente y correo, fecha de compra, dirección de entrega formateada, número de artículos y precio total.
- Selector de los 5 estados del enunciado: `recibido`, `en_preparacion`, `enviado`, `entregado` y `cancelado`.
- Al pulsar «Actualizar», el cambio se persiste y se notifica al usuario con un mensaje de éxito.
- El cliente ve reflejado el nuevo estado de inmediato en `mis-pedidos.html` y en `pedido.html`.

---

## ADM-06 · Control de acceso y protección de rutas `/admin` (Seguridad)

Como sistema, quiero verificar los permisos del usuario antes de mostrar secciones de administración, para garantizar que solo el personal autorizado gestione el negocio.

- Si un visitante sin sesión intenta abrir cualquier página bajo `admin/`, se le oculta el panel de gestión y se le ofrece enlace de inicio de sesión con parámetro `?volver=`.
- **(error · Obligatorio 7.1)** Si un cliente autenticado (`rol: "cliente"`, ej. Elena) intenta entrar a `admin/productos.html`, `admin/producto-form.html` o `admin/pedidos.html`, el sistema bloquea los datos y muestra el aviso de permisos insuficientes.
