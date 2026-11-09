# Historias de Usuario · Parte C (Usuarios y Administración)

Documento listo para entregar al responsable de la **Parte A** para su integración en el inventario de páginas y el mapa de navegación.

## HU-C01 · Registro de nuevo cliente (`registro.html`)
- **Historia:** Como *visitante*, quiero *registrarme con mi nombre, correo electrónico, teléfono, dirección y contraseña*, para *obtener una cuenta de cliente y poder realizar pedidos en Oleum*.
- **Criterios de aceptación (Sí/No):**
  - **Caso de éxito:** ¿Si introduzco nombre, un email con formato válido no existente en `usuarios.js`, teléfono de 9 dígitos, dirección y dos contraseñas coincidentes de al menos 8 caracteres, se registra el usuario y se redirige a `login.html?registrado=1` mostrando aviso de confirmación?
  - **Caso de error 1 (Registro duplicado · Obligatorio 7.1):** ¿Si intento registrarme con un correo que ya existe (ej. `elena@oleum.es`), el sistema impide el alta, marca el campo con `aria-invalid="true"`, muestra el error junto al email y conserva todos los demás datos introducidos?
  - **Caso de error 2 (Contraseñas distintas o campos inválidos):** ¿Si las contraseñas no coinciden o algún campo incumple las reglas HTML5, se muestra un mensaje comprensible junto a cada campo sin borrar lo escrito?

## HU-C02 · Inicio y cierre de sesión (`login.html` y cabecera común)
- **Historia:** Como *visitante o usuario registrado*, quiero *iniciar y cerrar sesión en la tienda*, para *acceder a las opciones propias de mi rol (cliente o administrador)*.
- **Criterios de aceptación (Sí/No):**
  - **Caso de éxito:** ¿Si inicio sesión con credenciales válidas de un usuario con `activo: true`, se guarda `{ id, nombre, rol }` en `sessionStorage`, la cabecera muestra las opciones de mi rol y se me redirige a la ruta interna de `?volver=` (o a `index.html` / `admin/productos.html`)?
  - **Caso de error 1 (Credenciales incorrectas o cuenta inactiva · Obligatorio 7.1):** ¿Si el correo no existe, la contraseña no coincide o el usuario tiene `activo: false`, se deniega el acceso con un mensaje claro sin exponer detalles técnicos?
  - **Caso de error 2 (Redirección abierta · Acuerdo 6):** ¿Si el parámetro `?volver=` apunta a un dominio externo (`https://...` o `//...`), se descarta y se redirige de forma segura a una ruta relativa interna?

## HU-C03 · Mantenimiento de catálogo, stock y baja lógica (`admin/productos.html`, `admin/producto-form.html`)
- **Historia:** Como *administrador*, quiero *listar todos los productos, crear nuevos, editar los existentes, actualizar su stock y aplicar bajas lógicas*, para *mantener actualizado el catálogo sin romper la integridad de los pedidos históricos*.
- **Criterios de aceptación (Sí/No):**
  - **Caso de éxito:** ¿Con sesión de `'admin'` puedo ver todos los productos en una `<table>`, modificar su stock en línea, crear o editar un producto en `admin/producto-form.html` y cambiar su estado `activo: true/false` sin eliminarlo físicamente?
  - **Caso de error 1 (Precio o stock inválido · Obligatorio 7.1):** ¿Si introduzco un precio menor o igual a 0 o un stock negativo, `validacion.js` bloquea el envío, marca `aria-invalid="true"` y mantiene los datos válidos del formulario?
  - **Caso de error 2 (Producto inexistente · Obligatorio 7.1):** ¿Si accedo a `admin/producto-form.html?id=999` con un ID que no existe, se oculta el formulario y se informa claramente de que el producto no existe?
  - **Caso de error 3 (Acceso no autorizado a `/admin` · Obligatorio 7.1):** ¿Si un visitante o un usuario con rol `'cliente'` intenta abrir `admin/productos.html` o `admin/producto-form.html`, se oculta el panel y se muestra el mensaje de acceso restringido?

## HU-C04 · Gestión de estados de pedidos (`admin/pedidos.html`)
- **Historia:** Como *administrador*, quiero *consultar todos los pedidos de los clientes y actualizar su estado*, para *reflejar el progreso real desde su recepción hasta la entrega o cancelación*.
- **Criterios de aceptación (Sí/No):**
  - **Caso de éxito:** ¿En `admin/pedidos.html` se muestra una `<table>` con todos los pedidos y puedo actualizar el estado de cualquiera de ellos entre `'recibido'`, `'en_preparacion'`, `'enviado'`, `'entregado'` y `'cancelado'`, persistiendo el cambio en la sesión?
  - **Caso de error (Acceso no autorizado a `/admin` · Obligatorio 7.1):** ¿Si un visitante o un `'cliente'` intenta acceder a `admin/pedidos.html`, el sistema bloquea la visualización y modificación de los pedidos?
