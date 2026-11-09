// =============================================================================
// validacion.js · Utilidades de validación de formularios (Parte 1)
// Mantenido por C; utilizado por B (perfil, confirmación) y C (login, registro,
// administración de productos).
//
// INTERFAZ PARA EL GRUPO:
//   - mostrarErrorCampo(campo, mensaje)
//   - limpiarErrorCampo(campo)
//   - validarCampo(campo, validadorPersonalizado)
//   - validarFormulario(formulario, validadoresPorNombre)
//   - configurarValidacionEnVivo(formulario, validadoresPorNombre)
// =============================================================================

/**
 * Muestra un mensaje de error accesible junto al campo y marca aria-invalid="true".
 * No borra ni modifica el valor escrito por el usuario.
 * Acepta tanto (campo, mensaje) como (campo, contenedorError, mensaje).
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} campo
 * @param {string | HTMLElement} mensajeOContenedor
 * @param {string} [mensajeOpcional]
 */
export function mostrarErrorCampo(campo, mensajeOContenedor, mensajeOpcional) {
  if (!campo || campo.type === "hidden") return;

  campo.setAttribute("aria-invalid", "true");

  let mensaje = typeof mensajeOContenedor === "string" ? mensajeOContenedor : mensajeOpcional || "";
  let contenedorError = null;

  if (mensajeOContenedor instanceof HTMLElement) {
    contenedorError = mensajeOContenedor;
  } else {
    // Buscar si ya está referenciado en aria-describedby
    const descActual = campo.getAttribute("aria-describedby") || "";
    const idsDesc = descActual.split(/\s+/).filter(Boolean);
    for (const id of idsDesc) {
      const elem = document.getElementById(id);
      if (elem && (elem.classList.contains("campo-error") || elem.classList.contains("campo__error"))) {
        contenedorError = elem;
        break;
      }
    }

    const idBase = campo.id || campo.name || "campo";
    if (!contenedorError) {
      contenedorError =
        document.getElementById(`error-${idBase}`) ||
        document.getElementById(`${idBase}-error`);
    }

    if (!contenedorError) {
      const idError = `${idBase}-error`;
      contenedorError = document.createElement("p");
      contenedorError.id = idError;
      contenedorError.className = "campo-error";
      contenedorError.setAttribute("role", "alert");
      campo.insertAdjacentElement("afterend", contenedorError);
    }
  }

  contenedorError.textContent = mensaje;
  contenedorError.hidden = false;

  if (contenedorError.id) {
    const descActual = campo.getAttribute("aria-describedby") || "";
    const ids = descActual.split(/\s+/).filter(Boolean);
    if (!ids.includes(contenedorError.id)) {
      ids.push(contenedorError.id);
      campo.setAttribute("aria-describedby", ids.join(" "));
    }
  }
}

/**
 * Limpia el estado de error de un campo y oculta su mensaje asociado.
 * Acepta tanto (campo) como (campo, contenedorError).
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} campo
 * @param {HTMLElement} [contenedorOpcional]
 */
export function limpiarErrorCampo(campo, contenedorOpcional) {
  if (!campo || campo.type === "hidden") return;

  campo.removeAttribute("aria-invalid");

  let contenedorError = contenedorOpcional || null;

  if (!contenedorError) {
    const descActual = campo.getAttribute("aria-describedby") || "";
    const idsDesc = descActual.split(/\s+/).filter(Boolean);
    for (const id of idsDesc) {
      const elem = document.getElementById(id);
      if (elem && (elem.classList.contains("campo-error") || elem.classList.contains("campo__error"))) {
        contenedorError = elem;
        break;
      }
    }
  }

  if (!contenedorError) {
    const idBase = campo.id || campo.name || "campo";
    contenedorError =
      document.getElementById(`error-${idBase}`) ||
      document.getElementById(`${idBase}-error`);
  }

  if (contenedorError) {
    contenedorError.textContent = "";
    contenedorError.hidden = true;
  }
}

/**
 * Genera un mensaje en español claro a partir de las restricciones HTML5 (ValidityState).
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} campo
 * @returns {string}
 */
