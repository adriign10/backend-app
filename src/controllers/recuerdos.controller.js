import { db } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { notificarMencionesRecuerdo } from './notificaciones.controller.js';

export const createRecuerdo = async (req, res) => {
  try {
    const { titulo, nota, fecha_evento, id_ubicacion, creado_por, privacidad } = req.body;

    let fotoUrl = null;

    // Si viene una imagen en base64 la subimos a Cloudinary
    if (req.body.foto_base64) {
      const resultado = await cloudinary.uploader.upload(req.body.foto_base64, {
        folder: "Recuerdos",
      });
      fotoUrl = resultado.secure_url;
    }

    const [result] = await db.query(
      `INSERT INTO recuerdos 
      (titulo, nota, fecha_evento, id_ubicacion, foto_representativa, creado_por, privacidad)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titulo, nota, fecha_evento, id_ubicacion, fotoUrl, creado_por, privacidad]
    );

    res.status(201).json({
      message: "Recuerdo creado",
      id_recuerdo: result.insertId,
      foto_representativa: fotoUrl,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear recuerdo", error });
  }
};

export const getRecuerdosUsuario = async (req, res) => {
  try {
    const creado_por = req.query.creado_por;
    console.log("Query params:", req.query);

    if (!creado_por) {
      return res.status(400).json({ message: "Falta id de usuario" });
    }

    const [rows] = await db.query(
      `SELECT id_recuerdo, titulo, nota, fecha_evento, id_ubicacion, foto_representativa, creado_por, privacidad, fecha_creacion
       FROM recuerdos
       WHERE creado_por = ?
       ORDER BY fecha_evento DESC`,
      [creado_por]
    );

    console.log("Recuerdos encontrados:", rows);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error en getRecuerdosUsuario:", error);
    res.status(500).json({ message: "Error al obtener recuerdos", error });
  }
};


export const updateRecuerdo = async (req, res) => {
  try {
    const { id_recuerdo } = req.params;
    const { titulo, nota } = req.body;

    let nuevaFotoUrl = null;

    // Si se envió foto nueva → Cloudinary
    if (req.file) {
      nuevaFotoUrl = await new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { folder: "Recuerdos" },
          (err, result) => {
            if (err) return reject(err);
            resolve(result.secure_url);
          }
        );
        upload.end(req.file.buffer);
      });
    }

    // Actualizar en MySQL
    const query = nuevaFotoUrl
      ? `UPDATE recuerdos SET titulo=?, nota=?, foto_representativa=? WHERE id_recuerdo=?`
      : `UPDATE recuerdos SET titulo=?, nota=? WHERE id_recuerdo=?`;

    const params = nuevaFotoUrl
      ? [titulo, nota, nuevaFotoUrl, id_recuerdo]
      : [titulo, nota, id_recuerdo];

    await db.query(query, params);

    res.json({
      ok: true,
      msg: "Recuerdo actualizado correctamente",
      foto_representativa: nuevaFotoUrl
    });

  } catch (error) {
    console.error("❌ ERROR updateRecuerdo:", error);
    res.status(500).json({ msg: "Error actualizando recuerdo" });
  }
};


export const getRecuerdoById = async (req, res) => {
  try {
    const { id_recuerdo } = req.params;

    const [rows] = await db.query(
      `SELECT 
        r.*,
        u.nombre AS nombre_ubicacion,
        u.latitud AS ubic_latitud,
        u.longitud AS ubic_longitud
      FROM recuerdos r
      LEFT JOIN ubicaciones u ON r.id_ubicacion = u.id_ubicacion
      WHERE r.id_recuerdo = ?`,
      [id_recuerdo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Recuerdo no encontrado" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("❌ ERROR getRecuerdoById:", error);
    res.status(500).json({ message: "Error consultando recuerdo", error });
  }
};


export const agregarAmigosRecuerdo = async (req, res) => {
  try {
    const { id_recuerdo } = req.params;
    const { amigos, creado_por, creado_por_nombre } = req.body; // IDs de amigos y creador

        console.log("💡 ID del recuerdo:", id_recuerdo);
    console.log("💡 Amigos a agregar:", amigos);
    console.log("💡 Creado por:", creado_por);
    
    if (!Array.isArray(amigos) || amigos.length === 0) {
      return res.status(400).json({ message: "No hay amigos seleccionados" });
    }

// 🔹 Insertar amigos en la tabla de relación recuerdo-amigos, ignorando duplicados
const amigosData = amigos.map(id_usuario => [id_recuerdo, id_usuario]);
await db.query(
  `INSERT IGNORE INTO recuerdos_amigos (id_recuerdo, id_usuario) VALUES ?`,
  [amigosData]
);


    // 🔹 Obtener título del recuerdo
    const [recuerdoRows] = await db.query(
      `SELECT titulo FROM recuerdos WHERE id_recuerdo = ?`,
      [id_recuerdo]
    );

    if (recuerdoRows.length === 0) {
      return res.status(404).json({ message: "Recuerdo no encontrado" });
    }

    const tituloRecuerdo = recuerdoRows[0].titulo;

    // 🔹 Crear notificaciones para todos los amigos mencionados
    await notificarMencionesRecuerdo(id_recuerdo, amigos, tituloRecuerdo, creado_por);

    res.json({ message: "Amigos agregados y notificaciones enviadas correctamente" });

  } catch (error) {
    console.error("❌ ERROR agregarAmigosRecuerdo:", error);
    res.status(500).json({ message: "Error agregando amigos", error });
  }
};

export const obtenerAmigosRecuerdo = async (req, res) => {
  const { id_recuerdo } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.foto_perfil
       FROM recuerdos_amigos ra
       JOIN usuarios u ON u.id_usuario = ra.id_usuario
       WHERE ra.id_recuerdo = ?`,
      [id_recuerdo]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo amigos del recuerdo", error });
  }
};


// GET /usuarios/buscar?term=xxx&id_usuario=1
export const buscarUsuariosNoAmigos  = async (req, res) => {
  try {
    const { term, id_usuario } = req.query;
    const busqueda = `%${term}%`;

    const [rows] = await db.query(
      `SELECT id_usuario, nombre, email, foto_perfil
       FROM usuarios
       WHERE (nombre LIKE ? OR email LIKE ?)
         AND id_usuario != ?
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


export const getRecuerdosVisibles = async (req, res) => {
  try {
    const { id_usuario } = req.query; // usuario logueado

    const [recuerdos] = await db.query(
      `SELECT r.* 
       FROM recuerdos r
       LEFT JOIN recuerdos_amigos ra ON r.id_recuerdo = ra.id_recuerdo
       LEFT JOIN recuerdos_menciones rm ON r.id_recuerdo = rm.id_recuerdo
       WHERE r.privacidad='publico'
          OR r.creado_por=?
          OR ra.id_usuario=?
          OR rm.id_usuario=? 
       GROUP BY r.id_recuerdo
       ORDER BY r.fecha_evento DESC`,
      [id_usuario, id_usuario, id_usuario]
    );

    res.json(recuerdos);
  } catch (error) {
    console.error("❌ Error obteniendo recuerdos visibles:", error);
    res.status(500).json({ message: "Error obteniendo recuerdos visibles", error });
  }
};


