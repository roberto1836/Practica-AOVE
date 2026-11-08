# Pruebas y calidad · Parte B (Compra, cliente y diseño)

La Parte B se ha verificado en tres niveles: pruebas automáticas de la lógica de dominio (`node --test`), pruebas de criterios de aceptación y casos de error en el navegador, y comprobaciones de accesibilidad (contraste WCAG 2.1 AA, navegación por teclado, comportamiento en 375 px y 1280 px).

| Nivel | Herramienta | Resultado |
| --- | --- | --- |
| Lógica del carrito (`carrito.js`) | `node --test` (8 pruebas, `pruebas/carrito.test.mjs`) | 8 de 8 correctas |
| Persistencia y reglas de pedidos (`pedidos.js`) | `node --test` (5 pruebas, `pruebas/pedidos.test.mjs`) | 5 de 5 correctas |
| Suite global de la aplicación | `node --test` (40 pruebas totales: 27 de A + 13 de B) | 40 de 40 correctas en 120 ms |
| Estructura HTML5 y validación | Validador W3C Nu Checker / sintaxis estricta | 0 errores en las 5 páginas de B |
| Hojas de estilo CSS | Sintaxis W3C y variables de `base.css` | 0 errores; contraste AA cumplido |
| Accesibilidad y teclado | Navegación con Tab, Shift+Tab, Enter y Espacio | Foco visible en todos los interactivos |
| Diseño adaptable (Responsive) | Viewports de 375 px (móvil) y 1280 px (escritorio) | Sin desbordamiento horizontal ni solapes |

---

## Matriz de casos de prueba de la Parte B

| Id | Historia | Datos y pasos | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- | --- |
| P-B01 | CLI-01 | En `producto.html?id=1`, indicar cantidad 2 y pulsar «Añadir al carrito» | Mensaje «Añadido al carrito: 2 × Primer Día Picual»; contador de cabecera pasa a 2 | Correcto |
| P-B02 | CLI-01 (error) | Intentar añadir cantidad 0 o 999 (superando stock) | Error junto al campo; no se añade nada y no se modifica el contador | Correcto |
| P-B03 | CLI-02 | Abrir `carrito.html` con 2 botellas de Primer Día Picual (18,95 €) | Subtotal 37,90 €; envío 4,95 €; total 42,85 €; aviso «Añade 12,10 € más para envío gratis» | Correcto |
| P-B04 | CLI-02 | Añadir productos hasta superar 50 € de subtotal | Los gastos de envío pasan a «Gratis» (0,00 €) y desaparece el aviso de importe restante | Correcto |
| P-B05 | CLI-03 | En `carrito.html`, pulsar botón «+» en un producto | Se incrementa 1 unidad, el subtotal de la línea y el resumen general se recalculan; se anuncia por `aria-live` | Correcto |
| P-B06 | CLI-03 (error) | Pulsar «+» hasta agotar el stock del producto | El botón «+» se desactiva (`disabled`) impidiendo sobrepasar las existencias | Correcto |
| P-B07 | CLI-03 | Reducir la cantidad a 1 unidad con el botón «−» | El botón «−» se desactiva al alcanzar la unidad mínima | Correcto |
| P-B08 | CLI-04 | Pulsar botón «Eliminar» en la única línea del carrito | El artículo se retira y aparece la sección de «Tu carrito está vacío» con enlace al catálogo | Correcto |
| P-B09 | CLI-05 (error) | Acceder directamente a `confirmacion.html` con el carrito vacío | Se oculta el formulario y se muestra la sección de bloqueo indicando que no hay artículos | Correcto |
| P-B10 | CLI-05 (error) | Acceder a `confirmacion.html` sin sesión activa (`usuarioActual() = null`) | Redirección automática a `login.html?volver=confirmacion.html` | Correcto |
| P-B11 | CLI-06 | En el paso 1 de `confirmacion.html`, pulsar «Continuar» con campos vacíos | Errores junto a cada campo obligatorio, foco en el primer campo erróneo, datos válidos conservados | Correcto |
| P-B12 | CLI-06 (error) | Introducir teléfono no válido «123» y CP «288» | «Introduce un teléfono español válido de 9 dígitos» y «El código postal debe constar de 5 dígitos» con `aria-invalid="true"` | Correcto |
| P-B13 | CLI-06 | Rellenar datos correctos y pulsar «Continuar al resumen» | Se valida y avanza al paso 2; indicador muestra paso 1 completado y paso 2 activo | Correcto |
| P-B14 | CLI-07 | En el paso 2 de confirmación, revisar dirección y líneas | La dirección coincide con la tecleada; la tabla desglosa aceites, cantidades y totales | Correcto |
| P-B15 | CLI-07 | En el paso 2, pulsar botón «Modificar» | Se regresa al paso 1 conservando intactos todos los valores previamente escritos | Correcto |
| P-B16 | CLI-08 | En el paso 3 de confirmación, revisar opciones de pago | Aviso visible de pago simulado; selector de tarjeta, Bizum o transferencia seleccionable | Correcto |
| P-B17 | CLI-09 | Pulsar «Confirmar y formalizar pedido» en el paso 3 | Se crea el pedido (ej. OLEUM-1007), se vacía el carrito (contador a 0) y se muestra el paso 4 de éxito | Correcto |
| P-B18 | CLI-09 | En el paso 4, pulsar «Ver detalle del pedido» | Conduce a `pedido.html?id=1007` mostrando la información completa | Correcto |
| P-B19 | CLI-10 | Abrir `mis-pedidos.html` como cliente autenticado | Tabla con pedidos ordenados por fecha descendente; badges visuales con sus 5 estados | Correcto |
| P-B20 | CLI-10 | Probar visualización de `mis-pedidos.html` a 375 px | La tabla no rompe la maquetación; desplazamiento táctil/teclado accesible (`tabindex="0"`) | Correcto |
| P-B21 | CLI-11 | Abrir `pedido.html?id=1001` (pedido histórico de 18,95 €) | Se muestran las líneas con el precio unitario congelado de 18,95 € aunque el catálogo cambie | Correcto |
| P-B22 | CLI-11 (error) | Abrir `pedido.html?id=9999` (inexistente) | Pantalla amigable «Pedido no encontrado» con enlaces a mis pedidos y catálogo | Correcto |
| P-B23 | CLI-11 (error) | Abrir `pedido.html?id=1006` (pedido de otro usuario) | «Pedido no encontrado» (aislamiento de seguridad por rol y propietario) | Correcto |
| P-B24 | CLI-12 | En `perfil.html`, modificar teléfono y dirección y pulsar «Guardar cambios» | Se valida, se persiste en el almacenamiento y se anuncia alerta accesible de éxito | Correcto |
| P-B25 | General | Recorrer las 5 páginas solo con teclado (Tab, Enter) | Foco en acento visible en todos los botones, enlaces y campos; orden lógico | Correcto |
