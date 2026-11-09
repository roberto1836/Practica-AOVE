// =============================================================================
// datos/usuarios.js · Usuarios de prueba de Oleum (Parte 1)
// Mantenido por C. Cumple el mínimo de 2 clientes y 1 administrador (6.3.1),
// más 1 cuenta desactivada para probar bajas lógicas de usuario.
// En la Parte 2 la contraseña se almacenará como hash_password en base de datos.
// =============================================================================

export const usuariosIniciales = [
  {
    id: 1,
    nombre: "Elena Martínez",
    email: "elena@oleum.es",
    telefono: "612345678",
    password: "Cliente123!",
    rol: "cliente",
    activo: true,
    direccion: "Calle Mayor 14, 3º B, 28013 Madrid"
  },
  {
    id: 2,
    nombre: "Javier Gómez",
    email: "javier@oleum.es",
    telefono: "698765432",
    password: "Cliente123!",
    rol: "cliente",
    activo: true,
    direccion: "Avenida de la Constitución 22, 41004 Sevilla"
  },
  {
    id: 3,
    nombre: "Carlos Ruiz (Admin)",
    email: "admin@oleum.es",
    telefono: "600112233",
    password: "Admin123!",
    rol: "admin",
    activo: true,
    direccion: "Polígono Industrial Olivar, Nave 4, 23009 Jaén"
  },
  {
    id: 4,
    nombre: "Usuario Desactivado",
    email: "inactivo@oleum.es",
    telefono: "655443322",
    password: "Cliente123!",
    rol: "cliente",
    activo: false,
    direccion: "Calle Sin Salida 1, 28000 Madrid"
  }
];
