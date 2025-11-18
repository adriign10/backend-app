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
