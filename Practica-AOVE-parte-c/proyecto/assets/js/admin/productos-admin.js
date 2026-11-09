// =============================================================================
// admin/productos-admin.js · CRUD, stock y baja lógica de productos (C)
// =============================================================================

import { categorias, productos as productosBase } from "../datos/productos.js";
import { formatearPrecio, formatearVolumen } from "../util/formato.js";
import { verificarAcceso } from "../sesion.js";
import {
  configurarValidacionEnVivo,
  validarFormulario,
  validarCampo
} from "../validacion.js";

const CLAVE_CATALOGO_ADMIN = "oleum_productos_admin";

export function obtenerProductosCatalogo() {
  try {
    const guardado = sessionStorage.getItem(CLAVE_CATALOGO_ADMIN);
    if (guardado) return JSON.parse(guardado);
  } catch {
    // Si falla la lectura, se usa la lista base
  }
  return structuredClone(productosBase);
}

function guardarProductosCatalogo(lista) {
  sessionStorage.setItem(CLAVE_CATALOGO_ADMIN, JSON.stringify(lista));
}

function comprobarPermisoAdmin() {
  const acceso = verificarAcceso("admin");
  const bloqueo = document.getElementById("bloqueo-acceso");
  const textoDenegado = document.getElementById("texto-denegado");

  if (!acceso.autorizado) {
    if (bloqueo) bloqueo.hidden = false;
    if (acceso.motivo === "rol_insuficiente" && textoDenegado) {
      textoDenegado.textContent =
        "Has iniciado sesión como cliente. Esta sección requiere permisos de administrador.";
    }
    return false;
  }
  return true;
}

function actualizarMetricasProductos(lista) {
  const totalEl = document.getElementById("metrica-total-productos");
  const activosEl = document.getElementById("metrica-productos-activos");
  const agotadosEl = document.getElementById("metrica-productos-agotados");

  if (totalEl) totalEl.textContent = String(lista.length);
  if (activosEl) activosEl.textContent = String(lista.filter((p) => p.activo).length);
  if (agotadosEl) agotadosEl.textContent = String(lista.filter((p) => p.stock === 0).length);
}

function resolverRutaImagenEnAdmin(ruta) {
  if (!ruta) return "../assets/img/favicon.svg";
  if (ruta.startsWith("http") || ruta.startsWith("../")) return ruta;
  return `../${ruta}`;
}

function iniciarListadoProductos() {
  const panel = document.getElementById("panel-admin-productos");
  const cuerpo = document.getElementById("cuerpo-tabla-productos");
  const plantilla = document.getElementById("plantilla-fila-producto");
  if (!panel || !cuerpo || !plantilla) return;

  if (!comprobarPermisoAdmin()) return;
  panel.hidden = false;

  const mensaje = document.getElementById("mensaje-admin-productos");
  const params = new URLSearchParams(window.location.search);
  if (params.get("guardado") === "1" && mensaje) {
    mensaje.textContent = "Los datos del producto se han guardado correctamente.";
    mensaje.hidden = false;
  }

  function renderizarTabla() {
    const lista = obtenerProductosCatalogo();
    actualizarMetricasProductos(lista);
    cuerpo.replaceChildren();

    for (const prod of lista) {
      const clon = plantilla.content.cloneNode(true);
      const cat = categorias.find((c) => c.id === prod.categoria_id);

      clon.querySelector(".celda-id").textContent = String(prod.id);

      const img = clon.querySelector(".producto-miniatura__img");
      img.src = resolverRutaImagenEnAdmin(prod.imagen);
      img.alt = `Envase de ${prod.nombre}`;

      clon.querySelector(".celda-nombre").textContent = prod.nombre;
      clon.querySelector(".celda-variedad").textContent = `${prod.variedad} · ${prod.origen}`;
      clon.querySelector(".celda-categoria").textContent = cat ? cat.nombre : "Sin categoría";
      clon.querySelector(".celda-formato").textContent = formatearVolumen(prod.formato_ml);
      clon.querySelector(".celda-precio").textContent = formatearPrecio(prod.precio);

      const inputStock = clon.querySelector(".input-stock");
      const labelStock = clon.querySelector(".label-stock");
      const idInputStock = `stock-prod-${prod.id}`;
      inputStock.id = idInputStock;
      inputStock.value = String(prod.stock);
      labelStock.setAttribute("for", idInputStock);

      const formStock = clon.querySelector(".form-stock");
      formStock.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validarCampo(inputStock, (val) => {
          const n = Number(val);
          if (!Number.isInteger(n) || n < 0) return "El stock debe ser un entero mayor o igual a 0.";
          return null;
        })) {
          return;
        }
        prod.stock = Number.parseInt(inputStock.value, 10);
        guardarProductosCatalogo(lista);
        actualizarMetricasProductos(lista);
        if (mensaje) {
          mensaje.textContent = `Stock de «${prod.nombre}» actualizado a ${prod.stock} unidades.`;
          mensaje.hidden = false;
        }
      });

      const etiquetaEstado = clon.querySelector(".celda-estado");
      etiquetaEstado.textContent = prod.activo ? "Activo" : "Inactivo (Baja)";
      etiquetaEstado.className = prod.activo
        ? "etiqueta etiqueta--activo celda-estado"
        : "etiqueta etiqueta--inactivo celda-estado";

      const enlaceEditar = clon.querySelector(".enlace-editar");
      enlaceEditar.href = `producto-form.html?id=${prod.id}`;

      const botonBaja = clon.querySelector(".boton-baja-logica");
      botonBaja.textContent = prod.activo ? "Desactivar" : "Reactivar";
      botonBaja.addEventListener("click", () => {
        prod.activo = !prod.activo;
        guardarProductosCatalogo(lista);
        renderizarTabla();
        if (mensaje) {
          const accion = prod.activo ? "reactivado" : "marcado como inactivo (baja lógica)";
          mensaje.textContent = `El producto «${prod.nombre}» ha sido ${accion}.`;
          mensaje.hidden = false;
        }
      });

      cuerpo.appendChild(clon);
    }
  }

  renderizarTabla();
}

