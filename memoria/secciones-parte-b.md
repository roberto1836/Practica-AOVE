# Memoria · Secciones de la Parte B

**Autor:** Integrante B (Compra, cliente y diseño del grupo Oleum).

Estas secciones se integran en la memoria común del grupo. Los anexos detallados se encuentran en la misma carpeta `memoria/`:
- **Anexo A:** historias de usuario del cliente (`analisis/historias-cliente.md`).
- **Anexo B:** inventario de páginas y mapa de navegación (`analisis/inventario-y-mapa.md`).
- **Anexo C:** matriz de pruebas de compra y cliente (`analisis/pruebas-parte-b.md`).

---

## 1. Alcance y responsabilidades de la Parte B

Siguiendo el reparto acordado en el equipo, la Parte B se encarga del ciclo completo de compra del cliente registrado y de la consolidación del sistema visual:

1. **Páginas desarrolladas:**
   - `carrito.html`: cesta de la compra interactiva, modificación de existencias y desglose de costes.
   - `confirmacion.html`: proceso asistido de checkout en 4 fases (Envío, Resumen, Pago simulado y Confirmación).
   - `perfil.html`: consulta y edición accesible de los datos de contacto y entrega habitual del cliente.
   - `mis-pedidos.html`: tabla de historial de compras con estados normalizados y orden cronológico.
   - `pedido.html?id=N`: ficha detallada de un pedido con precios históricos congelados en cada línea.
2. **Componentes compartidos y sistema visual:**
   - Consolidación de `base.css` incorporando tablas accesibles con contenedor de desbordamiento, insignias de estado de pedido, componentes de tarjeta, formularios estructurados con validación accesible y componentes de alertas.
   - Hoja propia `compra.css` respetando fielmente la paleta y tipografía establecidas por la Parte A.
   - Plantillas canónicas de cabecera y pie en `/plantillas/` con contador reactivo del carrito y sincronización en todas las páginas.
3. **Lógica de negocio y persistencia:**
   - Módulo `assets/js/carrito.js` con persistencia en `localStorage`, control estricto de existencias (regla 3.3) y emisión de eventos reactivos.
   - Módulo `assets/js/datos/pedidos.js` con la estructura relacional exacta del apartado 6.1 del enunciado, pedidos iniciales de prueba en los 5 estados obligatorios y congelación de precios.

---

## 2. Decisiones de diseño y arquitectura del front-end

### 2.1 Modelo Vista Controlador (MVC) en el cliente
Al igual que en la Parte A, la arquitectura se ha estructurado para que la transición a la Parte 2 (Servlets, JSP y JDBC) sea directa:

| Capa | Archivos en la Parte 1 | Responsabilidad | Equivalente en la Parte 2 |
| --- | --- | --- | --- |
| **Modelo** | `datos/pedidos.js`, `carrito.js` | Persistencia en `localStorage`, cálculo de importes y verificación de stock | `PedidoDAO`, tabla `pedido`, tabla `linea_pedido` |
| **Lógica** | Métodos puros de validación de cantidades, congelación de precios y cálculo de envío | Reglas de negocio del dominio | Clases de servicio (`PedidoService`, `CarritoService`) |
| **Vista** | `carrito.html`, `confirmacion.html`, `perfil.html`, etc. con `<template>` | Marcado semántico, accesibilidad y tablas | Vistas JSP con JSTL (`<c:forEach>`, `<c:out>`) |
| **Controlador** | `assets/js/paginas/*.js` | Gestión de eventos, control de flujo en pasos y navegación | Servlets (`POST /carrito/items`, `POST /pedidos`) |

### 2.2 Decisiones principales de implementación

1. **Persistencia en `localStorage` con eventos reactivos:**
   El carrito (`'oleum_carrito_v1'`) y los pedidos (`'oleum_pedidos_v1'`) se guardan en el almacenamiento local del navegador. Cada modificación despacha un evento personalizado `window.dispatchEvent(new CustomEvent('carrito:actualizado'))`, permitiendo que el contador numérico de la cabecera se mantenga sincronizado en tiempo real sin recargar la página. Además, se escucha el evento global `'storage'` para sincronizar cambios si el usuario tiene varias pestañas abiertas.
2. **Congelación del precio unitario en la línea (Regla 3.3 y 7.1):**
   Al formalizar una compra, cada línea de pedido guarda una copia exacta del `precio_unitario` vigente en ese instante. Las pruebas automáticas demuestran que si un producto sube o baja de precio en el catálogo con posterioridad, los pedidos históricos mantienen intacto su importe original.
3. **Checkout asistido en 4 pasos con conservación de datos:**
   El proceso de confirmación guía al usuario de manera intuitiva:
   `1. Envío ➔ 2. Resumen ➔ 3. Pago simulado ➔ 4. Confirmación`.
   Si el cliente regresa del paso 2 al paso 1 para corregir su dirección, o si se produce un error de validación, **ningún dato introducido se borra**.
4. **Pago simulado transparente y seguro:**
   Cumpliendo estrictamente el apartado 2 del enunciado, la tienda nunca solicita números reales de tarjeta de crédito ni interactúa con pasarelas externas. Se presenta un aviso explícito en pantalla y opciones didácticas de demostración.
