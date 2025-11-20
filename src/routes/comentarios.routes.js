// routes/comentarios.routes.js
import { Router } from "express";
import { agregarComentario, obtenerComentarios } from "../controllers/comentarios.controller.js";

const router = Router();

router.post("/:id_recuerdo", agregarComentario); // Crear comentario
router.get("/:id_recuerdo", obtenerComentarios);  // Listar comentarios

export default router;
