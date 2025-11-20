import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario.js";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import fetch from "node-fetch"; // si no la tienes

dotenv.config();

/* ============================================================
   GOOGLE CLIENT (usa client_id y client_secret)
============================================================ */
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/* ============================================================
   REGISTRO NORMAL
============================================================ */
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
      google: 0
    });

    res.status(201).json({ message: "Usuario registrado", id: userId });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
};

/* ============================================================
   LOGIN NORMAL
============================================================ */
export const login = async (req, res) => {
  console.log("BODY recibido:", req.body);
  try {
    const { email, contrasena } = req.body;

    // 1️⃣ Buscar usuario por email
    const usuario = await Usuario.findByEmail(email);
console.log("Usuario encontrado:", usuario);


    if (!usuario) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
    }

    // 2️⃣ Validar si es usuario Google
    if (usuario.google === 1) {
      return res.status(400).json({ message: "Este usuario solo puede iniciar con Google" });
    }

    // 3️⃣ Validar que tenga contraseña
    if (!usuario.contrasena) {
      return res.status(400).json({ message: "El usuario no tiene contraseña registrada" });
    }

    // 4️⃣ Comparar contraseña
    const match = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!match) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
    }

    // 5️⃣ Crear JWT
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Responder con datos del usuario
    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        foto_perfil: usuario.foto_perfil,
        google: usuario.google
      },
    });

  } catch (error) {
    console.error("Error en login:", error); // 🔥 importante para ver detalles en consola
    res.status(500).json({ message: "Error en el login", error: error.message });
  }
};



/* ============================================================
   PERFIL
============================================================ */
export const profile = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id_usuario);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo perfil" });
  }
};


///GOOGLE
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // token enviado desde frontend

    if (!token) {
      return res.status(400).json({ message: "Token no recibido" });
    }

    // 1️⃣ Verificar ID token con Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const nombre = payload.name;

    // 2️⃣ Buscar usuario en BD
    let usuario = await Usuario.findByEmail(email);

    // 3️⃣ Si no existe, crear usuario nuevo
    if (!usuario) {
      const id = await Usuario.create({
        nombre,
        email,
        contrasena: null, // no tiene contraseña
        foto_perfil: null, // se puede actualizar luego
        estado: 1,
        google: 1
      });
      usuario = await Usuario.findById(id);
    }

    // 4️⃣ Crear JWT
    const tokenJwt = jwt.sign(
      { id_usuario: usuario.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login Google exitoso",
      token: tokenJwt,
      usuario
    });

  } catch (error) {
    console.error("Error Google Login:", error);
    res.status(400).json({
      message: "Error con Google Login",
      error: error.message
    });
  }
};