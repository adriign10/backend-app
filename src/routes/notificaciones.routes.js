import express from 'express';
import { crearNotificacion, getNotificacionesUsuario, marcarLeida } from '../controllers/notificaciones.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET notificaciones de un usuario
router.get('/:id_usuario', verifyToken, getNotificacionesUsuario);

// POST crear notificación manual
router.post('/', verifyToken, crearNotificacion);

// PATCH marcar notificación como leída
router.patch('/:id_notificacion/leida', verifyToken, marcarLeida);


export default router;
