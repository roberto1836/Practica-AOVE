// assets/js/paginas/carrito.js · Controlador de la vista de Carrito (B)
import {
  obtenerLineas, actualizarCantidad, eliminar, calcularTotales,
  contarUnidades, UMBRAL_ENVIO_GRATIS
} from '../carrito.js';
import { formatearPrecio, formatearVolumen } from '../util/formato.js';
import '../comun/cabecera.js';

const contenedorCarrito = document.getElementById('contenedor-carrito');
const notificacionAccesible = document.getElementById('notificacion-accesible');
const plantillaVacio = document.getElementById('plantilla-carrito-vacio');
const plantillaLinea = document.getElementById('plantilla-linea-carrito');

function anunciar(mensaje) {
  if (notificacionAccesible) {
    notificacionAccesible.textContent = '';
    // Pequeño timeout para forzar re-lectura en lectores de pantalla
    setTimeout(() => {
      notificacionAccesible.textContent = mensaje;
    }, 50);
  }
}

function renderizarCarrito() {
  if (!contenedorCarrito) return;
  contenedorCarrito.replaceChildren();

  const lineas = obtenerLineas();

  if (lineas.length === 0) {
    if (plantillaVacio) {
      contenedorCarrito.appendChild(plantillaVacio.content.cloneNode(true));
    }
    return;
  }

  // Estructura de dos columnas: lista de artículos + resumen lateral
  const vistaCarrito = document.createElement('div');
  vistaCarrito.className = 'vista-carrito';

  const seccionArticulos = document.createElement('section');
  seccionArticulos.className = 'carrito-articulos';
  seccionArticulos.setAttribute('aria-label', 'Artículos en tu cesta');

  for (const item of lineas) {
    const fragmento = plantillaLinea.content.cloneNode(true);
    const articulo = fragmento.querySelector('.linea-carrito');
    const imagen = fragmento.querySelector('.linea-carrito__imagen');
    const enlace = fragmento.querySelector('.linea-carrito__enlace');
    const variedad = fragmento.querySelector('.linea-carrito__variedad');
    const formato = fragmento.querySelector('.linea-carrito__formato');
    const precioValor = fragmento.querySelector('.linea-carrito__precio-valor');
    const errorBox = fragmento.querySelector('.linea-carrito__error');
    const inputCantidad = fragmento.querySelector('.input-cantidad');
    const botonRestar = fragmento.querySelector('.boton-restar');
    const botonSumar = fragmento.querySelector('.boton-sumar');
    const subtotalLinea = fragmento.querySelector('.linea-carrito__subtotal');
    const botonEliminar = fragmento.querySelector('.boton-eliminar');

    const prod = item.producto;
    imagen.src = prod.imagen || 'assets/img/producto-sin-imagen.svg';
    imagen.alt = `Botella de ${prod.nombre}`;
    enlace.textContent = prod.nombre;
    enlace.href = `producto.html?id=${prod.id}`;
    variedad.textContent = prod.variedad;
    formato.textContent = formatearVolumen(prod.formato_ml);
    precioValor.textContent = formatearPrecio(prod.precio);
    subtotalLinea.textContent = formatearPrecio(item.subtotal);

    inputCantidad.value = String(item.cantidad);
    inputCantidad.max = String(prod.stock);
    inputCantidad.setAttribute('aria-label', `Cantidad de ${prod.nombre}`);

    if (item.cantidad <= 1) {
      botonRestar.setAttribute('disabled', '');
    }
    if (item.cantidad >= prod.stock) {
      botonSumar.setAttribute('disabled', '');
    }

    // Manejador botón restar
    botonRestar.addEventListener('click', () => {
      const nueva = item.cantidad - 1;
      const res = actualizarCantidad(prod.id, nueva);
      if (res.ok) {
        anunciar(`Reducida la cantidad de ${prod.nombre} a ${nueva}`);
        renderizarCarrito();
      } else {
        errorBox.textContent = res.mensaje;
      }
    });

    // Manejador botón sumar
    botonSumar.addEventListener('click', () => {
      const nueva = item.cantidad + 1;
      const res = actualizarCantidad(prod.id, nueva);
      if (res.ok) {
        anunciar(`Aumentada la cantidad de ${prod.nombre} a ${nueva}`);
        renderizarCarrito();
      } else {
        errorBox.textContent = res.mensaje;
      }
    });

    // Manejador input manual
    inputCantidad.addEventListener('change', () => {
      const valor = parseInt(inputCantidad.value, 10);
      if (isNaN(valor) || valor < 1) {
        errorBox.textContent = 'La cantidad mínima es 1 unidad.';
        inputCantidad.value = String(item.cantidad);
        return;
      }
      const res = actualizarCantidad(prod.id, valor);
      if (res.ok) {
        anunciar(`Actualizada la cantidad de ${prod.nombre} a ${valor}`);
        renderizarCarrito();
      } else {
        errorBox.textContent = res.mensaje;
        inputCantidad.value = String(item.cantidad);
      }
    });

    // Manejador eliminar
    botonEliminar.addEventListener('click', () => {
      eliminar(prod.id);
      anunciar(`Eliminado ${prod.nombre} del carrito`);
      renderizarCarrito();
    });

    seccionArticulos.appendChild(fragmento);
  }

  // Panel lateral de Resumen
  const totales = calcularTotales();
  const asideResumen = document.createElement('aside');
  asideResumen.className = 'resumen-compra tarjeta';
  asideResumen.setAttribute('aria-label', 'Resumen de costes');

  const tituloResumen = document.createElement('h2');
  tituloResumen.className = 'tarjeta__titulo';
  tituloResumen.textContent = 'Resumen del pedido';
  asideResumen.appendChild(tituloResumen);

  // Fila Subtotal
  const filaSubtotal = document.createElement('div');
  filaSubtotal.className = 'resumen-compra__fila';
  filaSubtotal.innerHTML = `<span>Subtotal (${contarUnidades()} unidades)</span><span>${formatearPrecio(totales.subtotal)}</span>`;
  asideResumen.appendChild(filaSubtotal);

  // Fila Envío
  const filaEnvio = document.createElement('div');
  filaEnvio.className = 'resumen-compra__fila';
  const textoEnvio = totales.esEnvioGratis ? 'Gratis' : formatearPrecio(totales.gastosEnvio);
  filaEnvio.innerHTML = `<span>Gastos de envío</span><span>${textoEnvio}</span>`;
  asideResumen.appendChild(filaEnvio);

  // Aviso Envío Gratis si no ha llegado a 50 €
  if (totales.envioGratisRestante > 0) {
    const avisoEnvio = document.createElement('p');
    avisoEnvio.className = 'resumen-compra__envio-gratis';
    avisoEnvio.textContent = `Añade ${formatearPrecio(totales.envioGratisRestante)} más para obtener envío gratuito.`;
    asideResumen.appendChild(avisoEnvio);
  }

  // Fila Total
  const filaTotal = document.createElement('div');
  filaTotal.className = 'resumen-compra__fila resumen-compra__fila--total';
  filaTotal.innerHTML = `<span>Total <small style="font-size:0.7em;font-weight:normal;">(IVA incluido)</small></span><span>${formatearPrecio(totales.total)}</span>`;
  asideResumen.appendChild(filaTotal);

  // Acciones
  const acciones = document.createElement('div');
  acciones.className = 'resumen-compra__acciones';

  const btnTramitar = document.createElement('a');
  btnTramitar.href = 'confirmacion.html';
  btnTramitar.className = 'boton';
  btnTramitar.textContent = 'Tramitar pedido';

  const btnContinuar = document.createElement('a');
  btnContinuar.href = 'productos.html';
  btnContinuar.className = 'boton boton--secundario';
  btnContinuar.textContent = 'Continuar comprando';

  acciones.appendChild(btnTramitar);
  acciones.appendChild(btnContinuar);
  asideResumen.appendChild(acciones);

  vistaCarrito.appendChild(seccionArticulos);
  vistaCarrito.appendChild(asideResumen);
  contenedorCarrito.appendChild(vistaCarrito);
}

// Escuchar cambios reactivos en el carrito
window.addEventListener('carrito:actualizado', () => {
  renderizarCarrito();
});

renderizarCarrito();