5. **Aislamiento y control de acceso:**
   Un cliente autenticado solo puede consultar sus propios pedidos. Si intenta acceder mediante la URL a un pedido de otro usuario (`pedido.html?id=1006`), el sistema devuelve amigablemente la pantalla de «Pedido no encontrado», equivalente a un código de estado HTTP 403/404.

---

## 3. Sistema visual y coherencia estética

Se ha mantenido una coherencia absoluta con el trabajo previo de la Parte A:
- **Paleta cromática:** uso exclusivo de las variables de `base.css`: verde oliva oscuro (`--color-primario: #3b4a2c`) para acciones principales, crema de fondo (`--color-fondo: #faf7ef`), blanco para tarjetas y oro viejo (`--color-acento: #8c6a1f`) para el foco accesible y el badge del carrito.
- **Tipografía del sistema:** *Palatino Linotype* para encabezados y fuente de interfaz del sistema para textos y formularios, garantizando visualización idéntica y sin retardos en la defensa.
- **Tablas de datos adaptables:** las tablas (`mis-pedidos.html` y detalle de compra) se enmarcan en contenedores `.tabla-contenedor` con desplazamiento horizontal suave y foco de teclado accesible (`tabindex="0"`, `role="region"`), garantizando que en pantallas móviles de **375 px** no se produzca desbordamiento involuntario de la página.
- **Insignias de estado con alto contraste:** cada estado del pedido (`recibido`, `en_preparacion`, `enviado`, `entregado`, `cancelado`) cuenta con una combinación de fondo y texto que supera el ratio de contraste 4,5:1 de las WCAG 2.1 AA.

---

## 4. Accesibilidad (WCAG 2.1 AA)

Se han seguido rigurosamente los cuatro principios de accesibilidad:

1. **Perceptible:**
   - La información de estado de los pedidos no se transmite solo por color, sino siempre acompañada de texto legible explícito.
   - Todas las imágenes de botellas cuentan con texto alternativo contextualizado (`alt="Botella de Primer Día Picual"`).
2. **Operable:**
   - Todo el proceso de compra, desde añadir unidades hasta tramitar y revisar pedidos, se puede ejecutar íntegramente mediante el teclado (`Tab`, `Shift+Tab`, `Enter`, `Espacio`).
   - El anillo de foco (`:focus-visible`) destaca en oro viejo con un grosor de 3 px y separación de 2 px.
   - Objetivos táctiles mínimos de 44 px en los botones «+» y «−» para facilitar su pulsación en dispositivos móviles.
3. **Comprensible:**
   - Todos los campos de formulario cuentan con `<label>` explícitamente asociado mediante `for`/`id`.
   - Los campos con error se señalan programáticamente mediante `aria-invalid="true"` y se enlazan con su mensaje explicativo mediante `aria-describedby`.
   - El foco se traslada automáticamente al primer campo erróneo tras enviar un formulario incompleto.
4. **Robusto:**
   - Uso de regiones en vivo (`aria-live="polite"`, `role="status"`) para anunciar de forma no invasiva las adiciones o eliminaciones en el carrito y las alertas de guardado de perfil.
   - Marcado de pasos de checkout con `aria-current="step"`.

---

## 5. Pruebas y validación

1. **Pruebas automáticas (`node --test`):**
   - 8 pruebas de lógica del carrito en `pruebas/carrito.test.mjs` (cantidades válidas, rechazo de stock, cálculo de tramos de envío gratis a partir de 50 €).
   - 5 pruebas de modelo y pedidos en `pruebas/pedidos.test.mjs` (coherencia de precios congelados, aislamiento de usuarios, presencia de los 5 estados).
   - La suite global pasa **40 de 40 pruebas en ~120 ms**, certificando que no existe ninguna regresión con la Parte A.
2. **Validación W3C:**
   - Todas las páginas (`carrito.html`, `confirmacion.html`, `perfil.html`, `mis-pedidos.html`, `pedido.html`) presentan estructura HTML5 válida, con `<!DOCTYPE html>`, `lang="es"`, metadatos de viewport y hojas de estilo externas.
3. **Comprobación en múltiples anchos:**
   - Verificado a 375 px (móvil compacto), 768 px (tableta) y 1280 px (escritorio), constatando ausencia de solapamientos o scroll horizontal indeseado en el cuerpo de la página.

---

## 6. Contribución de la Parte B

- **Páginas desarrolladas:** Maquetación HTML semántica y controladores JS de Carrito, Confirmación en pasos, Perfil, Mis pedidos y Detalle de pedido.
- **Sistema visual:** Consolidación de `base.css` (tablas adaptables, tarjetas, badges, alertas, stepper, formularios) y creación de `compra.css`.
- **Plantillas canónicas:** Publicación de `plantillas/cabecera.html` y `plantillas/pie.html` y sincronización del componente de cabecera reactivo en todo el sitio web.
- **Módulos de negocio:** Creación de `assets/js/carrito.js` (sustituyendo el mock) y `assets/js/datos/pedidos.js`.
- **Pruebas y documentación:** Suites de test unitarios, matriz de pruebas, historias de usuario del cliente y redacción de la memoria técnica de la Parte B.
