# Historias de Usuario · Parte C (Usuarios y Administración)

Documento integrado con el análisis y mapa de navegación del equipo (`memoria/analisis/historias-administrador.md`).

## VIS-13 · Registro de nuevo cliente (`registro.html`)
- **Historia:** Como *visitante*, quiero *registrarme con mi nombre, correo electrónico, teléfono, dirección y contraseña*, para *obtener una cuenta de cliente y poder realizar pedidos en Oleum*.
- **Criterios de aceptación (Sí/No):**
  - **Caso de éxito:** ¿Si introduzco nombre, un email con formato válido no existente en `usuarios.js`, teléfono de 9 dígitos, dirección y dos contraseñas coincidentes de al menos 8 caracteres, se registra el usuario y se redirige a `login.html?registrado=1` mostrando aviso de confirmación?
  - **Caso de error 1 (Registro duplicado · Obligatorio 7.1):** ¿Si intento registrarme con un correo que ya existe (ej. `elena@oleum.es`), el sistema impide el alta, marca el campo con `aria-invalid="true"`, muestra el error junto al email y conserva todos los demás datos introducidos?
  - **Caso de error 2 (Contraseñas distintas o campos inválidos):** ¿Si las contraseñas no coinciden o algún campo incumple las reglas HTML5, se muestra un mensaje comprensible junto a cada campo sin borrar lo escrito?

## VIS-14 · Inicio y cierre de sesión (`login.html` y cabecera común)
- **Historia:** Como *visitante o usuario registrado*, quiero *iniciar y cerrar sesión en la tienda*, para *acceder a las opciones propias de mi rol (cliente o administrador)*.
- **Criterios de aceptación (Sí/No):**
  - **Caso de éxito:** ¿Si inicio sesión con credenciales válidas de un usuario con `activo: true`, se guarda `{ id, nombre, rol, email, telefono, direccion }` en `sessionStorage`, la cabecera muestra las opciones de mi rol y se me redirige a la ruta interna de `?volver=` (o a `index.html` / `admin/productos.html`)?
  - **Caso de error 1 (Credenciales incorrectas o cuenta inactiva · Obligatorio 7.1):** ¿Si el correo no existe, la contraseña no coincide o el usuario tiene `activo: false`, se deniega el acceso con un mensaje claro sin exponer detalles técnicos?
  - **Caso de error 2 (Redirección abierta · Acuerdo 6):** ¿Si el parámetro `?volver=` apunta a un dominio externo (`https://...` o `//...`), se descarta y se redirige de forma segura a una ruta relativa interna?

## ADM-01 y ADM-02 · Mantenimiento de catálogo, stock y métricas (`admin/productos.html`)
- **Historia:** Como *administrador*, quiero *listar todos los productos, consultar métricas de inventario y actualizar el stock en línea*, para *mantener el almacén al día de forma inmediata*.
- **Criterios de aceptación (Sí/No):**
  - **Caso de éxito:** ¿Con sesión de `'admin'` puedo ver todos los productos en una `<table>`, consultar métricas cuantitativas y modificar el stock de cualquier producto guardándolo en un clic?
  - **Caso de error 1 (Stock negativo o inválido · Obligatorio 7.1):** ¿Si introduzco un stock negativo o no entero, `validacion.js` bloquea el guardado, marca `aria-invalid="true"` y mantiene los datos válidos?
  - **Caso de error 2 (Acceso no autorizado a `/admin` · Obligatorio 7.1):** ¿Si un visitante o un usuario con rol `'cliente'` intenta abrir `admin/productos.html`, se oculta el panel y se muestra el mensaje de acceso restringido?

## ADM-03 y ADM-04 · Formulario de alta/edición y baja lógica (`admin/producto-form.html`, `admin/productos.html`)
- **Historia:** Como *administrador*, quiero *crear nuevos productos, editar los existentes y aplicar bajas lógicas*, para *actualizar la oferta sin romper la integridad de los pedidos históricos*.
- **Criterios de aceptación (Sí/No):**
  - **Caso de éxito:** ¿Puedo dar de alta un producto o editar sus datos en `admin/producto-form.html` y cambiar su estado `activo: true/false` con el botón «Desactivar» / «Reactivar» sin borrar el registro de la base de datos?
  - **Caso de error 1 (Precio menor o igual a 0 · Obligatorio 7.1):** ¿Si el precio unitario es menor o igual a 0 €, se impide el guardado y se resalta el error?
  - **Caso de error 2 (Producto inexistente · Obligatorio 7.1):** ¿Si accedo a `admin/producto-form.html?id=999` con un ID que no existe, se oculta el formulario y se informa claramente de que el producto no existe?

## ADM-05 · Gestión de estados de pedidos (`admin/pedidos.html`)
- **Historia:** Como *administrador*, quiero *consultar todos los pedidos de los clientes y actualizar su estado*, para *reflejar el progreso real desde su recepción hasta la entrega o cancelación*.
- **Criterios de aceptación (Sí/No):**
  - **Caso de éxito:** ¿En `admin/pedidos.html` se muestra una `<table>` con todos los pedidos (cliente legible, fecha local y dirección formateada) y puedo actualizar su estado entre `'recibido'`, `'en_preparacion'`, `'enviado'`, `'entregado'` y `'cancelado'`, persistiendo el cambio en el almacenamiento compartido?
  - **Caso de error (Acceso no autorizado a `/admin` · Obligatorio 7.1):** ¿Si un visitante o un `'cliente'` intenta acceder a `admin/pedidos.html`, el sistema bloquea la visualización y modificación de los pedidos?
