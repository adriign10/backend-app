// controllers/comentarios.controller.js
import { db } from "../config/db.js";

/**
 * Notifica al propietario de un recuerdo cuando alguien comenta
 */
export const notificarComentario = async (id_usuario, id_quien_comento, id_recuerdo, texto) => {
  try {
    const mensaje = `Alguien comentó en tu recuerdo: "${texto}"`;
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
 * Agrega un comentario a un recuerdo
 */
export const agregarComentario = async (req, res) => {
  try {
    const { id_recuerdo } = req.params;
    const { id_usuario, texto } = req.body;

    if (!texto || texto.trim() === "") {
      return res.status(400).json({ message: "El comentario no puede estar vacío" });
    }

    // INSERTAR comentario
    const [result] = await db.query(
      `INSERT INTO comentarios (id_recuerdo, id_usuario, texto) VALUES (?, ?, ?)`,
      [id_recuerdo, id_usuario, texto]
    );

    // Obtener propietario del recuerdo
    const [recuerdoRows] = await db.query(
      `SELECT creado_por FROM recuerdos WHERE id_recuerdo = ?`,
      [id_recuerdo]
    );

    if (recuerdoRows.length > 0) {
      const creadorId = recuerdoRows[0].creado_por;
      if (creadorId !== id_usuario) {
        try {
          await notificarComentario(creadorId, id_usuario, id_recuerdo, texto);
        } catch (err) {
          console.error("No se pudo notificar al propietario:", err);
        }
      }
    }

    res.status(201).json({ message: "Comentario agregado", id_comentario: result.insertId });

  } catch (error) {
    console.error("❌ ERROR agregarComentario:", error);
    res.status(500).json({ message: "Error agregando comentario", error });
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
