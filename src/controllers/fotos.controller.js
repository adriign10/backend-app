import { FotosModel } from "../models/Foto.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const upload = multer(); // ← igual que en usuarios.controller

export const subirMultiplesFotos = async (req, res) => {
  try {
    const { id_recuerdo } = req.body;
    const descripciones = req.body.descripciones; // puede ser string o array
    const archivos = req.files;

    if (!archivos || archivos.length === 0) {
      return res.status(400).json({ msg: "No enviaste fotos" });
    }

    const descripcionesArray = Array.isArray(descripciones)
      ? descripciones
      : [descripciones];

    const urlsFinales = [];

    for (let i = 0; i < archivos.length; i++) {
      const file = archivos[i];
      const descripcion = descripcionesArray[i] || "";

      const url = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Fotos" },
          (err, result) => {
            if (err) return reject(err);
            resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });

      await FotosModel.crearFoto(id_recuerdo, url, descripcion);
      urlsFinales.push(url);
    }

    return res.json({
      ok: true,
      msg: "Fotos subidas correctamente",
      urls: urlsFinales
    });

  } catch (error) {
    console.error("❌ Error subirMultiplesFotos:", error);
    return res.status(500).json({ msg: "Error al subir múltiples fotos" });
  }
};


export const obtenerFotos = async (req, res) => {
  try {
    const { id_recuerdo } = req.params;
    const fotos = await FotosModel.obtenerFotosPorRecuerdo(id_recuerdo);
    res.json(fotos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo fotos" });
  }
};

export const eliminarFoto = async (req, res) => {
  try {
    const { id_foto } = req.params;

    const ok = await FotosModel.eliminarFoto(id_foto);
    if (!ok) return res.status(404).json({ msg: "La foto no existe" });

    res.json({ ok: true, msg: "Foto eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error eliminando foto" });
  }
};

export const uploadFotoMiddleware = upload.single("foto");
