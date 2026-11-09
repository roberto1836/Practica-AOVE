// assets/js/paginas/mis-pedidos.js · Controlador del historial de pedidos (B)
import { obtenerPedidosCliente, ETIQUETAS_ESTADO } from '../datos/pedidos.js';
import { usuarioActual } from '../sustitutos/sesion.js';
import { formatearPrecio } from '../util/formato.js';
import '../comun/cabecera.js';

const contenedor = document.getElementById('contenedor-pedidos');
const plantillaSinPedidos = document.getElementById('plantilla-sin-pedidos');

function comprobarSesion() {
  const usuario = usuarioActual();
  if (usuario === null) {
    window.location.href = `login.html?volver=${encodeURIComponent('mis-pedidos.html')}`;
    return false;
  }
  return true;
}

function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function contarArticulos(lineas) {
  const total = lineas.reduce((acc, l) => acc + l.cantidad, 0);
  return total === 1 ? '1 unidad' : `${total} unidades`;
}

function renderizarListado() {
  if (!contenedor) return;
  contenedor.replaceChildren();

  const usuario = usuarioActual();
  if (!usuario) return;

  const pedidos = obtenerPedidosCliente(usuario.id);

  if (pedidos.length === 0) {
    if (plantillaSinPedidos) {
      contenedor.appendChild(plantillaSinPedidos.content.cloneNode(true));
    }
    return;
  }

  const tablaContenedor = document.createElement('div');
  tablaContenedor.className = 'tabla-contenedor';
  tablaContenedor.setAttribute('role', 'region');
  tablaContenedor.setAttribute('aria-label', 'Listado de pedidos del cliente');
  tablaContenedor.setAttribute('tabindex', '0');

  const tabla = document.createElement('table');
  tabla.className = 'tabla-datos';

  tabla.innerHTML = `
    <caption>Pedidos formalizados en Oleum</caption>
    <thead>
      <tr>
        <th scope="col">Nº Pedido</th>
        <th scope="col">Fecha</th>
        <th scope="col">Artículos</th>
        <th scope="col" class="tabla-datos__numero">Total</th>
        <th scope="col">Estado</th>
        <th scope="col" style="text-align:center;">Acción</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabla.querySelector('tbody');

  for (const pedido of pedidos) {
    const tr = document.createElement('tr');
    const estadoEtiqueta = ETIQUETAS_ESTADO[pedido.estado] || pedido.estado;
    const claseEstado = `estado-pedido estado-pedido--${pedido.estado}`;

    tr.innerHTML = `
      <td><strong>OLEUM-${pedido.id}</strong></td>
      <td>${formatearFecha(pedido.fecha)}</td>
      <td>${contarArticulos(pedido.lineas)}</td>
      <td class="tabla-datos__numero"><strong>${formatearPrecio(pedido.total)}</strong></td>
      <td><span class="${claseEstado}">${estadoEtiqueta}</span></td>
      <td style="text-align:center;">
        <a href="pedido.html?id=${pedido.id}" class="boton boton--secundario" style="font-size:var(--texto-sm);min-height:auto;padding:var(--espacio-1) var(--espacio-3);" aria-label="Ver detalle del pedido OLEUM-${pedido.id}">
          Ver detalle
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tablaContenedor.appendChild(tabla);
  contenedor.appendChild(tablaContenedor);
}

function iniciar() {
  if (!comprobarSesion()) return;
  renderizarListado();
}

iniciar();
