// =============================================================================
// admin/pedidos-admin.js · Gestión de estados de pedidos en administración (C)
// =============================================================================

import { pedidos as pedidosBase } from "../datos/pedidos.js";
import { formatearPrecio } from "../util/formato.js";
import { verificarAcceso, obtenerTodosLosUsuarios } from "../sesion.js";

const CLAVE_PEDIDOS_ADMIN = "oleum_pedidos_admin";

const NOMBRES_ESTADO = {
  recibido: "Recibido",
  en_preparacion: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado"
};

function obtenerPedidos() {
  try {
    const guardado = sessionStorage.getItem(CLAVE_PEDIDOS_ADMIN);
    if (guardado) return JSON.parse(guardado);
  } catch {
    // Si falla, usar datos iniciales
  }
  return structuredClone(pedidosBase);
}

function guardarPedidos(lista) {
  sessionStorage.setItem(CLAVE_PEDIDOS_ADMIN, JSON.stringify(lista));
}

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
  const listaPedidos = obtenerPedidos();

  cuerpo.replaceChildren();

  for (const pedido of listaPedidos) {
    const clon = plantilla.content.cloneNode(true);
    const cliente = usuarios.find((u) => u.id === pedido.usuario_id);
    const numUnidades = Array.isArray(pedido.lineas)
      ? pedido.lineas.reduce((acc, l) => acc + (Number(l.cantidad) || 0), 0)
      : 0;

    clon.querySelector(".celda-id").textContent = `#${pedido.id}`;
    clon.querySelector(".celda-cliente").textContent = cliente
      ? `${cliente.nombre} (${cliente.email})`
      : `Usuario #${pedido.usuario_id}`;
    clon.querySelector(".celda-fecha").textContent = pedido.fecha;
    clon.querySelector(".celda-direccion").textContent = pedido.direccion_envio;
    clon.querySelector(".celda-unidades").textContent = `${numUnidades} uds.`;
    clon.querySelector(".celda-total").textContent = formatearPrecio(pedido.total);

    const selectEstado = clon.querySelector(".select-estado");
    const labelEstado = clon.querySelector(".label-estado");
    const idSelect = `estado-pedido-${pedido.id}`;
    selectEstado.id = idSelect;
    selectEstado.value = pedido.estado;
    labelEstado.setAttribute("for", idSelect);

    const formEstado = clon.querySelector(".form-estado-pedido");
    formEstado.addEventListener("submit", (e) => {
      e.preventDefault();
      pedido.estado = selectEstado.value;
      guardarPedidos(listaPedidos);
      if (mensaje) {
        const nombreLegible = NOMBRES_ESTADO[pedido.estado] || pedido.estado;
        mensaje.textContent = `El estado del pedido #${pedido.id} se ha actualizado a «${nombreLegible}».`;
        mensaje.hidden = false;
      }
    });

    cuerpo.appendChild(clon);
  }
}

document.addEventListener("DOMContentLoaded", iniciarAdminPedidos);
