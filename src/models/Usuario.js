import { db } from "../config/db.js";

export const Usuario = {
  create: async ({ nombre, email, contrasena, fotoPerfil, google }) => {
    const [result] = await db.execute(
      `INSERT INTO usuarios (nombre, email, contrasena, foto_perfil, fecha_registro, estado, google)
       VALUES (?, ?, ?, ?, NOW(), 1, ?)`,
      [nombre, email, contrasena, fotoPerfil, google]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await db.execute(
      "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.execute(
      "SELECT id_usuario, nombre, email, foto_perfil, fecha_registro, estado, google FROM usuarios WHERE id_usuario = ?",
      [id]
    );
    return rows[0];
  }
};
