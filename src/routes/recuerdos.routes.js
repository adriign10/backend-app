// src/routes/recuerdos.routes.js
import { Router } from 'express';
import * as RecuerdosCtrl from '../controllers/recuerdos.controller.js';

const router = Router();

// Crear nuevo recuerdo
router.post('/', RecuerdosCtrl.crearRecuerdo);

// Obtener recuerdos de un usuario
router.get('/:id', RecuerdosCtrl.obtenerRecuerdosUsuario);

export default router;
