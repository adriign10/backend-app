// src/app.js
import express from 'express';
import cors from 'cors';

import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import recuerdosRoutes from './routes/recuerdos.routes.js';
import ubicacionesRoutes from "./routes/ubicaciones.routes.js";
import fotosRouter from "./routes/fotos.routes.js";
import notificacionesRoutes from './routes/notificaciones.routes.js';

const app = express();

// Aumenta el límite de 10MB
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

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
app.use("/api/fotos", fotosRouter);
app.use('/api/notificaciones', notificacionesRoutes);

export default app;
