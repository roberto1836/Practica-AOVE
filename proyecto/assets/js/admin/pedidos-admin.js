// =============================================================================
// admin/pedidos-admin.js · Gestión de estados de pedidos en administración (C)
// =============================================================================

import {
  obtenerTodosLosPedidos,
  actualizarEstadoPedido,
  ETIQUETAS_ESTADO
} from "../datos/pedidos.js";
import { formatearPrecio } from "../util/formato.js";
import { verificarAcceso, obtenerTodosLosUsuarios } from "../sesion.js";

function iniciarAdminPedidos() {
  const panel = document.getElementById("panel-admin-pedidos");
  const cuerpo = document.getElementById("cuerpo-tabla-pedidos");
  const plantilla = document.getElementById("plantilla-fila-pedido");
  if (!panel || !cuerpo || !plantilla) return;

  const acceso = verificarAcceso("admin");
  const bloqueo = document.getElementById("bloqueo-acceso");
  const textoDenegado = document.getElementById("texto-denegado");

  if (!acceso.autorizado) {
    if (bloqueo) bloqueo.hidden = false;
    if (acceso.motivo === "rol_insuficiente" && textoDenegado) {
      textoDenegado.textContent =
        "Has iniciado sesión como cliente. Solo un administrador puede modificar pedidos.";
    }
    return;
  }

  panel.hidden = false;
  const mensaje = document.getElementById("mensaje-admin-pedidos");
  const usuarios = obtenerTodosLosUsuarios();
  const listaPedidos = obtenerTodosLosPedidos();

  cuerpo.replaceChildren();

  for (const pedido of listaPedidos) {
    const clon = plantilla.content.cloneNode(true);
    const cliente = usuarios.find((u) => u.id === pedido.usuario_id);
    const numUnidades = Array.isArray(pedido.lineas)
      ? pedido.lineas.reduce((acc, l) => acc + (Number(l.cantidad) || 0), 0)
      : 0;

    clon.querySelector(".celda-id").textContent = `#${pedido.id}`;

    // Identificación legible del cliente
    let clienteTexto = "";
    if (cliente) {
      clienteTexto = `${cliente.nombre} (${cliente.email})`;
    } else if (pedido.direccion_envio && pedido.direccion_envio.nombre_completo) {
      clienteTexto = `${pedido.direccion_envio.nombre_completo} (Cliente #${pedido.usuario_id})`;
    } else {
      clienteTexto = `Cliente #${pedido.usuario_id}`;
    }
    clon.querySelector(".celda-cliente").textContent = clienteTexto;

    // Fecha en formato local en español
    let fechaTexto = pedido.fecha;
    try {
      const f = new Date(pedido.fecha);
      if (!Number.isNaN(f.getTime())) {
        fechaTexto = f.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      }
    } catch {
      // conservar fecha original
    }
    clon.querySelector(".celda-fecha").textContent = fechaTexto;

    // Dirección de envío formateada (evita [object Object])
    let direccionTexto = "";
    if (typeof pedido.direccion_envio === "object" && pedido.direccion_envio !== null) {
      const d = pedido.direccion_envio;
      const partes = [d.calle, `${d.codigo_postal || ""} ${d.ciudad || ""}`.trim(), d.provincia ? `(${d.provincia})` : ""].filter(Boolean);
      direccionTexto = partes.join(", ");
    } else {
      direccionTexto = String(pedido.direccion_envio || "");
    }
    clon.querySelector(".celda-direccion").textContent = direccionTexto;

    clon.querySelector(".celda-unidades").textContent = `${numUnidades} uds.`;
    clon.querySelector(".celda-total").textContent = formatearPrecio(pedido.total);

    const selectEstado = clon.querySelector(".select-estado");
    const labelEstado = clon.querySelector(".label-estado");
    const idSelect = `estado-pedido-${pedido.id}`;
    selectEstado.id = idSelect;
    selectEstado.value = pedido.estado;
    labelEstado.setAttribute("for", idSelect);

    const botonActualizar = clon.querySelector("button[type='submit']");
    if (botonActualizar) {
      botonActualizar.setAttribute("aria-label", `Actualizar estado del pedido #${pedido.id}`);
    }

    const formEstado = clon.querySelector(".form-estado-pedido");
    formEstado.addEventListener("submit", (e) => {
      e.preventDefault();
      const nuevoEstado = selectEstado.value;
      const res = actualizarEstadoPedido(pedido.id, nuevoEstado);
      if (res.ok) {
        pedido.estado = nuevoEstado;
        if (mensaje) {
          const nombreLegible = ETIQUETAS_ESTADO[nuevoEstado] || nuevoEstado;
          mensaje.textContent = `El estado del pedido #${pedido.id} se ha actualizado a «${nombreLegible}».`;
          mensaje.hidden = false;
        }
      }
    });

    cuerpo.appendChild(clon);
  }
}

document.addEventListener("DOMContentLoaded", iniciarAdminPedidos);
