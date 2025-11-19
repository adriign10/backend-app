// src/models/Recuerdo.js
import { db } from '../config/db.js';

export const crearRecuerdo = async (recuerdo) => {
  const { titulo, nota, fecha_evento, foto_representativa, creado_por, privacidad } = recuerdo;
  const [result] = await db.query(
    `INSERT INTO recuerdos (titulo, nota, fecha_evento, foto_representativa, creado_por, privacidad) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [titulo, nota, fecha_evento, foto_representativa, creado_por, privacidad || 'privado']
  );
  return result.insertId; // devuelve id_recuerdo creado
};

export const agregarFotosRecuerdo = async (id_recuerdo, fotos) => {
  const values = fotos.map(url => [id_recuerdo, url]);
  if (values.length === 0) return;
  await db.query(
    `INSERT INTO fotos (id_recuerdo, url) VALUES ?`,
    [values]
  );
};

export const obtenerRecuerdosUsuario = async (id_usuario) => {
  const [recuerdos] = await db.query(
    `SELECT * FROM recuerdos WHERE creado_por = ? ORDER BY fecha_creacion DESC`,
    [id_usuario]
  );
  return recuerdos;
};

export const obtenerFotosRecuerdo = async (id_recuerdo) => {
  const [fotos] = await db.query(
    `SELECT * FROM fotos WHERE id_recuerdo = ?`,
    [id_recuerdo]
  );
  return fotos;
};
