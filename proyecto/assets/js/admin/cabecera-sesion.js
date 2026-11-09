// =============================================================================
// admin/cabecera-sesion.js · Sincroniza el menú según el rol del usuario (C)
// Delega en comun/cabecera.js para mantener la coherencia global entre B y C.
// =============================================================================

import { sincronizarMenuUsuario } from '../comun/cabecera.js';

export function inicializarCabeceraSesion() {
  sincronizarMenuUsuario();
}

document.addEventListener('DOMContentLoaded', inicializarCabeceraSesion);
