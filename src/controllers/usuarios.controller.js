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



// Enviar solicitud de amistad
export const enviarSolicitudAmistad = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const { id_amigo } = req.body;

    if (id_usuario === id_amigo) {
      return res.status(400).json({ message: "No puedes enviarte solicitud a ti mismo" });
    }

    // Verificar si ya existe solicitud
    const [exist] = await db.query(
      `SELECT * FROM amistades WHERE id_usuario=? AND id_amigo=?`,
      [id_usuario, id_amigo]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "Solicitud ya enviada o amistad existente" });
    }

    // Insertar solicitud pendiente
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


// Responder solicitud
export const responderSolicitudAmistad = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario; // quien recibe la solicitud
    const { id_usuario: solicitante_id, accion } = req.body; // accion = 'aceptado' | 'rechazado'

    if (!['aceptado', 'rechazado'].includes(accion)) {
      return res.status(400).json({ message: "Acción inválida" });
    }

    await db.query(
      `UPDATE amistades SET estado=? WHERE id_usuario=? AND id_amigo=?`,
      [accion, solicitante_id, id_usuario]
    );

    res.json({ message: `Solicitud ${accion}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error respondiendo solicitud", error });
  }
};



// Obtener amigos (aceptados)
export const obtenerAmigos = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;

    const [amigos] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.foto_perfil
       FROM amistades a
       JOIN usuarios u ON u.id_usuario = a.id_amigo
       WHERE a.id_usuario=? AND a.estado='aceptado'`,
      [id_usuario]
    );

    res.json(amigos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo amigos", error });
  }
};

// Buscar usuarios para agregar como amigos
export const buscarUsuarios = async (req, res) => {
  try {
    const { term } = req.query;
    const id_usuario = req.user.id_usuario; // desde token JWT
    const busqueda = `%${term}%`;

    const [rows] = await db.query(
      `SELECT id_usuario, nombre, email, foto_perfil
       FROM usuarios
       WHERE (nombre LIKE ? OR email LIKE ?)
         AND id_usuario != ?  -- no mostrarse a sí mismo
         AND id_usuario NOT IN (
           SELECT id_amigo 
           FROM amistades 
           WHERE id_usuario = ? AND estado='aceptado'
         )`,
      [busqueda, busqueda, id_usuario, id_usuario]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error buscando usuarios", error });
  }
};

// Obtener solicitudes recibidas
export const obtenerSolicitudesAmistad = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario; // quien recibe la solicitud

    const [solicitudes] = await db.query(
      `SELECT a.id_usuario AS solicitante_id, u.nombre, u.email, u.foto_perfil
       FROM amistades a
       JOIN usuarios u ON u.id_usuario = a.id_usuario
       WHERE a.id_amigo = ? AND a.estado='pendiente'`,
      [id_usuario]
    );

    res.json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo solicitudes", error });
  }
};