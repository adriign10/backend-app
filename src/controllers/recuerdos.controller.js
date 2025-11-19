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