function obtenerMensajeNativo(campo) {
  const v = campo.validity;
  if (v.valueMissing) {
    return "Este campo es obligatorio.";
  }
  if (v.typeMismatch) {
    if (campo.type === "email") {
      return "Introduce una dirección de correo válida (ejemplo: nombre@dominio.es).";
    }
    if (campo.type === "tel") {
      return "Introduce un número de teléfono válido (9 dígitos).";
    }
    if (campo.type === "url") {
      return "Introduce una dirección web válida.";
    }
  }
  if (v.tooShort) {
    return `Debe tener al menos ${campo.minLength} caracteres (actualmente: ${campo.value.length}).`;
  }
  if (v.tooLong) {
    return `No puede superar los ${campo.maxLength} caracteres.`;
  }
  if (v.rangeUnderflow) {
    return `El valor mínimo permitido es ${campo.min}.`;
  }
  if (v.rangeOverflow) {
    return `El valor máximo permitido es ${campo.max}.`;
  }
  if (v.stepMismatch) {
    return "Introduce un valor con el formato o incremento permitido.";
  }
  if (v.patternMismatch) {
    if (campo.type === "tel") {
      return "Introduce un teléfono válido de 9 dígitos (ejemplo: 612345678).";
    }
    return campo.title || "El formato introducido no es válido.";
  }
  if (v.badInput) {
    return "Introduce un valor numérico válido.";
  }
  return "El valor introducido no es válido.";
}

/**
 * Valida un único campo combinando validación nativa HTML5 y una función opcional.
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} campo
 * @param {(valor: string, formulario: HTMLFormElement) => string | null} [validadorExtra]
 * @returns {boolean} true si es válido, false si tiene errores.
 */
export function validarCampo(campo, validadorExtra) {
  if (!campo || campo.disabled || campo.type === "hidden") return true;

  if (
    campo.required &&
    typeof campo.value === "string" &&
    campo.type !== "password" &&
    campo.value.trim() === ""
  ) {
    mostrarErrorCampo(campo, "Este campo es obligatorio y no puede contener solo espacios.");
    return false;
  }

  if (campo.type === "tel" && campo.value.trim() !== "") {
    const soloDigitos = campo.value.replace(/\s+/g, "");
    if (!/^[6789]\d{8}$/.test(soloDigitos)) {
      mostrarErrorCampo(campo, "Introduce un teléfono español válido de 9 dígitos (ej. 612345678).");
      return false;
    }
  }

  if (!campo.checkValidity()) {
    mostrarErrorCampo(campo, obtenerMensajeNativo(campo));
    return false;
  }

  if (typeof validadorExtra === "function") {
    const errorExtra = validadorExtra(campo.value, campo.form);
    if (errorExtra) {
      mostrarErrorCampo(campo, errorExtra);
      return false;
    }
  }

  limpiarErrorCampo(campo);
  return true;
}

/**
 * Valida todos los campos de un formulario y lleva el foco al primer campo con error.
 * @param {HTMLFormElement} formulario
 * @param {Record<string, (valor: string, form: HTMLFormElement) => string | null>} [validadoresPorNombre={}]
 * @returns {boolean} true si todo el formulario es válido.
 */
export function validarFormulario(formulario, validadoresPorNombre = {}) {
  if (!formulario) return false;

  const campos = Array.from(
    formulario.querySelectorAll("input, select, textarea")
  ).filter((c) => c.type !== "hidden");

  let primerCampoInvalido = null;
  let todoValido = true;

  for (const campo of campos) {
    const clave = campo.name || campo.id;
    const validadorExtra = clave ? validadoresPorNombre[clave] : undefined;
    const esValido = validarCampo(campo, validadorExtra);

    if (!esValido) {
      todoValido = false;
      if (!primerCampoInvalido) {
        primerCampoInvalido = campo;
      }
    }
  }

  if (primerCampoInvalido) {
    primerCampoInvalido.focus();
  }

  return todoValido;
}

/**
 * Activa la validación al perder el foco (blur) y limpia o revalida al escribir (input)
 * si el campo ya estaba marcado como erróneo.
 * @param {HTMLFormElement} formulario
 * @param {Record<string, (valor: string, form: HTMLFormElement) => string | null>} [validadoresPorNombre={}]
 */
export function configurarValidacionEnVivo(formulario, validadoresPorNombre = {}) {
  if (!formulario) return;

  formulario.setAttribute("novalidate", "novalidate");

  const campos = Array.from(
    formulario.querySelectorAll("input, select, textarea")
  ).filter((c) => c.type !== "hidden");

  for (const campo of campos) {
    const clave = campo.name || campo.id;
    const validadorExtra = clave ? validadoresPorNombre[clave] : undefined;

    campo.addEventListener("blur", () => {
      validarCampo(campo, validadorExtra);
    });

    campo.addEventListener("input", () => {
      if (campo.getAttribute("aria-invalid") === "true") {
        validarCampo(campo, validadorExtra);
      }
    });

    if (campo.tagName === "SELECT") {
      campo.addEventListener("change", () => {
        validarCampo(campo, validadorExtra);
      });
    }
  }
}
