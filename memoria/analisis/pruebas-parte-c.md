# Pruebas y calidad · Parte C (Usuarios, Admin y Calidad)

La Parte C se ha validado en cuatro dimensiones: pruebas automáticas unitarias (`node --test`), matriz de casos de prueba del apartado 7.1 del enunciado, validación de estándares W3C y verificación de accesibilidad WCAG 2.1 AA en dispositivos de 375 px y 1280 px.

| Nivel | Herramienta | Resultado |
| --- | --- | --- |
| Lógica de sesión, registro y seguridad | `node --test pruebas/sesion.test.mjs` (11 pruebas) | 11 de 11 correctas |
| Suite global de la aplicación | `node --test pruebas/*.test.mjs` (51 pruebas totales: 27 de A + 13 de B + 11 de C) | 51 de 51 correctas en 67 ms |
| Estructura HTML5 y validación W3C | Nu Html Checker / sintaxis estricta W3C | 0 errores en las 5 páginas de C |
| Hojas de estilo CSS (`admin.css`, `base.css`) | Validador CSS W3C y variables comunes | 0 errores; contraste AA cumplido (4,5:1) |
| Accesibilidad y teclado | Navegación con Tab, Shift+Tab, Enter y Espacio | Foco visible (`:focus-visible`) y labels asociados |
| Diseño adaptable (Responsive) | Viewports de 375 px (móvil) y 1280 px (escritorio) | Tablas apiladas sin scroll horizontal en móvil |

---

## Matriz de casos de prueba de la Parte C

| Id | Historia | Datos y pasos | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- | --- |
| **P-C01** | VIS-13 (error) | En `registro.html`, introducir `email = elena@oleum.es` con resto de datos válidos y enviar | Se deniega el registro por correo duplicado, se marca `aria-invalid="true"` en el email y se conservan intactos los demás datos (nombre, teléfono, dirección) | Correcto |
| **P-C02** | VIS-13 (error) | Introducir dos contraseñas distintas en `registro.html` | Mensaje «Las contraseñas no coinciden» junto al campo de repetir contraseña, con foco en el error | Correcto |
| **P-C03** | VIS-13 (error) | Introducir un teléfono incorrecto «12345» | «Introduce un teléfono español válido de 9 dígitos» señalado por `validacion.js` | Correcto |
| **P-C04** | VIS-13 | Registrar un usuario nuevo válido | Redirección a `login.html?registrado=1` y notificación de confirmación de cuenta | Correcto |
| **P-C05** | VIS-14 | En `login.html`, pulsar botón demo «Cliente (Elena)» y enviar | Se inicia sesión como cliente, se almacena en `sessionStorage` y se sincroniza el menú en la cabecera | Correcto |
| **P-C06** | VIS-14 | En `login.html`, pulsar botón demo «Administrador» y enviar | Se inicia sesión como admin, la cabecera muestra «Administración» y se redirige a `admin/productos.html` | Correcto |
| **P-C07** | VIS-14 (error) | Introducir contraseña errónea para `elena@oleum.es` | Alerta «El correo electrónico o la contraseña no son correctos», sin desvelar qué dato falló | Correcto |
| **P-C08** | VIS-14 (error) | Pulsar botón demo «Cuenta inactiva» (`inactivo@oleum.es`) y enviar | Denegación con mensaje «Esta cuenta está desactivada. Contacta con administración» | Correcto |
| **P-C09** | VIS-14 | Pulsar «Cerrar sesión» en cualquier cabecera | Se borra la sesión de `sessionStorage` y el menú regresa a estado visitante | Correcto |
| **P-C10** | VIS-14 (error) | Acceder con parámetro `login.html?volver=https://sitio-malicioso.com` | `obtenerRutaVolverSegura()` descarta la URL externa y redirige a la ruta interna segura | Correcto |
| **P-C11** | ADM-01 | Abrir `admin/productos.html` con sesión de admin | Tabla con todos los aceites y métricas cuantitativas superiores de catálogo y stock | Correcto |
| **P-C12** | ADM-02 | Modificar el stock del producto #1 a 40 unidades y pulsar «Guardar» | Stock actualizado en la tabla, métricas recalculadas y reflejo en el catálogo público | Correcto |
| **P-C13** | ADM-02 (error) | Introducir un stock negativo (-5) en la tabla | Error «El stock no puede ser negativo y debe ser un número entero» y bloqueo del guardado | Correcto |
| **P-C14** | ADM-03 | Acceder a `admin/producto-form.html` y dar de alta un producto nuevo | Asignación automática de nuevo ID, guardado y redirección a `productos.html?guardado=1` | Correcto |
| **P-C15** | ADM-03 (error) | Acceder a `admin/producto-form.html?id=999` (inexistente) | Se oculta el formulario y se presenta la alerta «No existe ningún producto con el identificador #999» | Correcto |
| **P-C16** | ADM-04 | En `admin/productos.html`, pulsar «Desactivar» en el producto #1 | El estado cambia a «Inactivo (Baja)», el botón pasa a «Reactivar» y el producto no se elimina | Correcto |
| **P-C17** | ADM-05 | En `admin/pedidos.html`, cambiar el estado de un pedido a «Enviado» | El estado se persiste en `oleum_pedidos_v1` y el cliente lo ve actualizado en su historial | Correcto |
| **P-C18** | ADM-06 (error) | Intentar entrar a `/admin` como visitante o cliente | El panel se oculta completamente y se muestra la pantalla de acceso restringido | Correcto |
| **P-C19** | General | Probar tablas de admin en resolución móvil de 375 px | Filas transformadas en bloques con etiquetas `data-etiqueta`, sin desbordamiento horizontal | Correcto |
| **P-C20** | General | Navegación íntegra con teclado (Tab, Enter, Espacio) | Salto al contenido operativo, foco visible y formularios operables sin ratón | Correcto |
