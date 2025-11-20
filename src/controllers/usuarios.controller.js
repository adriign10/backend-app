import { db } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

export const actualizarPerfil = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const { nombre, email } = req.body;

    console.log("📥 BODY recibido:", req.body);
    console.log("📸 Archivo recibido:", req.file ? "Sí" : "No");

    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id_usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }

    const usuarioActual = rows[0];
    let nuevaFoto = usuarioActual.foto_perfil;

    if (req.file) {
      nuevaFoto = await new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { folder: "Perfiles" }, // ← corregido
          (err, result) => {
            if (err) return reject(err);
            resolve(result.secure_url);
          }
        );
        upload.end(req.file.buffer);
      });
    }

    await db.query(
      `UPDATE usuarios 
       SET nombre = ?, email = ?, foto_perfil = ?
       WHERE id_usuario = ?`,
      [nombre, email, nuevaFoto, id_usuario]
    );

    const [nuevoUsuario] = await db.query(
      "SELECT id_usuario, nombre, email, foto_perfil FROM usuarios WHERE id_usuario = ?",
      [id_usuario]
    );

    return res.json({
      ok: true,
      msg: "Perfil actualizado",
      usuario: nuevoUsuario[0],
    });

  } catch (error) {
    console.error("❌ ERROR actualizarPerfil:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al actualizar perfil",
      error: error.message,
    });
  }
};



// 1️⃣ Enviar solicitud
export const enviarSolicitudAmistad = async (req, res) => {
  try {
    const { id_usuario, id_amigo } = req.body;

    if (!id_usuario || !id_amigo) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    // Verificar si ya existe solicitud
    const [exist] = await db.query(
      `SELECT * FROM amistades WHERE id_usuario = ? AND id_amigo = ?`,
      [id_usuario, id_amigo]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "Ya existe una solicitud o amistad" });
    }

    await db.query(
      `INSERT INTO amistades (id_usuario, id_amigo, estado) VALUES (?, ?, 'pendiente')`,
      [id_usuario, id_amigo]
    );

    res.json({ message: "Solicitud enviada" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error enviando solicitud", error });
  }
};

// 2️⃣ Responder solicitud
export const responderSolicitudAmistad = async (req, res) => {
  try {
    const { id_usuario, id_amigo, accion } = req.body; // accion = 'aceptado' | 'rechazado'

    if (!['aceptado','rechazado'].includes(accion)) {
      return res.status(400).json({ message: "Acción inválida" });
    }

    await db.query(
      `UPDATE amistades SET estado=? WHERE id_usuario=? AND id_amigo=?`,
      [accion, id_usuario, id_amigo]
    );

    // Si acepta → crear relación recíproca
    if (accion === 'aceptado') {
      await db.query(
        `INSERT IGNORE INTO amistades (id_usuario, id_amigo, estado) VALUES (?, ?, 'aceptado')`,
        [id_amigo, id_usuario]
      );
    }

    res.json({ message: `Solicitud ${accion}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error respondiendo solicitud", error });
  }
};

// 3️⃣ Obtener solicitudes recibidas
export const obtenerSolicitudesAmistad = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [rows] = await db.query(
      `SELECT a.id_usuario as solicitante_id, u.nombre, u.foto_perfil, a.fecha_solicitud
       FROM amistades a
       JOIN usuarios u ON u.id_usuario = a.id_usuario
       WHERE a.id_amigo = ? AND a.estado='pendiente'`,
       [id_usuario]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo solicitudes", error });
  }
};

// 4️⃣ Obtener amigos (aceptados)
export const obtenerAmigos = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.foto_perfil
       FROM amistades a
       JOIN usuarios u ON u.id_usuario = a.id_amigo
       WHERE a.id_usuario = ? AND a.estado='aceptado'`,
      [id_usuario]
    );

    res.json(rows);

  } catch (error) {
    console.error("❌ ERROR obtenerAmigos:", error);
    res.status(500).json({ message: "Error obteniendo amigos", error });
  }
};

export const buscarUsuarios = async (req, res) => {
  try {
    const { term, id_usuario } = req.query;

    if (!term) return res.json([]);

    // Buscar usuarios que coincidan con nombre o email, excluyendo amigos y solicitudes pendientes
    const [rows] = await db.query(
      `SELECT id_usuario, nombre, email, foto_perfil
       FROM usuarios
       WHERE (nombre LIKE ? OR email LIKE ?)
       AND id_usuario != ?
       AND id_usuario NOT IN (
         SELECT id_amigo FROM amistades WHERE id_usuario = ? 
         UNION
         SELECT id_usuario FROM amistades WHERE id_amigo = ?
       )
       LIMIT 10`,
       [`%${term}%`, `%${term}%`, id_usuario, id_usuario, id_usuario]
    );

    res.json(rows);

  } catch (error) {
    console.error("❌ ERROR buscarUsuarios:", error);
    res.status(500).json({ message: "Error buscando usuarios", error });
  }
};