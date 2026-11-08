# Oleum · Tienda online de aceite de oliva virgen extra

Práctica de curso de **Arquitectura y Diseño de Sistemas Web y C/S** (Universidad de Alcalá, curso 2026-27).
Aplicación web con arquitectura MVC para consultar y comprar AOVE, con pago simulado.

- **Parte 1 (este hito):** experiencia de usuario y prototipo front-end en HTML5, CSS3 y JavaScript, desplegado en Apache Tomcat.
- **Parte 2:** persistencia, lógica de negocio e integración con Servlets, JSP/JSTL y JDBC.

## Integrantes y reparto de la Parte 1

| Parte | Integrante | Páginas y responsabilidades |
| --- | --- | --- |
| A | Noe ([@noelopezgarcia](https://github.com/noelopezgarcia)) | Inicio, catálogo y ficha de producto; datos de productos; análisis (historias, inventario y mapa de navegación); propuesta del sistema visual |
| B | *(nombre y usuario de GitHub)* | Carrito, confirmación de pedido, perfil e historial; sistema visual, cabecera y pie |
| C | *(nombre y usuario de GitHub)* | Registro, login y administración; validación de formularios, sesión simulada y despliegue |

El detalle de quién mantiene cada fichero está en [ACUERDOS.md](ACUERDOS.md).

## Requisitos de ejecución

- Un navegador actual (Chrome, Edge o Firefox).
- Apache Tomcat *(versión por confirmar)* con JDK 17 o superior.
- Para desarrollar: VS Code con la extensión Live Server.
- Opcional, para las pruebas automáticas: Node.js 20 o superior.

Las páginas usan módulos de JavaScript, así que **siempre se abren desde un servidor** (Live Server o Tomcat), nunca con doble clic.

## Cómo ejecutarlo

**Con Live Server:** abre esta carpeta en VS Code, haz clic derecho en `proyecto/index.html` y elige *Open with Live Server*.

**En Tomcat:** copia el contenido de `proyecto/` a `webapps/oleum/` dentro de la carpeta de Tomcat e inícialo.

**URL de entrada:** `http://localhost:8080/oleum/index.html`

## Pruebas

```bash
node --test
```

Ejecuta las 40 pruebas automáticas de la lógica del catálogo, carrito de la compra y persistencia de pedidos (`pruebas/`). La matriz completa de pruebas está en `memoria/analisis/`.

## Estructura

```
/proyecto/      la aplicación (en la Parte 2 será src/main/webapp)
/memoria/       memoria en PDF, análisis, pruebas y evidencias
/pruebas/       pruebas automáticas
/herramientas/  scripts de apoyo (generador de ilustraciones); no se despliegan
ACUERDOS.md     acuerdos del grupo: modelo de datos, URLs, interfaces, sistema visual y Git
```
