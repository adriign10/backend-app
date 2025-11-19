import { db } from "../config/db.js";

// GET — obtener todas las ubicaciones
export const getUbicaciones = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM ubicaciones");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ubicaciones", error });
  }
};

// POST — crear nueva ubicación
export const createUbicacion = async (req, res) => {
  try {
    const { nombre, latitud, longitud } = req.body;

    if (!nombre || !latitud || !longitud) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const [result] = await db.query(
      "INSERT INTO ubicaciones (nombre, latitud, longitud) VALUES (?, ?, ?)",
      [nombre, latitud, longitud]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      latitud,
      longitud,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear ubicación", error });
  }
};

// PUT — actualizar
export const updateUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, latitud, longitud } = req.body;

    const [result] = await db.query(
      "UPDATE ubicaciones SET nombre=?, latitud=?, longitud=? WHERE id_ubicacion=?",
      [nombre, latitud, longitud, id]
    );

    res.json({ message: "Ubicación actualizada", result });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar ubicación", error });
  }
};

// DELETE — eliminar
export const deleteUbicacion = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM ubicaciones WHERE id_ubicacion=?", [id]);

    res.json({ message: "Ubicación eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar ubicación", error });
  }
};
