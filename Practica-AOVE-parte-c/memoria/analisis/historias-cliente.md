# Historias de usuario · Cliente (Parte B)

Formato: «Como [actor], quiero [acción], para [objetivo]». Cada criterio de aceptación se puede comprobar con un sí o un no. Los marcados como **(error)** cubren el camino alternativo o de validación. Los identificadores siguen el esquema del grupo: `CLI` cliente.

---

## CLI-01 · Seleccionar unidades y añadir al carrito desde la ficha

Como cliente, quiero elegir cuántas unidades de un aceite deseo comprar y añadirlas a mi cesta, para preparar mi compra.

- Puedo indicar cualquier cantidad entera entre 1 y el stock disponible del producto.
- Dispone de botones táctiles «+» y «−» para ajustar la cantidad con un solo clic.
- Al pulsar «Añadir al carrito», el producto se almacena y se actualiza el contador global de la cabecera sin recargar.
- **(error)** Si indico 0, un número negativo o no entero, aparece el mensaje de error junto al campo y no se añade nada.
- **(error)** Si indico una cantidad mayor que el stock actual, se avisa del stock máximo disponible y no se añade.
- **(error)** Si ya tenía unidades en el carrito y la suma acumulada supera el stock, se notifica el límite restante disponible.

---

## CLI-02 · Consultar el contenido de la cesta y el desglose de costes

Como cliente, quiero ver la lista de aceites que he seleccionado con sus importes desglosados, para comprobar el coste total antes de comprar.

- En `carrito.html` se muestra cada artículo con su imagen, nombre con enlace a su ficha, variedad, formato, precio unitario, cantidad y subtotal.
- La tarjeta de resumen desglosa el subtotal, los gastos de envío y el importe total con IVA incluido.
- Si el subtotal es menor de 50 €, se indica el importe restante necesario para disfrutar de gastos de envío gratuitos.
- A partir de 50 € de subtotal, los gastos de envío se marcan como «Gratis» (0,00 €).
- Desde el carrito hay un enlace directo «Continuar comprando» para volver al catálogo.

---

## CLI-03 · Modificar unidades de un artículo en el carrito

Como cliente, quiero poder cambiar el número de unidades de un aceite directamente desde el carrito, para ajustar mi pedido sin salir de la página.

- Cada línea dispone de controles «+» y «−» e introducción directa de unidades.
- Al modificar la cantidad, el subtotal de la línea, el resumen general y el badge de la cabecera se recalculan al instante.
- El cambio se anuncia mediante tecnologías de asistencia (`aria-live="polite"`).
- **(error)** El botón «+» se desactiva cuando se alcanza el stock máximo del producto.
- **(error)** Si se reduce la cantidad a 0 mediante el campo numérico, el producto se elimina del carrito.

---

## CLI-04 · Eliminar productos y gestionar el carrito vacío

Como cliente, quiero poder retirar artículos que ya no deseo o vaciar mi cesta, para mantenerla al día.

- Cada línea de artículo incluye un botón «Eliminar» claramente identificado.
- Al pulsar «Eliminar», la línea desaparece suavemente y los totales se recalculan.
- Si se eliminan todos los artículos, se muestra un estado visual amigable de carrito vacío con enlace destacado a `productos.html`.
- Con el carrito vacío no se muestran botones para tramitar el pedido.

---

## CLI-05 · Iniciar la confirmación del pedido

Como cliente autenticado, quiero iniciar el proceso de tramitación desde el carrito, para formalizar mi compra.

- El botón «Tramitar pedido» conduce a `confirmacion.html`.
- **(error)** Si el carrito está vacío, `confirmacion.html` muestra un aviso de bloqueo impidiendo continuar e invitando al catálogo.
- **(error)** Si el usuario no ha iniciado sesión, se le redirige a `login.html?volver=confirmacion.html`.

---

## CLI-06 · Introducir y validar la dirección de entrega

Como cliente, quiero indicar los datos postales de entrega y teléfono, para que el pedido llegue correctamente a mi domicilio.

