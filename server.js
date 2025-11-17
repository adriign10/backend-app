// backend-clean/server.js
import express from 'express';
import app from './src/app.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Para usar __dirname con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- SERVIR FRONTEND IONIC ----
// Apuntamos al build generado en ../frontend/www
const frontendPath = path.join(__dirname, '../frontend/www');
app.use(express.static(frontendPath));

// Cualquier ruta que no sea /api/... devuelve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ---- LEVANTAR BACKEND ----
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
