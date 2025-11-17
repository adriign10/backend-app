import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario.js";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

/* ============================================================
   GOOGLE CLIENT
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
  try {
    const { email, contrasena } = req.body;

    const usuario = await Usuario.findByEmail(email);

    if (!usuario) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
    }

    if (usuario.google === 1) {
      return res.status(400).json({ message: "Este usuario solo puede iniciar con Google" });
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
        google: usuario.google
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error: error.message });
  }
};

/* ============================================================
   LOGIN CON GOOGLE
============================================================ */
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Code no recibido" });
    }

    // 1. Intercambiar el CODE por tokens (fetch nativo de Node)
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: token,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "postmessage",
        grant_type: "authorization_code"
      })
    });

    const tokens = await r.json();
    console.log("TOKENS:", tokens);

    if (tokens.error) {
      return res.status(400).json({ message: "Error token", error: tokens });
    }

    const idToken = tokens.id_token;

    // 2. Verificar ID TOKEN
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const nombre = payload.name;
    const foto = payload.picture;

    let usuario = await Usuario.findByEmail(email);

    if (!usuario) {
      const id = await Usuario.create({
        nombre,
        email,
        contrasena: null,
        fotoPerfil: foto,
        google: 1
      });
      usuario = await Usuario.findById(id);
    }

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
    res.status(400).json({
      message: "Error con Google Login",
      error: error.message
    });
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
