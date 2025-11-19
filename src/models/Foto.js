import { db } from "../config/db.js";

export const FotosModel = {
  crearFoto: async (id_recuerdo, url, descripcion) => {
    const [result] = await db.execute(
      `INSERT INTO fotos (id_recuerdo, url, descripcion)
       VALUES (?, ?, ?)`,
      [id_recuerdo, url, descripcion]
    );
    return result.insertId;
  },

  obtenerFotosPorRecuerdo: async (id_recuerdo) => {
    const [rows] = await db.execute(
      `SELECT * FROM fotos WHERE id_recuerdo = ? ORDER BY id_foto DESC`,
      [id_recuerdo]
    );
    return rows;
  },

  eliminarFoto: async (id_foto) => {
    const [result] = await db.execute(
      `DELETE FROM fotos WHERE id_foto = ?`,
      [id_foto]
    );

    return result.affectedRows > 0;
  }
};