- El formulario solicita: Nombre y apellidos, Teléfono de contacto, Calle y número, Código Postal (5 dígitos), Ciudad y Provincia.
- Si el cliente ya tenía su dirección en su perfil, los campos se pre-cumplimentan automáticamente.
- Los campos obligatorios se señalan de forma visual y programática (`required`, `aria-hidden="true"` en asteriscos).
- **(error)** Si falta algún campo obligatorio o el teléfono/código postal no tienen formato español válido, se muestra el error específico bajo cada campo afectado con `aria-invalid="true"` y se conserva todo lo ya escrito sin borrar datos.
- **(error)** El foco del teclado se desplaza automáticamente al primer campo erróneo para facilitar la corrección.

---

## CLI-07 · Revisar el resumen completo antes de formalizar

Como cliente, quiero comprobar en una pantalla de resumen la dirección y los artículos antes de pagar, para evitar equivocaciones.

- El paso 2 del checkout muestra la dirección de envío formateada y la tabla de artículos con subtotales y total general.
- Dispone de un botón «Modificar» que permite regresar al paso 1 conservando todos los datos introducidos para corregir cualquier errata.
- Dispone de un botón «Continuar al pago» que avanza al paso 3.

---

## CLI-08 · Seleccionar un método de pago ficticio

Como cliente, quiero seleccionar una forma de pago simulada para la demostración, comprendiendo que es un entorno académico sin cargos reales.

- La interfaz muestra un aviso destacado recordando que el pago es 100% simulado (apartado 2 del enunciado).
- Permite elegir entre tarjeta de prueba ficticia (4242 ••••), Bizum simulado y transferencia.
- Cada opción se presenta en una tarjeta seleccionable con teclado y ratón.

---

## CLI-09 · Recibir la confirmación y referencia del pedido

Como cliente, quiero ver la confirmación inmediata de mi compra con un identificador único, para tener constancia de que se ha recibido.

- Al pulsar «Confirmar y formalizar pedido», se crea el pedido en el sistema y se vacía el carrito automáticamente.
- La pantalla final (paso 4) muestra el código de pedido generado (ej. `OLEUM-1007`), fecha y hora, total abonado, estado «Recibido» y dirección de entrega.
- Ofrece botones directos para «Ver detalle del pedido» (`pedido.html?id=...`), «Ir a mis pedidos» (`mis-pedidos.html`) y «Volver al inicio».

---

## CLI-10 · Consultar mi historial de pedidos

Como cliente, quiero ver una tabla con todas mis compras anteriores y su estado actual, para comprobar mis pedidos en Oleum.

- En `mis-pedidos.html` se presenta una tabla accesible con columnas: Nº Pedido, Fecha, Artículos, Total, Estado y Acción.
- Los pedidos se ordenan cronológicamente del más reciente al más antiguo.
- Cada estado se distingue con su etiqueta e insignia visual de color contrastado: Recibido, En preparación, Enviado, Entregado o Cancelado.
- En pantallas estrechas (375 px) la tabla se puede desplazar horizontalmente con el teclado (`tabindex="0"`) sin romper la maquetación.
- Si el usuario no tiene compras registradas, se muestra un mensaje informativo con llamada a la acción para descubrir productos.

---

## CLI-11 · Ver el detalle completo de un pedido anterior

Como cliente, quiero acceder a la vista detallada de cualquiera de mis pedidos, para consultar los precios y productos que compré en su momento.

- Desde el historial o la confirmación puedo acceder a `pedido.html?id=N`.
- La vista desglosa cada línea con el precio unitario exacto aplicado en el momento de la compra (**regla de negocio 3.3**), permaneciendo inalterable aunque el producto varíe de precio en el catálogo.
- Si un producto de un pedido antiguo fue dado de baja lógica (`activo: false`), el pedido histórico sigue visualizándose sin romperse.
- **(error)** Si se solicita un id de pedido inexistente o perteneciente a otro cliente, se muestra la pantalla de «Pedido no encontrado» sin revelar datos ajenos (apartados 3.2 y 7.1).

---

## CLI-12 · Editar mi perfil y datos predeterminados

Como cliente, quiero actualizar mis datos de contacto y dirección en mi cuenta, para no tener que escribirlos cada vez que compre.

- En `perfil.html` puedo consultar y modificar mi nombre, correo electrónico, teléfono y dirección habitual.
- La validación comprueba el formato de correo, código postal y teléfono sin borrar los datos introducidos ante un fallo.
- Al guardar correctamente, se muestra un mensaje accesible de confirmación (`role="status"`, `aria-live="polite"`).
- Se proporcionan accesos directos hacia «Mis pedidos» y «Mi carrito».
