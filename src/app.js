// src/app.js
import express from 'express';
import cors from 'cors';

import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import recuerdosRoutes from './routes/recuerdos.routes.js';
import ubicacionesRoutes from "./routes/ubicaciones.routes.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/recuerdos", recuerdosRoutes);
app.use("/api/ubicaciones", ubicacionesRoutes);

export default app;
