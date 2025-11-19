import { Router } from "express";
import { createRecuerdo, getRecuerdosUsuario, updateRecuerdo } from "../controllers/recuerdos.controller.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.post("/", createRecuerdo);
router.get("/", getRecuerdosUsuario);

// NUEVO — editar colección
router.put("/:id_recuerdo", upload.single("foto"), updateRecuerdo);

export default router;
