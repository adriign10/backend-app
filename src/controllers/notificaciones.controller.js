import { db } from '../config/db.js';

/**
 * Crear notificación manual
 */
// notificaciones.controller.js
export const crearNotificacion = async (req, res) => {
  try {
    const { id_usuario, mensaje, link, id_quien_menciono } = req.body;

    if (!id_usuario || !mensaje) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const [result] = await db.query(
      `INSERT INTO notificaciones (id_usuario, mensaje, link, leido, id_quien_menciono)
       VALUES (?, ?, ?, 0, ?)`,
      [id_usuario, mensaje, link || null, id_quien_menciono || null]
    );

    res.json({ 
      message: "Notificación creada correctamente",
      id_notificacion: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando notificación", error });
  }
};

/**
 * Obtener notificaciones de un usuario
 */
export const getNotificacionesUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [rows] = await db.query(
      `SELECT id_notificacion, id_usuario, mensaje, link, leido, fecha
       FROM notificaciones
       WHERE id_usuario = ?
       ORDER BY id_notificacion DESC`,
      [id_usuario]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
};

/**
 * Marcar notificación como leída
 */
export const marcarLeida = async (req, res) => {
  try {
    const { id_notificacion } = req.params;

    await db.query(
      `UPDATE notificaciones SET leido = 1 WHERE id_notificacion = ?`,
      [id_notificacion]
    );

    res.json({ message: "Notificación marcada como leída" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marcando notificación como leída", error });
  }
};

/**
 * Notificar a amigos mencionados en un recuerdo
 * @param {number} id_recuerdo
 * @param {number[]} amigos
 * @param {string} tituloRecuerdo
 * @param {number} idQuienMenciono
 */
export const notificarMencionesRecuerdo = async (id_recuerdo, amigos, tituloRecuerdo, idQuienMenciono) => {
  if (!Array.isArray(amigos) || amigos.length === 0) return;

  const notificaciones = amigos.map(id_usuario => [
    id_usuario,
    `Has sido mencionado en el recuerdo "${tituloRecuerdo}"`,
    `/recuerdo/${id_recuerdo}`,
    0,
    idQuienMenciono
  ]);

  await db.query(
    `INSERT INTO notificaciones (id_usuario, mensaje, link, leido, id_quien_menciono) VALUES ?`,
    [notificaciones]
  );
};
