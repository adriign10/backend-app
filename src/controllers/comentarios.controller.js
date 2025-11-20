// controllers/comentarios.controller.js
import { db } from "../config/db.js";

export const agregarComentario = async (req, res) => {
  try {
    const { id_recuerdo } = req.params;
    const { id_usuario, texto } = req.body;

    if (!texto || texto.trim() === "") {
      return res.status(400).json({ message: "El comentario no puede estar vacío" });
    }

    // Insertar comentario
    const [result] = await db.query(
      `INSERT INTO comentarios (id_recuerdo, id_usuario, texto) VALUES (?, ?, ?)`,
      [id_recuerdo, id_usuario, texto]
    );

    // Obtener info del recuerdo y nombre del usuario que comenta
    const [recuerdoRows] = await db.query(
      `SELECT creado_por FROM recuerdos WHERE id_recuerdo = ?`,
      [id_recuerdo]
    );

    const [usuarioRows] = await db.query(
      `SELECT nombre FROM usuarios WHERE id_usuario = ?`,
      [id_usuario]
    );
    const nombreUsuario = usuarioRows.length > 0 ? usuarioRows[0].nombre : "Alguien";

    let creadorId = null;
    if (recuerdoRows.length > 0) {
      creadorId = recuerdoRows[0].creado_por;
      // Notificar al propietario si no es el mismo que comenta
      if (creadorId !== id_usuario) {
        await notificarComentario(creadorId, id_usuario, id_recuerdo, `${nombreUsuario} comentó en tu recuerdo`);
      }
    }

// Notificar a todos los que ya comentaron (excepto el que comenta)
const [comentadores] = await db.query(
  `SELECT DISTINCT id_usuario 
   FROM comentarios 
   WHERE id_recuerdo = ? AND id_usuario != ?`,
  [id_recuerdo, id_usuario]
);

for (let u of comentadores) {
  const mensaje = u.id_usuario === creadorId 
    ? `${nombreUsuario} comentó en tu recuerdo` 
    : `${nombreUsuario} respondió a tu comentario`;
  await notificarComentario(u.id_usuario, id_usuario, id_recuerdo, mensaje);
}


    res.status(201).json({ message: "Comentario agregado", id_comentario: result.insertId });

  } catch (error) {
    console.error("❌ ERROR agregarComentario:", error);
    res.status(500).json({ message: "Error agregando comentario", error });
  }
};

// Función de notificación
export const notificarComentario = async (id_usuario, id_quien_comento, id_recuerdo, mensaje) => {
  try {
    const link = `/recuerdo/${id_recuerdo}`;
    await db.query(
      `INSERT INTO notificaciones (id_usuario, mensaje, link, leido, id_quien_menciono)
       VALUES (?, ?, ?, 0, ?)`,
      [id_usuario, mensaje, link, id_quien_comento]
    );
  } catch (error) {
    console.error("❌ ERROR notificarComentario:", error);
    throw error;
  }
};


/**
 * Obtiene todos los comentarios de un recuerdo
 */
export const obtenerComentarios = async (req, res) => {
  try {
    const { id_recuerdo } = req.params;

    const [rows] = await db.query(
      `SELECT c.id_comentario, c.texto, c.fecha, u.id_usuario, u.nombre, u.email, u.foto_perfil
       FROM comentarios c
       JOIN usuarios u ON c.id_usuario = u.id_usuario
       WHERE c.id_recuerdo = ?
       ORDER BY c.fecha ASC`,
      [id_recuerdo]
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ ERROR obtenerComentarios:", error);
    res.status(500).json({ message: "Error obteniendo comentarios", error });
  }
};
