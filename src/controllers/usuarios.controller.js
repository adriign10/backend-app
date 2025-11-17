import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario.js";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  try {
    const { nombre, email, contrasena, fotoPerfil } = req.body;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const existe = await Usuario.findByEmail(email);
    if (existe) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const userId = await Usuario.create({
      nombre,
      email,
      contrasena: hashedPassword,
      fotoPerfil: fotoPerfil || null,
    });

    res.status(201).json({ message: "Usuario registrado", id: userId });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    const usuario = await Usuario.findByEmail(email);

    if (!usuario) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
    }

    const match = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!match) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        foto_perfil: usuario.foto_perfil,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error: error.message });
  }
};

export const profile = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id_usuario);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo perfil" });
  }
};
