import { Router } from "express";
import { createRecuerdo, getRecuerdosUsuario  } from "../controllers/recuerdos.controller.js";

const router = Router();

router.post("/", createRecuerdo);

// Obtener recuerdos por usuario
router.get("/", getRecuerdosUsuario);

export default router;
