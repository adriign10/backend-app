// src/controllers/recuerdos.controller.js
import * as RecuerdoModel from '../models/Recuerdo.js';

export const crearRecuerdo = async (req, res) => {
  try {
    const { titulo, nota, fecha_evento, foto_representativa, fotos, creado_por } = req.body;

    if (!titulo || !creado_por) {
      return res.status(400).json({ msg: "Título y creador son obligatorios" });
    }

    // 1️⃣ Crear el recuerdo
    const id_recuerdo = await RecuerdoModel.crearRecuerdo({
      titulo,
      nota,
      fecha_evento,
      foto_representativa,
      creado_por
    });

    // 2️⃣ Guardar las fotos asociadas
    if (fotos && fotos.length > 0) {
      await RecuerdoModel.agregarFotosRecuerdo(id_recuerdo, fotos);
    }

    res.json({ msg: "Recuerdo creado correctamente", id_recuerdo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al crear recuerdo", error });
  }
};

export const obtenerRecuerdosUsuario = async (req, res) => {
  try {
    const id_usuario = req.params.id;
    const recuerdos = await RecuerdoModel.obtenerRecuerdosUsuario(id_usuario);

    // Para cada recuerdo, traer sus fotos
    for (const r of recuerdos) {
      r.fotos = await RecuerdoModel.obtenerFotosRecuerdo(r.id_recuerdo);
    }

    res.json(recuerdos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener recuerdos", error });
  }
};