function iniciarFormularioProducto() {
  const panel = document.getElementById("panel-form-producto");
  const formulario = document.getElementById("formulario-producto");
  if (!panel || !formulario) return;

  if (!comprobarPermisoAdmin()) return;
  panel.hidden = false;

  const selectCategoria = document.getElementById("prod-categoria");
  for (const cat of categorias) {
    const opcion = document.createElement("option");
    opcion.value = String(cat.id);
    opcion.textContent = cat.nombre;
    selectCategoria.appendChild(opcion);
  }

  const params = new URLSearchParams(window.location.search);
  const paramId = params.get("id");
  const idEditar = paramId !== null ? Number.parseInt(paramId, 10) : null;
  const lista = obtenerProductosCatalogo();
  const alertaErrorForm = document.getElementById("mensaje-error-form");

  if (paramId !== null) {
    const existente = lista.find((p) => p.id === idEditar);
    const titulo = document.getElementById("titulo-form-producto");
    if (!existente) {
      if (titulo) titulo.textContent = "Producto no encontrado";
      if (alertaErrorForm) {
        alertaErrorForm.textContent = `No existe ningún producto con el identificador #${paramId}.`;
        alertaErrorForm.hidden = false;
      }
      formulario.hidden = true;
      return;
    }

    if (titulo) titulo.textContent = `Editar producto #${existente.id}`;
    document.getElementById("prod-id").value = String(existente.id);
    document.getElementById("prod-nombre").value = existente.nombre;
    document.getElementById("prod-categoria").value = String(existente.categoria_id);
    document.getElementById("prod-productor").value = existente.productor;
    document.getElementById("prod-origen").value = existente.origen;
    document.getElementById("prod-variedad").value = existente.variedad;
    document.getElementById("prod-formato").value = String(existente.formato_ml);
    document.getElementById("prod-precio").value = String(existente.precio);
    document.getElementById("prod-stock").value = String(existente.stock);
    document.getElementById("prod-imagen").value = existente.imagen;
    document.getElementById("prod-descripcion").value = existente.descripcion;
    document.getElementById("prod-activo").checked = Boolean(existente.activo);
  }

  const validadoresProducto = {
    precio: (valor) => {
      const num = Number.parseFloat(valor);
      if (Number.isNaN(num) || num <= 0) {
        return "El precio debe ser un número mayor que 0 €.";
      }
      return null;
    },
    stock: (valor) => {
      const num = Number(valor);
      if (!Number.isInteger(num) || num < 0) {
        return "El stock no puede ser negativo y debe ser un número entero.";
      }
      return null;
    },
    formato_ml: (valor) => {
      const num = Number(valor);
      if (!Number.isInteger(num) || num < 100 || num > 10000) {
        return "Introduce un volumen entero entre 100 ml y 10000 ml.";
      }
      return null;
    }
  };

  configurarValidacionEnVivo(formulario, validadoresProducto);

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validarFormulario(formulario, validadoresProducto)) return;

    const datosProducto = {
      id: idEditar || lista.reduce((max, p) => Math.max(max, p.id), 0) + 1,
      categoria_id: Number.parseInt(document.getElementById("prod-categoria").value, 10),
      nombre: document.getElementById("prod-nombre").value.trim(),
      productor: document.getElementById("prod-productor").value.trim(),
      origen: document.getElementById("prod-origen").value.trim(),
      variedad: document.getElementById("prod-variedad").value.trim(),
      formato_ml: Number.parseInt(document.getElementById("prod-formato").value, 10),
      precio: Number.parseFloat(document.getElementById("prod-precio").value),
      stock: Number.parseInt(document.getElementById("prod-stock").value, 10),
      imagen: document.getElementById("prod-imagen").value.trim(),
      descripcion: document.getElementById("prod-descripcion").value.trim(),
      activo: document.getElementById("prod-activo").checked
    };

    if (idEditar) {
      const indice = lista.findIndex((p) => p.id === idEditar);
      if (indice !== -1) lista[indice] = datosProducto;
    } else {
      lista.push(datosProducto);
    }

    guardarProductosCatalogo(lista);
    window.location.href = "productos.html?guardado=1";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarListadoProductos();
  iniciarFormularioProducto();
});
