import { db } from "../config/db.js";
import cloudinary from "cloudinary";

// Configurar cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createRecuerdo = async (req, res) => {
  try {
    const { titulo, nota, fecha_evento, id_ubicacion, creado_por, privacidad } = req.body;

    let fotoUrl = null;

    // Si viene una imagen en base64 la subimos a Cloudinary
    if (req.body.foto_base64) {
      const resultado = await cloudinary.v2.uploader.upload(req.body.foto_base64, {
        folder: "recuerdos",
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
    const { creado_por } = req.query;

    if (!creado_por) {
      return res.status(400).json({ message: "Falta el parámetro creado_por" });
    }

    const [recuerdos] = await db.query(
      "SELECT * FROM recuerdos WHERE creado_por = ? ORDER BY fecha_creacion DESC",
      [creado_por]
    );

    res.json(recuerdos);
  } catch (error) {
    console.log(error);
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
        const upload = cloudinary.v2.uploader.upload_stream(
          { folder: "recuerdos" },
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
      `SELECT r.*, 
              u.nombre AS ubicacion_nombre,
              u.descripcion AS ubicacion_descripcion,
              u.latitud,
              u.longitud
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
