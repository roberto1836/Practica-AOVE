// assets/js/paginas/pedido.js · Controlador del detalle de pedido (B)
import { obtenerPedidoPorId, ETIQUETAS_ESTADO } from '../datos/pedidos.js';
import { productos } from '../datos/productos.js';
import { usuarioActual } from '../sesion.js';
import { formatearPrecio, formatearVolumen } from '../util/formato.js';
import '../comun/cabecera.js';

const contenedor = document.getElementById('contenedor-detalle');
const plantillaNoEncontrado = document.getElementById('plantilla-pedido-no-encontrado');

function comprobarSesion() {
  const usuario = usuarioActual();
  if (usuario === null) {
    window.location.href = `login.html?volver=${encodeURIComponent(window.location.search ? `pedido.html${window.location.search}` : 'mis-pedidos.html')}`;
    return false;
  }
  return true;
}

function renderizarNoEncontrado() {
  if (!contenedor || !plantillaNoEncontrado) return;
  document.title = 'Pedido no encontrado · Oleum';
  contenedor.replaceChildren(plantillaNoEncontrado.content.cloneNode(true));
}

function renderizarDetalle(pedido) {
  if (!contenedor) return;
  contenedor.replaceChildren();

  document.title = `Pedido OLEUM-${pedido.id} · Oleum`;

  const fechaFormateada = new Date(pedido.fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const estadoTexto = ETIQUETAS_ESTADO[pedido.estado] || pedido.estado;
  const claseEstado = `estado-pedido estado-pedido--${pedido.estado}`;

  // Cabecera del detalle
  const encabezado = document.createElement('div');
  encabezado.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:var(--espacio-3);margin-bottom:var(--espacio-5);';
  encabezado.innerHTML = `
    <div>
      <nav aria-label="Miga de pan" style="margin-bottom:var(--espacio-2);font-size:var(--texto-sm);">
        <a href="mis-pedidos.html">← Volver a mis pedidos</a>
      </nav>
      <h1 style="margin-bottom:var(--espacio-1);">Pedido OLEUM-${pedido.id}</h1>
      <p style="margin:0;color:var(--color-texto-suave);font-size:var(--texto-sm);">Formalizado el ${fechaFormateada}</p>
    </div>
    <div>
      <span class="${claseEstado}" style="font-size:var(--texto-base);padding:var(--espacio-2) var(--espacio-4);">${estadoTexto}</span>
    </div>
  `;
  contenedor.appendChild(encabezado);

  // Dos tarjetas de información de entrega y pago
  const bloqueInfo = document.createElement('div');
  bloqueInfo.className = 'detalle-pedido-resumen';

  const tarjetaEnvio = document.createElement('div');
  tarjetaEnvio.className = 'tarjeta';
  tarjetaEnvio.innerHTML = `
    <h2 class="tarjeta__titulo" style="font-size:var(--texto-base);">Dirección de entrega</h2>
    <div class="info-bloque">
      <p class="info-bloque__valor">
        <strong>${pedido.direccion_envio.nombre_completo}</strong><br>
        Teléfono: ${pedido.direccion_envio.telefono}<br>
        ${pedido.direccion_envio.calle}<br>
        ${pedido.direccion_envio.codigo_postal} ${pedido.direccion_envio.ciudad} (${pedido.direccion_envio.provincia})
      </p>
      ${pedido.direccion_envio.observaciones ? `<p class="info-bloque__valor" style="margin-top:var(--espacio-2);font-size:var(--texto-sm);color:var(--color-texto-suave);"><em>Nota: ${pedido.direccion_envio.observaciones}</em></p>` : ''}
    </div>
  `;

  const tarjetaPago = document.createElement('div');
  tarjetaPago.className = 'tarjeta';
  tarjetaPago.innerHTML = `
    <h2 class="tarjeta__titulo" style="font-size:var(--texto-base);">Información del pago</h2>
    <div class="info-bloque">
      <p class="info-bloque__valor">
        <strong>Método:</strong> ${pedido.metodo_pago}<br>
        <strong>Estado del cobro:</strong> Simulado y verificado<br>
        <strong>Total del pedido:</strong> ${formatearPrecio(pedido.total)}
      </p>
      <p style="margin-top:var(--espacio-2);font-size:var(--texto-sm);color:var(--color-texto-suave);">
        <em>Operación simulada en entorno de pruebas (sin coste real).</em>
      </p>
    </div>
  `;

  bloqueInfo.appendChild(tarjetaEnvio);
  bloqueInfo.appendChild(tarjetaPago);
  contenedor.appendChild(bloqueInfo);

  // Tabla con las líneas del pedido
  const tablaContenedor = document.createElement('div');
  tablaContenedor.className = 'tabla-contenedor';
  tablaContenedor.setAttribute('role', 'region');
  tablaContenedor.setAttribute('aria-label', 'Líneas y productos del pedido');
  tablaContenedor.setAttribute('tabindex', '0');

  const tabla = document.createElement('table');
  tabla.className = 'tabla-datos';
  tabla.innerHTML = `
    <caption>Artículos incluidos en el pedido</caption>
    <thead>
      <tr>
        <th scope="col">Aceite de oliva</th>
        <th scope="col" class="tabla-datos__numero">Precio unitario</th>
        <th scope="col" class="tabla-datos__numero">Unidades</th>
        <th scope="col" class="tabla-datos__numero">Subtotal</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabla.querySelector('tbody');

  for (const linea of pedido.lineas) {
    const prod = productos.find((p) => p.id === linea.producto_id);
    const nombre = prod ? prod.nombre : `Aceite #${linea.producto_id}`;
    const detalleVariedad = prod ? `${prod.variedad} · ${formatearVolumen(prod.formato_ml)}` : '';
    const imagenSrc = prod?.imagen || 'assets/img/producto-sin-imagen.svg';
    const subtotalLinea = Number((linea.cantidad * linea.precio_unitario).toFixed(2));

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <img src="${imagenSrc}" alt="" class="linea-producto-miniatura" width="50" height="50">
        <div style="display:inline-block;vertical-align:middle;">
          ${prod ? `<a href="producto.html?id=${prod.id}"><strong>${nombre}</strong></a>` : `<strong>${nombre}</strong>`}
          ${detalleVariedad ? `<br><small style="color:var(--color-texto-suave);">${detalleVariedad}</small>` : ''}
        </div>
      </td>
      <td class="tabla-datos__numero">${formatearPrecio(linea.precio_unitario)}</td>
      <td class="tabla-datos__numero">${linea.cantidad}</td>
      <td class="tabla-datos__numero"><strong>${formatearPrecio(subtotalLinea)}</strong></td>
    `;
    tbody.appendChild(tr);
  }

  tablaContenedor.appendChild(tabla);
  contenedor.appendChild(tablaContenedor);

  // Desglose de totales
  const tablaTotales = document.createElement('table');
  tablaTotales.className = 'totales-pedido-tabla';
  const textoEnvio = pedido.gastos_envio === 0 ? 'Gratis' : formatearPrecio(pedido.gastos_envio);
  tablaTotales.innerHTML = `
    <tbody>
      <tr>
        <td>Subtotal</td>
        <td class="tabla-datos__numero">${formatearPrecio(pedido.subtotal)}</td>
      </tr>
      <tr>
        <td>Gastos de envío</td>
        <td class="tabla-datos__numero">${textoEnvio}</td>
      </tr>
      <tr>
        <td>Total abonado</td>
        <td class="tabla-datos__numero">${formatearPrecio(pedido.total)}</td>
      </tr>
    </tbody>
  `;
  contenedor.appendChild(tablaTotales);
}

function iniciar() {
  if (!comprobarSesion()) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const usuario = usuarioActual();

  if (!id || !usuario) {
    renderizarNoEncontrado();
    return;
  }

  const pedido = obtenerPedidoPorId(id, usuario.id);
  if (!pedido) {
    renderizarNoEncontrado();
  } else {
    renderizarDetalle(pedido);
  }
}

iniciar();
