import { Router } from "express";
import { obtenerAmigosRecuerdo, agregarAmigosRecuerdo, createRecuerdo, getRecuerdosUsuario, updateRecuerdo, getRecuerdoById } from "../controllers/recuerdos.controller.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.post("/", createRecuerdo);
router.post("/:id_recuerdo/amigos", agregarAmigosRecuerdo);

router.get("/", getRecuerdosUsuario);
router.get("/:id_recuerdo/amigos", obtenerAmigosRecuerdo);

// NUEVO — editar colección
router.put("/:id_recuerdo", upload.single("foto"), updateRecuerdo);
router.get("/:id_recuerdo", getRecuerdoById);


export default router;
