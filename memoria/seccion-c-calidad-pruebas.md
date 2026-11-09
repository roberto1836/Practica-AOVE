# Memoria Técnica · Parte C: Validación W3C, Accesibilidad, Despliegue y Pruebas

## 1. Validación W3C de HTML y CSS (Apartado 5.3)
Todas las páginas de autenticación y administración (`login.html`, `registro.html`, `admin/productos.html`, `admin/producto-form.html` y `admin/pedidos.html`), así como las hojas de estilo (`base.css` y `admin.css`), cumplen estrictamente los estándares del W3C (**0 errores en Nu Html Checker y W3C CSS Validator**):
- **Marcado semántico:** Uso de `<header>`, `<nav>`, `<main>`, `<section>`, `<aside>` y `<footer>`, con declaración `<!DOCTYPE html>`, `<meta charset="utf-8">` y `lang="es"`.
- **Separación de responsabilidades y prevención de XSS:** Cero estilos en línea (`style="..."`) y cero manejadores de eventos en atributos HTML. Los datos dinámicos se representan clonando nodos `<template>` y asignando texto exclusivamente mediante `textContent`, evitando cualquier inyección XSS.
- **Plantillas válidas:** Los controles dentro de `<template>` cuentan con asociación explícita `<label for="...">` que se actualiza dinámicamente con IDs únicos por fila (`stock-prod-{id}`, `estado-pedido-{id}`).

## 2. Accesibilidad WCAG 2.1 AA y Diseño Adaptable (375 px y 1280 px)
- **Navegación por teclado y foco:** Enlace `.saltar-al-contenido` operativo como primer elemento tabulable de cada documento y contorno `:focus-visible` de 3 px en color `--color-acento` (`#8c6a1f`).
- **Contraste:** Verificado el cumplimiento del ratio mínimo 4,5:1 para texto normal y 3:1 para bordes de componentes (`--color-borde-campo: #7d7866`) sobre `--color-fondo` (`#faf7ef`) y `--color-superficie` (`#ffffff`).
- **Gestión de errores en formularios (`validacion.js`):** Al fallar la validación en cliente, no se borra ningún dato introducido, se añade `aria-invalid="true"` al campo erróneo, se vincula mediante `aria-describedby` un párrafo `<p class="campo-error" role="alert">` con el motivo exacto del fallo y se desplaza el foco al primer campo con error.
- **Adaptabilidad a 375 px y 1280 px:** Punto de corte principal en `768px`. Por debajo de `768px` (comprobado en 375 px), las tablas `.tabla-admin` transforman sus filas en tarjetas verticales mediante `data-etiqueta`, eliminando cualquier barra de desplazamiento horizontal injustificada. En escritorio (1280 px), el formulario de producto se organiza en rejilla CSS Grid de dos columnas.

## 3. Matriz de Casos de Prueba (Apartado 7.1)

| ID | Caso de prueba | Entrada / Condición | Pasos ejecutados | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- | --- | --- |
| **CP-C01** | Registro con correo duplicado *(7.1)* | `email = elena@oleum.es`, resto de campos válidos | Abrir `registro.html`, completar campos y pulsar «Registrarme». | Se bloquea el registro, se marca `aria-invalid="true"` en el email con mensaje de cuenta duplicada y se conservan nombre, teléfono y dirección. | **Correcto (OK)** |
| **CP-C02** | Credenciales incorrectas *(7.1)* | `email = elena@oleum.es`, `password = ClaveFalsa1` | Abrir `login.html`, introducir datos y pulsar «Entrar». | No se crea sesión; se muestra alerta de error genérica sin revelar si falló el correo o la clave. | **Correcto (OK)** |
| **CP-C03** | Inicio de sesión con cuenta inactiva | `email = inactivo@oleum.es`, `password = Cliente123!` | Pulsar botón demo «Cuenta inactiva» en `login.html` y enviar. | Se impide el inicio de sesión informando de que la cuenta está desactivada (`activo: false`). | **Correcto (OK)** |
| **CP-C04** | Contraseñas no coincidentes en registro | `password = Cliente123!`, `passwordRepetir = Otra1234!` | Completar `registro.html` con claves distintas y enviar. | `validacion.js` señala el error junto a «Repetir contraseña» y mantiene los datos del formulario. | **Correcto (OK)** |
| **CP-C05** | Precio o stock negativo/cero en producto *(7.1)* | `precio = 0` o `-5`, `stock = -2` | En `admin/producto-form.html` o en la tabla de `admin/productos.html`, guardar valores inválidos. | Se impide el guardado, se marca el campo con `aria-invalid="true"` y se conserva el resto de campos. | **Correcto (OK)** |
| **CP-C06** | Edición de producto inexistente *(7.1)* | URL `admin/producto-form.html?id=999` | Navegar con sesión de administrador a un ID inexistente. | Se oculta el formulario y se muestra alerta indicando que el producto `#999` no existe. | **Correcto (OK)** |
| **CP-C07** | Baja lógica de producto | Producto `#1` (`activo: true`) | En `admin/productos.html`, pulsar el botón «Desactivar». | El estado cambia a «Inactivo (Baja)» (`activo: false`) sin eliminar el registro de la lista. | **Correcto (OK)** |
| **CP-C08** | Cliente intentando acceder a `/admin` *(7.1)* | Sesión iniciada como `elena@oleum.es` (`rol: cliente`) | Acceder directamente a `admin/productos.html`, `admin/producto-form.html` o `admin/pedidos.html`. | `verificarAcceso('admin')` mantiene oculto el panel de administración y muestra la sección `#bloqueo-acceso`. | **Correcto (OK)** |
| **CP-C09** | Cambio de estado de pedido | Pedido `#1001` en estado `recibido` | En `admin/pedidos.html`, seleccionar `enviado` y pulsar «Actualizar». | El pedido pasa a `enviado`, se persiste en `oleum_pedidos_v1` y se muestra confirmación en pantalla. | **Correcto (OK)** |
| **CP-C10** | Prevención de redirección abierta *(Acuerdo 6)* | URL `login.html?volver=https://sitio-externo.com` | Iniciar sesión con credenciales válidas desde esa URL. | `obtenerRutaVolverSegura()` descarta la URL externa y redirige a la página interna por defecto. | **Correcto (OK)** |

## 4. Pruebas Unitarias Automatizadas
Se ha integrado la suite de pruebas unitarias para la Parte C bajo el ejecutor nativo `node --test` (`pruebas/sesion.test.mjs`):
- **11 pruebas unitarias** que cubren autenticación de clientes y administradores, denegación por clave errónea o cuenta inactiva, registro y duplicados, sanitización de redirecciones abiertas, control de acceso por rol y gestión de estados de pedidos.
- **Suite global del proyecto:** 51 pruebas automáticas (27 de A + 13 de B + 11 de C), ejecutadas con éxito al 100% en menos de 70 ms.

## 5. Despliegue en Apache Tomcat 10.1
- **Directorio de contexto:** `/oleum/` bajo `$TOMCAT_HOME/webapps/oleum`.
- **Rutas y recursos:** Verificado que todas las referencias a CSS, imágenes, favicon y módulos JavaScript ES6 (`type="module"`) emplean rutas relativas estrictas y responden con código HTTP `200 OK` y `Content-Type: text/javascript`.
- **Automatización:** Script de sincronización `./desplegar-tomcat.sh` ejecutable con un solo comando.
